import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Html } from '@react-three/drei';
import * as THREE from 'three';
import { ASSETS } from '../../constants';
import { getSafeTexture, textureManager } from '../../services/textureLoader';
import { getChibiProportions, calculateChibiSquashAndStretch } from '../../services/chibiScaling';
import { DEFAULT_COZY_GRADIENT_MAP, injectCozyCelShader, PulsingOutlineShaderMaterial } from '../../services/toonShader';
import { STANDARD_3D_SCALES } from '../Base3DRenderer';
import { useGameStore } from '../../store/gameStore';
import { BattleAction } from '../../types';

const SpriteComponent = ({ 
    url, 
    isFlashing, 
    isCurrentTurn,
    turnColor,
    charWidth, 
    charHeight,
    hp,
    isWalking,
    isCasting,
    isAttacking,
    isVictory
}: { 
    url: string; 
    isFlashing: boolean;
    isCurrentTurn?: boolean;
    turnColor?: string;
    charWidth: number;
    charHeight: number;
    hp: number;
    isWalking: boolean;
    isCasting: boolean;
    isAttacking: boolean;
    isVictory: boolean;
}) => {
    const safeUrl = (url && url.length > 5) ? url : ASSETS.UNITS.PLAYER;
    const [texVersion, setTexVersion] = useState(0);

    useEffect(() => {
        const unsubscribe = textureManager.subscribe(() => {
            setTexVersion(v => v + 1);
        });
        return unsubscribe;
    }, []);

    // Robust Priest & Fighter detection
    const isPriest = safeUrl.toLowerCase().includes('priest');
    const isFighter = safeUrl.toLowerCase().includes('fighter');
    
    // Intelligent sheet selection: Use battle sheet for combat/damage/battle states, walk sheet for map walking/idle
    const isCombatState = isAttacking || isCasting || isFlashing || hp <= 0 || isCurrentTurn;
    const currentUrl = (isPriest && !isCombatState && !isVictory) ? '/assets/players/priest/spritesheetpriest.png' : 
                       (isPriest && isCombatState) ? '/assets/players/priest/spritesheetpriestattacks.png' : 
                       (isPriest && isVictory) ? '/assets/players/priest/spritesheetpriest.png' :
                       (isFighter && isWalking) ? '/assets/fighter/fighter_walk.png' :
                       (isFighter && !isCombatState && !isVictory) ? '/assets/fighter/fighter_walk.png' :
                       (isFighter) ? '/assets/fighter/fighter_battle.png' :
                       safeUrl;

    const texture = useMemo(() => {
        const tex = getSafeTexture(currentUrl, 'transparent').clone();
        if (isPriest) {
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            
            // Priest Main Sheet (1030h) is 4x4. Attack Sheet (772h) is 4x3.
            const isAttacks = currentUrl.includes('attacks.png');
            const rows = isAttacks ? 3 : 4;
            const cols = 4;
            tex.repeat.set(1 / cols, 1 / rows);
        } else if (isFighter) {
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            
            // Fighter Walk Sheet is 4x4. Fighter Battle Sheet is 2x3.
            const isBattle = currentUrl.includes('fighter_battle.png');
            const rows = isBattle ? 3 : 4;
            const cols = isBattle ? 2 : 4;
            tex.repeat.set(1 / cols, 1 / rows);
        }
        tex.needsUpdate = true;
        return tex;
    }, [currentUrl, texVersion, isPriest, isFighter]);

    // Active Entity Pulsing Emission Outline Shader Material
    const outlineMaterial = useMemo(() => {
        return new PulsingOutlineShaderMaterial({
            map: texture,
            outlineColor: turnColor || '#fbbf24',
            outlineThickness: 0.036,
            baseIntensity: 0.85,
            pulseIntensity: 0.95,
            pulseSpeed: 3.8
        });
    }, [texture, turnColor]);

    useEffect(() => {
        if (outlineMaterial) {
            outlineMaterial.map = texture;
            outlineMaterial.outlineColor = turnColor || '#fbbf24';
            outlineMaterial.uMapOffset = texture.offset;
            outlineMaterial.uMapRepeat = texture.repeat;
        }
    }, [texture, turnColor, outlineMaterial]);

    useEffect(() => {
        if (texture && isPriest) {
            const isAttacksSheet = currentUrl.includes('attacks.png');
            const totalRows = isAttacksSheet ? 3 : 4;
            const totalCols = 4;
            let col = 0; 
            let row = 0;

            if (hp <= 0) {
                row = isAttacksSheet ? 2 : 0; 
                col = isAttacksSheet ? 3 : 0; // KO/Down pose
            } else if (isFlashing) {
                row = isAttacksSheet ? 2 : 0;
                col = isAttacksSheet ? 3 : 0; // Hurt pose
            } else if (isVictory) {
                row = isAttacksSheet ? 2 : 0; 
                col = isAttacksSheet ? 2 : 0; // Victory pose
            } else if (isWalking) {
                row = isAttacksSheet ? 0 : 0; // Walk down
                col = 1;
            } else if (isCasting) {
                row = isAttacksSheet ? 2 : 0; 
                col = 0; 
            } else if (isAttacking) {
                row = isAttacksSheet ? 1 : 0;
                col = 0;
            } else if (isCurrentTurn) {
                row = 0;
                col = 0; // Battle idle
            } else {
                row = 0;
                col = 0; // Standard idle
            }

            // Correct Three.js Y inversion (offset.y is bottom-up)
            texture.offset.set(col / totalCols, (totalRows - 1 - row) / totalRows);
            texture.needsUpdate = true;
            
            if (outlineMaterial) {
                outlineMaterial.uMapOffset = texture.offset;
                outlineMaterial.uMapRepeat = texture.repeat;
            }
        } else if (texture && isFighter) {
            const isBattleSheet = currentUrl.includes('fighter_battle.png');
            const totalRows = isBattleSheet ? 3 : 4;
            const totalCols = isBattleSheet ? 2 : 4;
            let col = 0;
            let row = 0;

            if (isBattleSheet) {
                // fighter_battle.png layout (2 cols x 3 rows)
                // Row 0: [0]=Standing, [1]=Battle Stance
                // Row 1: [0]=Attack Punch, [1]=Guard/Defend
                // Row 2: [0]=Victory Cheer, [1]=Hurt/KO
                if (hp <= 0 || isFlashing) {
                    row = 2;
                    col = 1; // Hurt / KO
                } else if (isVictory) {
                    row = 2;
                    col = 0; // Victory cheer
                } else if (isAttacking || isCasting) {
                    row = 1;
                    col = 0; // Attack punch
                } else if (isCurrentTurn) {
                    row = 0;
                    col = 1; // Battle stance
                } else {
                    row = 0;
                    col = 0; // Standing idle
                }
            } else {
                // fighter_walk.png layout (4 cols x 4 rows)
                if (isWalking) {
                    row = 0;
                    col = 1; // Walk step
                } else {
                    row = 0;
                    col = 0; // Front standing
                }
            }

            texture.offset.set(col / totalCols, (totalRows - 1 - row) / totalRows);
            texture.needsUpdate = true;
            
            if (outlineMaterial) {
                outlineMaterial.uMapOffset = texture.offset;
                outlineMaterial.uMapRepeat = texture.repeat;
            }
        }
    }, [texture, isPriest, isFighter, currentUrl, hp, isFlashing, isVictory, isWalking, isCasting, isAttacking, isCurrentTurn]);

    // Calculate Aspect Ratio Correction for Chibi Sprites
    // Priest & Fighter frames are ~172.5x257.5 (Ratio ~1.49).
    const isSpritesheetChar = isPriest || isFighter;
    const spriteAspect = isSpritesheetChar ? 257.5 / 172.5 : 1;
    const finalCharHeight = charHeight * spriteAspect;

    useFrame(({ clock }) => {
        if (isCurrentTurn && outlineMaterial) {
            outlineMaterial.time = clock.getElapsedTime();
        }
    });

    return (
        <group position={[0, finalCharHeight / 2, 0]}>
            {/* X-Ray Occlusion Silhouette */}
            <mesh position={[0, 0, -0.015]} scale={[1.08, 1.08, 1]}>
                <planeGeometry args={[charWidth, finalCharHeight]} />
                <meshBasicMaterial 
                    map={texture} 
                    transparent 
                    opacity={0.6} 
                    depthTest={false} 
                    depthWrite={false} 
                    color={isCurrentTurn ? (turnColor || '#fbbf24') : (turnColor || '#38bdf8')} 
                    side={THREE.DoubleSide} 
                />
            </mesh>

            {/* Active Turn Pulsing Emission Silhouette Outline Shader */}
            {isCurrentTurn && (
                <mesh position={[0, 0, -0.005]} scale={[1.09, 1.09, 1]}>
                    <planeGeometry args={[charWidth, finalCharHeight]} />
                    <primitive object={outlineMaterial} attach="material" />
                </mesh>
            )}

            {/* Crisp Chibi Cel/Ink Outline Backdrop */}
            <mesh position={[0, 0, -0.01]} scale={[1.06, 1.06, 1]}>
                <planeGeometry args={[charWidth, finalCharHeight]} />
                <meshBasicMaterial map={texture} transparent alphaTest={0.5} color="#0f172a" side={THREE.DoubleSide} />
            </mesh>

            {/* Primary Cel-Shaded Character Sprite */}
            <mesh>
                <planeGeometry args={[charWidth, finalCharHeight]} />
                <meshToonMaterial 
                    map={texture} 
                    gradientMap={DEFAULT_COZY_GRADIENT_MAP}
                    transparent 
                    alphaTest={0.5} 
                    color={isFlashing ? '#ff4444' : 'white'} 
                    emissive={isFlashing ? '#ff0000' : isCurrentTurn ? (turnColor || '#fbbf24') : '#000000'}
                    emissiveIntensity={isFlashing ? 1.5 : isCurrentTurn ? 0.22 : 0}
                    side={THREE.DoubleSide} 
                    onUpdate={(mat) => injectCozyCelShader(mat, { 
                        rimColor: isCurrentTurn ? (turnColor || '#fbbf24') : '#fffbeb', 
                        rimIntensity: isCurrentTurn ? 0.58 : 0.35, 
                        rimPower: isCurrentTurn ? 2.2 : 2.8,
                        isActiveTurn: isCurrentTurn
                    })}
                />
            </mesh>
        </group>
    );
};

const getConditionBadge = (condition: string) => {
    const c = condition.toLowerCase();
    if (c.includes('poison') || c.includes('veneno')) return { icon: '🧪', label: 'Poisoned', bg: 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40' };
    if (c.includes('stun') || c.includes('aturd')) return { icon: '💫', label: 'Stunned', bg: 'bg-amber-950/90 text-amber-300 border-amber-500/40' };
    if (c.includes('haste') || c.includes('prisa') || c.includes('veloz')) return { icon: '⚡', label: 'Hasted', bg: 'bg-yellow-950/90 text-yellow-300 border-yellow-500/40' };
    if (c.includes('burn') || c.includes('ardien') || c.includes('fuego')) return { icon: '🔥', label: 'Burning', bg: 'bg-orange-950/90 text-orange-300 border-orange-500/40' };
    if (c.includes('frost') || c.includes('congel') || c.includes('hielo')) return { icon: '❄️', label: 'Frozen', bg: 'bg-cyan-950/90 text-cyan-300 border-cyan-500/40' };
    if (c.includes('shield') || c.includes('escud')) return { icon: '🛡️', label: 'Shielded', bg: 'bg-sky-950/90 text-sky-300 border-sky-500/40' };
    if (c.includes('bless') || c.includes('bendi') || c.includes('curac')) return { icon: '✨', label: 'Blessed', bg: 'bg-yellow-950/90 text-yellow-200 border-yellow-400/40' };
    if (c.includes('curse') || c.includes('mald') || c.includes('sombra')) return { icon: '🔮', label: 'Cursed', bg: 'bg-purple-950/90 text-purple-300 border-purple-500/40' };
    return { icon: '🔸', label: condition, bg: 'bg-slate-900/90 text-slate-200 border-slate-700' };
};

// Pre-allocated static vectors for zero-allocation useFrame loops
const DEAD_SCALE = new THREE.Vector3(0.7, 0.4, 0.7);

export const BillboardUnit = React.memo(({ 
  position, 
  color, 
  spriteUrl, 
  isCurrentTurn, 
  hp, 
  maxHp, 
  name, 
  level, 
  conditions = [], 
  onUnitClick,
  isTargetable = false
}: any) => {
  const safeMaxHp = maxHp || 1; 
  const hpPercent = Math.max(0, Math.min(1, hp / safeMaxHp));
  const groupRef = useRef<THREE.Group>(null);
  const spriteGroupRef = useRef<THREE.Group>(null);
  const shadowMeshRef = useRef<THREE.Mesh>(null);
  const auraRingRef = useRef<THREE.Mesh>(null);
  const targetRingRef = useRef<THREE.Mesh>(null);
  const beaconMeshRef = useRef<THREE.Mesh>(null);
  const prevHpRef = useRef(hp);
  const [isFlashing, setIsFlashing] = useState(false);

  // Smooth position interpolation refs
  const currentPosRef = useRef(new THREE.Vector3(position[0], position[1], position[2]));
  const targetPosRef = useRef(new THREE.Vector3(position[0], position[1], position[2]));
  const prevPositionRef = useRef(position);
  const [isWalking, setIsWalking] = useState(false);

  useEffect(() => {
    targetPosRef.current.set(position[0], position[1], position[2]);
    const dx = position[0] - prevPositionRef.current[0];
    const dz = position[2] - prevPositionRef.current[2];
    if (Math.abs(dx) > 0.01 || Math.abs(dz) > 0.01) {
      setIsWalking(true);
      const timer = setTimeout(() => setIsWalking(false), 800);
      prevPositionRef.current = position;
      return () => clearTimeout(timer);
    }
    prevPositionRef.current = position;
  }, [position]);

  // Determine active action modes from gameStore
  const selectedAction = useGameStore(state => state.selectedAction);
  const battleEntities = useGameStore(state => state.battleEntities || []);

  const isCasting = useMemo(() => {
    if (!isCurrentTurn) return false;
    return selectedAction === BattleAction.MAGIC;
  }, [isCurrentTurn, selectedAction]);

  const isAttacking = useMemo(() => {
    if (!isCurrentTurn) return false;
    return selectedAction === BattleAction.ATTACK;
  }, [isCurrentTurn, selectedAction]);

  const isVictory = useMemo(() => {
    const enemies = battleEntities.filter(e => e.type === 'ENEMY');
    return enemies.length > 0 && enemies.every(e => e.stats.hp <= 0);
  }, [battleEntities]);

  // Derive standardized Chibi proportions
  const chibiProps = useMemo(() => {
    return getChibiProportions({ name, maxHp: safeMaxHp });
  }, [name, safeMaxHp]);

  const charHeight = chibiProps.height;
  const charWidth = chibiProps.width;
  const floorOffset = STANDARD_3D_SCALES.FLOOR_Y_OFFSET;

  // Unique deterministic phase offset per unit
  const phaseOffset = useMemo(() => {
    return ((position[0] * 17 + position[2] * 31) % 100) / 100 * Math.PI * 2;
  }, [position]);

  // Trigger red hit flash when HP decreases
  useEffect(() => {
    if (prevHpRef.current > hp) {
      setIsFlashing(true);
      const timer = setTimeout(() => setIsFlashing(false), 300);
      prevHpRef.current = hp;
      return () => clearTimeout(timer);
    }
    prevHpRef.current = hp;
  }, [hp]);
  
  // Proportional Chibi Squash & Stretch / Active Turn Pulsing Animation
  useFrame(({ clock }, delta) => {
    const time = clock.getElapsedTime();

    // 1. Smooth 3D World Position Interpolation (Walking Glide)
    if (groupRef.current) {
      currentPosRef.current.lerp(targetPosRef.current, Math.min(1.0, delta * 9.0));
      groupRef.current.position.x = currentPosRef.current.x;
      groupRef.current.position.y = currentPosRef.current.y;
      groupRef.current.position.z = currentPosRef.current.z;
    }

    if (spriteGroupRef.current) {
      const isDead = hp <= 0;

      if (isDead) {
        // Death / KO Collapse: Sink into ground, tilt, and fade
        spriteGroupRef.current.position.y = THREE.MathUtils.lerp(spriteGroupRef.current.position.y, -charHeight * 0.35, delta * 4.0);
        spriteGroupRef.current.rotation.z = THREE.MathUtils.lerp(spriteGroupRef.current.rotation.z, Math.PI / 2.2, delta * 5.0);
        spriteGroupRef.current.scale.lerp(DEAD_SCALE, delta * 4.0);
      } else {
        const anim = calculateChibiSquashAndStretch({
          time,
          phaseOffset,
          isCurrentTurn,
          isFlashing
        });

        // Add walk step hopping when moving
        const walkHop = isWalking ? Math.abs(Math.sin(time * 12.0)) * 0.18 : 0;
        // Add attack lunge
        const attackLungeY = isAttacking ? Math.sin(time * 8.0) * 0.05 : 0;

        spriteGroupRef.current.position.y = anim.bobY + walkHop + attackLungeY;
        spriteGroupRef.current.scale.set(anim.scaleX, anim.scaleY, 1.0);
        spriteGroupRef.current.rotation.z = 0;

        if (shadowMeshRef.current) {
          const s = anim.shadowScaleModifier * (isWalking ? 0.85 : 1.0);
          shadowMeshRef.current.scale.set(chibiProps.shadowScale * 2.2 * s, chibiProps.shadowScale * 1.8 * s, 1.0);
        }
      }
    }

    // Active Turn Ground Aura Dynamic Breathing Pulse
    if (isCurrentTurn && auraRingRef.current && hp > 0) {
      const auraPulse = Math.sin(time * 3.8) * 0.08 + 1.0;
      auraRingRef.current.scale.set(auraPulse, auraPulse, 1.0);
    }

    // Targetable Enemy Ground Target Marker Pulse
    if (isTargetable && targetRingRef.current && hp > 0) {
      const targetPulse = Math.sin(time * 5.0) * 0.12 + 1.0;
      targetRingRef.current.scale.set(targetPulse, targetPulse, 1.0);
      targetRingRef.current.rotation.z = time * 1.5;
    }

    // Active Turn Overhead Beacon Rotation & Floating
    if (isCurrentTurn && beaconMeshRef.current && hp > 0) {
      beaconMeshRef.current.rotation.y = time * 2.5;
      beaconMeshRef.current.rotation.z = Math.sin(time * 3.0) * 0.15;
      beaconMeshRef.current.position.y = Math.sin(time * 4.0) * 0.05;
    }
  });

  const handleClick = (e: any) => {
      e.stopPropagation();
      onUnitClick(position[0], position[2]); 
  };

  return (
    <group ref={groupRef} position={position}>
        {/* Generous Mobile Touch Hitbox Proxy (Enlarged 2.2x cylinder capturing taps seamlessly) */}
        <mesh 
          position={[0, charHeight / 2, 0]} 
          onClick={handleClick} 
          onPointerDown={handleClick}
          visible={false}
        >
          <cylinderGeometry args={[charWidth * 1.1, charWidth * 1.1, charHeight * 1.6, 12]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>

        {/* Targetable Enemy Glowing Ground Reticle */}
        {isTargetable && (
          <group>
            <mesh ref={targetRingRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, floorOffset + 0.02, 0]} onClick={handleClick}>
              <ringGeometry args={[chibiProps.auraRadius * 0.85, chibiProps.auraRadius * 1.25, 32]} />
              <meshBasicMaterial color="#ef4444" transparent opacity={0.85} side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[0, charHeight / 2, 0]}>
              <cylinderGeometry args={[chibiProps.auraRadius * 1.1, chibiProps.auraRadius * 1.1, charHeight * 1.2, 16, 1, true]} />
              <meshBasicMaterial color="#ef4444" transparent opacity={0.12} side={THREE.DoubleSide} depthWrite={false} />
            </mesh>
          </group>
        )}

        {/* Active Turn Pulsing Base Aura */}
        {isCurrentTurn && (
             <group>
               <mesh ref={auraRingRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, floorOffset + 0.01, 0]}>
                  <ringGeometry args={[chibiProps.auraRadius * 0.72, chibiProps.auraRadius * 1.05, 32]} />
                  <meshBasicMaterial color={color || '#f59e0b'} transparent opacity={0.9} toneMapped={false} side={THREE.DoubleSide} />
               </mesh>
               <mesh position={[0, charHeight / 2, 0]}>
                  <cylinderGeometry args={[chibiProps.auraRadius * 0.95, chibiProps.auraRadius * 0.95, charHeight, 16, 1, true]} />
                  <meshBasicMaterial color={color || '#f59e0b'} transparent opacity={0.15} side={THREE.DoubleSide} depthWrite={false} />
               </mesh>
             </group>
        )}
        
        {/* Hit Flash Ring on Damage */}
        {isFlashing && (
             <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, floorOffset + 0.02, 0]}>
                <circleGeometry args={[chibiProps.auraRadius * 1.1, 32]} />
                <meshBasicMaterial color="#ef4444" transparent opacity={0.6} side={THREE.DoubleSide} />
             </mesh>
        )}

        {/* Unit Shadow */}
        <mesh ref={shadowMeshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, floorOffset, 0]}>
            <circleGeometry args={[chibiProps.shadowScale, 16]} />
            <meshBasicMaterial color="#0f172a" transparent opacity={0.55} depthWrite={false} />
        </mesh>

        <Billboard follow={true} lockX={true} lockY={false} lockZ={true}>
            <group ref={spriteGroupRef} onClick={handleClick} onPointerDown={handleClick}>
                <SpriteComponent 
                    url={spriteUrl} 
                    isFlashing={isFlashing} 
                    isCurrentTurn={isCurrentTurn}
                    turnColor={color}
                    charWidth={charWidth}
                    charHeight={charHeight}
                    hp={hp}
                    isWalking={isWalking}
                    isCasting={isCasting}
                    isAttacking={isAttacking}
                    isVictory={isVictory}
                />
            </group>

            {/* Active Turn Overhead Beacon Gem */}
            {isCurrentTurn && (
              <group position={[0, charHeight + 0.38, 0]}>
                <mesh ref={beaconMeshRef}>
                  <octahedronGeometry args={[0.14, 0]} />
                  <meshToonMaterial 
                    gradientMap={DEFAULT_COZY_GRADIENT_MAP}
                    color={color || '#f59e0b'} 
                    emissive={color || '#f59e0b'}
                    emissiveIntensity={1.4}
                    toneMapped={false}
                  />
                </mesh>
              </group>
            )}
        </Billboard>
        
        {/* Persistent 3D Health Bar & Unit Status Overhead (Contextual Minimalist) */}
        <Html 
            position={[0, charHeight + (isTargetable ? 0.75 : isCurrentTurn ? 0.65 : 0.3), 0]} 
            center 
            zIndexRange={isTargetable ? [120, 80] : isCurrentTurn ? [100, 50] : [70, 0]}
        >
            <div className={`pointer-events-auto select-none flex flex-col items-center gap-0.5 min-w-[70px] transition-all duration-200 ${isTargetable ? 'scale-110 z-30' : isCurrentTurn ? 'scale-105 z-20' : 'scale-90 opacity-80'}`}>
                {/* Interactive Mobile Quick Target Badge */}
                {isTargetable && (
                    <button
                        type="button"
                        onClick={handleClick}
                        className="px-2 py-0.5 mb-0.5 rounded-full bg-red-600/90 hover:bg-red-500 active:scale-95 text-white font-black text-[10px] border border-red-300 shadow-[0_0_12px_rgba(239,68,68,0.7)] flex items-center gap-1 animate-pulse tracking-wide cursor-pointer"
                    >
                        <span>🎯</span>
                        <span>ATACAR</span>
                    </button>
                )}

                {/* Status Conditions */}
                {conditions && conditions.length > 0 && (isCurrentTurn || isTargetable) && (
                    <div className="flex items-center gap-1 mb-0.5">
                        {conditions.map((cond: string, idx: number) => {
                            const badge = getConditionBadge(cond);
                            return (
                                <span 
                                    key={idx} 
                                    className={`px-1.5 py-0.5 rounded text-[8px] font-medium border flex items-center gap-0.5 shadow-md ${badge.bg}`}
                                    title={badge.label}
                                >
                                    <span>{badge.icon}</span>
                                    <span>{badge.label}</span>
                                </span>
                            );
                        })}
                    </div>
                )}

                {/* Name Tag: Only show full name badge on Active Turn, Targetable, or when Damaged */}
                {name && (isCurrentTurn || isTargetable) && (
                    <div 
                        onClick={handleClick}
                        className={`font-semibold text-[9px] px-2 py-0.5 rounded-full border whitespace-nowrap shadow-sm flex items-center gap-1.5 backdrop-blur-md cursor-pointer transition-colors ${
                            isTargetable 
                                ? 'bg-red-950/90 border-red-400 text-red-100 ring-1 ring-red-500/50' 
                                : 'bg-slate-950/85 border-amber-400/60 text-amber-200'
                        }`}
                    >
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: isTargetable ? '#ef4444' : color || '#38bdf8' }} />
                        <span>{name}</span>
                        {level && <span className="text-amber-300/80 text-[8px]">Nv.{level}</span>}
                    </div>
                )}

                {/* Micro Health Bar: Always subtle, highlighted on active/target */}
                {(isCurrentTurn || isTargetable || hpPercent < 1.0) && (
                    <div className="flex flex-col items-center gap-0.5">
                        <div className={`h-1 rounded-full bg-slate-950/90 border border-slate-700/60 overflow-hidden shadow transition-all ${isCurrentTurn || isTargetable ? 'w-12 h-1.5' : 'w-9'}`}>
                            <div
                                className="h-full transition-all duration-300 rounded-full"
                                style={{
                                    width: `${Math.max(5, hpPercent * 100)}%`,
                                    backgroundColor: hpPercent > 0.5 ? '#22c55e' : hpPercent > 0.25 ? '#f59e0b' : '#ef4444'
                                }}
                            />
                        </div>
                        {(isCurrentTurn || isTargetable) && (
                            <div className="text-[7px] font-mono text-slate-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] leading-none">
                                {hp}/{safeMaxHp}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Html>

    </group>
  );
});

