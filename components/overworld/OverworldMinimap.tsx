import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useGameStore } from '../../store/gameStore';
import { WorldGenerator } from '../../services/WorldGenerator';
import { Dimension, GameState } from '../../types';
import { 
    hexToScreenPosition, 
    drawBiomeTile, 
    drawPoiMarker, 
    drawPlayerToken,
    getBiomeNameForCoords
} from '../world_map/mapUtils';
import { sfx } from '../../services/SoundSystem';

export const OverworldMinimap: React.FC = () => {
    const { 
        playerPos, 
        dimension, 
        gameState, 
        activeOverworldEnemies, 
        toggleMap, 
        exploredTiles 
    } = useGameStore();

    const [isCollapsed, setIsCollapsed] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animFrameRef = useRef<number>(0);
    const startTimeRef = useRef<number>(Date.now());

    const isTown = gameState === GameState.TOWN_EXPLORATION;
    const isOverworld = gameState === GameState.OVERWORLD;

    const currentBiome = useMemo(() => {
        if (isTown) return 'Asentamiento Seguro';
        return getBiomeNameForCoords(playerPos.x, playerPos.y, dimension);
    }, [playerPos.x, playerPos.y, dimension, isTown]);

    useEffect(() => {
        if (isCollapsed || !isOverworld) return;

        let isMounted = true;
        const render = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d', { alpha: false });
            if (!ctx) return;

            const width = canvas.width = canvas.clientWidth;
            const height = canvas.height = canvas.clientHeight;
            const centerX = width / 2;
            const centerY = height / 2;
            const scale = 11; // Clear scale for 6-hex view radius
            const animTime = (Date.now() - startTimeRef.current) / 1000;

            // Background
            const isUD = dimension === Dimension.UPSIDE_DOWN;
            ctx.fillStyle = isUD ? '#05020a' : '#090d16';
            ctx.fillRect(0, 0, width, height);

            // Clip into circular/rounded compass viewport
            ctx.save();
            ctx.beginPath();
            ctx.arc(centerX, centerY, width / 2 - 2, 0, Math.PI * 2);
            ctx.clip();

            // Render surrounding tiles in a 6-hex radius
            const radius = 6;
            for (let qOffset = -radius; qOffset <= radius; qOffset++) {
                const r1 = Math.max(-radius, -qOffset - radius);
                const r2 = Math.min(radius, -qOffset + radius);
                for (let rOffset = r1; rOffset <= r2; rOffset++) {
                    const q = playerPos.x + qOffset;
                    const r = playerPos.y + rOffset;

                    const tile = WorldGenerator.getTile(q, r, dimension);
                    const { x, y } = hexToScreenPosition(q, r, playerPos.x, playerPos.y, centerX, centerY, scale);

                    // Draw Biome Hexagon Tile
                    drawBiomeTile(ctx, tile, x, y, scale, dimension, animTime, false);
                    drawPoiMarker(ctx, tile, x, y, scale, animTime);
                }
            }

            // Draw Overworld Enemies within range
            activeOverworldEnemies.forEach(enemy => {
                if (enemy.dimension !== dimension) return;
                const { x, y } = hexToScreenPosition(enemy.q, enemy.r, playerPos.x, playerPos.y, centerX, centerY, scale);
                
                // Threat beacon
                ctx.fillStyle = '#ef4444';
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#fca5a5';
                ctx.lineWidth = 1;
                ctx.stroke();
            });

            // Draw Player Token at Center
            drawPlayerToken(ctx, centerX, centerY, scale, animTime);

            ctx.restore();

            // Bezel Ring & Cardinal North Indicator
            ctx.strokeStyle = isUD ? 'rgba(168, 85, 247, 0.6)' : 'rgba(245, 158, 11, 0.6)';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(centerX, centerY, width / 2 - 2, 0, Math.PI * 2);
            ctx.stroke();

            // North indicator badge
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.moveTo(centerX, 2);
            ctx.lineTo(centerX - 4, 10);
            ctx.lineTo(centerX + 4, 10);
            ctx.closePath();
            ctx.fill();

            if (isMounted) {
                animFrameRef.current = requestAnimationFrame(render);
            }
        };

        render();

        return () => {
            isMounted = false;
            if (animFrameRef.current) {
                cancelAnimationFrame(animFrameRef.current);
            }
        };
    }, [playerPos, dimension, isOverworld, isCollapsed, activeOverworldEnemies]);

    if (!isOverworld) return null;

    return (
        <div className="fixed top-16 right-3 z-20 pointer-events-auto flex flex-col items-end gap-1 select-none animate-in fade-in duration-200">
            {/* Main Minimap Capsule */}
            <div className="relative bg-slate-950/80 backdrop-blur-2xl p-1.5 rounded-3xl border border-white/15 shadow-2xl flex flex-col items-center">
                
                {/* Minimap Viewport */}
                {!isCollapsed ? (
                    <div 
                        onClick={() => {
                            sfx.playUiClick();
                            toggleMap();
                        }}
                        className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden cursor-pointer active:scale-95 transition-transform shadow-inner group"
                        title="Toca para abrir el Mapa Completo de Arcadia"
                    >
                        <canvas ref={canvasRef} className="w-full h-full" />
                        
                        {/* Hover Overlay Hint */}
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-black text-amber-300">
                            🔍 Abrir
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => {
                            sfx.playUiClick();
                            setIsCollapsed(false);
                        }}
                        className="min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-amber-400 font-black text-xs hover:bg-white/10"
                        title="Mostrar Minimapa"
                    >
                        🗺️
                    </button>
                )}

                {/* Info Bar & Collapse Toggle */}
                {!isCollapsed && (
                    <div className="w-full mt-1.5 flex items-center justify-between gap-1 px-1">
                        <div className="flex flex-col text-left min-w-0 pr-1">
                            <span className="text-[8px] font-mono font-bold text-amber-300 truncate max-w-[85px]">
                                {currentBiome}
                            </span>
                            <span className="text-[7px] font-mono text-slate-400">
                                ({playerPos.x}, {playerPos.y})
                            </span>
                        </div>

                        <div className="flex items-center gap-0.5">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    sfx.playUiClick();
                                    toggleMap();
                                }}
                                className="w-6 h-6 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] flex items-center justify-center font-bold"
                                title="Pantalla Completa"
                            >
                                ⛶
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    sfx.playUiClick();
                                    setIsCollapsed(true);
                                }}
                                className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-[10px] flex items-center justify-center"
                                title="Ocultar Minimapa"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
