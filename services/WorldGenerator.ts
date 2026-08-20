
import { HexCell, TerrainType, WeatherType, Dimension } from '../types';
import { getAncientSiteAt } from '../data/ancientSites';

// Pseudo-random number generator with seed (Kept for details like trees/encounters)
class Mulberry32 {
    private a: number;
    constructor(seed: number) {
        this.a = seed;
    }
    next(): number {
        var t = this.a += 0x6D2B79F5;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
}

// Simple noise for organic borders (Coastline roughness)
const PERM = new Uint8Array(512);
const GRAD3 = [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]];

const seedNoise = (seed: number) => {
    const rng = new Mulberry32(seed);
    const p = new Uint8Array(256);
    for(let i=0; i<256; i++) p[i] = i;
    for(let i=0; i<256; i++) {
        const r = Math.floor(rng.next() * 256);
        const temp = p[i]; p[i] = p[r]; p[r] = temp;
    }
    for(let i=0; i<512; i++) PERM[i] = p[i & 255];
};

const dot = (g: number[], x: number, y: number) => g[0]*x + g[1]*y;

const noise2D = (xin: number, yin: number): number => {
    let n0, n1, n2;
    const F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
    const s = (xin + yin) * F2;
    const i = Math.floor(xin + s);
    const j = Math.floor(yin + s);
    const G2 = (3.0 - Math.sqrt(3.0)) / 6.0;
    const t = (i + j) * G2;
    const X0 = i - t;
    const Y0 = j - t;
    const x0 = xin - X0;
    const y0 = yin - Y0;
    let i1, j1;
    if(x0 > y0) { i1=1; j1=0; } else { i1=0; j1=1; }
    const x1 = x0 - i1 + G2;
    const y1 = y0 - j1 + G2;
    const x2 = x0 - 1.0 + 2.0 * G2;
    const y2 = y0 - 1.0 + 2.0 * G2;
    const ii = i & 255;
    const jj = j & 255;
    const gi0 = PERM[ii+PERM[jj]] % 12;
    const gi1 = PERM[ii+i1+PERM[jj+j1]] % 12;
    const gi2 = PERM[ii+1+PERM[jj+1]] % 12;
    let t0 = 0.5 - x0*x0 - y0*y0;
    if(t0<0) n0 = 0.0; else { t0 *= t0; n0 = t0 * t0 * dot(GRAD3[gi0], x0, y0); }
    let t1 = 0.5 - x1*x1 - y1*y1;
    if(t1<0) n1 = 0.0; else { t1 *= t1; n1 = t1 * t1 * dot(GRAD3[gi1], x1, y1); }
    let t2 = 0.5 - x2*x2 - y2*y2;
    if(t2<0) n2 = 0.0; else { t2 *= t2; n2 = t2 * t2 * dot(GRAD3[gi2], x2, y2); }
    return 70.0 * (n0 + n1 + n2);
};

export class WorldGenerator {
    private static isInitialized = false;
    private static seed = 12345; // FIXED SEED FOR CONSISTENCY

    static init(seed: number) {
        this.seed = seed;
        seedNoise(seed);
        this.isInitialized = true;
    }

    static getTile(q: number, r: number, dimension: Dimension): HexCell {
        if (!this.isInitialized) this.init(12345);

        // Use deterministic RNG for details (trees, encounters) based on coords
        const rng = new Mulberry32(q * 73856093 ^ r * 19349663 ^ this.seed);
        
        // --- THE ARCADIA ATLAS (Designed Geography) ---
        // We define both dimensions simultaneously to ensure perfect mirroring
        
        // 1. Global Noise for Organic Edges
        const warpX = noise2D(q * 0.1, r * 0.1) * 4;
        const warpY = noise2D(q * 0.1 + 100, r * 0.1 + 100) * 4;
        
        const mq = q + warpX;
        const mr = r + warpY;

        // Distance from Center (0,0)
        const dist = Math.sqrt(mq*mq + mr*mr);

        // DEFAULT: THE OCEAN / VOID
        let terrain = TerrainType.WATER;
        let udTerrain = TerrainType.CHASM; 
        let weather = WeatherType.NONE;
        let udWeather = WeatherType.ASH; // The void is full of ash

        // --- REGION DEFINITIONS ---

        // CENTRAL CONTINENT (Radius ~45)
        if (dist < 45) {
            // Base Land
            terrain = TerrainType.GRASS; 
            udTerrain = TerrainType.CAVE_FLOOR; // Dead rock

            // REGION: THE FROZEN NORTH (Top, negative R)
            if (mr < -20) {
                terrain = TerrainType.TUNDRA;
                udTerrain = TerrainType.CAVE_FLOOR; // Frozen wasteland is just dead rock in hell
                
                if (mr < -30) {
                    terrain = TerrainType.MOUNTAIN; // Ice wall
                    udTerrain = TerrainType.MOUNTAIN; // Dark peaks
                }
                if (rng.next() > 0.6) weather = WeatherType.SNOW;
            }
            // REGION: THE SUNSCORCHED SANDS (Bottom, positive R)
            else if (mr > 20) {
                terrain = TerrainType.DESERT;
                udTerrain = TerrainType.CAVE_FLOOR; // Ash dunes
                
                if (mq > 15) {
                    terrain = TerrainType.PLAINS; // Savannah transition
                    udTerrain = TerrainType.CAVE_FLOOR;
                }
            }
            // REGION: THE WHISPERING WOODS (West, negative Q)
            else if (mq < -15) {
                terrain = TerrainType.FOREST;
                udTerrain = TerrainType.FUNGUS; // Forests become Fungus groves
                
                if (mq < -25) {
                    terrain = TerrainType.JUNGLE; // Deep woods
                    udTerrain = TerrainType.FUNGUS; // Deep corruption
                }
                udWeather = WeatherType.FOG; // Spores
            }
            // REGION: THE IRON PEAKS (East, positive Q)
            else if (mq > 15) {
                terrain = TerrainType.MOUNTAIN;
                udTerrain = TerrainType.MOUNTAIN; // Shared geology
                
                if (mq > 25 && mr > -10 && mr < 10) {
                    terrain = TerrainType.RUINS; 
                    udTerrain = TerrainType.RUINS;
                }
            }
            // REGION: THE SWAMP OF SORROWS (Specific pocket)
            else if (mq > 5 && mq < 15 && mr > 5 && mr < 15) {
                terrain = TerrainType.SWAMP;
                udTerrain = TerrainType.SWAMP; // Swamp exists in both, but looks darker in UD
                if (rng.next() > 0.7) weather = WeatherType.RAIN;
                udWeather = WeatherType.FOG;
            }
            // CENTER: THE CAPITAL PLAINS
            else {
                // Just nice grass/plains
                if (rng.next() > 0.7) terrain = TerrainType.PLAINS;
            }

            // RIVERS (Mirrored as cracks/chasms)
            const river1 = Math.abs(mq - Math.sin(mr * 0.2) * 5);
            const river2 = Math.abs(mr - Math.cos(mq * 0.2) * 5);
            
            // Only cut rivers through non-elevated land
            if ((river1 < 1.2 || river2 < 1.2) && terrain !== TerrainType.MOUNTAIN && terrain !== TerrainType.TUNDRA) {
                if (elevationNoise(q,r) < 0.2) {
                    terrain = TerrainType.WATER; 
                    udTerrain = TerrainType.CHASM; // Reality tear
                }
            }
        }
        
        // OUTER ISLANDS
        else if (dist > 55 && dist < 75) {
            // Archipelago Ring
            const islandNoise = noise2D(q * 0.08, r * 0.08);
            if (islandNoise > 0.4) {
                terrain = TerrainType.JUNGLE; 
                udTerrain = TerrainType.FUNGUS; // Floating fungus islands
                
                if (islandNoise > 0.7) {
                    terrain = TerrainType.MOUNTAIN; // Volcano
                    udTerrain = TerrainType.LAVA; // Active hellscape
                }
            }
        }

        // --- PROCEDURAL DETAILS ---
        
        // Detail Noise for patches (Flowers / small forests)
        if (terrain === TerrainType.GRASS && noise2D(q*0.3, r*0.3) > 0.6) {
            terrain = TerrainType.FOREST;
            udTerrain = TerrainType.FUNGUS;
        }
        
        // --- POI & LOGIC ---
        
        let poiType: HexCell['poiType'] = undefined;
        let poiName: string | undefined = undefined;
        let poiDescription: string | undefined = undefined;
        let hasPortal = false;
        let hasEncounter = false;

        // Check for Named Ancient Ruins & Mystic Caves
        const ancientSite = getAncientSiteAt(q, r);
        if (ancientSite) {
            terrain = ancientSite.type === 'RUINS' ? TerrainType.RUINS : TerrainType.CAVE_FLOOR;
            udTerrain = TerrainType.RUINS;
            poiType = ancientSite.type === 'RUINS' ? 'ANCIENT_RUINS' : 'MYSTIC_CAVE';
            poiName = ancientSite.name;
            poiDescription = ancientSite.description;
        }
        // Settlements only exist on "safe" land in normal world
        else if (terrain !== TerrainType.WATER && terrain !== TerrainType.MOUNTAIN) {
            
            // Guaranteed Settlements (Mirrored as Ruins)
            if (q === 0 && r === 0) {
                terrain = TerrainType.CASTLE; // Capital City
                udTerrain = TerrainType.RUINS; // Fallen Capital
                poiType = 'PLAZA';
            } else if (q === 2 && r === -3) {
                terrain = TerrainType.FOREST; // Goblin Lair in the North-East Woods
                udTerrain = TerrainType.FUNGUS;
                poiType = 'GOBLIN_LAIR';
                poiName = 'Guarida Oculta de Grommash';
                poiDescription = 'Un campamento de asalto y caverna fortificada con empalizadas de madera oscura y tótems goblin.';
            } else if (q === -20 && r === -10) {
                terrain = TerrainType.VILLAGE; // Elf Village
                udTerrain = TerrainType.RUINS;
            } else if (
                (q === 15 && r === -20) ||
                (q === -25 && r === 5) ||
                (q === 10 && r === 30) ||
                (q === -30 && r === -25) ||
                (q === 40 && r === 0)
            ) {
                terrain = TerrainType.RUINS; 
                udTerrain = TerrainType.RUINS;
                poiType = 'DRAGON_LAIR';
            } 
            // Random Settlements
            else if (rng.next() > 0.985) {
                terrain = rng.next() > 0.5 ? TerrainType.VILLAGE : TerrainType.RUINS;
                udTerrain = TerrainType.RUINS;
            }

            // Portals (Exist in same spot in both dimensions, obviously)
            if (rng.next() < 0.008) hasPortal = true;

            // --- ENCOUNTER BALANCING (Overworld Enemies) ---
            // SAFE ZONE: No enemies within 4 hexes of origin to allow safe start (was 10)
            if (dist > 4) {
                if (dimension === Dimension.NORMAL) {
                    // Normal World: 10% chance (was 3%)
                    // Villages and Castles are safe zones
                    if (terrain !== TerrainType.VILLAGE && terrain !== TerrainType.CASTLE && rng.next() > 0.90) {
                        hasEncounter = true;
                    }
                } else {
                    // Upside Down: Higher danger (15% chance)
                    if (rng.next() > 0.85) {
                        hasEncounter = true;
                    }
                }
            }
        }

        // Override logic if somehow UD terrain got messed up or needs specific fix
        if (udTerrain === TerrainType.LAVA) udWeather = WeatherType.FOG;

        // Final Output based on Dimension
        const finalTerrain = dimension === Dimension.NORMAL ? terrain : udTerrain;
        const finalWeather = dimension === Dimension.NORMAL ? weather : udWeather;

        return {
            q, r,
            terrain: finalTerrain,
            weather: finalWeather,
            isExplored: false,
            isVisible: false,
            hasPortal,
            poiType,
            poiName,
            poiDescription,
            hasEncounter
        };
    }
}

// Helper for river depth
const elevationNoise = (x: number, y: number) => {
    return (noise2D(x * 0.1, y * 0.1) + 1) / 2;
}
