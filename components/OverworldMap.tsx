import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { HexCell, TerrainType, PositionComponent, WeatherType, Dimension, GameState } from '../types';
import { HEX_SIZE, TERRAIN_COLORS, ASSETS, TERRAIN_PRIORITY, getWesnothTransition, TRANSITION_COMBINATIONS, DIRECTION_ORDER } from '../constants';
import { useGameStore } from '../store/gameStore';
import { findPath } from '../services/pathfinding';
import { WorldGenerator } from '../services/WorldGenerator';
import { textureManager } from '../services/TextureManager';
import { WeatherOverlay } from './overworld/WeatherOverlay';
export { WeatherOverlay };
import { HexMapSVGOverlay } from './overworld/HexMapSVGOverlay';
import { useOverworldLogic } from '../hooks/useOverworldLogic';
import { hexToPixel, pixelToAxial, axialRound, HORIZ_DIST, VERT_DIST, NEIGHBOR_OFFSETS } from '../services/hexMath';

interface OverworldMapProps {
  mapData: HexCell[]; // Deprecated, only used for Town now.
  playerPos: PositionComponent;
  onMove: (q: number, r: number) => void;
  dimension: Dimension;
  width: number;
  height: number;
}

export const OverworldMap: React.FC<OverworldMapProps> = ({ mapData: townMapData, playerPos, onMove, dimension, width, height }) => {
  const {
    containerRef,
    canvasRef,
    svgRef,
    viewport,
    pan,
    targetPan,
    isDragging,
    lastMousePos,
    dragDistance,
    needsRedraw,
    hoveredCellKey,
    setHoveredCellKey,
    previewPath,
    setPreviewPath,
    visibleCells,
    visibleEnemies,
    currentWeather,
    isGracePeriod,
    isTown,
    isUpsideDown,
    updateViewport
  } = useOverworldLogic(townMapData, playerPos, dimension);

  const tileCache = useRef<Map<string, HTMLCanvasElement>>(new Map());
  const imgCache = useRef<Map<string, HTMLImageElement>>(new Map());
  const transitionCache = useRef<Map<string, HTMLCanvasElement>>(new Map());

  // Texture Loading
  const loadImage = useCallback((src: string): Promise<HTMLImageElement | null> => {
    if (!src) return Promise.resolve(null);
    if (imgCache.current.has(src)) return Promise.resolve(imgCache.current.get(src)!);
    
    return new Promise((resolve) => {
      const cached = textureManager.get2DImage(src, (img) => {
        if (img) {
          imgCache.current.set(src, img);
          needsRedraw.current = true;
        }
        resolve(img);
      });
      if (cached) {
        imgCache.current.set(src, cached);
        resolve(cached);
      }
    });
  }, []);

  const prebuildTerrainTile = useCallback(async (terrain: TerrainType) => {
    const key = `base-${terrain}`;
    const src = ASSETS.TERRAIN[terrain];
    const size = Math.ceil(HEX_SIZE * 2.2);
    
    if (src) {
        const img = await loadImage(src);
        if (img) {
            const canvas = document.createElement('canvas');
            canvas.width = size; 
            canvas.height = size;
            const ctx = canvas.getContext('2d')!;
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(img, 0, 0, size, size);
            tileCache.current.set(key, canvas);
            needsRedraw.current = true;
            return;
        }
    }
    
    if (!tileCache.current.has(key)) {
        const canvas = document.createElement('canvas');
        canvas.width = size; 
        canvas.height = size;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = TERRAIN_COLORS[terrain] || '#166534';
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 180) * (60 * i);
          const px = (size / 2) + HEX_SIZE * Math.cos(angle);
          const py = (size / 2) + HEX_SIZE * Math.sin(angle);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        tileCache.current.set(key, canvas);
    }
  }, [loadImage]);

  const prebuildTransition = useCallback(async (terrain: TerrainType, combo: string) => {
      const key = `trans-${terrain}-${combo}`;
      if (transitionCache.current.has(key)) return;
      const url = getWesnothTransition(terrain, combo);
      if (!url) return;
      const img = await loadImage(url);
      if (!img) return;
      const size = Math.ceil(HEX_SIZE * 2.2);
      const canvas = document.createElement('canvas');
      canvas.width = size; 
      canvas.height = size;
      const ctx = canvas.getContext('2d')!;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, size, size);
      transitionCache.current.set(key, canvas);
      needsRedraw.current = true;
  }, [loadImage]);

  useEffect(() => {
    const loadVisible = async () => {
        const terrains = new Set<TerrainType>();
        visibleCells.forEach(c => {
            terrains.add(c.terrain);
            const overlayDef = ASSETS.OVERLAYS[c.terrain];
            if (overlayDef) (Array.isArray(overlayDef) ? overlayDef : [overlayDef]).forEach(url => loadImage(url));
        });
        await Promise.all(Array.from(terrains).map(t => prebuildTerrainTile(t)));
        
        const transPromises: Promise<any>[] = [];
        for (const cell of visibleCells) {
            if (!cell.isExplored) continue;
            const priorityNeighbors: Record<string, string[]> = {};
            NEIGHBOR_OFFSETS.forEach(offset => {
                let neighborTerrain;
                if (isTown && townMapData) {
                    const n = townMapData.find(tc => tc.q === cell.q + offset.dq && tc.r === cell.r + offset.dr);
                    neighborTerrain = n?.terrain;
                } else {
                    neighborTerrain = WorldGenerator.getTile(cell.q + offset.dq, cell.r + offset.dr, dimension).terrain;
                }

                if (neighborTerrain && TERRAIN_PRIORITY[neighborTerrain] > TERRAIN_PRIORITY[cell.terrain]) {
                     if (!priorityNeighbors[neighborTerrain]) priorityNeighbors[neighborTerrain] = [];
                     priorityNeighbors[neighborTerrain].push(offset.dir);
                }
            });

            for (const [tStr, dirs] of Object.entries(priorityNeighbors)) {
                const terrain = tStr as TerrainType;
                let activeDirs = [...dirs].sort((a, b) => DIRECTION_ORDER.indexOf(a) - DIRECTION_ORDER.indexOf(b));
                TRANSITION_COMBINATIONS.forEach(combo => {
                    if (activeDirs.length === 0) return;
                    const parts = combo.split('-');
                    if (parts.every(p => activeDirs.includes(p))) {
                        transPromises.push(prebuildTransition(terrain, combo));
                        activeDirs = activeDirs.filter(d => !parts.includes(d));
                    }
                });
            }
        }
        await Promise.all(transPromises);
        needsRedraw.current = true;
    };
    loadVisible();
  }, [visibleCells, dimension, prebuildTerrainTile, prebuildTransition, loadImage, isTown]);

  // Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false })!;
    let animationFrameId = 0;

    const render = () => {
        const lerp = 0.1;
        const diffX = targetPan.current.x - pan.current.x;
        const diffY = targetPan.current.y - pan.current.y;
        
        if (Math.abs(diffX) > 0.1 || Math.abs(diffY) > 0.1) {
            pan.current.x += diffX * lerp;
            pan.current.y += diffY * lerp;
            needsRedraw.current = true;
            
            if (svgRef.current) {
                const vbX = pan.current.x - viewport.w / 2;
                const vbY = pan.current.y - viewport.h / 2;
                svgRef.current.setAttribute('viewBox', `${vbX} ${vbY} ${viewport.w} ${viewport.h}`);
            }
        }

        if (!needsRedraw.current) { animationFrameId = requestAnimationFrame(render); return; }
        needsRedraw.current = false;

        const dpr = window.devicePixelRatio || 1;
        if (canvas.width !== viewport.w * dpr || canvas.height !== viewport.h * dpr) {
            canvas.width = viewport.w * dpr; 
            canvas.height = viewport.h * dpr;
            canvas.style.width = `${viewport.w}px`; 
            canvas.style.height = `${viewport.h}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        ctx.imageSmoothingEnabled = false;
        ctx.fillStyle = isUpsideDown ? '#0a0010' : '#020617';
        ctx.fillRect(0, 0, viewport.w, viewport.h);

        const offsetX = (pan.current.x - viewport.w / 2);
        const offsetY = (pan.current.y - viewport.h / 2);
        const imgSize = Math.ceil(HEX_SIZE * 2.2);
        const halfSize = imgSize / 2;

        visibleCells.forEach(cell => {
            const { x, y } = hexToPixel(cell.q, cell.r);
            const screenX = x - offsetX;
            const screenY = y - offsetY;

            if (screenX < -imgSize || screenX > viewport.w + imgSize || screenY < -imgSize || screenY > viewport.h + imgSize) return;

            ctx.save();
            ctx.translate(screenX, screenY);

            if (cell.isExplored) {
                // Terrain
                const terrainSrc = ASSETS.TERRAIN[cell.terrain];
                const baseCanvas = tileCache.current.get(`base-${cell.terrain}`);
                const directImg = terrainSrc ? (imgCache.current.get(terrainSrc) || textureManager.get2DImage(terrainSrc, (img) => {
                    if (img) {
                        imgCache.current.set(terrainSrc, img);
                        needsRedraw.current = true;
                    }
                })) : null;

                if (directImg) {
                    ctx.drawImage(directImg, -halfSize, -halfSize, imgSize, imgSize);
                } else if (baseCanvas) { 
                    ctx.drawImage(baseCanvas, -halfSize, -halfSize); 
                } else {
                    ctx.fillStyle = TERRAIN_COLORS[cell.terrain] || '#166534'; 
                    ctx.beginPath(); 
                    for (let i = 0; i < 6; i++) {
                        const angle = 60 * i * (Math.PI / 180);
                        ctx.lineTo(HEX_SIZE * Math.cos(angle), HEX_SIZE * Math.sin(angle));
                    }
                    ctx.closePath();
                    ctx.fill(); 
                }

                // Transitions
                const priorityNeighbors: Record<string, string[]> = {};
                NEIGHBOR_OFFSETS.forEach(offset => {
                    let neighborTerrain;
                    if (isTown && townMapData) {
                        const n = townMapData.find(tc => tc.q === cell.q + offset.dq && tc.r === cell.r + offset.dr);
                        neighborTerrain = n?.terrain;
                    } else {
                        neighborTerrain = WorldGenerator.getTile(cell.q + offset.dq, cell.r + offset.dr, dimension).terrain;
                    }
                    if (neighborTerrain && TERRAIN_PRIORITY[neighborTerrain] > TERRAIN_PRIORITY[cell.terrain]) {
                        if (!priorityNeighbors[neighborTerrain]) priorityNeighbors[neighborTerrain] = [];
                        priorityNeighbors[neighborTerrain].push(offset.dir);
                    }
                });

                for (const [tStr, dirs] of Object.entries(priorityNeighbors)) {
                    let activeDirs = [...dirs].sort((a, b) => DIRECTION_ORDER.indexOf(a) - DIRECTION_ORDER.indexOf(b));
                    TRANSITION_COMBINATIONS.forEach(combo => {
                        if (activeDirs.length === 0) return;
                        const parts = combo.split('-');
                        if (parts.every(p => activeDirs.includes(p))) {
                            const transCanvas = transitionCache.current.get(`trans-${tStr}-${combo}`);
                            if (transCanvas) ctx.drawImage(transCanvas, -halfSize, -halfSize);
                            activeDirs = activeDirs.filter(d => !parts.includes(d));
                        }
                    });
                }

                // Overlays
                const overlayDef = ASSETS.OVERLAYS[cell.terrain];
                if (overlayDef) {
                    let url = '';
                    if (Array.isArray(overlayDef)) {
                        const hash = Math.abs((cell.q * 13) ^ (cell.r * 7));
                        url = overlayDef[hash % overlayDef.length];
                    } else {
                        url = overlayDef;
                    }

                    if (url) {
                        const img = imgCache.current.get(url) || textureManager.get2DImage(url, (loadedImg) => {
                            if (loadedImg) {
                                imgCache.current.set(url, loadedImg);
                                needsRedraw.current = true;
                            }
                        });

                        if (img) {
                            let oWidth = imgSize;
                            let oHeight = imgSize;
                            let yOffset = 0;
                            if (cell.terrain === TerrainType.MOUNTAIN) {
                                oWidth = imgSize * 1.05;
                                oHeight = imgSize * 1.05;
                                yOffset = -HEX_SIZE * 0.12;
                            } else if (cell.terrain === TerrainType.VILLAGE) {
                                oWidth = imgSize * 0.92;
                                oHeight = imgSize * 0.92;
                                yOffset = -HEX_SIZE * 0.05;
                            } else if (cell.terrain === TerrainType.CASTLE || cell.terrain === TerrainType.RUINS) {
                                oWidth = imgSize * 0.95;
                                oHeight = imgSize * 0.95;
                                yOffset = -HEX_SIZE * 0.05;
                            } else if (cell.terrain === TerrainType.FOREST || cell.terrain === TerrainType.TAIGA || cell.terrain === TerrainType.JUNGLE) {
                                oWidth = imgSize * 0.95;
                                oHeight = imgSize * 0.95;
                                yOffset = -HEX_SIZE * 0.08;
                            }
                            ctx.drawImage(img, -oWidth / 2, -oHeight / 2 + yOffset, oWidth, oHeight);
                        }
                    }
                }

                // Hex Outline
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const angle = 60 * i * (Math.PI / 180);
                    const px = HEX_SIZE * Math.cos(angle);
                    const py = HEX_SIZE * Math.sin(angle);
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.closePath();
                ctx.stroke();

                // Fog of War
                if (!cell.isVisible) {
                    ctx.fillStyle = isUpsideDown ? 'rgba(30, 10, 50, 0.65)' : 'rgba(15, 23, 42, 0.6)';
                    ctx.beginPath();
                    for (let i = 0; i < 6; i++) {
                        const angle = 60 * i * (Math.PI / 180);
                        ctx.lineTo(HEX_SIZE * Math.cos(angle), HEX_SIZE * Math.sin(angle));
                    }
                    ctx.closePath();
                    ctx.fill();
                }

            }
            ctx.restore();
        });

        animationFrameId = requestAnimationFrame(render);
    };
    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [visibleCells, viewport, dimension, isTown, townMapData]);

  // Pointer Interaction
  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
      isDragging.current = true; dragDistance.current = 0;
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
      lastMousePos.current = { x: clientX, y: clientY };
      setPreviewPath([]);
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDragging.current) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
      const dx = clientX - lastMousePos.current.x;
      const dy = clientY - lastMousePos.current.y;
      dragDistance.current += Math.abs(dx) + Math.abs(dy);
      
      pan.current.x -= dx; pan.current.y -= dy;
      targetPan.current.x = pan.current.x;
      targetPan.current.y = pan.current.y;
      
      lastMousePos.current = { x: clientX, y: clientY };
      updateViewport(); needsRedraw.current = true;
  };

  const handlePointerUp = () => { isDragging.current = false; };

  const handleClick = (e: React.MouseEvent) => {
      if (dragDistance.current > 10) return; 
      const rect = containerRef.current!.getBoundingClientRect();
      const clickX = e.clientX - rect.left; const clickY = e.clientY - rect.top;
      const worldX = clickX + (pan.current.x - viewport.w / 2);
      const worldY = clickY + (pan.current.y - viewport.h / 2);
      const { q, r } = pixelToAxial(worldX, worldY);
      onMove(q, r);
  };

  const handleMouseMoveOverlay = (e: React.MouseEvent) => {
      if (isDragging.current) return; 
      const rect = containerRef.current!.getBoundingClientRect();
      const mouseX = e.clientX - rect.left; const mouseY = e.clientY - rect.top;
      const worldX = mouseX + (pan.current.x - viewport.w / 2);
      const worldY = mouseY + (pan.current.y - viewport.h / 2);
      const { q, r } = pixelToAxial(worldX, worldY);
      setHoveredCellKey(`${q},${r}`);
  };

  const regionTitle = useMemo(() => isUpsideDown ? 'The Shadow Realm' : 'Arcadia', [isUpsideDown]);
  const playerSprite = useGameStore.getState().party[0]?.visual.spriteUrl || ASSETS.UNITS.PLAYER;

  return (
    <div ref={containerRef} className={`w-full h-full bg-[#242528] relative overflow-hidden select-none transition-all duration-1000 ${isUpsideDown ? 'grayscale-[0.3] brightness-75 contrast-125 hue-rotate-[240deg]' : ''}`}
        onMouseDown={handlePointerDown} onMouseMove={(e) => { handlePointerMove(e); handleMouseMoveOverlay(e); }} onMouseUp={handlePointerUp} onMouseLeave={handlePointerUp} onTouchStart={handlePointerDown} onTouchMove={handlePointerMove} onTouchEnd={handlePointerUp} onClick={handleClick}>
        
        {isUpsideDown && (
             <div className="absolute inset-0 z-20 pointer-events-none mix-blend-multiply bg-indigo-900/80" />
        )}

        <canvas ref={canvasRef} className="absolute inset-0 block pointer-events-none" />

        <HexMapSVGOverlay
          svgRef={svgRef}
          pan={pan.current}
          viewport={viewport}
          visibleCells={visibleCells}
          visibleEnemies={visibleEnemies}
          playerPos={playerPos}
          isGracePeriod={isGracePeriod}
          previewPath={previewPath}
          hoveredCellKey={hoveredCellKey}
          isUpsideDown={isUpsideDown}
          playerSprite={playerSprite}
          hexToPixel={hexToPixel}
        />
        
        <WeatherOverlay type={currentWeather} />

        <button onClick={() => { const center = hexToPixel(playerPos.x, playerPos.y); pan.current = { x: center.x, y: center.y }; targetPan.current = { ...pan.current }; updateViewport(); needsRedraw.current = true; }} className="absolute bottom-48 right-4 z-20 bg-slate-900/80 border border-amber-500/30 p-3 rounded-full shadow-lg text-amber-400 hover:bg-slate-800 hover:scale-105 transition-all" title="Recenter Camera">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        </button>

        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(circle at center, transparent 50%, ${isUpsideDown ? '#0a0010' : '#020617'} 100%)`, opacity: 0.95 }} />
    </div>
  );
};
