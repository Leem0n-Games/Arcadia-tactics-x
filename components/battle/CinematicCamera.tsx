import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/gameStore';
import { BATTLE_MAP_SIZE } from '../../constants';
import { BattleCell, BattleAction } from '../../types';

// Easing functions for luxurious cinematic camera movement
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const _targetLookAt = new THREE.Vector3();
const _idealCamPos = new THREE.Vector3();
const _currentCamOffset = new THREE.Vector3();
const Y_AXIS = new THREE.Vector3(0, 1, 0);

export const CinematicCamera = () => {
  const {
    isActionAnimating,
    activeDiceRoll,
    battleEntities,
    turnOrder,
    currentTurnIndex,
    selectedTile,
    selectedAction,
    hoveredEntity,
    activeSpellEffect,
    screenShake,
    battleMap,
    isRadialMenuOpen,
    cameraZoomFactor = 1.0,
    cameraAzimuthOffset = 0
  } = useGameStore();

  const { camera, controls } = useThree();
  const center = BATTLE_MAP_SIZE / 2;

  // Tween state refs
  const prevTurnIndexRef = useRef<number | null>(null);
  const tweenTimeRef = useRef<number>(1.0); // 0.0 -> 1.0 (1.0 = completed)
  const tweenDurationRef = useRef<number>(0.75); // seconds
  const startLookAtRef = useRef(new THREE.Vector3(center, 1.0, center));
  const targetLookAtRef = useRef(new THREE.Vector3(center, 1.0, center));
  const currentLookAtRef = useRef(new THREE.Vector3(center, 1.0, center));
  const smoothAzimuthRef = useRef(0);
  const victoryAngleRef = useRef(0);

  // Initialize lookAt on mount
  useEffect(() => {
    if (controls) {
      const orbit = controls as any;
      startLookAtRef.current.copy(orbit.target);
      targetLookAtRef.current.copy(orbit.target);
      currentLookAtRef.current.copy(orbit.target);
    }
  }, [controls]);

  useFrame((state, delta) => {
    if (!controls) return;
    const orbit = controls as any;

    const activeId = turnOrder[currentTurnIndex];
    const activeEntity = battleEntities.find((e) => e.id === activeId);

    // Check if victory condition met (all enemies defeated)
    const enemies = battleEntities.filter(e => e.type === 'ENEMY');
    const isVictory = enemies.length > 0 && enemies.every(e => e.stats.hp <= 0);

    // Get terrain height at entity cell
    const getCellY = (x: number, z: number) => {
      const cell = battleMap.find((c: BattleCell) => c.x === x && c.z === z);
      return cell ? (cell.offsetY || 0) + cell.height : 0.5;
    };

    let targetLookAtX = center;
    let targetLookAtY = 1.0;
    let targetLookAtZ = center;

    let targetDistance = 20;
    let targetHeight = 15;
    let targetFov = 36;
    let transitionDuration = 0.75;

    // VICTORY CINEMATIC: Slow luxurious orbit around surviving party
    if (isVictory) {
      const alivePlayers = battleEntities.filter(e => e.type === 'PLAYER' && e.stats.hp > 0);
      if (alivePlayers.length > 0) {
        const avgX = alivePlayers.reduce((sum, p) => sum + p.position.x, 0) / alivePlayers.length;
        const avgZ = alivePlayers.reduce((sum, p) => sum + p.position.y, 0) / alivePlayers.length;
        const avgY = getCellY(avgX, avgZ);

        targetLookAtX = avgX;
        targetLookAtY = avgY + 1.2;
        targetLookAtZ = avgZ;

        targetDistance = 14;
        targetHeight = 8;
        targetFov = 32;

        victoryAngleRef.current += delta * 0.35;
      }
    } else if (activeEntity) {
      const activeX = activeEntity.position.x;
      const activeZ = activeEntity.position.y;
      const activeY = getCellY(activeX, activeZ);

      // Default focus: center on active chibi unit with gentle height compensation
      targetLookAtX = activeX;
      targetLookAtY = activeY + 1.1;
      targetLookAtZ = activeZ;

      // 1. ACTIVE ATTACK / SPELL / DICE ROLL ANIMATION (CINEMATIC CLOSE-UP IMPACT ZOOM)
      if (activeDiceRoll || activeSpellEffect || isActionAnimating) {
        let impactX = activeX;
        let impactZ = activeZ;
        let impactY = activeY;

        if (activeDiceRoll) {
          const targetEnt = battleEntities.find((e) => e.name === activeDiceRoll.targetName);
          if (targetEnt) {
            impactX = targetEnt.position.x;
            impactZ = targetEnt.position.y;
            impactY = getCellY(impactX, impactZ);
          }
        } else if (activeSpellEffect?.endPos) {
          impactX = activeSpellEffect.endPos[0];
          impactY = activeSpellEffect.endPos[1];
          impactZ = activeSpellEffect.endPos[2];
        } else if (selectedTile) {
          impactX = selectedTile.x;
          impactZ = selectedTile.z;
          impactY = getCellY(impactX, impactZ);
        }

        // Focus 80% directly on impact position for high-octane battle feedback
        targetLookAtX = THREE.MathUtils.lerp(activeX, impactX, 0.80);
        targetLookAtY = THREE.MathUtils.lerp(activeY, impactY, 0.80) + 1.1;
        targetLookAtZ = THREE.MathUtils.lerp(activeZ, impactZ, 0.80);

        // Close-up action zoom-in
        targetDistance = 8.5;
        targetHeight = 4.8;
        targetFov = 24;
        transitionDuration = 0.5;

      // 2. TARGETING MODE (ATTACK / MAGIC WITH HOVERED OR SELECTED TARGET)
      } else if (
        selectedAction === BattleAction.ATTACK ||
        selectedAction === BattleAction.MAGIC ||
        (hoveredEntity && selectedAction !== BattleAction.MOVE) ||
        (selectedTile && selectedAction !== BattleAction.MOVE)
      ) {
        let destX = activeX;
        let destZ = activeZ;
        let destY = activeY;

        if (hoveredEntity && (hoveredEntity as any).position) {
          destX = (hoveredEntity as any).position.x;
          destZ = (hoveredEntity as any).position.y;
          destY = getCellY(destX, destZ);
        } else if (selectedTile) {
          destX = selectedTile.x;
          destZ = selectedTile.z;
          destY = getCellY(destX, destZ);
        }

        // Smooth framing centered between attacker and defender
        targetLookAtX = (activeX + destX) * 0.5;
        targetLookAtY = Math.max(activeY, destY) + 1.1;
        targetLookAtZ = (activeZ + destZ) * 0.5;

        // Scale distance smoothly with distance between combatants
        const combatantDist = Math.hypot(destX - activeX, destZ - activeZ);
        targetDistance = Math.max(14, combatantDist * 1.5 + 8);
        targetHeight = Math.max(10, combatantDist * 1.0 + 6);
        targetFov = 34;
        transitionDuration = 0.55;
        
      // 3. TACTICAL MOVEMENT MODE (TOP-DOWN HIGH-ALTITUDE VIEW)
      } else if (selectedAction === BattleAction.MOVE) {
        targetDistance = 1.0;
        targetHeight = 22;
        targetFov = 42;
        transitionDuration = 0.6;
      }

      // 4. RADIAL MENU OPEN (SLIGHT PULL-BACK FOR THUMB ERGONOMICS)
      const isPlayerTurn = activeEntity?.type === 'PLAYER';
      if (isPlayerTurn && isRadialMenuOpen && !isActionAnimating && !activeDiceRoll) {
        targetDistance += 4;
        targetHeight += 3;
        targetFov += 3;
      }
    }

    _targetLookAt.set(targetLookAtX, targetLookAtY, targetLookAtZ);

    // Detect turn switch or significant focus target change
    const isNewTurn = prevTurnIndexRef.current !== currentTurnIndex;
    const distanceToNewTarget = targetLookAtRef.current.distanceTo(_targetLookAt);

    if (isNewTurn || distanceToNewTarget > 0.8) {
      if (isNewTurn) {
        prevTurnIndexRef.current = currentTurnIndex;
        transitionDuration = 0.85; // Luxurious, cozy turn-panning tween
      }
      startLookAtRef.current.copy(currentLookAtRef.current);
      targetLookAtRef.current.copy(_targetLookAt);
      tweenTimeRef.current = 0.0;
      tweenDurationRef.current = Math.max(0.35, transitionDuration);
    }

    // Advance smooth tween progress
    if (tweenTimeRef.current < 1.0) {
      tweenTimeRef.current = Math.min(1.0, tweenTimeRef.current + delta / tweenDurationRef.current);
      const easeProgress = easeInOutCubic(tweenTimeRef.current);
      currentLookAtRef.current.lerpVectors(startLookAtRef.current, targetLookAtRef.current, easeProgress);
    } else {
      // Gentle micro-follow when unit moves
      currentLookAtRef.current.lerp(_targetLookAt, Math.min(1.0, delta * 5.5));
    }

    // Apply tweened lookAt to controls target
    orbit.target.copy(currentLookAtRef.current);

    // Apply user gesture pinch-to-zoom multiplier
    const scaledDistance = targetDistance * cameraZoomFactor;

    // Calculate ideal camera position based on distance and height offset using scratch vector
    _currentCamOffset.copy(camera.position).sub(orbit.target);

    const currentDist = _currentCamOffset.length();
    const idealDist = Math.sqrt(scaledDistance * scaledDistance + targetHeight * targetHeight);

    const newDist = THREE.MathUtils.lerp(currentDist, idealDist, Math.min(1.0, delta * 4.0));
    _currentCamOffset.setLength(newDist);

    // Apply smooth two-finger azimuth rotation or victory orbit
    const totalAzimuth = cameraAzimuthOffset + (isVictory ? victoryAngleRef.current : 0);
    smoothAzimuthRef.current = THREE.MathUtils.lerp(smoothAzimuthRef.current, totalAzimuth, Math.min(1.0, delta * 8.0));
    if (Math.abs(smoothAzimuthRef.current) > 0.0001) {
      _currentCamOffset.applyAxisAngle(Y_AXIS, smoothAzimuthRef.current);
    }

    _idealCamPos.copy(orbit.target).add(_currentCamOffset);

    // Apply Screen Shake Camera Jitter if screenShake active
    if (screenShake && screenShake > 0) {
      const shakeIntensity = Math.min(1.5, screenShake * 0.22);
      _idealCamPos.x += (Math.random() - 0.5) * shakeIntensity;
      _idealCamPos.y += (Math.random() - 0.5) * shakeIntensity * 0.8;
      _idealCamPos.z += (Math.random() - 0.5) * shakeIntensity;
    }

    // Smooth camera positioning with natural damping
    camera.position.lerp(_idealCamPos, Math.min(1.0, delta * 5.0));

    // Smooth FOV zoom transitions
    if ('fov' in camera) {
      const pCam = camera as THREE.PerspectiveCamera;
      pCam.fov = THREE.MathUtils.lerp(pCam.fov, targetFov, Math.min(1.0, delta * 4.0));
      pCam.updateProjectionMatrix();
    }

    orbit.update();
  });

  return null;
};
