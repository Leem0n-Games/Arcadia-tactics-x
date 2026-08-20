import { StateCreator } from 'zustand';
import { GameState, HuntPrey, HuntSession } from '../../types';
import { SchematicData } from '../../services/SchematicParser';
import { generatePresetInWorker } from '../../services/schematicWorkerService';
import { sfx } from '../../services/SoundSystem';

export interface HuntSlice {
  currentSchematic: SchematicData | null;
  huntSession: HuntSession | null;
  startHuntMode: (presetName?: string) => Promise<void>;
  loadCustomSchematic: (schematicData: SchematicData) => void;
  moveHuntPlayer: (x: number, y: number, z: number) => void;
  attackPreyInHunt: (preyId: string) => void;
  exitHuntMode: () => void;
}

export const createHuntSlice: StateCreator<any, [], [], HuntSlice> = (set, get) => ({
  currentSchematic: null,
  huntSession: null,

  startHuntMode: async (presetName = 'Castillo de Cacería de Obsidiana') => {
    sfx.playUiClick();
    try {
      const { schematicData } = await generatePresetInWorker(presetName);
      get().loadCustomSchematic(schematicData);
    } catch (err) {
      console.error('Error starting hunt mode via worker:', err);
    }
  },

  loadCustomSchematic: (schematicData: SchematicData) => {
    const isDragonLair = schematicData.title.includes('Dragón') || schematicData.title.includes('Guarida');

    // Generate preys (Monstruos de cacería) positioned at high elevation / strategic locations in the schematic
    const preys: HuntPrey[] = isDragonLair ? [
      {
        id: `prey-dragon-boss`,
        name: 'Ignis, Gran Dragón Rojo Ancestral',
        type: 'dragon',
        level: 16,
        hp: 250,
        maxHp: 250,
        x: Math.floor(schematicData.width / 2),
        y: Math.max(6, Math.floor(schematicData.height * 0.65)),
        z: Math.floor(schematicData.length / 2),
        color: '#ef4444',
        icon: '🐉',
        isDefeated: false,
        rewardXp: 2000,
        rewardGold: 2500,
        trophyName: 'Corazón y Escamas de Dragón Rojo'
      },
      {
        id: `prey-golem-guard`,
        name: 'Gólem Guardián de Lava',
        type: 'golem',
        level: 10,
        hp: 140,
        maxHp: 140,
        x: Math.floor(schematicData.width * 0.25),
        y: 4,
        z: Math.floor(schematicData.length * 0.75),
        color: '#f97316',
        icon: '🗿',
        isDefeated: false,
        rewardXp: 400,
        rewardGold: 300,
        trophyName: 'Núcleo de Magma'
      },
      {
        id: `prey-wyvern-guard`,
        name: 'Guiverno Escupefuego',
        type: 'wyvern',
        level: 11,
        hp: 150,
        maxHp: 150,
        x: Math.floor(schematicData.width * 0.75),
        y: Math.max(6, Math.floor(schematicData.height * 0.6)),
        z: Math.floor(schematicData.length * 0.25),
        color: '#dc2626',
        icon: '🦅',
        isDefeated: false,
        rewardXp: 450,
        rewardGold: 350,
        trophyName: 'Garra Ígnea'
      }
    ] : [
      {
        id: `prey-dragon-1`,
        name: 'Gran Dragón Volcánico',
        type: 'dragon',
        level: 12,
        hp: 180,
        maxHp: 180,
        x: Math.floor(schematicData.width / 2),
        y: Math.max(8, Math.floor(schematicData.height * 0.7)),
        z: Math.floor(schematicData.length / 2),
        color: '#ef4444',
        icon: '🐉',
        isDefeated: false,
        rewardXp: 350,
        rewardGold: 500,
        trophyName: 'Corazón de Dragón Volcánico'
      },
      {
        id: `prey-golem-1`,
        name: 'Gólem de Obsidiana Ancestral',
        type: 'golem',
        level: 8,
        hp: 120,
        maxHp: 120,
        x: Math.floor(schematicData.width * 0.25),
        y: 4,
        z: Math.floor(schematicData.length * 0.75),
        color: '#0284c7',
        icon: '🗿',
        isDefeated: false,
        rewardXp: 200,
        rewardGold: 250,
        trophyName: 'Núcleo de Obsidiana'
      },
      {
        id: `prey-wyvern-1`,
        name: 'Guiverno del Vacío',
        type: 'wyvern',
        level: 10,
        hp: 140,
        maxHp: 140,
        x: Math.floor(schematicData.width * 0.75),
        y: Math.max(6, Math.floor(schematicData.height * 0.6)),
        z: Math.floor(schematicData.length * 0.25),
        color: '#a855f7',
        icon: '🦅',
        isDefeated: false,
        rewardXp: 280,
        rewardGold: 350,
        trophyName: 'Garra de Guiverno de Bloques'
      },
      {
        id: `prey-lord-1`,
        name: 'Señor de las Sombras de Voxel',
        type: 'shadow_lord',
        level: 15,
        hp: 250,
        maxHp: 250,
        x: Math.floor(schematicData.width * 0.5),
        y: Math.max(10, Math.floor(schematicData.height * 0.85)),
        z: Math.floor(schematicData.length * 0.5),
        color: '#eab308',
        icon: '👑',
        isDefeated: false,
        rewardXp: 500,
        rewardGold: 800,
        trophyName: 'Corona de Voxel Antiguo'
      }
    ];

    // Find safe spawn y level near x=2, z=2
    let spawnY = 2;
    const spawnBlocks = schematicData.blocks.filter(b => Math.abs(b.x - 3) <= 2 && Math.abs(b.z - 3) <= 2 && b.isSolid);
    if (spawnBlocks.length > 0) {
      spawnY = Math.max(...spawnBlocks.map(b => b.y)) + 1;
    }

    const session: HuntSession = {
      schematicTitle: schematicData.title,
      playerPos: { x: 3, y: spawnY, z: 3 },
      preys,
      trophiesCollected: [],
      preysDefeatedCount: 0,
      totalPreysCount: preys.length
    };

    get().transitionToMap({
      targetState: GameState.HUNT_MODE,
      targetLocationName: schematicData.title,
      targetBiome: 'Estructura Voxel 3D',
      durationMs: 800,
      action: () => {
        set({
          currentSchematic: schematicData,
          huntSession: session
        });
        get().addLog(`🎮 Modo Cacería cargado: "${schematicData.title}" (${schematicData.width}x${schematicData.height}x${schematicData.length} bloques).`, 'narrative');
      }
    });
  },

  moveHuntPlayer: (x: number, y: number, z: number) => {
    const session = get().huntSession;
    if (!session) return;

    set({
      huntSession: {
        ...session,
        playerPos: { x, y, z }
      }
    });
  },

  attackPreyInHunt: (preyId: string) => {
    const session = get().huntSession;
    if (!session) return;

    const prey = session.preys.find(p => p.id === preyId);
    if (!prey || prey.isDefeated) return;

    sfx.playAttack();

    // D&D 20-sided dice roll calculation for attack zoom emphasis
    const d20Roll = Math.floor(Math.random() * 20) + 1;
    const modifier = 4;
    const totalRoll = d20Roll + modifier;
    const isCrit = d20Roll === 20;

    // Damage prey calculation
    const baseDamage = Math.floor(22 + Math.random() * 18);
    const damage = isCrit ? baseDamage * 2 : baseDamage;
    const newHp = Math.max(0, prey.hp - damage);
    const isDefeated = newHp === 0;

    const updatedPreys = session.preys.map(p => {
      if (p.id === preyId) {
        return { ...p, hp: newHp, isDefeated };
      }
      return p;
    });

    const defeatedCount = updatedPreys.filter(p => p.isDefeated).length;
    const newTrophies = isDefeated 
      ? [...session.trophiesCollected, prey.trophyName]
      : session.trophiesCollected;

    let updatedReturnPortal = session.returnPortal;

    if (isDefeated) {
      sfx.playVictory();
      get().addLog(`⚔️ ¡CRÍTICO/GOLPE MORTAL! Derrotaste a ${prey.name}! Obtuviste ${prey.rewardXp} XP y el trofeo "${prey.trophyName}".`, 'levelup');
      
      if (prey.type === 'dragon' || prey.id.includes('dragon')) {
        get().progressQuestObjective('DRAGON_HUNT', 'OBJ_KILL_DRAGON', 1);
        get().addLog('🏆 ¡HAS CAZADO AL GRAN DRAGÓN ROJO! El corazón de la bestia es tuyo.', 'loot');
        get().addLog('🌀 ¡Se ha abierto un Portal Arcano de retorno! Úsalo para regresar a la salida del dungeon.', 'narrative');
        sfx.playPortal();
        updatedReturnPortal = {
          x: prey.x,
          y: Math.max(1, prey.y),
          z: prey.z,
          active: true
        };
      }
    } else {
      const logText = isCrit
        ? `💥 GOLPE CRÍTICO! D20 (${d20Roll}) + 4 = ${totalRoll} -> Asestaste ${damage} de daño a ${prey.name}!`
        : `🗡️ Ataque certero: D20 (${d20Roll}) + 4 = ${totalRoll} -> ${damage} de daño a ${prey.name}.`;
      get().addLog(logText, 'combat');
    }

    set({
      huntSession: {
        ...session,
        preys: updatedPreys,
        trophiesCollected: newTrophies,
        preysDefeatedCount: defeatedCount,
        returnPortal: updatedReturnPortal,
        lastAttackEvent: {
          preyId: prey.id,
          preyName: prey.name,
          damage,
          isHit: true,
          isCrit,
          d20Roll,
          modifier,
          totalRoll,
          targetPos: { x: prey.x, y: prey.y, z: prey.z },
          timestamp: Date.now()
        }
      }
    });
  },

  exitHuntMode: () => {
    sfx.playPortal();
    const dungeonEntrance = get().dragonDungeonEntrancePos;
    if (dungeonEntrance) {
      set({
        gameState: GameState.OVERWORLD,
        playerPos: { x: dungeonEntrance.x, y: dungeonEntrance.y },
        dimension: dungeonEntrance.dimension ?? get().dimension,
        gracePeriodEndTime: Date.now() + 4000
      });
      get().addLog(`🌀 ¡Has cruzado el portal de regreso! Apareces a salvo en la salida del dungeon (${dungeonEntrance.x}, ${dungeonEntrance.y}). ¡Regresa a la ciudad para cobrar tu recompensa legendaria!`, 'narrative');
    } else {
      set({
        gameState: GameState.OVERWORLD,
        gracePeriodEndTime: Date.now() + 4000
      });
      get().addLog('Has regresado al mapa del mundo.', 'info');
    }
  }
});
