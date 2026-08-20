
import React, { useRef, useMemo, useLayoutEffect } from 'react';
import { ThreeElements } from '@react-three/fiber';
import * as THREE from 'three';
import { BATTLE_MAP_SIZE, ASSETS } from '../../constants';
import { TerrainType, BattleCell } from '../../types';
import { getSafeTexture } from '../../services/textureLoader';
import { STANDARD_3D_SCALES } from '../Base3DRenderer';
import { DEFAULT_COZY_GRADIENT_MAP } from '../../services/toonShader';

// Optimized Pseudo-Random for deterministic placement
const pseudoRandom = (seed: number) => {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
};

// Shared geometries and helper dummy for decoration instances
const SHARED_DECORATION_PLANE_GEO = new THREE.PlaneGeometry(
  STANDARD_3D_SCALES.PROP_DECORATION_HEIGHT,
  STANDARD_3D_SCALES.PROP_DECORATION_HEIGHT
);
const _decorDummy = new THREE.Object3D();

// Render a single type of decoration in batch
const InstancedDecoration = React.memo(({ type, positions, scaleRange = [0.8, 1.2], isMoveMode }: { type: string, positions: THREE.Vector3[], scaleRange?: [number, number], isMoveMode?: boolean }) => {
    const texture = useMemo(() => getSafeTexture(type, '#166534'), [type]);
    const meshRef = useRef<THREE.InstancedMesh>(null);

    useMemo(() => {
        if (texture) {
            texture.magFilter = THREE.NearestFilter;
            texture.minFilter = THREE.NearestFilter;
            texture.colorSpace = THREE.SRGBColorSpace;
        }
    }, [texture]);

    useLayoutEffect(() => {
        if (!meshRef.current || positions.length === 0) return;

        positions.forEach((pos, i) => {
            _decorDummy.position.copy(pos);
            
            // Deterministic scale variation based on position
            const seedRng = pseudoRandom(Math.floor((pos.x + 50) * 1000 + (pos.z + 50) * 10));
            const s = scaleRange[0] + seedRng() * (scaleRange[1] - scaleRange[0]);
            _decorDummy.scale.set(s, s, s);
            
            _decorDummy.updateMatrix();
            meshRef.current!.setMatrixAt(i, _decorDummy.matrix);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
        meshRef.current.computeBoundingSphere();
    }, [positions, scaleRange]);

    if (positions.length === 0) return null;

    // Cross-plane geometry for 2.5D look with Toon/Cel Shading
    return (
        <group>
            <instancedMesh ref={meshRef} geometry={SHARED_DECORATION_PLANE_GEO} args={[undefined, undefined, positions.length]}>
                <meshToonMaterial 
                    map={texture} 
                    gradientMap={DEFAULT_COZY_GRADIENT_MAP}
                    transparent 
                    opacity={isMoveMode ? 0.15 : 1.0}
                    alphaTest={isMoveMode ? 0 : 0.5} 
                    side={THREE.DoubleSide} 
                />
            </instancedMesh>
             {/* Second plane for cross effect (X shape) */}
            <instancedMesh geometry={SHARED_DECORATION_PLANE_GEO}
                           args={[undefined, undefined, positions.length]} 
                           instanceMatrix={meshRef.current?.instanceMatrix} 
                           rotation={[0, Math.PI/2, 0]}>
                <meshToonMaterial 
                    map={texture} 
                    gradientMap={DEFAULT_COZY_GRADIENT_MAP}
                    transparent 
                    opacity={isMoveMode ? 0.15 : 1.0}
                    alphaTest={isMoveMode ? 0 : 0.5} 
                    side={THREE.DoubleSide} 
                />
            </instancedMesh>
        </group>
    );
});

export const DecorationLayer = React.memo(({ mapData, isMoveMode }: { mapData: BattleCell[], isMoveMode?: boolean }) => {
    const decorationGroups = useMemo(() => {
        const groups: Record<string, THREE.Vector3[]> = {
            GRASS: [],
            FLOWER: [],
            ROCK: [],
            MUSHROOM: []
        };
        const propHeight = STANDARD_3D_SCALES.PROP_DECORATION_HEIGHT;
        const floorOffset = STANDARD_3D_SCALES.FLOOR_Y_OFFSET;

        mapData.forEach(cell => {
            // Simple hash for determinism
            const rng = pseudoRandom(cell.x * 73856093 ^ cell.z * 19349663);
            const y = cell.offsetY + cell.height + floorOffset + (propHeight / 2);

            // Don't decorate obstacles or water directly (unless lilypads later)
            if (cell.textureUrl.includes('water') || cell.textureUrl.includes('lava') || cell.isObstacle) return;

            // Grass on GRASS, FOREST, PLAINS
            if (cell.textureUrl.includes('grass')) {
                // 40% chance of detail
                if (rng() > 0.6) {
                    const type = rng() > 0.9 ? 'FLOWER' : 'GRASS';
                    const ox = (rng() - 0.5) * 0.6;
                    const oz = (rng() - 0.5) * 0.6;
                    groups[type].push(new THREE.Vector3(cell.x + ox, y, cell.z + oz));
                }
            }
            
            // Rocks on MOUNTAIN, CAVE
            if (cell.textureUrl.includes('stone') || cell.textureUrl.includes('cobble')) {
                 if (rng() > 0.9) {
                     groups.ROCK.push(new THREE.Vector3(cell.x, y, cell.z));
                 }
            }

            // Mushrooms on FUNGUS, SWAMP
            if (cell.textureUrl.includes('mycelium') || cell.textureUrl.includes('podzol')) {
                if (rng() > 0.8) {
                    groups.MUSHROOM.push(new THREE.Vector3(cell.x, y, cell.z));
                }
            }
        });

        return groups;
    }, [mapData]);

    return (
        <group>
            {decorationGroups.GRASS.length > 0 && (
                <InstancedDecoration type={ASSETS.DECORATIONS.GRASS_1} positions={decorationGroups.GRASS} isMoveMode={isMoveMode} />
            )}
            {decorationGroups.FLOWER.length > 0 && (
                <InstancedDecoration type={ASSETS.DECORATIONS.FLOWER_1} positions={decorationGroups.FLOWER} isMoveMode={isMoveMode} />
            )}
            {decorationGroups.ROCK.length > 0 && (
                <InstancedDecoration type={ASSETS.DECORATIONS.ROCK_1} positions={decorationGroups.ROCK} isMoveMode={isMoveMode} />
            )}
            {decorationGroups.MUSHROOM.length > 0 && (
                <InstancedDecoration type={ASSETS.DECORATIONS.MUSHROOM} positions={decorationGroups.MUSHROOM} isMoveMode={isMoveMode} />
            )}
        </group>
    );
});
