import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { ASSETS } from '../../constants';
import { getSafeTexture, textureManager } from '../../services/textureLoader';
import { DEFAULT_COZY_GRADIENT_MAP, PulsingOutlineShaderMaterial } from '../../services/toonShader';

export interface SpriteSheetMapping {
    row: number;
    col: number;
}

export interface ModularBillboardConfig {
    rows: number;
    cols: number;
    charWidth?: number;
    charHeight?: number;
    scaleX?: number;
    scaleY?: number;
    yOffset?: number;
    xOffset?: number;
    zOffset?: number;
    
    // State mappings (0-indexed)
    idle: SpriteSheetMapping;
    walk: SpriteSheetMapping;
    attack: SpriteSheetMapping;
    cast: SpriteSheetMapping;
    hurt: SpriteSheetMapping;
    victory: SpriteSheetMapping;
}

// Global default configuration for standard single-sprites (1x1 sheets)
export const DEFAULT_SINGLE_SPRITE_CONFIG: ModularBillboardConfig = {
    rows: 1,
    cols: 1,
    charWidth: 0.8,
    charHeight: 0.8,
    scaleX: 1,
    scaleY: 1,
    yOffset: 0,
    xOffset: 0,
    zOffset: 0,
    idle: { row: 0, col: 0 },
    walk: { row: 0, col: 0 },
    attack: { row: 0, col: 0 },
    cast: { row: 0, col: 0 },
    hurt: { row: 0, col: 0 },
    victory: { row: 0, col: 0 },
};

// Default configuration for Priest/Cleric sheet (4x4 or 4x3)
export const DEFAULT_PRIEST_CONFIG: ModularBillboardConfig = {
    rows: 4,
    cols: 4,
    charWidth: 0.8,
    charHeight: 1.2,
    scaleX: 1,
    scaleY: 1,
    yOffset: 0.05,
    xOffset: 0,
    zOffset: 0,
    idle: { row: 0, col: 0 },
    walk: { row: 0, col: 1 },
    attack: { row: 1, col: 0 },
    cast: { row: 2, col: 0 },
    hurt: { row: 2, col: 3 },
    victory: { row: 2, col: 2 },
};

// Default configuration for Fighter/Knight sheet (2x3 or 4x4)
export const DEFAULT_FIGHTER_CONFIG: ModularBillboardConfig = {
    rows: 4,
    cols: 4,
    charWidth: 0.8,
    charHeight: 1.2,
    scaleX: 1,
    scaleY: 1,
    yOffset: 0.05,
    xOffset: 0,
    zOffset: 0,
    idle: { row: 0, col: 0 },
    walk: { row: 0, col: 1 },
    attack: { row: 1, col: 0 },
    cast: { row: 1, col: 0 },
    hurt: { row: 2, col: 1 },
    victory: { row: 2, col: 0 },
};

interface ModularBillboardProps {
    url: string;
    isFlashing?: boolean;
    isCurrentTurn?: boolean;
    turnColor?: string;
    hp?: number;
    isWalking?: boolean;
    isCasting?: boolean;
    isAttacking?: boolean;
    isVictory?: boolean;
    
    // Custom settings that can be customized dynamically per unit / race / class
    config?: Partial<ModularBillboardConfig>;
}

export const ModularBillboard: React.FC<ModularBillboardProps> = ({
    url,
    isFlashing = false,
    isCurrentTurn = false,
    turnColor = '#fbbf24',
    hp = 100,
    isWalking = false,
    isCasting = false,
    isAttacking = false,
    isVictory = false,
    config = {}
}) => {
    const safeUrl = (url && url.length > 5) ? url : ASSETS.UNITS.PLAYER;
    const [texVersion, setTexVersion] = useState(0);

    // Watch texture loader notifications
    useEffect(() => {
        const unsubscribe = textureManager.subscribe(() => {
            setTexVersion(v => v + 1);
        });
        return unsubscribe;
    }, []);

    // Resolve base configurations based on file names or custom properties
    const baseConfig = useMemo(() => {
        const lowerUrl = safeUrl.toLowerCase();
        if (lowerUrl.includes('priest')) {
            return { ...DEFAULT_PRIEST_CONFIG };
        } else if (lowerUrl.includes('fighter')) {
            // Adjust rows/cols dynamically depending on the current active sheet for fighter
            const isBattle = lowerUrl.includes('fighter_battle.png') || isAttacking || isCasting || isFlashing || hp <= 0 || isCurrentTurn;
            return {
                ...DEFAULT_FIGHTER_CONFIG,
                rows: isBattle ? 3 : 4,
                cols: isBattle ? 2 : 4,
            };
        }
        return { ...DEFAULT_SINGLE_SPRITE_CONFIG };
    }, [safeUrl, isAttacking, isCasting, isFlashing, hp, isCurrentTurn]);

    // Merge baseline configurations with user-customized adjustments (ideal for Admin Panel overrides)
    const finalConfig = useMemo((): ModularBillboardConfig => {
        // Prevent null/undefined from overriding valid baseConfig fields
        const rows = Math.max(1, config.rows !== undefined && config.rows !== null ? config.rows : baseConfig.rows);
        const cols = Math.max(1, config.cols !== undefined && config.cols !== null ? config.cols : baseConfig.cols);
        const charWidth = config.charWidth !== undefined && config.charWidth !== null ? config.charWidth : baseConfig.charWidth;
        const charHeight = config.charHeight !== undefined && config.charHeight !== null ? config.charHeight : baseConfig.charHeight;
        const scaleX = config.scaleX !== undefined && config.scaleX !== null ? config.scaleX : baseConfig.scaleX;
        const scaleY = config.scaleY !== undefined && config.scaleY !== null ? config.scaleY : baseConfig.scaleY;
        const yOffset = config.yOffset !== undefined && config.yOffset !== null ? config.yOffset : baseConfig.yOffset;
        const xOffset = config.xOffset !== undefined && config.xOffset !== null ? config.xOffset : baseConfig.xOffset;
        const zOffset = config.zOffset !== undefined && config.zOffset !== null ? config.zOffset : baseConfig.zOffset;

        return {
            rows,
            cols,
            charWidth,
            charHeight,
            scaleX,
            scaleY,
            yOffset,
            xOffset,
            zOffset,
            // Deeply merge nested states
            idle: { ...baseConfig.idle, ...(config.idle || {}) },
            walk: { ...baseConfig.walk, ...(config.walk || {}) },
            attack: { ...baseConfig.attack, ...(config.attack || {}) },
            cast: { ...baseConfig.cast, ...(config.cast || {}) },
            hurt: { ...baseConfig.hurt, ...(config.hurt || {}) },
            victory: { ...baseConfig.victory, ...(config.victory || {}) },
        };
    }, [baseConfig, config]);

    // Choose the active texture file (supports dynamic sub-sheets e.g. Priest walking vs Priest attacking)
    const activeUrl = useMemo(() => {
        const lowerUrl = safeUrl.toLowerCase();
        if (lowerUrl.includes('priest')) {
            const isCombatState = isAttacking || isCasting || isFlashing || hp <= 0 || isCurrentTurn;
            return isCombatState 
                ? '/assets/players/priest/spritesheetpriestattacks.png'
                : '/assets/players/priest/spritesheetpriest.png';
        } else if (lowerUrl.includes('fighter')) {
            const isCombatState = isAttacking || isCasting || isFlashing || hp <= 0 || isCurrentTurn;
            return isCombatState
                ? '/assets/fighter/fighter_battle.png'
                : '/assets/fighter/fighter_walk.png';
        }
        return safeUrl;
    }, [safeUrl, isAttacking, isCasting, isFlashing, hp, isCurrentTurn]);

    // Create and wrap the texture map
    const texture = useMemo(() => {
        const tex = getSafeTexture(activeUrl, 'transparent').clone();
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        
        // Define texture subdivision grid
        const cols = finalConfig.cols || 1;
        const rows = finalConfig.rows || 1;
        tex.repeat.set(1 / cols, 1 / rows);
        tex.needsUpdate = true;
        return tex;
    }, [activeUrl, texVersion, finalConfig.cols, finalConfig.rows]);

    // Refs for all material types to force manual Three.js updates and prevent stale WebGL cache
    const silhouetteMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
    const shadowMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
    const primaryMaterialRef = useRef<THREE.MeshToonMaterial>(null);

    // Create the outline custom toon shader
    const outlineMaterial = useMemo(() => {
        return new PulsingOutlineShaderMaterial({
            map: texture,
            outlineColor: turnColor,
            outlineThickness: 0.036,
            baseIntensity: 0.85,
            pulseIntensity: 0.95,
            pulseSpeed: 3.8
        });
    }, [texture, turnColor]);

    // Keep the shader map updated in real-time
    useEffect(() => {
        if (outlineMaterial) {
            outlineMaterial.map = texture;
            outlineMaterial.outlineColor = turnColor;
            outlineMaterial.uMapOffset = texture.offset;
            outlineMaterial.uMapRepeat = texture.repeat;
            outlineMaterial.needsUpdate = true;
        }
    }, [texture, turnColor, outlineMaterial]);

    // Select and apply the correct frame offset depending on state
    useEffect(() => {
        if (!texture) return;

        const totalRows = finalConfig.rows || 1;
        const totalCols = finalConfig.cols || 1;
        
        // Ensure texture repeat matches the calculated grid subdivisions
        texture.repeat.set(1 / totalCols, 1 / totalRows);

        let mapping = finalConfig.idle;

        if (hp <= 0) {
            mapping = finalConfig.hurt; // KO/Down state
        } else if (isFlashing) {
            mapping = finalConfig.hurt; // Flashing/Hurt stance
        } else if (isVictory) {
            mapping = finalConfig.victory; // Triumph pose
        } else if (isWalking) {
            mapping = finalConfig.walk; // Walking movement
        } else if (isCasting) {
            mapping = finalConfig.cast; // Casting magic
        } else if (isAttacking) {
            mapping = finalConfig.attack; // Weapon sweep
        } else if (isCurrentTurn) {
            // Highlighted idle stance
            const isBattleSheet = activeUrl.includes('fighter_battle.png');
            if (isBattleSheet) {
                mapping = { row: 0, col: 1 }; // Battle stance
            } else {
                mapping = finalConfig.idle;
            }
        }

        // Apply column and row coordinates with Three.js Y-axis inversion correction (0,0 is bottom-left)
        const targetCol = Math.min(totalCols - 1, Math.max(0, mapping.col));
        const targetRow = Math.min(totalRows - 1, Math.max(0, mapping.row));
        
        texture.offset.set(targetCol / totalCols, (totalRows - 1 - targetRow) / totalRows);
        texture.needsUpdate = true;

        if (outlineMaterial) {
            outlineMaterial.uMapOffset = texture.offset.clone();
            outlineMaterial.uMapRepeat = texture.repeat.clone();
            outlineMaterial.needsUpdate = true;
        }

        // Explicitly force Three.js to re-compile / re-upload our materials so changes in texture or uv coords are immediately drawn
        if (silhouetteMaterialRef.current) silhouetteMaterialRef.current.needsUpdate = true;
        if (shadowMaterialRef.current) shadowMaterialRef.current.needsUpdate = true;
        if (primaryMaterialRef.current) primaryMaterialRef.current.needsUpdate = true;
    }, [texture, finalConfig, hp, isFlashing, isVictory, isWalking, isCasting, isAttacking, isCurrentTurn, outlineMaterial, activeUrl]);

    // Dimensions
    const charWidth = (finalConfig.charWidth || 0.8) * (finalConfig.scaleX || 1.0);
    const charHeight = (finalConfig.charHeight || 0.8) * (finalConfig.scaleY || 1.0);
    const yOffset = finalConfig.yOffset || 0.0;
    const xOffset = finalConfig.xOffset || 0.0;
    const zOffset = finalConfig.zOffset || 0.0;

    // Pulse the outline shader over time
    useFrame(({ clock }) => {
        if (isCurrentTurn && outlineMaterial) {
            outlineMaterial.time = clock.getElapsedTime();
        }
    });

    return (
        <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
            {/* Float container applying offsets */}
            <group position={[xOffset, (charHeight / 2) + yOffset, zOffset]}>
                
                {/* 1. X-Ray Occlusion Silhouette (Visible when characters are behind houses or mountains) */}
                <mesh position={[0, 0, -0.015]} scale={[1.08, 1.08, 1]}>
                    <planeGeometry args={[charWidth, charHeight]} />
                    <meshBasicMaterial 
                        ref={silhouetteMaterialRef}
                        map={texture} 
                        transparent 
                        opacity={0.6} 
                        depthTest={false} 
                        depthWrite={false} 
                        color={isCurrentTurn ? turnColor : '#38bdf8'} 
                        side={THREE.DoubleSide} 
                    />
                </mesh>

                {/* 2. Active Pulsing Contour Outline Shader */}
                {isCurrentTurn && (
                    <mesh position={[0, 0, -0.005]} scale={[1.09, 1.09, 1]}>
                        <planeGeometry args={[charWidth, charHeight]} />
                        <primitive object={outlineMaterial} attach="material" side={THREE.DoubleSide} transparent depthWrite={false} />
                    </mesh>
                )}

                {/* 3. Drop Shadow Rim Backdrop (For crisp contrast against bright floors) */}
                <mesh position={[0, 0, -0.01]} scale={[1.06, 1.06, 1]}>
                    <planeGeometry args={[charWidth, charHeight]} />
                    <meshBasicMaterial 
                        ref={shadowMaterialRef}
                        map={texture} 
                        transparent 
                        alphaTest={0.1} 
                        color="#0f172a" 
                        side={THREE.DoubleSide} 
                    />
                </mesh>

                {/* 4. Primary High-Definition Character Sprite */}
                <mesh position={[0, 0, 0]}>
                    <planeGeometry args={[charWidth, charHeight]} />
                    <meshToonMaterial 
                        ref={primaryMaterialRef}
                        map={texture} 
                        gradientMap={DEFAULT_COZY_GRADIENT_MAP}
                        transparent 
                        alphaTest={0.1} 
                        color={isFlashing ? '#ff4444' : 'white'} 
                        emissive={isFlashing ? '#ff0000' : isCurrentTurn ? turnColor : '#000000'}
                        emissiveIntensity={isFlashing ? 1.5 : isCurrentTurn ? 0.22 : 0}
                        side={THREE.DoubleSide} 
                    />
                </mesh>
            </group>
        </Billboard>
    );
};
