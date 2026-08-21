import React, { useState, useCallback } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../../store/gameStore';
import { BattleCell, BattleAction, Entity } from '../../types';
import { BATTLE_MAP_SIZE } from '../../constants';
import { TargetTrajectoryLine } from './TargetTrajectoryLine';
import { Tactical3DGridOverlay } from './Tactical3DGridOverlay';
import { TargetLockRing3D } from './TargetLockRing3D';
import { CombatForecastOverlay } from './CombatForecastOverlay';
import { checkLineOfSight } from '../../services/dndRules';

export const InteractionLayer = ({ mapData, validMoves, validTargets, attackRangeTiles, onTileClick, onTileHover }: any) => {
    const { turnOrder, currentTurnIndex, battleEntities, selectedAction, selectedTile, hoveredEntity } = useGameStore();
    const [snappedLockEntity, setSnappedLockEntity] = useState<Entity | null>(null);
    const [isAutoSnapped, setIsAutoSnapped] = useState<boolean>(false);

    if (!mapData || mapData.length === 0) return null;
    const center = BATTLE_MAP_SIZE / 2;

    const activeId = turnOrder[currentTurnIndex];
    const activeEntity = battleEntities.find(e => e.id === activeId);

    /**
     * Auto-Target Radius Helper:
     * Calculates the closest active entity within a snap radius (2.5 grid tiles)
     * from touch/click point (px, pz) and snaps target selection to it.
     */
    const resolveAutoTarget = useCallback((px: number, pz: number) => {
      const rawX = Math.round(px);
      const rawZ = Math.round(pz);

      const clampedX = Math.max(0, Math.min(BATTLE_MAP_SIZE - 1, rawX));
      const clampedZ = Math.max(0, Math.min(BATTLE_MAP_SIZE - 1, rawZ));

      let closestEnt: Entity | null = null;
      let minDistance = 2.5; // Max auto-target snap radius in grid tiles

      for (const ent of battleEntities) {
        if (!ent.position || ent.stats.hp <= 0) continue;

        const dx = ent.position.x - px;
        const dz = ent.position.y - pz;
        const dist = Math.hypot(dx, dz);

        // Prioritize targetable entities during ATTACK or MAGIC mode
        const isTargetable = validTargets && validTargets.some((vt: any) => vt.x === ent.position.x && vt.y === ent.position.y);
        const weight = isTargetable ? 0.75 : 1.0;
        const weightedDist = dist * weight;

        if (weightedDist < minDistance) {
          minDistance = weightedDist;
          closestEnt = ent;
        }
      }

      if (closestEnt) {
        const rawDist = Math.hypot(closestEnt.position.x - px, closestEnt.position.y - pz);
        return {
          tile: { x: closestEnt.position.x, z: closestEnt.position.y },
          entity: closestEnt,
          isSnapped: rawDist > 0.35 // True if touch point was offset from exact tile center
        };
      }

      return {
        tile: { x: clampedX, z: clampedZ },
        entity: null,
        isSnapped: false
      };
    }, [battleEntities, validTargets]);

    const handlePointerMove = (e: any) => { 
      e.stopPropagation(); 
      const targetRes = resolveAutoTarget(e.point.x, e.point.z);
      
      setSnappedLockEntity(targetRes.entity);
      setIsAutoSnapped(targetRes.isSnapped);

      if (targetRes.tile.x >= 0 && targetRes.tile.x < BATTLE_MAP_SIZE && targetRes.tile.z >= 0 && targetRes.tile.z < BATTLE_MAP_SIZE) {
        onTileHover(targetRes.tile.x, targetRes.tile.z); 
      }
    };

    const handleClick = (e: any) => { 
      e.stopPropagation(); 
      const targetRes = resolveAutoTarget(e.point.x, e.point.z);

      setSnappedLockEntity(targetRes.entity);
      setIsAutoSnapped(targetRes.isSnapped);

      if (targetRes.tile.x >= 0 && targetRes.tile.x < BATTLE_MAP_SIZE && targetRes.tile.z >= 0 && targetRes.tile.z < BATTLE_MAP_SIZE) {
        onTileClick(targetRes.tile.x, targetRes.tile.z); 
      }
    };

    // Calculate Trajectory Line parameters
    let trajectoryData = null;
    if (activeEntity && (selectedAction === BattleAction.ATTACK || selectedAction === BattleAction.MAGIC)) {
        const targetTile = selectedTile || ((hoveredEntity as any)?.position ? { x: (hoveredEntity as any).position.x, z: (hoveredEntity as any).position.y } : null);
        
        if (targetTile && (targetTile.x !== activeEntity.position.x || targetTile.z !== activeEntity.position.y)) {
            const startCell = mapData.find((c: BattleCell) => c.x === activeEntity.position.x && c.z === activeEntity.position.y);
            const targetCell = mapData.find((c: BattleCell) => c.x === targetTile.x && c.z === targetTile.z);

            const startY = startCell ? (startCell.offsetY + startCell.height) : 0.5;
            const targetY = targetCell ? (targetCell.offsetY + targetCell.height) : 0.5;

            const hasLos = checkLineOfSight(activeEntity.position, { x: targetTile.x, y: targetTile.z }, mapData);
            const hasHighGround = startY > targetY + 0.5;

            trajectoryData = {
                startPos: [activeEntity.position.x, startY, activeEntity.position.y] as [number, number, number],
                endPos: [targetTile.x, targetY, targetTile.z] as [number, number, number],
                hasLos,
                hasHighGround
            };
        }
    }

    // Determine target lock entity (priority: snapped entity > hovered entity > selected tile entity)
    const lockedTarget = snappedLockEntity || (hoveredEntity as Entity) || (selectedTile ? battleEntities.find((e: Entity) => e.position.x === selectedTile.x && e.position.y === selectedTile.z) : null);
    
    let targetSurfaceY = 0.5;
    if (lockedTarget) {
      const cell = mapData.find((c: BattleCell) => c.x === lockedTarget.position.x && c.z === lockedTarget.position.y);
      targetSurfaceY = cell ? (cell.offsetY + cell.height) : 0.5;
    }

    return (
        <group>
             {/* Invisible Interaction Plane for mouse/touch raycasting */}
             <mesh rotation={[-Math.PI / 2, 0, 0]} position={[center - 0.5, 0.5, center - 0.5]} onPointerMove={handlePointerMove} onClick={handleClick}>
               <planeGeometry args={[BATTLE_MAP_SIZE, BATTLE_MAP_SIZE]} />
               <meshBasicMaterial transparent opacity={0} depthWrite={false} />
             </mesh>

             {/* Custom GLSL 3D Grid Overlay with Color-Coded Shaders */}
             <Tactical3DGridOverlay 
               mapData={mapData} 
               validMoves={validMoves || []} 
               validTargets={validTargets || []} 
               attackRangeTiles={attackRangeTiles || []}
             />

             {/* 3D Auto-Target Lock Ring & Visual Feedback */}
             {lockedTarget && lockedTarget.id !== activeId && (
                 <>
                   <TargetLockRing3D 
                       targetEntity={lockedTarget}
                       activeEntity={activeEntity || null}
                       surfaceY={targetSurfaceY}
                       selectedAction={selectedAction}
                       isAutoSnapped={isAutoSnapped}
                   />
                   <CombatForecastOverlay
                       targetEntity={lockedTarget}
                       mapData={mapData}
                   />
                 </>
             )}

             {/* 3D Trajectory Projection Arc */}
             {trajectoryData && (
                 <TargetTrajectoryLine 
                     startPos={trajectoryData.startPos} 
                     endPos={trajectoryData.endPos} 
                     hasLos={trajectoryData.hasLos} 
                     hasHighGround={trajectoryData.hasHighGround} 
                     color={selectedAction === BattleAction.MAGIC ? "#a855f7" : "#38bdf8"}
                 />
             )}
        </group>
    );
};


