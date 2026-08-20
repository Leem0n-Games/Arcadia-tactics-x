import * as pako from 'pako';
import { ASSETS } from '../constants';
import { TerrainType } from '../types';
import { cullHiddenBlocks } from './VoxelEngine';

export { cullHiddenBlocks };

export interface SchematicBlock {
  x: number;
  y: number;
  z: number;
  id: number;
  name: string;
  color: string;
  textureUrl: string;
  isSolid: boolean;
  isHazard?: boolean;
  isLight?: boolean;
}

export interface SchematicData {
  title: string;
  width: number;  // X
  height: number; // Y
  length: number; // Z
  blocks: SchematicBlock[];
  totalBlocks: number;
  source: 'uploaded' | 'preset';
}

// Map Minecraft Block Names or IDs to Colors and Textures
export const MINECRAFT_BLOCK_MAP: Record<string, { name: string; color: string; textureUrl: string; isSolid: boolean; isHazard?: boolean; isLight?: boolean }> = {
  'air': { name: 'Aire', color: 'transparent', textureUrl: '', isSolid: false },
  'grass_block': { name: 'Hierba', color: '#4ade80', textureUrl: ASSETS.BLOCK_TEXTURES[TerrainType.GRASS], isSolid: true },
  'dirt': { name: 'Tierra', color: '#854d0e', textureUrl: ASSETS.VOXEL_STRUCTURE_TEXTURES.DIRT, isSolid: true },
  'coarse_dirt': { name: 'Tierra Rocosa', color: '#713f12', textureUrl: ASSETS.VOXEL_STRUCTURE_TEXTURES.COARSE_DIRT, isSolid: true },
  'stone': { name: 'Piedra', color: '#64748b', textureUrl: ASSETS.VOXEL_STRUCTURE_TEXTURES.STONE, isSolid: true },
  'cobblestone': { name: 'Adoquín', color: '#475569', textureUrl: ASSETS.VOXEL_STRUCTURE_TEXTURES.COBBLESTONE, isSolid: true },
  'mossy_cobblestone': { name: 'Adoquín Musgoso', color: '#334155', textureUrl: ASSETS.VOXEL_STRUCTURE_TEXTURES.MOSSY_COBBLESTONE, isSolid: true },
  'stone_bricks': { name: 'Ladrillos de Piedra', color: '#475569', textureUrl: ASSETS.VOXEL_STRUCTURE_TEXTURES.STONE_BRICKS, isSolid: true },
  'cracked_stone_bricks': { name: 'Ladrillos Agrietados', color: '#334155', textureUrl: ASSETS.VOXEL_STRUCTURE_TEXTURES.CRACKED_STONE_BRICKS, isSolid: true },
  'mossy_stone_bricks': { name: 'Ladrillos Musgosos', color: '#1e3a29', textureUrl: ASSETS.VOXEL_STRUCTURE_TEXTURES.MOSSY_STONE_BRICKS, isSolid: true },
  'oak_log': { name: 'Tronco de Roble', color: '#78350f', textureUrl: ASSETS.VOXEL_STRUCTURE_TEXTURES.OAK_LOG, isSolid: true },
  'oak_leaves': { name: 'Hojas de Roble', color: '#15803d', textureUrl: ASSETS.VOXEL_STRUCTURE_TEXTURES.OAK_LEAVES, isSolid: true },
  'oak_planks': { name: 'Madera de Roble', color: '#a16207', textureUrl: ASSETS.VOXEL_STRUCTURE_TEXTURES.OAK_PLANKS, isSolid: true },
  'jungle_log': { name: 'Tronco de Selva', color: '#713f12', textureUrl: ASSETS.VOXEL_STRUCTURE_TEXTURES.JUNGLE_LOG, isSolid: true },
  'jungle_leaves': { name: 'Hojas de Selva', color: '#166534', textureUrl: ASSETS.VOXEL_STRUCTURE_TEXTURES.JUNGLE_LEAVES, isSolid: true },
  'sandstone': { name: 'Arenisca', color: '#fde047', textureUrl: ASSETS.VOXEL_STRUCTURE_TEXTURES.SANDSTONE, isSolid: true },
  'chiseled_sandstone': { name: 'Arenisca Cincelada', color: '#eab308', textureUrl: ASSETS.VOXEL_STRUCTURE_TEXTURES.CHISELED_SANDSTONE, isSolid: true },
  'water': { name: 'Agua', color: '#3b82f6', textureUrl: ASSETS.BLOCK_TEXTURES[TerrainType.WATER], isSolid: false },
  'lava': { name: 'Lava', color: '#ef4444', textureUrl: ASSETS.BLOCK_TEXTURES[TerrainType.LAVA], isSolid: true, isHazard: true },
  'obsidian': { name: 'Obsidiana', color: '#0f172a', textureUrl: ASSETS.VOXEL_STRUCTURE_TEXTURES.DEEPSLATE, isSolid: true },
  'deepslate': { name: 'Pizarra Profunda', color: '#1e293b', textureUrl: ASSETS.VOXEL_STRUCTURE_TEXTURES.DEEPSLATE, isSolid: true },
  'bedrock': { name: 'Roca Madre', color: '#090d16', textureUrl: ASSETS.VOXEL_STRUCTURE_TEXTURES.BEDROCK, isSolid: true },
  'glowstone': { name: 'Piedra Brillante', color: '#fef08a', textureUrl: ASSETS.VOXEL_STRUCTURE_TEXTURES.LANTERN, isSolid: true, isLight: true },
  'gold_block': { name: 'Bloque de Oro', color: '#eab308', textureUrl: ASSETS.VOXEL_STRUCTURE_TEXTURES.CHISELED_SANDSTONE, isSolid: true },
  'diamond_block': { name: 'Bloque de Diamante', color: '#06b6d4', textureUrl: ASSETS.VOXEL_STRUCTURE_TEXTURES.STONE_BRICKS, isSolid: true },
  'emerald_block': { name: 'Bloque de Esmeralda', color: '#10b981', textureUrl: ASSETS.VOXEL_STRUCTURE_TEXTURES.MOSSY_STONE_BRICKS, isSolid: true },
  'brick_block': { name: 'Ladrillo', color: '#991b1b', textureUrl: ASSETS.VOXEL_STRUCTURE_TEXTURES.CRACKED_STONE_BRICKS, isSolid: true },
  'bookshelf': { name: 'Librería', color: '#854d0e', textureUrl: ASSETS.VOXEL_STRUCTURE_TEXTURES.BOOKSHELF, isSolid: true },
  'snow': { name: 'Nieve', color: '#f8fafc', textureUrl: ASSETS.VOXEL_STRUCTURE_TEXTURES.SNOW, isSolid: true },
  'tnt': { name: 'TNT', color: '#dc2626', textureUrl: ASSETS.VOXEL_STRUCTURE_TEXTURES.TNT_SIDE, isSolid: true, isHazard: true }
};

// Legacy Minecraft numeric Block IDs fallback (MCEdit v1 schematic)
export const LEGACY_ID_MAP: Record<number, string> = {
  0: 'air',
  1: 'stone',
  2: 'grass_block',
  3: 'dirt',
  4: 'cobblestone',
  5: 'oak_planks',
  8: 'water',
  9: 'water',
  10: 'lava',
  11: 'lava',
  12: 'sandstone',
  17: 'oak_log',
  18: 'oak_leaves',
  24: 'sandstone',

  41: 'gold_block',
  45: 'brick_block',

  48: 'mossy_cobblestone',
  49: 'obsidian',

  89: 'glowstone',
  98: 'stone_bricks',
  161: 'oak_leaves',
  162: 'oak_log'
};

// --- NBT BINARY READER ---
class NBTReader {
  private buffer: Uint8Array;
  private offset: number = 0;

  constructor(buffer: Uint8Array) {
    this.buffer = buffer;
  }

  readByte(): number {
    return this.buffer[this.offset++];
  }

  readShort(): number {
    const val = (this.buffer[this.offset] << 8) | this.buffer[this.offset + 1];
    this.offset += 2;
    // convert to signed short
    return val > 32767 ? val - 65536 : val;
  }

  readInt(): number {
    const val = (this.buffer[this.offset] << 24) |
                (this.buffer[this.offset + 1] << 16) |
                (this.buffer[this.offset + 2] << 8) |
                this.buffer[this.offset + 3];
    this.offset += 4;
    return val;
  }

  readString(): string {
    const len = (this.buffer[this.offset] << 8) | this.buffer[this.offset + 1];
    this.offset += 2;
    const strBytes = this.buffer.subarray(this.offset, this.offset + len);
    this.offset += len;
    return new TextDecoder('utf-8').decode(strBytes);
  }

  readByteArray(): Uint8Array {
    const len = this.readInt();
    const arr = this.buffer.subarray(this.offset, this.offset + len);
    this.offset += len;
    return arr;
  }

  readIntArray(): Int32Array {
    const len = this.readInt();
    const arr = new Int32Array(len);
    for (let i = 0; i < len; i++) {
      arr[i] = this.readInt();
    }
    return arr;
  }

  skipTagValue(tagType: number) {
    switch (tagType) {
      case 1: this.offset += 1; break; // Byte
      case 2: this.offset += 2; break; // Short
      case 3: this.offset += 4; break; // Int
      case 4: this.offset += 8; break; // Long
      case 5: this.offset += 4; break; // Float
      case 6: this.offset += 8; break; // Double
      case 7: { // Byte Array
        const len = this.readInt();
        this.offset += len;
        break;
      }
      case 8: { // String
        const len = (this.buffer[this.offset] << 8) | this.buffer[this.offset + 1];
        this.offset += 2 + len;
        break;
      }
      case 9: { // List
        const elemType = this.readByte();
        const len = this.readInt();
        for (let i = 0; i < len; i++) {
          this.skipTagValue(elemType);
        }
        break;
      }
      case 10: { // Compound
        while (true) {
          const innerTag = this.readByte();
          if (innerTag === 0) break;
          this.readString(); // name
          this.skipTagValue(innerTag);
        }
        break;
      }
      case 11: { // Int Array
        const len = this.readInt();
        this.offset += len * 4;
        break;
      }
      case 12: { // Long Array
        const len = this.readInt();
        this.offset += len * 8;
        break;
      }
    }
  }

  parseCompoundTag(): Record<string, any> {
    const result: Record<string, any> = {};
    while (this.offset < this.buffer.length) {
      const tagType = this.readByte();
      if (tagType === 0) break; // Tag_End
      const tagName = this.readString();
      result[tagName] = this.parseTagValue(tagType);
    }
    return result;
  }

  parseTagValue(tagType: number): any {
    switch (tagType) {
      case 1: return this.readByte();
      case 2: return this.readShort();
      case 3: return this.readInt();
      case 4: { this.offset += 8; return 0; } // Long simplified
      case 5: { this.offset += 4; return 0; } // Float
      case 6: { this.offset += 8; return 0; } // Double
      case 7: return this.readByteArray();
      case 8: return this.readString();
      case 9: {
        const elemType = this.readByte();
        const len = this.readInt();
        const list = [];
        for (let i = 0; i < len; i++) {
          list.push(this.parseTagValue(elemType));
        }
        return list;
      }
      case 10: return this.parseCompoundTag();
      case 11: return this.readIntArray();
      default:
        this.skipTagValue(tagType);
        return null;
    }
  }
}

/**
 * Parses raw ArrayBuffer of a .schematic or .schem file
 */
export const parseMinecraftSchematic = async (arrayBuffer: ArrayBuffer, title: string = 'Mapa Importado'): Promise<SchematicData> => {
  let decompressed: Uint8Array;
  try {
    decompressed = pako.ungzip(new Uint8Array(arrayBuffer));
  } catch (e) {
    // If not gzipped, try raw buffer
    decompressed = new Uint8Array(arrayBuffer);
  }

  const reader = new NBTReader(decompressed);
  const rootType = reader.readByte();
  if (rootType !== 10) {
    throw new Error('Archivo .schematic no válido (no contiene etiqueta Compound NBT inicial)');
  }
  const rootName = reader.readString();
  const nbt = reader.parseCompoundTag();

  // MCEdit format fields
  let width = nbt.Width || (nbt.Schematic && nbt.Schematic.Width) || 16;
  let height = nbt.Height || (nbt.Schematic && nbt.Schematic.Height) || 16;
  let length = nbt.Length || (nbt.Schematic && nbt.Schematic.Length) || 16;

  const rawBlocks: Uint8Array | Int32Array = nbt.Blocks || (nbt.Schematic && nbt.Schematic.Blocks) || (nbt.BlockData) || new Uint8Array();

  const blocks: SchematicBlock[] = [];

  if (rawBlocks && rawBlocks.length > 0) {
    // MCEdit Indexing formula: (y * Length + z) * Width + x
    for (let y = 0; y < height; y++) {
      for (let z = 0; z < length; z++) {
        for (let x = 0; x < width; x++) {
          const index = (y * length + z) * width + x;
          if (index < rawBlocks.length) {
            const rawId = rawBlocks[index];
            if (rawId > 0) {
              const keyName = LEGACY_ID_MAP[rawId] || 'stone';
              const blockMeta = MINECRAFT_BLOCK_MAP[keyName] || MINECRAFT_BLOCK_MAP.stone;
              blocks.push({
                x,
                y,
                z,
                id: rawId,
                name: blockMeta.name,
                color: blockMeta.color,
                textureUrl: blockMeta.textureUrl,
                isSolid: blockMeta.isSolid,
                isHazard: blockMeta.isHazard
              });
            }
          }
        }
      }
    }
  }

  // If map ended up empty or corrupt, fallback to generated procedural schematic
  if (blocks.length === 0) {
    return generatePresetSchematic('Castillo de Cacería de Obsidiana');
  }

  return {
    title,
    width,
    height,
    length,
    blocks,
    totalBlocks: blocks.length,
    source: 'uploaded'
  };
};

/**
 * Procedurally generates high-quality Community Minecraft-style Presets
 * (e.g., Obsidian Dragon Arena, Ancient Temple, Mountain Citadel)
 */
export const generatePresetSchematic = (presetType: string): SchematicData => {
  const blocks: SchematicBlock[] = [];
  let width = 36;
  let length = 36;
  let height = 20;

  const getMeta = (typeKey: string) => MINECRAFT_BLOCK_MAP[typeKey] || MINECRAFT_BLOCK_MAP.stone;

  if (presetType.includes('Obsidiana') || presetType.includes('Dragón')) {
    // Dark volcanic obsidian castle with lava moats, stone bridges, and glowstone towers
    width = 36; length = 36; height = 20;

    for (let x = 0; x < width; x++) {
      for (let z = 0; z < length; z++) {
        // Base bedrock/obsidian layer
        blocks.push({ x, y: 0, z, id: 49, ...getMeta('obsidian') });

        // Lava moat around inner fortress (with bridges at x=17..18)
        const isBridge = (x >= 16 && x <= 19 && (z >= 3 && z <= 7));
        const isMoat = (x === 4 || x === width - 5 || z === 4 || z === length - 5) && x > 2 && x < width - 3 && z > 2 && z < length - 3;

        if (isBridge) {
          blocks.push({ x, y: 1, z, id: 4, ...getMeta('cobblestone') });
        } else if (isMoat) {
          blocks.push({ x, y: 1, z, id: 10, ...getMeta('lava') });
        } else {
          blocks.push({ x, y: 1, z, id: 1, ...getMeta('stone') });
        }

        // Main Fortress Outer Walls (width-9 = 27)
        const isWallLine = (x === 8 || x === width - 9 || z === 8 || z === length - 9) && x >= 8 && x <= width - 9 && z >= 8 && z <= length - 9;
        const isGatePassage = (x >= 16 && x <= 19 && z === 8); // Grand Entrance Gate

        if (isWallLine && !isGatePassage) {
          for (let y = 2; y <= 8; y++) {
            const blockType = (y === 8) ? 'glowstone' : (y % 2 === 0 ? 'stone_bricks' : 'cracked_stone_bricks');
            blocks.push({ x, y, z, id: 98, ...getMeta(blockType) });
          }
        } else if (isWallLine && isGatePassage) {
          // Archway top at y=7..8
          for (let y = 7; y <= 8; y++) {
            blocks.push({ x, y, z, id: 98, ...getMeta('stone_bricks') });
          }
        }

        // Corner Towers
        const isCorner = (x === 8 || x === width - 9) && (z === 8 || z === length - 9);
        if (isCorner) {
          for (let y = 9; y <= 16; y++) {
            const blockType = (y === 16) ? 'glowstone' : 'obsidian';
            blocks.push({ x, y, z, id: 49, ...getMeta(blockType) });
          }
        }

        // Central Altar & Dragon Shrine
        if (x >= 15 && x <= 20 && z >= 15 && z <= 20) {
          const distToCenter = Math.max(Math.abs(x - 17.5), Math.abs(z - 17.5));
          const altarHeight = Math.floor(5 - distToCenter * 1.5);
          for (let y = 2; y <= 2 + altarHeight; y++) {
            const isTop = (y === 2 + altarHeight);
            blocks.push({ x, y, z, id: 41, ...getMeta(isTop ? 'gold_block' : 'stone_bricks') });
          }
        }

        // Decorative Torches / Glowstone Pillars around courtyard
        if ((x === 11 || x === 24) && (z === 11 || z === 24)) {
          for (let y = 2; y <= 5; y++) {
            blocks.push({ x, y, z, id: 89, ...getMeta(y === 5 ? 'glowstone' : 'chiseled_sandstone') });
          }
        }
      }
    }
  } else if (presetType.includes('Templo') || presetType.includes('Ruinas')) {
    // Ancient Jungle Temple with stone stairs and mossy ruins
    width = 32; length = 32; height = 18;

    for (let x = 0; x < width; x++) {
      for (let z = 0; z < length; z++) {
        // Base grass ground
        blocks.push({ x, y: 0, z, id: 2, ...getMeta('grass_block') });

        // Tiered Mayan/Aztec Pyramid
        const layer = Math.min(x, width - 1 - x, z, length - 1 - z);
        if (layer >= 4) {
          const tier = layer - 4;
          if (tier < 8) {
            // Check if front staircase cutout
            const isStaircase = (x >= 14 && x <= 17 && z <= 15 && z >= 4);
            const currentMaxY = isStaircase ? Math.min(tier + 1, z - 3) : tier + 1;

            for (let y = 1; y <= currentMaxY; y++) {
              const bType = (y === currentMaxY)
                ? ((x + z + y) % 3 === 0 ? 'mossy_cobblestone' : 'mossy_stone_bricks')
                : 'stone';
              blocks.push({ x, y, z, id: 4, ...getMeta(bType) });
            }
          }
        }

        // Shrine room on top of pyramid (layer 11 -> tier 7 -> top center)
        if (x >= 13 && x <= 18 && z >= 13 && z <= 18) {
          for (let y = 8; y <= 12; y++) {
            const isWall = (x === 13 || x === 18 || z === 13 || z === 18);
            if (isWall) {
              blocks.push({ x, y, z, id: 98, ...getMeta(y === 12 ? 'glowstone' : 'chiseled_sandstone') });
            }
          }
          // Emerald altar in shrine
          if (x >= 15 && x <= 16 && z >= 15 && z <= 16) {
            blocks.push({ x, y: 9, z, id: 133, ...getMeta('emerald_block') });
          }
        }

        // Decorative Jungle Trees in outer corners (1,1), (30,1), (1,30), (30,30) - keeping (3,3) clear for spawn
        const isTreeLocation = (x === 1 && z === 1) || (x === 30 && z === 1) || (x === 1 && z === 30) || (x === 30 && z === 30);
        if (isTreeLocation) {
          for (let y = 1; y <= 7; y++) {
            blocks.push({ x, y, z, id: 17, ...getMeta('jungle_log') });
          }
          for (let lx = x - 2; lx <= x + 2; lx++) {
            for (let lz = z - 2; lz <= z + 2; lz++) {
              for (let ly = 6; ly <= 9; ly++) {
                if (lx >= 0 && lx < width && lz >= 0 && lz < length) {
                  if (Math.abs(lx - x) + Math.abs(lz - z) + Math.abs(ly - 7) <= 3) {
                    blocks.push({ x: lx, y: ly, z: lz, id: 18, ...getMeta('jungle_leaves') });
                  }
                }
              }
            }
          }
        }
      }
    }
  } else {
    // Mountain Citadel & High Peak Fortress
    width = 32; length = 32; height = 16;

    for (let x = 0; x < width; x++) {
      for (let z = 0; z < length; z++) {
        // Natural mountain terrain curve
        const distFromCenter = Math.hypot(x - 16, z - 16);
        const hillHeight = Math.max(1, Math.floor(7 - distFromCenter * 0.35 + Math.sin(x * 0.4) * 1.2));

        for (let y = 0; y <= hillHeight; y++) {
          let bType = 'stone';
          if (y === hillHeight) {
            bType = (y >= 6) ? 'snow' : ((y >= 3) ? 'grass_block' : 'dirt');
          } else if (y > hillHeight - 2) {
            bType = 'dirt';
          }
          blocks.push({ x, y, z, id: 2, ...getMeta(bType) });
        }

        // Citadel Keep on top of central mountain
        if (x >= 12 && x <= 19 && z >= 12 && z <= 19) {
          const baseKeepY = hillHeight + 1;
          for (let y = baseKeepY; y <= baseKeepY + 5; y++) {
            const isWall = (x === 12 || x === 19 || z === 12 || z === 19);
            const isGate = (x === 15 || x === 16) && z === 12 && y <= baseKeepY + 2;
            if (isWall && !isGate) {
              const bType = (y === baseKeepY + 5) ? 'glowstone' : 'stone_bricks';
              blocks.push({ x, y, z, id: 98, ...getMeta(bType) });
            }
          }
        }
      }
    }
  }


  return {
    title: presetType,
    width,
    height,
    length,
    blocks,
    totalBlocks: blocks.length,
    source: 'preset'
  };
};

