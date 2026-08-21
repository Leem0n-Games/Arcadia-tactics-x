import React, { useState, useEffect, useRef } from 'react';
import { HexCell, PositionComponent, OverworldEntity } from '../../types';
import { HEX_SIZE } from '../../constants';
import { useGameStore } from '../../store/gameStore';

// Hex Polygon Path
const HEX_POINTS = (() => {
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle_deg = 60 * i;
    const angle_rad = (Math.PI / 180) * angle_deg;
    points.push(`${HEX_SIZE * Math.cos(angle_rad)},${HEX_SIZE * Math.sin(angle_rad)}`);
  }
  return points.join(' ');
})();

interface HexMapSVGOverlayProps {
  svgRef: React.RefObject<SVGSVGElement | null>;
  pan: { x: number; y: number };
  viewport: { w: number; h: number };
  visibleCells: HexCell[];
  visibleEnemies: OverworldEntity[];
  playerPos: PositionComponent;
  isGracePeriod: boolean;
  previewPath: HexCell[];
  hoveredCellKey: string | null;
  isUpsideDown: boolean;
  playerSprite: string;
  hexToPixel: (q: number, r: number) => { x: number; y: number };
}

export const HexMapSVGOverlay: React.FC<HexMapSVGOverlayProps> = ({
  svgRef,
  pan,
  viewport,
  visibleCells,
  visibleEnemies,
  playerPos,
  isGracePeriod,
  previewPath,
  hoveredCellKey,
  isUpsideDown,
  playerSprite,
  hexToPixel
}) => {
  const isPlayerMoving = useGameStore(state => state.isPlayerMoving);
  
  const [frameIndex, setFrameIndex] = useState(0); // 0 is idle standing pose (4 columns: 0, 1, 2, 3)
  const [facingDir, setFacingDir] = useState(0); // 0: Down, 1: Left, 2: Right, 3: Up

  const lastPosRef = useRef(playerPos);

  // Direction tracking based on actual coordinates changes
  useEffect(() => {
    const prev = lastPosRef.current;
    if (playerPos.x !== prev.x || playerPos.y !== prev.y) {
      // Calculate delta in pixels (since hex q/r can be oblique, let's use actual pixels or q/r)
      const prevPixel = hexToPixel(prev.x, prev.y);
      const currPixel = hexToPixel(playerPos.x, playerPos.y);
      const dx = currPixel.x - prevPixel.x;
      const dy = currPixel.y - prevPixel.y;

      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) {
          setFacingDir(1); // Left
        } else {
          setFacingDir(2); // Right
        }
      } else {
        if (dy < 0) {
          setFacingDir(3); // Up
        } else {
          setFacingDir(0); // Down
        }
      }
      lastPosRef.current = playerPos;
    }
  }, [playerPos, hexToPixel]);

  // Frame cycling animation when player is moving (4-frame walk cycle)
  useEffect(() => {
    if (!isPlayerMoving) {
      setFrameIndex(0); // Reset to standing/idle frame
      return;
    }

    const interval = setInterval(() => {
      setFrameIndex(prev => (prev + 1) % 4);
    }, 140);

    return () => clearInterval(interval);
  }, [isPlayerMoving]);

  return (
    <svg 
      ref={svgRef} 
      className="absolute inset-0 pointer-events-none z-10" 
      width="100%" 
      height="100%" 
      viewBox={`${pan.x - viewport.w / 2} ${pan.y - viewport.h / 2} ${viewport.w} ${viewport.h}`} 
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient id="portalGlow">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
        </radialGradient>
        <polygon id="hex-shape-ui" points={HEX_POINTS} />
      </defs>

      {/* Portals */}
      {visibleCells.map(cell => {
        if (!cell.isExplored || !cell.isVisible) return null;
        const { x, y } = hexToPixel(cell.q, cell.r);
        if (cell.hasPortal) {
          return (
            <g key={`portal-${cell.q}-${cell.r}`} transform={`translate(${x}, ${y})`}>
              <circle r={HEX_SIZE * 0.6} fill="url(#portalGlow)" opacity="0.4" />
              <circle r={HEX_SIZE * 0.4} fill="none" stroke="#a855f7" strokeWidth="2" strokeDasharray="5, 3" opacity="0.8">
                <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="10s" repeatCount="indefinite" />
              </circle>
            </g>
          );
        }
        return null;
      })}

      {/* Ancient Ruins and Mystic Caves */}
      {visibleCells.map(cell => {
        if (!cell.isExplored || !cell.isVisible) return null;
        if (cell.poiType === 'ANCIENT_RUINS') {
          const { x, y } = hexToPixel(cell.q, cell.r);
          return (
            <g key={`ancient-ruins-${cell.q}-${cell.r}`} transform={`translate(${x}, ${y})`}>
              <circle r={HEX_SIZE * 0.7} fill="#06b6d4" opacity="0.2" className="animate-pulse" />
              <circle r={HEX_SIZE * 0.5} fill="none" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="3, 2" />
              <text textAnchor="middle" dominantBaseline="central" fontSize={HEX_SIZE * 0.6} y={-2}>🏛️</text>
              <text textAnchor="middle" dominantBaseline="central" fontSize={HEX_SIZE * 0.28} y={HEX_SIZE * 0.65} fill="#67e8f9" fontWeight="bold">RUINAS</text>
            </g>
          );
        }
        if (cell.poiType === 'MYSTIC_CAVE') {
          const { x, y } = hexToPixel(cell.q, cell.r);
          return (
            <g key={`mystic-cave-${cell.q}-${cell.r}`} transform={`translate(${x}, ${y})`}>
              <circle r={HEX_SIZE * 0.7} fill="#8b5cf6" opacity="0.2" className="animate-pulse" />
              <circle r={HEX_SIZE * 0.5} fill="none" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="3, 2" />
              <text textAnchor="middle" dominantBaseline="central" fontSize={HEX_SIZE * 0.6} y={-2}>⛰️</text>
              <text textAnchor="middle" dominantBaseline="central" fontSize={HEX_SIZE * 0.28} y={HEX_SIZE * 0.65} fill="#c4b5fd" fontWeight="bold">CUEVA</text>
            </g>
          );
        }
        if (cell.poiType === 'GOBLIN_LAIR') {
          const { x, y } = hexToPixel(cell.q, cell.r);
          return (
            <g key={`goblin-lair-${cell.q}-${cell.r}`} transform={`translate(${x}, ${y})`}>
              <circle r={HEX_SIZE * 0.75} fill="#22c55e" opacity="0.25" className="animate-pulse" />
              <circle r={HEX_SIZE * 0.55} fill="none" stroke="#22c55e" strokeWidth="2" strokeDasharray="3, 2" />
              <text textAnchor="middle" dominantBaseline="central" fontSize={HEX_SIZE * 0.65} y={-2}>⛺</text>
              <text textAnchor="middle" dominantBaseline="central" fontSize={HEX_SIZE * 0.28} y={HEX_SIZE * 0.68} fill="#86efac" fontWeight="bold">GOBLINS</text>
            </g>
          );
        }
        return null;
      })}

      {/* Dragon Dungeon Entrances */}
      {visibleCells.map(cell => {
        if (!cell.isExplored || !cell.isVisible) return null;
        if (cell.poiType === 'DRAGON_LAIR') {
          const { x, y } = hexToPixel(cell.q, cell.r);
          return (
            <g key={`dragon-lair-${cell.q}-${cell.r}`} transform={`translate(${x}, ${y})`}>
              <circle r={HEX_SIZE * 0.75} fill="#ef4444" opacity="0.25" className="animate-pulse" />
              <circle r={HEX_SIZE * 0.55} fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="4, 2" />
              <text textAnchor="middle" dominantBaseline="central" fontSize={HEX_SIZE * 0.65} y={-2}>🏰</text>
              <text textAnchor="middle" dominantBaseline="central" fontSize={HEX_SIZE * 0.3} y={HEX_SIZE * 0.7} fill="#fca5a5" fontWeight="bold">DUNGEON</text>
            </g>
          );
        }
        return null;
      })}
      
      {/* Enemies */}
      {visibleEnemies.map(enemy => {
        if (!visibleCells.some(c => c.q === enemy.q && c.r === enemy.r && c.isVisible)) return null;
        const { x, y } = hexToPixel(enemy.q, enemy.r);
        const distToPlayer = (Math.abs(enemy.q - playerPos.x) + Math.abs(enemy.q + enemy.r - playerPos.x - playerPos.y) + Math.abs(enemy.r - playerPos.y)) / 2;
        const isAggro = distToPlayer <= enemy.visionRange;

        return (
          <g key={enemy.id} transform={`translate(${x}, ${y})`}>
            {isAggro && !isGracePeriod && (
              <circle r={HEX_SIZE * 0.8} fill="none" stroke="#ef4444" strokeWidth="1" strokeDasharray="2,2" className="animate-pulse" opacity={0.5} />
            )}
            <image href={enemy.sprite} x={-HEX_SIZE * 0.8} y={-HEX_SIZE} width={HEX_SIZE * 1.6} height={HEX_SIZE * 1.6} className="drop-shadow-lg" style={{ imageRendering: 'pixelated' }} />
            <rect x={-10} y={-HEX_SIZE - 5} width={20} height={3} fill="#ef4444" rx={1} />
          </g>
        );
      })}

      {/* Pathfinding preview */}
      {previewPath.length > 0 && (
        <g className="pointer-events-none">
          <polyline 
            points={[ (() => { const {x, y} = hexToPixel(playerPos.x, playerPos.y); return `${x},${y}`; })(), ...previewPath.map(cell => { const {x, y} = hexToPixel(cell.q, cell.r); return `${x},${y}`; }) ].join(' ')} 
            fill="none" 
            stroke={isUpsideDown ? "#d8b4fe" : "#fbbf24"} 
            strokeWidth="3" 
            strokeDasharray="8,6" 
            strokeOpacity="0.6" 
            strokeLinecap="round" 
          />
          {previewPath.map((cell, i) => { const {x, y} = hexToPixel(cell.q, cell.r); return ( <circle key={`path-${i}`} cx={x} cy={y} r={4} fill={isUpsideDown ? "#d8b4fe" : "#fbbf24"} fillOpacity="0.8" /> ); })}
        </g>
      )}

      {/* Hover Highlight */}
      {hoveredCellKey && (() => {
        const [q, r] = hoveredCellKey.split(',').map(Number);
        const { x, y } = hexToPixel(q, r);
        return ( <use href="#hex-shape-ui" x={x} y={y} stroke={isUpsideDown ? "#d8b4fe" : "#fbbf24"} strokeWidth="2" fill={isUpsideDown ? "#a855f7" : "#fbbf24"} fillOpacity="0.1" className="animate-pulse" /> );
      })()}

      {/* Player Unit */}
      {(() => {
        const { x, y } = hexToPixel(playerPos.x, playerPos.y);
        const PLAYER_SCALE = 2.0;
        const isPriest = Boolean(playerSprite && playerSprite.toLowerCase().includes('priest'));
        const isFighter = Boolean(playerSprite && playerSprite.toLowerCase().includes('fighter'));
        const isSpritesheet = isPriest || isFighter;
        
        // Spritesheet: 4 columns (172.5px each) x 4 rows (257.5px each)
        // Row 0: Down (Front), Row 1: Left, Row 2: Right, Row 3: Up (Back)
        const ROW_BY_FACING: Record<number, number> = {
          0: 0, // Down -> Row 0
          1: 1, // Left -> Row 1 (Profile facing left)
          2: 2, // Right -> Row 2 (Profile facing right)
          3: 3  // Up -> Row 3 (Back)
        };
        const activeRow = ROW_BY_FACING[facingDir] ?? 0;
        const FRAME_WIDTH = 172.5;
        const FRAME_HEIGHT = 257.5;
        const displayWidth = HEX_SIZE * PLAYER_SCALE;
        const displayHeight = displayWidth * (FRAME_HEIGHT / FRAME_WIDTH);

        return (
          <g 
            className="transition-transform duration-200 ease-linear will-change-transform"
            style={{ transform: `translate(${x}px, ${y}px)` }}
          >
            {isGracePeriod && (
              <circle r={HEX_SIZE * 1.2} fill="none" stroke="#60a5fa" strokeWidth="2" className="animate-ping" opacity={0.6} />
            )}
            {isGracePeriod && (
              <circle r={HEX_SIZE * 1.1} fill="#3b82f6" opacity={0.2} />
            )}
            <use href="#hex-shape-ui" stroke="#fbbf24" strokeWidth="2" strokeOpacity="0.6" fill="none" className="animate-pulse" />
            {isSpritesheet ? (
              <g transform={`translate(${-displayWidth / 2}, ${-displayHeight * 0.82})`} className="drop-shadow-2xl" style={{ opacity: isGracePeriod ? 0.7 : 1 }}>
                <svg 
                  width={displayWidth} 
                  height={displayHeight} 
                  viewBox={`${frameIndex * FRAME_WIDTH} ${activeRow * FRAME_HEIGHT} ${FRAME_WIDTH} ${FRAME_HEIGHT}`}
                  style={{ overflow: 'hidden' }}
                >
                  <image 
                    href={isPriest ? '/assets/players/priest/spritesheetpriest.png' : playerSprite} 
                    width={690} 
                    height={1030} 
                    style={{ imageRendering: 'pixelated' }} 
                  />
                </svg>
              </g>
            ) : (
              <image href={playerSprite} x={-(HEX_SIZE * PLAYER_SCALE) / 2} y={-(HEX_SIZE * PLAYER_SCALE) * 0.75} height={HEX_SIZE * PLAYER_SCALE} width={HEX_SIZE * PLAYER_SCALE} className="drop-shadow-2xl" style={{ imageRendering: 'pixelated', opacity: isGracePeriod ? 0.7 : 1 }} />
            )}
          </g>
        );
      })()}
    </svg>
  );
};
