
import { TerrainType, CharacterClass, Attributes, CharacterRace, Item, ItemRarity, EquipmentSlot, Spell, SpellType, Ability, StartingEquipmentPackage } from './types';
import { DamageType, ArmorImmunities } from './types/armor';

export const HEX_SIZE = 20;
export const BATTLE_MAP_SIZE = 14; 
export const DEFAULT_MAP_WIDTH = 20;
export const DEFAULT_MAP_HEIGHT = 15;

export const TERRAIN_COLORS: Record<TerrainType, string> = {
    [TerrainType.GRASS]: '#4ade80',
    [TerrainType.PLAINS]: '#fde047',
    [TerrainType.FOREST]: '#166534',
    [TerrainType.JUNGLE]: '#064e3b',
    [TerrainType.MOUNTAIN]: '#57534e',
    [TerrainType.WATER]: '#3b82f6',
    [TerrainType.CASTLE]: '#94a3b8',
    [TerrainType.VILLAGE]: '#fbbf24',
    [TerrainType.DESERT]: '#fcd34d',
    [TerrainType.SWAMP]: '#3f6212',
    [TerrainType.RUINS]: '#78716c',
    [TerrainType.TUNDRA]: '#e2e8f0',
    [TerrainType.TAIGA]: '#3f6212',
    [TerrainType.COBBLESTONE]: '#64748b',
    [TerrainType.DIRT_ROAD]: '#b45309',
    [TerrainType.STONE_FLOOR]: '#475569',
    [TerrainType.CAVE_FLOOR]: '#1f2937',
    [TerrainType.FUNGUS]: '#a855f7',
    [TerrainType.LAVA]: '#ef4444',
    [TerrainType.CHASM]: '#000000',
    [TerrainType.WALL_HOUSE]: '#78350f',
    [TerrainType.WOOD_FLOOR]: '#451a03'
};

export const TERRAIN_NAMES: Record<TerrainType, string> = {
    [TerrainType.GRASS]: 'Praderas de Hierba',
    [TerrainType.PLAINS]: 'Llanuras Soleadas',
    [TerrainType.FOREST]: 'Bosque Antiguo',
    [TerrainType.JUNGLE]: 'Selva Virgen',
    [TerrainType.MOUNTAIN]: 'Picos Montañosos',
    [TerrainType.WATER]: 'Aguas Profundas',
    [TerrainType.CASTLE]: 'Castillo y Fortalezas',
    [TerrainType.VILLAGE]: 'Aldea Habitada',
    [TerrainType.DESERT]: 'Dunas del Desierto',
    [TerrainType.SWAMP]: 'Ciénaga Fangosa',
    [TerrainType.RUINS]: 'Ruinas Olvidadas',
    [TerrainType.TUNDRA]: 'Tundra Nevada',
    [TerrainType.TAIGA]: 'Taiga Boreal',
    [TerrainType.COBBLESTONE]: 'Adoquines de Ciudad',
    [TerrainType.DIRT_ROAD]: 'Camino de Tierra',
    [TerrainType.STONE_FLOOR]: 'Suelo de Piedra Labrada',
    [TerrainType.CAVE_FLOOR]: 'Caverna Subterránea',
    [TerrainType.FUNGUS]: 'Bosque Fúngico Arcano',
    [TerrainType.LAVA]: 'Río de Magma Ardiente',
    [TerrainType.CHASM]: 'Abismo sin Fondo',
    [TerrainType.WALL_HOUSE]: 'Muralla Residencial',
    [TerrainType.WOOD_FLOOR]: 'Tablones de Madera'
};

// --- RARITY COLORS ---
export const RARITY_COLORS: Record<ItemRarity, string> = {
    [ItemRarity.COMMON]: '#9ca3af',     // Slate-400
    [ItemRarity.UNCOMMON]: '#22c55e',   // Green
    [ItemRarity.RARE]: '#3b82f6',       // Blue
    [ItemRarity.VERY_RARE]: '#a855f7',  // Purple
    [ItemRarity.LEGENDARY]: '#f59e0b',  // Orange/Gold
};

export const TERRAIN_MOVEMENT_COST: Record<TerrainType, number> = {
    [TerrainType.GRASS]: 1, [TerrainType.PLAINS]: 1, [TerrainType.FOREST]: 2, [TerrainType.JUNGLE]: 2,
    [TerrainType.MOUNTAIN]: 3, [TerrainType.WATER]: 99, [TerrainType.CASTLE]: 1, [TerrainType.VILLAGE]: 1,
    [TerrainType.DESERT]: 2, [TerrainType.SWAMP]: 3, [TerrainType.RUINS]: 2, [TerrainType.TUNDRA]: 2,
    [TerrainType.TAIGA]: 2, [TerrainType.COBBLESTONE]: 1, [TerrainType.DIRT_ROAD]: 1, [TerrainType.STONE_FLOOR]: 1,
    [TerrainType.CAVE_FLOOR]: 1, [TerrainType.FUNGUS]: 2, [TerrainType.LAVA]: 99, [TerrainType.CHASM]: 99,
    [TerrainType.WALL_HOUSE]: 99, [TerrainType.WOOD_FLOOR]: 1
};

export const BASE_STATS: Record<CharacterClass, Attributes> = {
    [CharacterClass.FIGHTER]: { STR: 16, DEX: 12, CON: 14, INT: 10, WIS: 10, CHA: 10 },
    [CharacterClass.WIZARD]:  { STR: 8,  DEX: 14, CON: 12, INT: 16, WIS: 12, CHA: 10 },
    [CharacterClass.ROGUE]:   { STR: 10, DEX: 16, CON: 12, INT: 12, WIS: 10, CHA: 14 },
    [CharacterClass.CLERIC]:  { STR: 12, DEX: 10, CON: 14, INT: 10, WIS: 16, CHA: 12 },
    [CharacterClass.RANGER]:  { STR: 12, DEX: 16, CON: 12, INT: 10, WIS: 14, CHA: 10 },
    [CharacterClass.BARBARIAN]: { STR: 16, DEX: 12, CON: 16, INT: 8, WIS: 10, CHA: 8 },
    [CharacterClass.PALADIN]: { STR: 16, DEX: 10, CON: 14, INT: 8, WIS: 10, CHA: 16 },
    [CharacterClass.SORCERER]: { STR: 8, DEX: 14, CON: 14, INT: 10, WIS: 10, CHA: 16 },
    [CharacterClass.WARLOCK]: { STR: 10, DEX: 14, CON: 12, INT: 10, WIS: 12, CHA: 16 },
    [CharacterClass.DRUID]: { STR: 10, DEX: 12, CON: 14, INT: 10, WIS: 16, CHA: 10 },
    [CharacterClass.BARD]: { STR: 8, DEX: 14, CON: 12, INT: 12, WIS: 10, CHA: 16 },
};

export const RACE_BONUS: Record<CharacterRace, Partial<Attributes>> = {
    [CharacterRace.HUMAN]: { STR: 1, DEX: 1, CON: 1, INT: 1, WIS: 1, CHA: 1 },
    [CharacterRace.ELF]: { DEX: 2, INT: 1 },
    [CharacterRace.DWARF]: { CON: 2, STR: 1 },
    [CharacterRace.HALFLING]: { DEX: 2, CHA: 1 },
    [CharacterRace.DRAGONBORN]: { STR: 2, CHA: 1 },
    [CharacterRace.GNOME]: { INT: 2, DEX: 1 },
    [CharacterRace.TIEFLING]: { CHA: 2, INT: 1 },
    [CharacterRace.HALF_ORC]: { STR: 2, CON: 1 }
};

export const XP_TABLE = [0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000];

export const DIFFICULTY_SETTINGS = {
    EASY: { enemyStatMod: 0.8, xpMod: 1.2, goldMod: 1.5 },
    NORMAL: { enemyStatMod: 1.0, xpMod: 1.0, goldMod: 1.0 },
    HARD: { enemyStatMod: 1.3, xpMod: 0.8, goldMod: 0.7 }
};

// ASSET PATHS
export const USE_LOCAL_ASSETS = true; 

const REMOTE_WESNOTH_URL = "https://raw.githubusercontent.com/wesnoth/wesnoth/master/data/core/images";
const LOCAL_WESNOTH_URL = "/assets/wesnoth";

const REMOTE_MC_URL = "https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.4/assets/minecraft/textures/block";
const LOCAL_MC_URL = "/assets/minecraft";

export const WESNOTH_BASE_URL = USE_LOCAL_ASSETS ? LOCAL_WESNOTH_URL : REMOTE_WESNOTH_URL;
export const MC_BASE_URL = USE_LOCAL_ASSETS ? LOCAL_MC_URL : REMOTE_MC_URL;

export const ASSETS = {
    UNITS: {
        PLAYER: `${WESNOTH_BASE_URL}/units/human-loyalists/lieutenant.png`,
        GOBLIN: `${WESNOTH_BASE_URL}/units/goblins/spearman.png`,
        ORC: `${WESNOTH_BASE_URL}/units/orcs/grunt.png`,
        SKELETON: `${WESNOTH_BASE_URL}/units/undead-skeletal/skeleton.png`,
        NECROMANCER: `${WESNOTH_BASE_URL}/units/undead-necromancers/dark-sorcerer.png`,
        WOLF: `${WESNOTH_BASE_URL}/units/monsters/wolf.png`,
        
        PLAYER_FIGHTER: '/assets/fighter/fighter_walk.png',
        PLAYER_WIZARD: `${WESNOTH_BASE_URL}/units/human-magi/red-mage.png`,
        PLAYER_ROGUE: `${WESNOTH_BASE_URL}/units/human-outlaws/thief.png`,
        PLAYER_CLERIC: '/assets/players/priest/spritesheetpriest.png',
        PLAYER_BARBARIAN: `${WESNOTH_BASE_URL}/units/human-outlaws/thug.png`,
        PLAYER_BARD: `${WESNOTH_BASE_URL}/units/human-loyalists/fencer.png`,
        PLAYER_DRUID: `${WESNOTH_BASE_URL}/units/elves-wood/shaman.png`,
        PLAYER_PALADIN: `${WESNOTH_BASE_URL}/units/human-loyalists/paladin.png`, 
        PLAYER_RANGER: `${WESNOTH_BASE_URL}/units/human-outlaws/huntsman.png`,
        PLAYER_SORCERER: `${WESNOTH_BASE_URL}/units/human-magi/silver-mage.png`,
        PLAYER_WARLOCK: `${WESNOTH_BASE_URL}/units/undead-necromancers/adept.png`,
        
        ELF_FIGHTER: `${WESNOTH_BASE_URL}/units/elves-wood/hero.png`,
        ELF_ARCHER: `${WESNOTH_BASE_URL}/units/elves-wood/archer.png`,
        DWARF_FIGHTER: `${WESNOTH_BASE_URL}/units/dwarves/steelclad.png`,
        DWARF_GUARD: `${WESNOTH_BASE_URL}/units/dwarves/guard.png`,
        
        PLAYER_HALFLING: `${WESNOTH_BASE_URL}/units/human-outlaws/footpad.png`,
        PLAYER_DRAGONBORN: `${WESNOTH_BASE_URL}/units/drakes/fighter.png`,
        PLAYER_GNOME: `${WESNOTH_BASE_URL}/units/dwarves/thunderer.png`,
        PLAYER_TIEFLING: `${WESNOTH_BASE_URL}/units/undead-necromancers/adept.png`,
        PLAYER_HALF_ORC: `${WESNOTH_BASE_URL}/units/orcs/warrior.png`,
    },
    TERRAIN: {
        [TerrainType.GRASS]: `${WESNOTH_BASE_URL}/terrain/grass/green.png`,
        [TerrainType.PLAINS]: `${WESNOTH_BASE_URL}/terrain/grass/semi-dry.png`,
        [TerrainType.TAIGA]: `${WESNOTH_BASE_URL}/terrain/grass/dry.png`,
        [TerrainType.JUNGLE]: `${WESNOTH_BASE_URL}/terrain/grass/green.png`,
        [TerrainType.TUNDRA]: `${WESNOTH_BASE_URL}/terrain/frozen/snow.png`,
        [TerrainType.FOREST]: `${WESNOTH_BASE_URL}/terrain/grass/green.png`,
        [TerrainType.WATER]: `${WESNOTH_BASE_URL}/terrain/water/coast-tile.png`,
        [TerrainType.MOUNTAIN]: `${WESNOTH_BASE_URL}/terrain/grass/semi-dry.png`,
        [TerrainType.VILLAGE]: `${WESNOTH_BASE_URL}/terrain/grass/green.png`,
        [TerrainType.CASTLE]: `${WESNOTH_BASE_URL}/terrain/flat/dirt.png`,
        [TerrainType.RUINS]: `${WESNOTH_BASE_URL}/terrain/flat/dirt.png`,
        [TerrainType.DESERT]: `${WESNOTH_BASE_URL}/terrain/sand/desert.png`,
        [TerrainType.SWAMP]: `${WESNOTH_BASE_URL}/terrain/swamp/mud-tile.png`,
        [TerrainType.CAVE_FLOOR]: `${WESNOTH_BASE_URL}/terrain/cave/floor.png`,
        [TerrainType.FUNGUS]: `${WESNOTH_BASE_URL}/terrain/forest/mushrooms-tile.png`,
        [TerrainType.LAVA]: `${WESNOTH_BASE_URL}/terrain/unwalkable/lava-tile.png`,
        [TerrainType.CHASM]: `${WESNOTH_BASE_URL}/terrain/chasm/earthy-tile.png`,
        [TerrainType.COBBLESTONE]: `${WESNOTH_BASE_URL}/terrain/flat/road.png`,
        [TerrainType.DIRT_ROAD]: `${WESNOTH_BASE_URL}/terrain/flat/dirt.png`,
        [TerrainType.WOOD_FLOOR]: `${WESNOTH_BASE_URL}/terrain/flat/road.png`, 
        [TerrainType.STONE_FLOOR]: `${WESNOTH_BASE_URL}/terrain/cave/floor.png`, 
        [TerrainType.WALL_HOUSE]: `${WESNOTH_BASE_URL}/terrain/castle/castle-tile.png`,
    },
    BLOCK_TEXTURES: {
        [TerrainType.GRASS]: `${MC_BASE_URL}/grass_block_top.png`,
        [TerrainType.WATER]: `${MC_BASE_URL}/blue_concrete.png`,
        [TerrainType.MOUNTAIN]: `${MC_BASE_URL}/stone.png`,
        [TerrainType.DESERT]: `${MC_BASE_URL}/sand.png`,
        [TerrainType.CASTLE]: `${MC_BASE_URL}/stone_bricks.png`,
        [TerrainType.LAVA]: `${MC_BASE_URL}/lava_still.png`,
        [TerrainType.SWAMP]: `${MC_BASE_URL}/mycelium_top.png`,
        [TerrainType.STONE_FLOOR]: `${MC_BASE_URL}/stone.png`,
        [TerrainType.VILLAGE]: `${MC_BASE_URL}/oak_planks.png`,
        [TerrainType.COBBLESTONE]: `${MC_BASE_URL}/cobblestone.png`,
        [TerrainType.DIRT_ROAD]: `${MC_BASE_URL}/podzol_top.png`,
        [TerrainType.PLAINS]: `${MC_BASE_URL}/grass_block_top.png`,
        [TerrainType.FOREST]: `${MC_BASE_URL}/grass_block_top.png`,
        [TerrainType.JUNGLE]: `${MC_BASE_URL}/grass_block_top.png`,
        [TerrainType.TAIGA]: `${MC_BASE_URL}/podzol_top.png`,
        [TerrainType.TUNDRA]: `${MC_BASE_URL}/snow.png`,
        [TerrainType.RUINS]: `${MC_BASE_URL}/mossy_cobblestone.png`,
        [TerrainType.CAVE_FLOOR]: `${MC_BASE_URL}/cobblestone.png`,
        [TerrainType.FUNGUS]: `${MC_BASE_URL}/mycelium_top.png`,
        [TerrainType.CHASM]: `${MC_BASE_URL}/black_concrete.png`,
        [TerrainType.WOOD_FLOOR]: `${MC_BASE_URL}/oak_planks.png`,
        [TerrainType.WALL_HOUSE]: `${MC_BASE_URL}/bricks.png`,
    },
    VOXEL_STRUCTURE_TEXTURES: {
        OAK_LOG: `${MC_BASE_URL}/oak_log.png`,
        OAK_LEAVES: `${MC_BASE_URL}/oak_leaves.png`,
        BIRCH_LOG: `${MC_BASE_URL}/birch_log.png`,
        BIRCH_LEAVES: `${MC_BASE_URL}/birch_leaves.png`,
        SPRUCE_LOG: `${MC_BASE_URL}/spruce_log.png`,
        SPRUCE_LEAVES: `${MC_BASE_URL}/spruce_leaves.png`,
        JUNGLE_LOG: `${MC_BASE_URL}/jungle_log.png`,
        JUNGLE_LEAVES: `${MC_BASE_URL}/jungle_leaves.png`,
        AZALEA_LEAVES: `${MC_BASE_URL}/flowering_azalea_leaves.png`,
        CACTUS: `${MC_BASE_URL}/cactus_side.png`,
        SANDSTONE: `${MC_BASE_URL}/sandstone.png`,
        CHISELED_SANDSTONE: `${MC_BASE_URL}/chiseled_sandstone.png`,
        STONE_BRICKS: `${MC_BASE_URL}/stone_bricks.png`,
        CRACKED_STONE_BRICKS: `${MC_BASE_URL}/cracked_stone_bricks.png`,
        MOSSY_STONE_BRICKS: `${MC_BASE_URL}/mossy_stone_bricks.png`,
        STONE: `${MC_BASE_URL}/stone.png`,
        COBBLESTONE: `${MC_BASE_URL}/cobblestone.png`,
        MOSSY_COBBLESTONE: `${MC_BASE_URL}/mossy_cobblestone.png`,
        DEEPSLATE: `${MC_BASE_URL}/deepslate.png`,
        BEDROCK: `${MC_BASE_URL}/bedrock.png`,
        DIRT: `${MC_BASE_URL}/dirt.png`,
        COARSE_DIRT: `${MC_BASE_URL}/coarse_dirt.png`,
        RED_MUSHROOM_BLOCK: `${MC_BASE_URL}/red_mushroom_block.png`,
        BROWN_MUSHROOM_BLOCK: `${MC_BASE_URL}/brown_mushroom_block.png`,
        MUSHROOM_STEM: `${MC_BASE_URL}/mushroom_stem.png`,
        BOOKSHELF: `${MC_BASE_URL}/bookshelf.png`,
        BARREL: `${MC_BASE_URL}/barrel_side.png`,
        HAY_BLOCK: `${MC_BASE_URL}/hay_block_side.png`,
        OAK_PLANKS: `${MC_BASE_URL}/oak_planks.png`,
        SNOW: `${MC_BASE_URL}/snow.png`,
        TNT_SIDE: `${MC_BASE_URL}/tnt_side.png`,
        TNT_TOP: `${MC_BASE_URL}/tnt_top.png`,
        ENCHANTING_TABLE: `${MC_BASE_URL}/enchanting_table_top.png`,
        LANTERN: `${MC_BASE_URL}/lantern.png`,
        CHEST: `https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.4/assets/minecraft/textures/entity/chest/normal.png`,
        ENDER_CHEST: `https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.4/assets/minecraft/textures/entity/chest/ender.png`
    },
    OVERLAYS: {
        [TerrainType.FOREST]: [
            `${WESNOTH_BASE_URL}/terrain/forest/pine-tile.png`,
            `${WESNOTH_BASE_URL}/terrain/forest/deciduous-summer-tile.png`
        ], 
        [TerrainType.JUNGLE]: `${WESNOTH_BASE_URL}/terrain/forest/tropical/rainforest-small.png`, 
        [TerrainType.TAIGA]: `${WESNOTH_BASE_URL}/terrain/forest/snow-forest-tile.png`, 
        [TerrainType.MOUNTAIN]: [
            `${WESNOTH_BASE_URL}/terrain/mountains/basic-tile.png`,
            `${WESNOTH_BASE_URL}/terrain/mountains/dry-tile.png`
        ], 
        [TerrainType.VILLAGE]: `${WESNOTH_BASE_URL}/terrain/village/human-tile.png`, 
        [TerrainType.CASTLE]: `${WESNOTH_BASE_URL}/terrain/castle/castle-tile.png`, 
        [TerrainType.RUINS]: `${WESNOTH_BASE_URL}/terrain/castle/ruin-tile.png`, 
        [TerrainType.FUNGUS]: `${WESNOTH_BASE_URL}/terrain/forest/mushrooms-tile.png`, 
    },
    SPELL_FX: {
        MAGIC_SPELL: '/assets/spellFX/1_magicspell_spritesheet.png',
        MAGIC_8: '/assets/spellFX/2_magic8_spritesheet.png',
        BLUE_FIRE: '/assets/spellFX/3_bluefire_spritesheet.png',
        CASTING: '/assets/spellFX/4_casting_spritesheet.png',
        MAGIC_HIT: '/assets/spellFX/5_magickahit_spritesheet.png',
        FLAME_LASH: '/assets/spellFX/6_flamelash_spritesheet.png',
        FIRE_SPIN: '/assets/spellFX/7_firespin_spritesheet.png',
        PROTECTION_CIRCLE: '/assets/spellFX/8_protectioncircle_spritesheet.png',
        BRIGHT_FIRE: '/assets/spellFX/9_brightfire_spritesheet.png',
        WEAPON_HIT: '/assets/spellFX/10_weaponhit_spritesheet.png',
        FIRE: '/assets/spellFX/11_fire_spritesheet.png',
        NEBULA: '/assets/spellFX/12_nebula_spritesheet.png',
        VORTEX: '/assets/spellFX/13_vortex_spritesheet.png',
        PHANTOM: '/assets/spellFX/14_phantom_spritesheet.png',
        LOADING: '/assets/spellFX/15_loading_spritesheet.png',
        SUNBURN: '/assets/spellFX/16_sunburn_spritesheet.png',
        FEL_SPELL: '/assets/spellFX/17_felspell_spritesheet.png',
        MIDNIGHT: '/assets/spellFX/18_midnight_spritesheet.png',
        FREEZING: '/assets/spellFX/19_freezing_spritesheet.png',
        MAGIC_BUBBLES: '/assets/spellFX/20_magicbubbles_spritesheet.png',
    },
    PROJECTILES: {
        NECRO_BOLT: `${WESNOTH_BASE_URL}/items/staff-magic.png`,
        MAGIC_MISSILE: `${WESNOTH_BASE_URL}/items/staff.png`,
        FIREBALL: `${WESNOTH_BASE_URL}/items/potion-red.png`,
        ARROW: `${WESNOTH_BASE_URL}/items/bow.png`
    },
    ANIMATIONS: {
        HEAL: [
            `${WESNOTH_BASE_URL}/halo/elven/nature-halo1.png`,
            `${WESNOTH_BASE_URL}/halo/elven/nature-halo2.png`,
            `${WESNOTH_BASE_URL}/halo/elven/nature-halo3.png`,
            `${WESNOTH_BASE_URL}/halo/elven/nature-halo4.png`,
            `${WESNOTH_BASE_URL}/halo/elven/nature-halo5.png`,
            `${WESNOTH_BASE_URL}/halo/elven/nature-halo6.png`,
            `${WESNOTH_BASE_URL}/halo/elven/nature-halo7.png`,
            `${WESNOTH_BASE_URL}/halo/elven/nature-halo8.png`
        ],
        DARK_AURA: [
            `${WESNOTH_BASE_URL}/halo/undead/dark-magic-1.png`,
            `${WESNOTH_BASE_URL}/halo/undead/dark-magic-2.png`,
            `${WESNOTH_BASE_URL}/halo/undead/dark-magic-3.png`,
            `${WESNOTH_BASE_URL}/halo/undead/dark-magic-4.png`,
            `${WESNOTH_BASE_URL}/halo/undead/dark-magic-5.png`,
            `${WESNOTH_BASE_URL}/halo/undead/dark-magic-6.png`
        ],
        LIGHTNING: [
            `${WESNOTH_BASE_URL}/halo/lightning-bolt-1-1.png`,
            `${WESNOTH_BASE_URL}/halo/lightning-bolt-1-2.png`,
            `${WESNOTH_BASE_URL}/halo/lightning-bolt-1-3.png`,
            `${WESNOTH_BASE_URL}/halo/lightning-bolt-1-4.png`
        ],
        EXPLOSION: [
            `${WESNOTH_BASE_URL}/projectiles/fire-burst-small-1.png`,
            `${WESNOTH_BASE_URL}/projectiles/fire-burst-small-2.png`,
            `${WESNOTH_BASE_URL}/projectiles/fire-burst-small-3.png`,
            `${WESNOTH_BASE_URL}/projectiles/fire-burst-small-4.png`,
            `${WESNOTH_BASE_URL}/projectiles/fire-burst-small-5.png`,
            `${WESNOTH_BASE_URL}/projectiles/fire-burst-small-6.png`,
            `${WESNOTH_BASE_URL}/projectiles/fire-burst-small-7.png`,
            `${WESNOTH_BASE_URL}/projectiles/fire-burst-small-8.png`
        ]
    },
    WEATHER: {
        RAIN: `${WESNOTH_BASE_URL}/halo/lightning-bolt-1-1.png`
    },
    DECORATIONS: {
        GRASS_1: `${MC_BASE_URL}/grass.png`,
        FLOWER_1: `${MC_BASE_URL}/flowering_azalea_leaves.png`,
        ROCK_1: `${MC_BASE_URL}/stone.png`,
        MUSHROOM: `${MC_BASE_URL}/red_mushroom.png`
    }
};

export const TERRAIN_PRIORITY: Record<string, number> = {
    [TerrainType.WATER]: 0,
    [TerrainType.GRASS]: 1,
    [TerrainType.PLAINS]: 1,
    [TerrainType.FOREST]: 2,
    [TerrainType.MOUNTAIN]: 3
};

export const TRANSITION_COMBINATIONS: string[] = [
    'n-ne-se-s-sw-nw',
    'n-ne-se-s-sw', 'ne-se-s-sw-nw', 'se-s-sw-nw-n', 's-sw-nw-n-ne', 'sw-nw-n-ne-se', 'nw-n-ne-se-s',
    'n-ne-se-s', 'ne-se-s-sw', 'se-s-sw-nw', 's-sw-nw-n', 'sw-nw-n-ne', 'nw-n-ne-se',
    'n-ne-se', 'ne-se-s', 'se-s-sw', 's-sw-nw', 'sw-nw-n', 'nw-n-ne',
    'n-ne', 'ne-se', 'se-s', 's-sw', 'sw-nw', 'nw-n',
    'n', 'ne', 'se', 's', 'sw', 'nw'
];
export const DIRECTION_ORDER: string[] = ['n','ne','se','s','sw','nw'];
export const getWesnothTransition = (t: string, c: string) => "";

export const getSprite = (race: CharacterRace, cls: CharacterClass) => {
    // Special high-quality assets take priority
    if (cls === CharacterClass.CLERIC) return ASSETS.UNITS.PLAYER_CLERIC;

    if (race === CharacterRace.ELF && cls === CharacterClass.RANGER) return ASSETS.UNITS.ELF_ARCHER;
    if (race === CharacterRace.ELF && cls === CharacterClass.FIGHTER) return ASSETS.UNITS.ELF_FIGHTER;
    if (race === CharacterRace.DWARF && (cls === CharacterClass.FIGHTER || cls === CharacterClass.PALADIN)) return ASSETS.UNITS.DWARF_FIGHTER;
    if (race === CharacterRace.DWARF) return ASSETS.UNITS.DWARF_GUARD;
    if (race === CharacterRace.DRAGONBORN) return ASSETS.UNITS.PLAYER_DRAGONBORN;
    if (race === CharacterRace.HALF_ORC) return ASSETS.UNITS.PLAYER_HALF_ORC;
    if (race === CharacterRace.HALFLING) return ASSETS.UNITS.PLAYER_HALFLING;
    if (race === CharacterRace.GNOME) return ASSETS.UNITS.PLAYER_GNOME;
    if (race === CharacterRace.TIEFLING) return ASSETS.UNITS.PLAYER_TIEFLING;

    switch (cls) {
        case CharacterClass.WIZARD: return ASSETS.UNITS.PLAYER_WIZARD;
        case CharacterClass.ROGUE: return ASSETS.UNITS.PLAYER_ROGUE;
        case CharacterClass.BARBARIAN: return ASSETS.UNITS.PLAYER_BARBARIAN;
        case CharacterClass.BARD: return ASSETS.UNITS.PLAYER_BARD;
        case CharacterClass.DRUID: return ASSETS.UNITS.PLAYER_DRUID;
        case CharacterClass.PALADIN: return ASSETS.UNITS.PLAYER_PALADIN;
        case CharacterClass.RANGER: return ASSETS.UNITS.PLAYER_RANGER;
        case CharacterClass.SORCERER: return ASSETS.UNITS.PLAYER_SORCERER;
        case CharacterClass.WARLOCK: return ASSETS.UNITS.PLAYER_WARLOCK;
        case CharacterClass.FIGHTER:
        default:
            return ASSETS.UNITS.PLAYER_FIGHTER;
    }
}; 

export const SPELLS: Record<string, Spell> = {
    'MAGIC_MISSILE': { id: 'magic_missile', name: 'Magic Missile', level: 1, type: SpellType.DAMAGE, diceCount: 3, diceSides: 4, description: 'Fires 3 missiles.', range: 6 },
    'CURE_WOUNDS': { id: 'cure_wounds', name: 'Cure Wounds', level: 1, type: SpellType.HEAL, diceCount: 1, diceSides: 8, description: 'Heals a creature.', range: 1 },
    'FIREBALL': { id: 'fireball', name: 'Fireball', level: 3, type: SpellType.DAMAGE, diceCount: 8, diceSides: 6, description: 'Explosive fire.', range: 6 },
    'THUNDERWAVE': { id: 'thunderwave', name: 'Thunderwave', level: 1, type: SpellType.DAMAGE, diceCount: 2, diceSides: 8, description: 'Thunderous force.', range: 2 },
    'FIRE_BOLT': { id: 'firebolt', name: 'Fire Bolt', level: 0, type: SpellType.DAMAGE, diceCount: 1, diceSides: 10, description: 'Hurls a mote of fire.', range: 12 }
};

export const CLASS_SPELLS: Record<CharacterClass, string[]> = {
    [CharacterClass.WIZARD]: ['FIRE_BOLT', 'MAGIC_MISSILE', 'FIREBALL'],
    [CharacterClass.CLERIC]: ['CURE_WOUNDS'],
    [CharacterClass.FIGHTER]: [],
    [CharacterClass.ROGUE]: [],
    [CharacterClass.RANGER]: [],
    [CharacterClass.BARBARIAN]: [],
    [CharacterClass.PALADIN]: ['CURE_WOUNDS'],
    [CharacterClass.SORCERER]: ['FIRE_BOLT', 'MAGIC_MISSILE'],
    [CharacterClass.WARLOCK]: ['FIRE_BOLT', 'MAGIC_MISSILE'],
    [CharacterClass.DRUID]: ['CURE_WOUNDS', 'THUNDERWAVE'],
    [CharacterClass.BARD]: ['CURE_WOUNDS', 'THUNDERWAVE']
};

export const ITEMS: Record<string, Item> = {
    'POTION_HEALING': { id: 'potion_healing', name: 'Healing Potion', type: 'consumable', rarity: ItemRarity.COMMON, description: 'Restores HP', icon: `${WESNOTH_BASE_URL}/items/potion-red.png`, effect: { type: 'heal_hp', amount: 10 } },
    'POTION_MANA': { id: 'potion_mana', name: 'Mana Potion', type: 'consumable', rarity: ItemRarity.UNCOMMON, description: 'Restores Mana', icon: `${WESNOTH_BASE_URL}/items/potion-blue.png`, effect: { type: 'restore_mana', amount: 2 } },
    'RATION': { id: 'ration', name: 'Rations', type: 'consumable', rarity: ItemRarity.COMMON, description: 'Food', icon: `${WESNOTH_BASE_URL}/items/grain-sheaf.png`, effect: { type: 'heal_hp', amount: 2 } },
    
    'LONGSWORD': { id: 'longsword', name: 'Longsword', type: 'equipment', rarity: ItemRarity.COMMON, description: 'Versatile blade', icon: `${WESNOTH_BASE_URL}/items/sword.png`, equipmentStats: { slot: EquipmentSlot.MAIN_HAND, diceCount: 1, diceSides: 8 } },
    'DAGGER': { id: 'dagger', name: 'Dagger', type: 'equipment', rarity: ItemRarity.COMMON, description: 'Simple blade', icon: `${WESNOTH_BASE_URL}/items/dagger.png`, equipmentStats: { slot: EquipmentSlot.MAIN_HAND, diceCount: 1, diceSides: 4, properties: ['Finesse'] } },
    'GREATAXE': { id: 'greataxe', name: 'Greataxe', type: 'equipment', rarity: ItemRarity.UNCOMMON, description: 'Heavy axe', icon: `${WESNOTH_BASE_URL}/attacks/battleaxe.png`, equipmentStats: { slot: EquipmentSlot.MAIN_HAND, diceCount: 1, diceSides: 12 } },
    'MACE': { id: 'mace', name: 'Mace', type: 'equipment', rarity: ItemRarity.COMMON, description: 'Blunt force', icon: `${WESNOTH_BASE_URL}/attacks/mace.png`, equipmentStats: { slot: EquipmentSlot.MAIN_HAND, diceCount: 1, diceSides: 6 } },
    'QUARTERSTAFF': { id: 'quarterstaff', name: 'Quarterstaff', type: 'equipment', rarity: ItemRarity.COMMON, description: 'Simple staff', icon: `${WESNOTH_BASE_URL}/items/staff.png`, equipmentStats: { slot: EquipmentSlot.MAIN_HAND, diceCount: 1, diceSides: 6 } },
    'SHORTSWORD': { id: 'shortsword', name: 'Shortsword', type: 'equipment', rarity: ItemRarity.COMMON, description: 'Light blade', icon: `${WESNOTH_BASE_URL}/items/sword.png`, equipmentStats: { slot: EquipmentSlot.MAIN_HAND, diceCount: 1, diceSides: 6, properties: ['Finesse'] } },
    
    'CHAIN_MAIL': { id: 'chain_mail', name: 'Chain Mail', type: 'equipment', rarity: ItemRarity.UNCOMMON, description: 'Heavy armor', icon: `${WESNOTH_BASE_URL}/items/armor.png`, equipmentStats: { slot: EquipmentSlot.BODY, ac: 16, resistances: { [DamageType.SLASH]: 0.2, [DamageType.PIERCE]: 0.1 } } },
    'LEATHER_ARMOR': { id: 'leather_armor', name: 'Leather Armor', type: 'equipment', rarity: ItemRarity.COMMON, description: 'Light armor', icon: `${WESNOTH_BASE_URL}/items/armor.png`, equipmentStats: { slot: EquipmentSlot.BODY, ac: 11, warmthBonus: 5 } },
    'CHAIN_SHIRT': { id: 'chain_shirt', name: 'Chain Shirt', type: 'equipment', rarity: ItemRarity.UNCOMMON, description: 'Medium armor', icon: `${WESNOTH_BASE_URL}/items/armor.png`, equipmentStats: { slot: EquipmentSlot.BODY, ac: 13, resistances: { [DamageType.SLASH]: 0.1 } } },
    'SHIELD': { id: 'shield', name: 'Shield', type: 'equipment', rarity: ItemRarity.COMMON, description: 'Protection', icon: `${WESNOTH_BASE_URL}/attacks/heater-shield.png`, equipmentStats: { slot: EquipmentSlot.OFF_HAND, ac: 2 } },

    // --- DRAGONBONE ARMOR TIER (LEGENDARY) ---
    'DRAGONBONE_PLATE_FIGHTER': {
        id: 'dragonbone_plate_fighter',
        name: 'Dragonbone Dreadnought Plate',
        type: 'equipment',
        rarity: ItemRarity.LEGENDARY,
        description: 'Forged from the calcified breastplate of an ancient red dragon. Custom fitted for frontline Fighters.',
        flavorText: 'Only those with the strength to fell the wyrm may bear its bones as a bulwark.',
        icon: `${WESNOTH_BASE_URL}/items/armor-golden.png`,
        equipmentStats: {
            slot: EquipmentSlot.BODY,
            ac: 19,
            modifiers: { [Ability.STR]: 2, [Ability.CON]: 1 },
            resistances: { [DamageType.FIRE]: 0.5, [DamageType.SLASH]: 0.3 },
            immunities: [ArmorImmunities.BURN],
            specialEffects: { meleeDamageReflection: 0.1 }
        }
    },
    'DRAGONBONE_CRUSADER_PALADIN': {
        id: 'dragonbone_crusader_paladin',
        name: 'Dragonbone Holy Crusader Plate',
        type: 'equipment',
        rarity: ItemRarity.LEGENDARY,
        description: 'Imbued with celestial light, this dragonbone armor channels sacred power for Paladins.',
        flavorText: 'An unbreakable shield for those who walk in the path of absolute righteousness.',
        icon: `${WESNOTH_BASE_URL}/items/armor-golden.png`,
        equipmentStats: {
            slot: EquipmentSlot.BODY,
            ac: 18,
            modifiers: { [Ability.STR]: 1, [Ability.CHA]: 2 },
            resistances: { [DamageType.FIRE]: 0.4, [DamageType.BLUNT]: 0.2 },
            immunities: [ArmorImmunities.BURN, ArmorImmunities.KNOCKBACK]
        }
    },
    'DRAGONBONE_HARNESS_BARBARIAN': {
        id: 'dragonbone_harness_barbarian',
        name: 'Dragonbone Wyrm-Rage Harness',
        type: 'equipment',
        rarity: ItemRarity.LEGENDARY,
        description: 'Lightweight dragon ribs strapped with thick hydra leather. Ideal for Barbarian rages.',
        flavorText: 'The bones pulse with the untamed, violent spirit of the apex predator.',
        icon: `${WESNOTH_BASE_URL}/items/armor.png`,
        equipmentStats: {
            slot: EquipmentSlot.BODY,
            ac: 15,
            modifiers: { [Ability.STR]: 2, [Ability.CON]: 2 },
            resistances: { [DamageType.FIRE]: 0.3, [DamageType.SLASH]: 0.2 },
            specialEffects: { lowHealthDamageBonus: 0.2, dryingSpeedModifier: 1.5 }
        }
    },
    'DRAGONBONE_SHROUD_ROGUE': {
        id: 'dragonbone_shroud_rogue',
        name: 'Dragonbone Whispering Shroud',
        type: 'equipment',
        rarity: ItemRarity.LEGENDARY,
        description: 'Silenced dragonbone plates woven with darkweave silk. Form-fitting protection for Rogues.',
        flavorText: 'It is as silent as a falling shadow, whispering promises of lethal precision.',
        icon: `${WESNOTH_BASE_URL}/items/armor.png`,
        equipmentStats: {
            slot: EquipmentSlot.BODY,
            ac: 13,
            modifiers: { [Ability.DEX]: 2, [Ability.CHA]: 1 },
            resistances: { [DamageType.FIRE]: 0.2, [DamageType.PROJECTILE]: 0.3 },
            specialEffects: { silentMovement: true, detectionRadiusModifier: 0.8 }
        }
    },
    'DRAGONBONE_MANTLE_RANGER': {
        id: 'dragonbone_mantle_ranger',
        name: 'Dragonbone Stalker Greatmantle',
        type: 'equipment',
        rarity: ItemRarity.LEGENDARY,
        description: 'Lined with camouflaging dragon scales and reinforced joints. Tailored for Rangers.',
        flavorText: 'The wilderness bows to the hunter dressed in the remains of the skies.',
        icon: `${WESNOTH_BASE_URL}/items/armor.png`,
        equipmentStats: {
            slot: EquipmentSlot.BODY,
            ac: 14,
            modifiers: { [Ability.DEX]: 1, [Ability.WIS]: 2 }
        }
    },
    'DRAGONBONE_VESTMENTS_CLERIC': {
        id: 'dragonbone_vestments_cleric',
        name: 'Dragonbone Hierophant Vestments',
        type: 'equipment',
        rarity: ItemRarity.LEGENDARY,
        description: 'Consecrated clerical robes reinforced with holy dragon osteoderms.',
        flavorText: 'Divine intervention resonates through the fossilized remnants of ancient giants.',
        icon: `${WESNOTH_BASE_URL}/items/armor.png`,
        equipmentStats: {
            slot: EquipmentSlot.BODY,
            ac: 16,
            modifiers: { [Ability.WIS]: 2, [Ability.CON]: 1 }
        }
    },
    'DRAGONBONE_REGALIA_DRUID': {
        id: 'dragonbone_regalia_druid',
        name: 'Dragonbone Wildwood Regalia',
        type: 'equipment',
        rarity: ItemRarity.LEGENDARY,
        description: 'Constructed purely from natural mossy dragonbone and living vine sinew. Fitted for Druids.',
        flavorText: 'The heartbeat of the earth pulses within these deep, fossilized runic bones.',
        icon: `${WESNOTH_BASE_URL}/items/armor.png`,
        equipmentStats: {
            slot: EquipmentSlot.BODY,
            ac: 14,
            modifiers: { [Ability.WIS]: 2, [Ability.INT]: 1 }
        }
    },
    'DRAGONBONE_ROBES_WIZARD': {
        id: 'dragonbone_robes_wizard',
        name: 'Dragonbone Runecaster Garb',
        type: 'equipment',
        rarity: ItemRarity.LEGENDARY,
        description: 'Satin robes inlaid with intricate runic engravings carved on polished dragon bone shards.',
        flavorText: 'Arcane sigils thrum with ancient, forgotten spellpower of the dragon lords.',
        icon: `${WESNOTH_BASE_URL}/items/armor.png`,
        equipmentStats: {
            slot: EquipmentSlot.BODY,
            ac: 11,
            modifiers: { [Ability.INT]: 2, [Ability.DEX]: 1 }
        }
    },
    'DRAGONBONE_GARB_SORCERER': {
        id: 'dragonbone_garb_sorcerer',
        name: 'Dragonbone Pyromancer Vestments',
        type: 'equipment',
        rarity: ItemRarity.LEGENDARY,
        description: 'Woven with fire-resistant dragon thread and adorned with fiery dragon horn fragments.',
        flavorText: 'Unbound, raw elemental magic flows effortlessly through its warm draconic fibers.',
        icon: `${WESNOTH_BASE_URL}/items/armor.png`,
        equipmentStats: {
            slot: EquipmentSlot.BODY,
            ac: 12,
            modifiers: { [Ability.CHA]: 2, [Ability.DEX]: 1 }
        }
    },
    'DRAGONBONE_RAIMENT_WARLOCK': {
        id: 'dragonbone_raiment_warlocks',
        name: 'Dragonbone Eldritch Greatrobe',
        type: 'equipment',
        rarity: ItemRarity.LEGENDARY,
        description: 'Tainted dragonbone armor dark-infused with otherworldly essence. Designed for Warlocks.',
        flavorText: 'A pact sealed in bone and shadow, offering protection against mortal and cosmic threats.',
        icon: `${WESNOTH_BASE_URL}/items/armor.png`,
        equipmentStats: {
            slot: EquipmentSlot.BODY,
            ac: 12,
            modifiers: { [Ability.CHA]: 2, [Ability.INT]: 1 }
        }
    },
    'DRAGONBONE_DOUBLET_BARD': {
        id: 'dragonbone_doublet_bard',
        name: 'Dragonbone Troubadour Doublet',
        type: 'equipment',
        rarity: ItemRarity.LEGENDARY,
        description: 'Extravagant fine leather doublet reinforced with polished bone buttons and melodic wire strings.',
        flavorText: 'Every movement produces a soft, resonant hum that elevates the wearer’s performance.',
        icon: `${WESNOTH_BASE_URL}/items/armor.png`,
        equipmentStats: {
            slot: EquipmentSlot.BODY,
            ac: 13,
            modifiers: { [Ability.CHA]: 2, [Ability.DEX]: 1 }
        }
    },

    // --- JADE WEAPONS TIER (LEGENDARY) ---
    'JADE_GREATSWORD': {
        id: 'jade_greatsword',
        name: 'Jade Dragon Greatsword',
        type: 'equipment',
        rarity: ItemRarity.LEGENDARY,
        description: 'A colossal blade carved from a single seamless deposit of pure celestial jade.',
        flavorText: 'It glitters with a dangerous green light, cutting through armor as if it were parchment.',
        icon: `${WESNOTH_BASE_URL}/items/sword.png`,
        equipmentStats: {
            slot: EquipmentSlot.MAIN_HAND,
            diceCount: 2,
            diceSides: 6,
            modifiers: { [Ability.STR]: 2 }
        }
    },
    'JADE_LONGSWORD': {
        id: 'jade_longsword',
        name: 'Jade Sovereign Longsword',
        type: 'equipment',
        rarity: ItemRarity.LEGENDARY,
        description: 'A beautifully balanced longsword with a jade-embedded hilt and pristine edge.',
        flavorText: 'Drawn only by heroes of immense honor, bringing prosperity and decisive victory.',
        icon: `${WESNOTH_BASE_URL}/items/sword.png`,
        equipmentStats: {
            slot: EquipmentSlot.MAIN_HAND,
            diceCount: 1,
            diceSides: 10,
            modifiers: { [Ability.CHA]: 1, [Ability.STR]: 1 }
        }
    },
    'JADE_DAGGER': {
        id: 'jade_dagger',
        name: 'Jade Serpent Dagger',
        type: 'equipment',
        rarity: ItemRarity.LEGENDARY,
        description: 'A sleek, poisoned jade dagger crafted to resemble a striking viper.',
        flavorText: 'Silent and venomous, the jade blade drinks the life of the unsuspecting.',
        icon: `${WESNOTH_BASE_URL}/items/dagger.png`,
        equipmentStats: {
            slot: EquipmentSlot.MAIN_HAND,
            diceCount: 1,
            diceSides: 6,
            properties: ['Finesse'],
            modifiers: { [Ability.DEX]: 2 }
        }
    },
    'JADE_BOW': {
        id: 'jade_bow',
        name: 'Jade Gale-Runner Longbow',
        type: 'equipment',
        rarity: ItemRarity.LEGENDARY,
        description: 'A flexible recurve bow carved from resilient emerald wood and inlaid with jade runes.',
        flavorText: 'Arrows fired from this bow sing with the velocity of an impending storm.',
        icon: `${WESNOTH_BASE_URL}/items/bow.png`,
        equipmentStats: {
            slot: EquipmentSlot.MAIN_HAND,
            diceCount: 1,
            diceSides: 10,
            modifiers: { [Ability.DEX]: 2 }
        }
    },
    'JADE_STAFF': {
        id: 'jade_staff',
        name: 'Jade Archon Magic Staff',
        type: 'equipment',
        rarity: ItemRarity.LEGENDARY,
        description: 'An ancient wizard staff crowned with a swirling emerald sphere of pure power.',
        flavorText: 'Focuses and intensifies elemental streams of magic with natural perfection.',
        icon: `${WESNOTH_BASE_URL}/items/staff-magic.png`,
        equipmentStats: {
            slot: EquipmentSlot.MAIN_HAND,
            diceCount: 1,
            diceSides: 8,
            modifiers: { [Ability.INT]: 2, [Ability.WIS]: 1 }
        }
    },
    'JADE_MACE': {
        id: 'jade_mace',
        name: 'Jade Radiant Sun Mace',
        type: 'equipment',
        rarity: ItemRarity.LEGENDARY,
        description: 'A heavy mace featuring a solid jade head carved into the shape of a radiant sun.',
        flavorText: 'Channels pure divine wrath, turning undead into heaps of harmless dust.',
        icon: `${WESNOTH_BASE_URL}/items/staff.png`,
        equipmentStats: {
            slot: EquipmentSlot.MAIN_HAND,
            diceCount: 1,
            diceSides: 8,
            modifiers: { [Ability.WIS]: 2 }
        }
    },
    'JADE_GREATAXE': {
        id: 'jade_greataxe',
        name: 'Jade Wyvern Greataxe',
        type: 'equipment',
        rarity: ItemRarity.LEGENDARY,
        description: 'A heavy, double-bladed axe with beautifully etched jade blades.',
        flavorText: 'Each swing carries the crushing pressure of a cascading green mountain.',
        icon: `${WESNOTH_BASE_URL}/items/sword.png`,
        equipmentStats: {
            slot: EquipmentSlot.MAIN_HAND,
            diceCount: 1,
            diceSides: 12,
            modifiers: { [Ability.STR]: 2 }
        }
    },
    'JADE_SCEPTRE': {
        id: 'jade_sceptre',
        name: 'Jade Astral Star Sceptre',
        type: 'equipment',
        rarity: ItemRarity.LEGENDARY,
        description: 'A magnificent sceptre carved with stars, channeling cosmic and eldritch secrets.',
        flavorText: 'The cosmos whispers its designs to whoever holds this emerald beacon.',
        icon: `${WESNOTH_BASE_URL}/items/staff-magic.png`,
        equipmentStats: {
            slot: EquipmentSlot.MAIN_HAND,
            diceCount: 1,
            diceSides: 8,
            modifiers: { [Ability.CHA]: 2 }
        }
    },
    'JADE_SHIELD': {
        id: 'jade_shield',
        name: 'Jade Lotus Bulwark Shield',
        type: 'equipment',
        rarity: ItemRarity.LEGENDARY,
        description: 'A thick, heavy shield with a gorgeous carved jade lotus pattern on its face.',
        flavorText: 'The lotus absorbs the force of kinetic attacks, keeping the defender absolute.',
        icon: `${WESNOTH_BASE_URL}/items/armor.png`,
        equipmentStats: {
            slot: EquipmentSlot.OFF_HAND,
            ac: 4,
            modifiers: { [Ability.CON]: 2 }
        }
    }
};

export const CLASS_EQUIPMENT_PACKAGES: Record<CharacterClass, StartingEquipmentPackage[]> = {
    [CharacterClass.FIGHTER]: [
        {
            id: 'fighter_sentinel',
            name: 'Knight Sentinel',
            archetype: 'Defense & Control',
            description: 'Longsword with Shield and heavy Chain Mail. Sturdy and reliable.',
            equipment: {
                [EquipmentSlot.MAIN_HAND]: ITEMS.LONGSWORD,
                [EquipmentSlot.OFF_HAND]: ITEMS.SHIELD,
                [EquipmentSlot.BODY]: ITEMS.CHAIN_MAIL
            },
            bonusItems: [{ item: ITEMS.POTION_HEALING, quantity: 1 }]
        },
        {
            id: 'fighter_vanguard',
            name: 'Heavy Vanguard',
            archetype: 'Two-Handed Power',
            description: 'Massive Greataxe and Medium Chain Shirt for devastating front-line strikes.',
            equipment: {
                [EquipmentSlot.MAIN_HAND]: ITEMS.GREATAXE,
                [EquipmentSlot.BODY]: ITEMS.CHAIN_SHIRT
            },
            bonusItems: [{ item: ITEMS.POTION_HEALING, quantity: 2 }]
        }
    ],
    [CharacterClass.BARBARIAN]: [
        {
            id: 'barb_berserker',
            name: 'Berserker Executioner',
            archetype: 'Brutal Cleave',
            description: 'Titanic Greataxe and light Leather Armor for maximum aggression.',
            equipment: {
                [EquipmentSlot.MAIN_HAND]: ITEMS.GREATAXE,
                [EquipmentSlot.BODY]: ITEMS.LEATHER_ARMOR
            },
            bonusItems: [{ item: ITEMS.POTION_HEALING, quantity: 2 }]
        },
        {
            id: 'barb_slayer',
            name: 'Wild Twin-Blade',
            archetype: 'Dual-Wielding Fury',
            description: 'Dual Shortswords for rapid, relentless attacks.',
            equipment: {
                [EquipmentSlot.MAIN_HAND]: ITEMS.SHORTSWORD,
                [EquipmentSlot.OFF_HAND]: ITEMS.DAGGER,
                [EquipmentSlot.BODY]: ITEMS.LEATHER_ARMOR
            },
            bonusItems: [{ item: ITEMS.POTION_HEALING, quantity: 1 }, { item: ITEMS.RATION, quantity: 2 }]
        }
    ],
    [CharacterClass.PALADIN]: [
        {
            id: 'paladin_crusader',
            name: 'Holy Crusader',
            archetype: 'Bastion of Radiance',
            description: 'Longsword, Blessed Shield, and impenetrable Chain Mail.',
            equipment: {
                [EquipmentSlot.MAIN_HAND]: ITEMS.LONGSWORD,
                [EquipmentSlot.OFF_HAND]: ITEMS.SHIELD,
                [EquipmentSlot.BODY]: ITEMS.CHAIN_MAIL
            },
            bonusItems: [{ item: ITEMS.POTION_HEALING, quantity: 1 }]
        },
        {
            id: 'paladin_inquisitor',
            name: 'Zealous Inquisitor',
            archetype: 'Relentless Smite',
            description: 'Heavy War Mace and Chain Shirt with additional Divine draughts.',
            equipment: {
                [EquipmentSlot.MAIN_HAND]: ITEMS.MACE,
                [EquipmentSlot.BODY]: ITEMS.CHAIN_SHIRT
            },
            bonusItems: [{ item: ITEMS.POTION_HEALING, quantity: 2 }]
        }
    ],
    [CharacterClass.ROGUE]: [
        {
            id: 'rogue_shadow',
            name: 'Shadow Assassin',
            archetype: 'Stealth & Criticals',
            description: 'Twin Daggers with finesse edge and supple Leather Armor.',
            equipment: {
                [EquipmentSlot.MAIN_HAND]: ITEMS.DAGGER,
                [EquipmentSlot.OFF_HAND]: ITEMS.DAGGER,
                [EquipmentSlot.BODY]: ITEMS.LEATHER_ARMOR
            },
            bonusItems: [{ item: ITEMS.POTION_HEALING, quantity: 2 }]
        },
        {
            id: 'rogue_duelist',
            name: 'Acrobatic Duelist',
            archetype: 'Finesse Skirmish',
            description: 'Balanced Shortsword and parrying Dagger for agile footwork.',
            equipment: {
                [EquipmentSlot.MAIN_HAND]: ITEMS.SHORTSWORD,
                [EquipmentSlot.OFF_HAND]: ITEMS.DAGGER,
                [EquipmentSlot.BODY]: ITEMS.LEATHER_ARMOR
            },
            bonusItems: [{ item: ITEMS.POTION_HEALING, quantity: 1 }]
        }
    ],
    [CharacterClass.RANGER]: [
        {
            id: 'ranger_tracker',
            name: 'Wilderness Tracker',
            archetype: 'Agile Hunter',
            description: 'Shortsword, hunting Dagger, and Leather Armor crafted from beast hide.',
            equipment: {
                [EquipmentSlot.MAIN_HAND]: ITEMS.SHORTSWORD,
                [EquipmentSlot.OFF_HAND]: ITEMS.DAGGER,
                [EquipmentSlot.BODY]: ITEMS.LEATHER_ARMOR
            },
            bonusItems: [{ item: ITEMS.POTION_HEALING, quantity: 1 }, { item: ITEMS.RATION, quantity: 3 }]
        },
        {
            id: 'ranger_skirmisher',
            name: 'Shielded Warden',
            archetype: 'Tactical Vanguard',
            description: 'Shortsword paired with a light Shield and Leather Armor.',
            equipment: {
                [EquipmentSlot.MAIN_HAND]: ITEMS.SHORTSWORD,
                [EquipmentSlot.OFF_HAND]: ITEMS.SHIELD,
                [EquipmentSlot.BODY]: ITEMS.LEATHER_ARMOR
            },
            bonusItems: [{ item: ITEMS.POTION_HEALING, quantity: 1 }]
        }
    ],
    [CharacterClass.CLERIC]: [
        {
            id: 'cleric_warrior',
            name: 'War Priest',
            archetype: 'Battle Liturgy',
            description: 'Flanged Mace, Sacred Shield, and defensive Chain Shirt.',
            equipment: {
                [EquipmentSlot.MAIN_HAND]: ITEMS.MACE,
                [EquipmentSlot.OFF_HAND]: ITEMS.SHIELD,
                [EquipmentSlot.BODY]: ITEMS.CHAIN_SHIRT
            },
            bonusItems: [{ item: ITEMS.POTION_MANA, quantity: 1 }]
        },
        {
            id: 'cleric_oracle',
            name: 'Devout Healer',
            archetype: 'Pure Restoration',
            description: 'Consecrated Quarterstaff and supplementary mana elixirs.',
            equipment: {
                [EquipmentSlot.MAIN_HAND]: ITEMS.QUARTERSTAFF,
                [EquipmentSlot.BODY]: ITEMS.LEATHER_ARMOR
            },
            bonusItems: [{ item: ITEMS.POTION_HEALING, quantity: 1 }, { item: ITEMS.POTION_MANA, quantity: 2 }]
        }
    ],
    [CharacterClass.WIZARD]: [
        {
            id: 'wizard_scholar',
            name: 'Arcane Scholar',
            archetype: 'Spell Focus',
            description: 'Runed Quarterstaff and a satchel packed with Mana Potions.',
            equipment: {
                [EquipmentSlot.MAIN_HAND]: ITEMS.QUARTERSTAFF
            },
            bonusItems: [{ item: ITEMS.POTION_MANA, quantity: 2 }, { item: ITEMS.POTION_HEALING, quantity: 1 }]
        },
        {
            id: 'wizard_battle',
            name: 'Spellblade Initiate',
            archetype: 'Mobile Casting',
            description: 'Ritual Dagger, defensive Leather Armor, and Mana Potions.',
            equipment: {
                [EquipmentSlot.MAIN_HAND]: ITEMS.DAGGER,
                [EquipmentSlot.BODY]: ITEMS.LEATHER_ARMOR
            },
            bonusItems: [{ item: ITEMS.POTION_MANA, quantity: 1 }, { item: ITEMS.POTION_HEALING, quantity: 1 }]
        }
    ],
    [CharacterClass.SORCERER]: [
        {
            id: 'sorcerer_elemental',
            name: 'Elemental Channeler',
            archetype: 'Raw Essence',
            description: 'Channeling Quarterstaff with potent Mana Draughts.',
            equipment: {
                [EquipmentSlot.MAIN_HAND]: ITEMS.QUARTERSTAFF
            },
            bonusItems: [{ item: ITEMS.POTION_MANA, quantity: 2 }]
        },
        {
            id: 'sorcerer_blood',
            name: 'Blood Channeler',
            archetype: 'Close-Quarters Spark',
            description: 'Finesse Dagger, protective Leather Armor, and Vitality Potions.',
            equipment: {
                [EquipmentSlot.MAIN_HAND]: ITEMS.DAGGER,
                [EquipmentSlot.BODY]: ITEMS.LEATHER_ARMOR
            },
            bonusItems: [{ item: ITEMS.POTION_HEALING, quantity: 1 }, { item: ITEMS.POTION_MANA, quantity: 1 }]
        }
    ],
    [CharacterClass.WARLOCK]: [
        {
            id: 'warlock_pact',
            name: 'Pact Channeler',
            archetype: 'Eldritch Might',
            description: 'Eldritch Quarterstaff and mystic reserves.',
            equipment: {
                [EquipmentSlot.MAIN_HAND]: ITEMS.QUARTERSTAFF,
                [EquipmentSlot.BODY]: ITEMS.LEATHER_ARMOR
            },
            bonusItems: [{ item: ITEMS.POTION_MANA, quantity: 2 }]
        },
        {
            id: 'warlock_blade',
            name: 'Hexblade Stalker',
            archetype: 'Blade of Shadows',
            description: 'Ritual Dagger with Leather Armor and Elixirs.',
            equipment: {
                [EquipmentSlot.MAIN_HAND]: ITEMS.DAGGER,
                [EquipmentSlot.BODY]: ITEMS.LEATHER_ARMOR
            },
            bonusItems: [{ item: ITEMS.POTION_HEALING, quantity: 1 }, { item: ITEMS.POTION_MANA, quantity: 1 }]
        }
    ],
    [CharacterClass.DRUID]: [
        {
            id: 'druid_warden',
            name: 'Oak Warden',
            archetype: 'Nature Sentinel',
            description: 'Hardwood Quarterstaff, Wooden Shield, and Leather Armor.',
            equipment: {
                [EquipmentSlot.MAIN_HAND]: ITEMS.QUARTERSTAFF,
                [EquipmentSlot.OFF_HAND]: ITEMS.SHIELD,
                [EquipmentSlot.BODY]: ITEMS.LEATHER_ARMOR
            },
            bonusItems: [{ item: ITEMS.POTION_HEALING, quantity: 1 }]
        },
        {
            id: 'druid_shaman',
            name: 'Spirit Shaman',
            archetype: 'Primal Conjurer',
            description: 'Totemic Staff and restorative herbal draughts.',
            equipment: {
                [EquipmentSlot.MAIN_HAND]: ITEMS.QUARTERSTAFF,
                [EquipmentSlot.BODY]: ITEMS.LEATHER_ARMOR
            },
            bonusItems: [{ item: ITEMS.POTION_MANA, quantity: 2 }]
        }
    ],
    [CharacterClass.BARD]: [
        {
            id: 'bard_troubadour',
            name: 'Wandering Troubadour',
            archetype: 'Charismatic Duelist',
            description: 'Finesse Shortsword, Leather Armor, and balanced potions.',
            equipment: {
                [EquipmentSlot.MAIN_HAND]: ITEMS.SHORTSWORD,
                [EquipmentSlot.BODY]: ITEMS.LEATHER_ARMOR
            },
            bonusItems: [{ item: ITEMS.POTION_HEALING, quantity: 1 }, { item: ITEMS.POTION_MANA, quantity: 1 }]
        },
        {
            id: 'bard_minstrel',
            name: 'Arcane Minstrel',
            archetype: 'Spell Virtuoso',
            description: 'Twin Daggers and Leather Armor with extra Mana Draughts.',
            equipment: {
                [EquipmentSlot.MAIN_HAND]: ITEMS.DAGGER,
                [EquipmentSlot.OFF_HAND]: ITEMS.DAGGER,
                [EquipmentSlot.BODY]: ITEMS.LEATHER_ARMOR
            },
            bonusItems: [{ item: ITEMS.POTION_MANA, quantity: 2 }]
        }
    ]
};

export const LOADING_TIPS = [
    "Los bosques y montañas otorgan cobertura táctica y reducen el avance enemigo.",
    "El D-Pad táctil móvil facilita el desplazamiento hexagonal preciso sin fatiga táctil.",
    "Descansar en asentamientos y posadas restaura completamente tus Puntos de Golpe y Dados de Golpe.",
    "Los magos y clérigos recuperan sus espacios de conjuros tras completar un descanso largo.",
    "El Reino Invertido (Upside Down) contiene botines arcanos legendarios, pero enemigos más letales.",
    "En combate 5E, las casillas con fuego o hielo imponen salvaciones de Constitución y Destreza.",
    "Puedes configurar la vista ortográfica y las texturas pixel-art desde el menú de Ajustes.",
    "Las armas a distancia y conjuros requieren línea de visión libre de obstáculos y muros.",
    "El modo Cacería 3D te permite explorar estructuras de voxels y cazar bestias colosales."
];
