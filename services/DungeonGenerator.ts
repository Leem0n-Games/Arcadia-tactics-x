import { BattleCell, TerrainType, VoxelBlock } from '../types';
import { ASSETS, BATTLE_MAP_SIZE } from '../constants';

export interface VoxelDungeonResult {
    battleMap: BattleCell[];
    voxelStructures: VoxelBlock[];
    playerSpawns: { x: number; y: number }[];
    enemySpawns: { x: number; y: number }[];
}

/**
 * Procedurally generates a 3-Room Voxel Dungeon connected by corridors for tactical combat.
 * - Room 1: Antecámara de Entrada (Bottom-Left)
 * - Corridor 1: Pasillo Estrecho con Antorchas
 * - Room 2: Cripta Central de los Guardianes (Center)
 * - Corridor 2: Pasaje de Obsidiana
 * - Room 3: Sanctum del Portal Arcano (Top-Right) con Altar
 */
export const generate3RoomVoxelDungeon = (mapSize: number = BATTLE_MAP_SIZE): VoxelDungeonResult => {
    const battleMap: BattleCell[] = [];
    const voxelStructures: VoxelBlock[] = [];
    const T = ASSETS.VOXEL_STRUCTURE_TEXTURES;
    const B = ASSETS.BLOCK_TEXTURES;

    // Define room and corridor bounding boxes
    const inRoom1 = (x: number, z: number) => (x >= 1 && x <= 4 && z >= 9 && z <= 12);
    const inCorridor1 = (x: number, z: number) => (x >= 3 && x <= 4 && z >= 6 && z <= 8);
    const inRoom2 = (x: number, z: number) => (x >= 5 && x <= 9 && z >= 5 && z <= 8);
    const inCorridor2 = (x: number, z: number) => (x >= 8 && x <= 9 && z >= 2 && z <= 4);
    const inRoom3 = (x: number, z: number) => (x >= 9 && x <= 13 && z >= 1 && z <= 4);

    const isWalkableDungeonTile = (x: number, z: number) => {
        return inRoom1(x, z) || inCorridor1(x, z) || inRoom2(x, z) || inCorridor2(x, z) || inRoom3(x, z);
    };

    const isPortalTile = (x: number, z: number) => (x === 11 && z === 2);

    for (let x = 0; x < mapSize; x++) {
        for (let z = 0; z < mapSize; z++) {
            const walkable = isWalkableDungeonTile(x, z);
            const portal = isPortalTile(x, z);

            let texture = walkable ? B[TerrainType.STONE_FLOOR] : B[TerrainType.CASTLE];
            let cellTerrain = walkable ? TerrainType.STONE_FLOOR : TerrainType.RUINS;
            let height = 1;

            if (walkable) {
                // Room floor variations
                if (inRoom3(x, z)) {
                    texture = portal ? T.DEEPSLATE : T.STONE_BRICKS;
                    cellTerrain = TerrainType.STONE_FLOOR;
                } else if (inRoom2(x, z)) {
                    texture = ((x + z) % 2 === 0) ? T.MOSSY_STONE_BRICKS : T.CRACKED_STONE_BRICKS;
                } else {
                    texture = T.COBBLESTONE;
                }
            } else {
                height = 3; // Solid dungeon wall height
            }

            // Grid registration
            battleMap.push({
                x,
                z,
                terrain: cellTerrain,
                height: 1,
                offsetY: 0,
                color: walkable ? '#475569' : '#1e293b',
                textureUrl: texture,
                isObstacle: !walkable
            });

            // 3D Voxel geometry
            if (!walkable) {
                // Solid dungeon walls
                for (let y = 1; y <= 3; y++) {
                    const wallTex = (y === 3) ? T.STONE_BRICKS : (y === 2 ? T.CRACKED_STONE_BRICKS : T.COBBLESTONE);
                    voxelStructures.push({
                        x,
                        y,
                        z,
                        textureUrl: wallTex,
                        color: '#64748b',
                        isObstacle: true
                    });
                }
            } else {
                // Ground block
                voxelStructures.push({
                    x,
                    y: 0,
                    z,
                    textureUrl: texture,
                    color: '#94a3b8',
                    isObstacle: false
                });

                // Props & Architectural Details
                // Pillars in Room 2 (Crypt)
                if ((x === 5 && z === 5) || (x === 9 && z === 5) || (x === 5 && z === 8)) {
                    voxelStructures.push({ x, y: 1, z, textureUrl: T.STONE_BRICKS, color: '#475569', isObstacle: true });
                    voxelStructures.push({ x, y: 2, z, textureUrl: T.LANTERN, color: '#f59e0b', isObstacle: false });
                }

                // Barrels / Crates in Room 1 (Antechamber)
                if (x === 1 && z === 9) {
                    voxelStructures.push({ x, y: 1, z, textureUrl: T.BARREL, color: '#78350f', isObstacle: true });
                }

                // Arcane Portal Altar in Room 3
                if (portal) {
                    voxelStructures.push({ x, y: 1, z, textureUrl: T.ENCHANTING_TABLE, color: '#a855f7', isObstacle: false });
                    voxelStructures.push({ x, y: 2, z, textureUrl: T.ENDER_CHEST, color: '#38bdf8', isObstacle: false });
                } else if ((x === 10 && z === 1) || (x === 12 && z === 1) || (x === 10 && z === 4) || (x === 12 && z === 4)) {
                    // Glowing Obelisks framing the Portal Chamber
                    voxelStructures.push({ x, y: 1, z, textureUrl: T.DEEPSLATE, color: '#334155', isObstacle: true });
                    voxelStructures.push({ x, y: 2, z, textureUrl: T.LANTERN, color: '#a855f7', isObstacle: false });
                }
            }
        }
    }

    const playerSpawns = [
        { x: 2, y: 11 },
        { x: 3, y: 12 },
        { x: 1, y: 11 },
        { x: 2, y: 12 }
    ];

    const enemySpawns = [
        { x: 4, y: 7 },  // Guard in Corridor 1
        { x: 7, y: 6 },  // Cultist in Room 2
        { x: 6, y: 8 },  // Berserker in Room 2
        { x: 11, y: 3 }  // Dungeon Champion at Portal Altar in Room 3
    ];

    return {
        battleMap,
        voxelStructures,
        playerSpawns,
        enemySpawns
    };
};
