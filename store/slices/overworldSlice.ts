
import { StateCreator } from 'zustand';
import { GameState, Dimension, Difficulty, HexCell, PositionComponent, WeatherType, OverworldEntity, Quest, GameStateData, TerrainType, SaveSlotId, EventChoice, NarrativeEvent } from '../../types';
import { WorldGenerator } from '../../services/WorldGenerator';
import { findPath } from '../../services/pathfinding';
import { calculateVisionRange } from '../../services/dndRules';
import { sfx } from '../../services/SoundSystem';
import { useContentStore } from '../contentStore';
import { GameStore } from '../gameStore';
import { DEFAULT_MAP_WIDTH, DEFAULT_MAP_HEIGHT, TERRAIN_MOVEMENT_COST } from '../../constants';
import { writeSaveToSlot, readSaveFromSlot, deleteSaveSlot, deserializeGameState } from '../../services/saveManager';
import { ANCIENT_SITES, getAncientSiteAt } from '../../data/ancientSites';

const generateId = () => Math.random().toString(36).substr(2, 9);

export interface OverworldSlice {
  gameState: GameState;
  dimension: Dimension;
  difficulty: Difficulty;
  exploredTiles: Record<Dimension, Set<string>>;
  visitedTowns: Record<string, boolean>;
  clearedEncounters: Set<string>;
  townMapData: HexCell[] | null;
  activeOverworldEnemies: OverworldEntity[];
  playerPos: PositionComponent;
  isPlayerMoving: boolean;
  lastOverworldPos: PositionComponent | null;
  mapDimensions: { width: number; height: number };
  quests: Quest[];
  standingOnPortal: boolean;
  standingOnSettlement: boolean;
  isMapOpen: boolean;
  gracePeriodEndTime: number;
  searchedSites: string[];

  setGameState: (state: GameState) => void;
  initializeWorld: () => void;
  movePlayerOverworld: (q: number, r: number) => Promise<void>;
  usePortal: () => void;
  enterSettlement: () => void;
  exitSettlement: () => void;
  toggleMap: () => void;
  saveGame: (slotId?: SaveSlotId) => void;
  autoSaveGame: () => void;
  loadGame: (slotId?: SaveSlotId) => void;
  deleteSave: (slotId: SaveSlotId) => void;
  quitToMenu: () => void;
  triggerEventChoice: (choice: EventChoice) => void;
  closeNarrativeEvent: () => void;
  acceptQuest: (quest: Quest) => void;
  progressQuestObjective: (questId: string, objectiveId: string, amount: number) => void;
  investigateAncientSite: (siteId?: string) => void;
}

const generateTownMap = (): HexCell[] => {
    const width = 12;
    const height = 12;
    const cells: HexCell[] = [];
    
    for (let r = 0; r < height; r++) {
        for (let q = 0; q < width; q++) {
            let terrain = TerrainType.GRASS;
            let poiType: HexCell['poiType'] = undefined;
            if (q >= 4 && q <= 7 && r >= 4 && r <= 7) {
                terrain = TerrainType.COBBLESTONE;
                if (q === 5 && r === 5) poiType = 'PLAZA';
            } else if (q === 5 || q === 6 || r === 5 || r === 6) {
                terrain = TerrainType.DIRT_ROAD;
            } else if (Math.random() > 0.4) {
                 terrain = TerrainType.COBBLESTONE; 
                 if (Math.random() > 0.8) poiType = 'SHOP';
                 else if (Math.random() > 0.9) poiType = 'INN';
            }
            if (q === 0 || q === width-1 || r === 0 || r === height-1) {
                poiType = 'EXIT';
                terrain = TerrainType.DIRT_ROAD;
            }
            cells.push({ q, r, terrain, isExplored: true, isVisible: true, weather: WeatherType.NONE, poiType });
        }
    }
    return cells;
};

const updateExploration = (center: PositionComponent, dimension: Dimension, radius: number, currentSet: Set<string>): Set<string> => {
    const newSet = new Set(currentSet);
    for (let q = center.x - radius; q <= center.x + radius; q++) {
        for (let r = center.y - radius; r <= center.y + radius; r++) {
            const dist = (Math.abs(q - center.x) + Math.abs(q + r - center.x - center.y) + Math.abs(r - center.y)) / 2;
            if (dist <= radius) {
                newSet.add(`${q},${r}`);
            }
        }
    }
    return newSet;
};

export const createOverworldSlice: StateCreator<GameStore, [], [], OverworldSlice> = (set, get) => ({
  gameState: GameState.CHARACTER_CREATION,
  dimension: Dimension.NORMAL,
  difficulty: Difficulty.NORMAL,
  exploredTiles: { [Dimension.NORMAL]: new Set(), [Dimension.UPSIDE_DOWN]: new Set() },
  visitedTowns: {},
  clearedEncounters: new Set(),
  townMapData: null,
  activeOverworldEnemies: [],
  playerPos: { x: 0, y: 0 },
  isPlayerMoving: false,
  lastOverworldPos: null,
  mapDimensions: { width: DEFAULT_MAP_WIDTH, height: DEFAULT_MAP_HEIGHT },
  quests: [],
  standingOnPortal: false,
  standingOnSettlement: false,
  isMapOpen: false,
  gracePeriodEndTime: 0,
  searchedSites: [],

  setGameState: (state) => set({ gameState: state }),
  
  initializeWorld: () => {
       // Generator init happens in gameStore/init or implicitly via WorldGenerator class static
       WorldGenerator.init(12345);
  },

  toggleMap: () => { 
      sfx.playUiClick(); 
      set(state => ({ isMapOpen: !state.isMapOpen, isInventoryOpen: false })); 
  },

  movePlayerOverworld: async (q, r) => {
        const { isPlayerMoving, playerPos, dimension, gameState, townMapData, activeOverworldEnemies, party, clearedEncounters, exploredTiles, gracePeriodEndTime } = get();
        
        // Check if movement is redundant BUT allow if not explored
        const currentKey = `${q},${r}`;
        const isAlreadyThere = playerPos.x === q && playerPos.y === r;
        const isTileExplored = exploredTiles[dimension].has(currentKey);
        
        // Grace Period Logic
        const isGracePeriod = Date.now() < gracePeriodEndTime;

        if (isPlayerMoving) return;
        
        if (isAlreadyThere && isTileExplored) return;

        let path: any[] | null = [];
        
        if (gameState === GameState.TOWN_EXPLORATION && townMapData) {
            path = findPath({q: playerPos.x, r: playerPos.y}, {q, r}, townMapData);
        } else {
            path = findPath({q: playerPos.x, r: playerPos.y}, {q, r}, undefined, (q, r) => WorldGenerator.getTile(q, r, dimension));
        }

        if (!path || path.length === 0) {
             if (isAlreadyThere) path = [{ q, r, terrain: WorldGenerator.getTile(q, r, dimension).terrain }];
             else return;
        }
        
        // Disable Chase interruption if in Grace Period
        if (!isGracePeriod) {
            const isChaseMode = activeOverworldEnemies.some(e => {
                if (e.dimension !== dimension) return false;
                const dist = (Math.abs(e.q - playerPos.x) + Math.abs(e.q + e.r - playerPos.x - playerPos.y) + Math.abs(e.r - playerPos.y)) / 2;
                return dist <= e.visionRange;
            });

            if (isChaseMode && path.length > 1) {
                path = [path[0]]; 
            }
        }

        set({ isPlayerMoving: true }); 
        if (!isAlreadyThere) sfx.playUiClick();
        
        for (const stepCell of path) {
            if (get().gameState !== GameState.OVERWORLD && get().gameState !== GameState.TOWN_EXPLORATION) break;
            
            // Check Collision with Enemies (Only if not in grace period)
            if (!isGracePeriod) {
                const enemyOnTile = get().activeOverworldEnemies.find(e => e.q === stepCell.q && e.r === stepCell.r && e.dimension === dimension);
                if (enemyOnTile) {
                    get().startBattle(stepCell.terrain, stepCell.weather, enemyOnTile.id);
                    break;
                }
            }

            if (!isAlreadyThere) sfx.playStep();
            
            const { dimension: currentDim, exploredTiles: currentExplored } = get();
            
            if (get().gameState === GameState.TOWN_EXPLORATION && stepCell.poiType === 'EXIT') {
                 get().exitSettlement();
                 break;
            }

            let newExploredSet = currentExplored[currentDim];
            let newEnemies = [...get().activeOverworldEnemies];

            if (get().gameState === GameState.OVERWORLD) {
                const leader = party[0];
                const visionRadius = calculateVisionRange(leader.stats.attributes.WIS);
                
                // Exploration Logic
                for (let vq = stepCell.q - visionRadius; vq <= stepCell.q + visionRadius; vq++) {
                    for (let vr = stepCell.r - visionRadius; vr <= stepCell.r + visionRadius; vr++) {
                        const dist = (Math.abs(vq - stepCell.q) + Math.abs(vq + vr - stepCell.q - stepCell.r) + Math.abs(vr - stepCell.r)) / 2;
                        if (dist <= visionRadius) {
                            const key = `${vq},${vr}`;
                            if (!newExploredSet.has(key)) {
                                newExploredSet.add(key);
                                const tile = WorldGenerator.getTile(vq, vr, currentDim);
                                const encounterKey = `${currentDim}:${vq},${vr}`;
                                
                                // Spawn Logic - DISABLED DURING GRACE PERIOD for cleaner escape
                                if (!isGracePeriod && tile.hasEncounter && !clearedEncounters.has(encounterKey)) {
                                    if (!newEnemies.some(e => e.q === vq && e.r === vr && e.dimension === currentDim)) {
                                        const distToPlayer = (Math.abs(vq - stepCell.q) + Math.abs(vq + vr - stepCell.q - stepCell.r) + Math.abs(vr - stepCell.r)) / 2;
                                        if (distToPlayer >= 2) {
                                            const nearbyEnemiesCount = newEnemies.filter(e => {
                                                if (e.dimension !== currentDim) return false;
                                                return (Math.abs(e.q - vq) < 8 && Math.abs(e.r - vr) < 8);
                                            }).length;

                                            if (nearbyEnemiesCount < 2) {
                                                const { enemies, encounters } = useContentStore.getState();
                                                const possibleEnemies = encounters[tile.terrain] || Object.keys(enemies);
                                                const enemyDefId = possibleEnemies[Math.floor(Math.random() * possibleEnemies.length)];
                                                const enemyDef = enemies[enemyDefId] || Object.values(enemies)[0];
                                                newEnemies.push({
                                                    id: generateId(),
                                                    defId: enemyDefId,
                                                    name: enemyDef.name,
                                                    sprite: enemyDef.sprite,
                                                    dimension: currentDim,
                                                    q: vq,
                                                    r: vr,
                                                    visionRange: 4
                                                });
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                set({ 
                    playerPos: { x: stepCell.q, y: stepCell.r },
                    exploredTiles: { ...currentExplored, [currentDim]: newExploredSet },
                    activeOverworldEnemies: newEnemies,
                    standingOnPortal: !!stepCell.hasPortal,
                    standingOnSettlement: (stepCell.terrain === TerrainType.VILLAGE || stepCell.terrain === TerrainType.CASTLE)
                });

                // --- GOBLIN LAIR POI EVENT TRIGGER ---
                if (stepCell.poi?.type === 'GOBLIN_LAIR' && currentDim === Dimension.NORMAL) {
                    get().progressQuestObjective('GOBIN_TUTORIAL', 'OBJ_FIND_GOBLIN_LAIR', 1);
                    sfx.playVictory();
                    get().addLog(`🏰 ¡Has descubierto la Guarida de Grommash el Destripador en las colinas (q: 2, r: -3)!`, "narrative");
                    get().addLog(`⚔️ ¡El Gran Jefe Goblin y su guardia de élite cargan furiosos contra tu grupo!`, "combat");
                    set({ isPlayerMoving: false });
                    setTimeout(() => {
                        get().startBattle(
                            TerrainType.CAVE_FLOOR, 
                            WeatherType.NONE, 
                            undefined, 
                            ['goblin_shaman', 'orc_warrior', 'goblin_spearman', 'goblin_spearman'], 
                            true
                        );
                    }, 400);
                    break;
                }

                // --- ADVANCED NARRATIVE EVENT TRIGGER ---
                const { narrativeEvents } = useContentStore.getState();
                const triggers = get().triggeredEvents || [];
                
                const matchedEvent = Object.values(narrativeEvents).find(ev => {
                    if (triggers.includes(ev.id)) return false;
                    
                    if (ev.triggerType === 'COORDINATES') {
                        return ev.coordinateQ === stepCell.q && ev.coordinateR === stepCell.r;
                    } else if (ev.triggerType === 'TERRAIN') {
                        return ev.terrainType === stepCell.terrain;
                    }
                    return false;
                });

                if (matchedEvent) {
                    set({ 
                        activeNarrativeEvent: matchedEvent, 
                        activeNarrativeOutcome: null,
                        isPlayerMoving: false 
                    });
                    sfx.playVictory();
                    get().addLog(`[Evento] Encontrado: ${matchedEvent.title}`, "narrative");
                    break;
                }

                // --- ENEMY AI ---
                let updatedEnemies = [...get().activeOverworldEnemies];
                let combatTriggered = false;
                let triggeringEnemyId: string | undefined;

                updatedEnemies = updatedEnemies.map(e => {
                    if (e.dimension !== currentDim) return e;
                    
                    // IF GRACE PERIOD IS ACTIVE, ENEMIES DO NOT MOVE/CHASE
                    if (isGracePeriod) return e;

                    const dist = (Math.abs(e.q - stepCell.q) + Math.abs(e.q + e.r - stepCell.q - stepCell.r) + Math.abs(e.r - stepCell.r)) / 2;
                    
                    if (dist <= e.visionRange && dist > 0) {
                        const neighbors = [
                            { dq: 1, dr: 0 }, { dq: 1, dr: -1 }, { dq: 0, dr: -1 },
                            { dq: -1, dr: 0 }, { dq: -1, dr: 1 }, { dq: 0, dr: 1 }
                        ];

                        let bestMove = { q: e.q, r: e.r };
                        let minDistanceToPlayer = dist;
                        let willAttack = false;

                        for (const n of neighbors) {
                            const targetQ = e.q + n.dq;
                            const targetR = e.r + n.dr;
                            if (targetQ === stepCell.q && targetR === stepCell.r) { willAttack = true; break; }

                            const targetTile = WorldGenerator.getTile(targetQ, targetR, currentDim);
                            const movementCost = TERRAIN_MOVEMENT_COST[targetTile.terrain] || 1;
                            if (movementCost >= 99) continue;

                            const isOccupied = get().activeOverworldEnemies.some(other => other.id !== e.id && other.q === targetQ && other.r === targetR && other.dimension === currentDim);
                            if (isOccupied) continue;

                            const distFromNeighbor = (Math.abs(targetQ - stepCell.q) + Math.abs(targetQ + targetR - stepCell.q - stepCell.r) + Math.abs(targetR - stepCell.r)) / 2;
                            if (distFromNeighbor < minDistanceToPlayer) {
                                minDistanceToPlayer = distFromNeighbor;
                                bestMove = { q: targetQ, r: targetR };
                            }
                        }

                        if (willAttack) {
                            combatTriggered = true;
                            triggeringEnemyId = e.id;
                            return e;
                        }
                        
                        return { ...e, q: bestMove.q, r: bestMove.r };
                    }
                    return e;
                });

                set({ activeOverworldEnemies: updatedEnemies });
                if (combatTriggered) {
                    get().startBattle(stepCell.terrain, stepCell.weather, triggeringEnemyId);
                    break;
                }

            } else {
                set({ 
                    playerPos: { x: stepCell.q, y: stepCell.r },
                    standingOnPortal: false,
                    standingOnSettlement: false
                });
            }

            if (stepCell.hasPortal && get().gameState === GameState.OVERWORLD) { sfx.playMagic(); break; }
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        set({ isPlayerMoving: false });
  },

  enterSettlement: () => {
        const { playerPos } = get();
        sfx.playUiClick();
        
        get().transitionToMap({
            targetState: GameState.TOWN_EXPLORATION,
            targetLocationName: 'Asentamiento Fortificado',
            targetBiome: TerrainType.VILLAGE,
            durationMs: 500,
            action: () => {
                const townMap = generateTownMap();
                set({ 
                    lastOverworldPos: playerPos,
                    townMapData: townMap,
                    playerPos: { x: 0, y: 6 }, 
                    standingOnSettlement: false,
                    mapDimensions: { width: 12, height: 12 }
                });
                get().addLog("Entered settlement.", "narrative");
                get().autoSaveGame();
            }
        });
  },

  exitSettlement: () => {
        const { lastOverworldPos } = get();
        if (!lastOverworldPos) return;
        sfx.playUiClick();

        get().transitionToMap({
            targetState: GameState.OVERWORLD,
            targetLocationName: 'Tierras Salvajes de Arcadia',
            targetBiome: TerrainType.PLAINS,
            durationMs: 500,
            action: () => {
                set({ 
                    townMapData: null,
                    playerPos: lastOverworldPos,
                    lastOverworldPos: null,
                    mapDimensions: { width: DEFAULT_MAP_WIDTH, height: DEFAULT_MAP_HEIGHT }
                });
                get().addLog("Returned to the wild.", "narrative");
            }
        });
  },

  usePortal: () => {
        const { dimension, playerPos, exploredTiles, party } = get();
        const targetDimension = dimension === Dimension.NORMAL ? Dimension.UPSIDE_DOWN : Dimension.NORMAL;
        sfx.playMagic(); get().addLog("Dimension Hop!", "narrative");
        
        const vision = calculateVisionRange(party[0].stats.attributes.WIS);
        const newExploredSet = updateExploration(playerPos, targetDimension, vision, exploredTiles[targetDimension]);
        
        set({ 
            dimension: targetDimension, 
            exploredTiles: { ...exploredTiles, [targetDimension]: newExploredSet }
        });

        // Trigger auto-save on dimension hop
        get().autoSaveGame();
  },

  saveGame: (slotId: SaveSlotId = 'slot_1') => { 
        try { 
            const state = get();
            const success = writeSaveToSlot(slotId, state);
            if (success) {
              const label = slotId === 'auto_save' ? 'Auto-Save' : slotId.replace('_', ' ').toUpperCase();
              get().addLog(`Game Saved (${label})`, "info"); 
            } else {
              get().addLog("Failed to save game.", "combat");
            }
        } catch (e) {
            console.error("Save Failed:", e);
            get().addLog("Failed to save game.", "combat");
        } 
  },

  autoSaveGame: () => {
        try {
          const state = get();
          if (state.gameState === GameState.CHARACTER_CREATION) return;
          writeSaveToSlot('auto_save', state);
        } catch (e) {
          console.error("AutoSave Failed:", e);
        }
  },

  loadGame: (slotId: SaveSlotId = 'slot_1') => { 
        try { 
            const saveFile = readSaveFromSlot(slotId);
            if (!saveFile) {
                get().addLog("No save game found in this slot.", "info");
                return;
            }

            const sanitizedData = deserializeGameState(saveFile);

            set(sanitizedData as GameStateData);
            sfx.playVictory();
            get().addLog(`Game Loaded (${slotId.replace('_', ' ').toUpperCase()})`, "info");

        } catch(e) {
            console.error("Load Failed:", e);
            get().addLog("Save file corrupted.", "combat");
        } 
  },

  deleteSave: (slotId: SaveSlotId) => {
        try {
          deleteSaveSlot(slotId);
          get().addLog(`Deleted ${slotId.replace('_', ' ').toUpperCase()}`, "info");
        } catch (e) {
          console.error("Delete Failed:", e);
        }
  },

  quitToMenu: () => { sfx.playUiClick(); set({ gameState: GameState.CHARACTER_CREATION, logs: [], party: [] }); },

  triggerEventChoice: (choice) => {
    const outcome = choice.outcome;
    sfx.playUiClick();
    
    // Apply Gold changes (persisted in battleRewards)
    if (outcome.goldChange !== 0) {
        const currentRewards = get().battleRewards || { xp: 0, gold: 0, items: [] };
        const newGold = Math.max(0, currentRewards.gold + outcome.goldChange);
        set({ battleRewards: { ...currentRewards, gold: newGold } });
        get().addLog(`Ganas/Pierdes oro: ${outcome.goldChange > 0 ? '+' : ''}${outcome.goldChange}G (Total: ${newGold}G)`, "loot");
    }

    // Apply Party HP changes
    if (outcome.hpChange !== 0) {
        const newParty = get().party.map(member => {
            const newHp = Math.max(1, Math.min(member.stats.maxHp, member.stats.hp + outcome.hpChange));
            return {
                ...member,
                stats: { ...member.stats, hp: newHp }
            };
        });
        set({ party: newParty });
        get().addLog(`Salud del grupo afectada: ${outcome.hpChange > 0 ? '+' : ''}${outcome.hpChange} HP`, "info");
    }

    // Apply XP reward
    if (outcome.xpReward > 0) {
        const currentRewards = get().battleRewards || { xp: 0, gold: 0, items: [] };
        set({ battleRewards: { ...currentRewards, xp: currentRewards.xp + outcome.xpReward } });
        get().addLog(`Ganas experiencia: +${outcome.xpReward} XP`, "roll");
    }

    // Give Item if any
    if (outcome.gainItem) {
        const { items } = useContentStore.getState();
        const dbItem = items[outcome.gainItem.toUpperCase()] || Object.values(items).find(i => i.id === outcome.gainItem);
        if (dbItem) {
            const newInventory = [...get().inventory];
            const existingSlot = newInventory.find(s => s.item.id === dbItem.id);
            if (existingSlot) {
                existingSlot.quantity++;
            } else {
                newInventory.push({ item: dbItem, quantity: 1 });
            }
            set({ inventory: newInventory });
            get().addLog(`Obtienes objeto: ${dbItem.name}`, "loot");
        }
    }

    set({ activeNarrativeOutcome: outcome.text });
  },

  closeNarrativeEvent: () => {
    sfx.playUiClick();
    const event = get().activeNarrativeEvent;
    const outcome = event?.choices.find(c => c.outcome.text === get().activeNarrativeOutcome)?.outcome;
    
    if (event) {
        const triggers = get().triggeredEvents || [];
        set({ triggeredEvents: [...triggers, event.id] });
    }

    set({ activeNarrativeEvent: null, activeNarrativeOutcome: null });

    if (outcome && outcome.startBattle) {
        const battleEnemies = outcome.battleEnemies || [];
        get().startBattle(get().battleTerrain, get().battleWeather, undefined, battleEnemies, outcome.isBoss);
    }
  },

  acceptQuest: (quest: Quest) => {
    const existing = get().quests.find(q => q.id === quest.id);
    if (!existing) {
      set(state => ({ quests: [...state.quests, quest] }));
      get().addLog(`Nueva misión aceptada: ${quest.title}`, "info");
    }
  },

  progressQuestObjective: (questId: string, objectiveId: string, amount: number) => {
    set(state => {
      const newQuests = state.quests.map(q => {
        if (q.id === questId && !q.completed && q.objectives) {
          const newObj = q.objectives.map(obj => {
            if (obj.id === objectiveId && !obj.completed) {
              const newProgress = Math.min(obj.requiredProgress, obj.currentProgress + amount);
              const completed = newProgress >= obj.requiredProgress;
              if (completed) get().addLog(`🎯 Objetivo completado: ${obj.description}`, "info");
              return { ...obj, currentProgress: newProgress, completed };
            }
            return obj;
          });
          
          const allCompleted = newObj.every(o => o.completed);
          if (allCompleted) {
            sfx.playVictory();
            get().addLog(`🏆 ¡CAMPAÑA COMPLETADA: ${q.title}!`, "loot");
            
            // Deliver Quest Rewards if defined
            if (q.reward) {
              const { xp = 0, gold = 0, items: rewardItemIds = [] } = q.reward;
              const dbItems = useContentStore.getState().items;

              // Distribute massive reward XP to party to reach level 7
              if (xp > 0) {
                get().addLog(`✨ Recompensa de Campaña: ¡+${xp.toLocaleString()} EXP otorgada a todo el grupo!`, "levelup");
                const hasLevelUps = get().initiatePostBattleLevelUp(xp);
                if (!hasLevelUps) {
                  // Direct fallback XP addition
                  set(st => ({
                    party: st.party.map(h => ({
                      ...h,
                      stats: { ...h.stats, xp: (h.stats.xp || 0) + xp }
                    }))
                  }));
                }
              }

              // Deliver Equipment Rewards to inventory
              if (rewardItemIds && rewardItemIds.length > 0) {
                const newInv = [...state.inventory];
                rewardItemIds.forEach(itemId => {
                  const itemData = dbItems[itemId] || dbItems[itemId.toUpperCase()] || Object.values(dbItems).find(i => i.id === itemId);
                  if (itemData) {
                    const existing = newInv.find(slot => slot.item.id === itemData.id);
                    if (existing) {
                      existing.quantity += 1;
                    } else {
                      newInv.push({ item: itemData, quantity: 1 });
                    }
                    get().addLog(`🎁 Equipamiento desbloqueado: [${itemData.rarity}] ${itemData.name}`, "loot");
                  }
                });
                set({ inventory: newInv });
              }

              if (gold > 0) {
                get().addLog(`🪙 Botín de la Campaña: +${gold} Monedas de Oro.`, "loot");
              }
            }
          }
          return { ...q, objectives: newObj, completed: allCompleted };
        }
        return q;
      });
      return { quests: newQuests };
    });
  },

  investigateAncientSite: (siteId?: string) => {
    const { playerPos, party, searchedSites, progressQuestObjective, addLog, triggerDiceRoll, quests } = get();
    const site = siteId ? ANCIENT_SITES.find(s => s.id === siteId) : getAncientSiteAt(playerPos.x, playerPos.y);
    
    if (!site) {
      addLog("No hay ruinas o cuevas ancestrales en esta ubicación para investigar.", "info");
      return;
    }

    const siteKey = `${site.id}`;
    if (searchedSites.includes(siteKey)) {
      addLog(`Ya has investigado a fondo ${site.name}. Todos sus secretos han sido recopilados.`, "info");
      sfx.playUiClick();
      return;
    }

    // Party Leader or Best Investigator
    const leader = party[0];
    const leaderInt = leader?.stats?.attributes?.INT || 10;
    const intMod = Math.floor((leaderInt - 10) / 2);
    const d20Roll = Math.floor(Math.random() * 20) + 1;
    const totalCheck = d20Roll + intMod;
    
    // D&D Dice Roll UI
    if (triggerDiceRoll) {
      triggerDiceRoll({
        rollType: 'INVESTIGATION',
        diceResult: d20Roll,
        modifier: intMod,
        total: totalCheck,
        dc: site.d20Difficulty,
        characterName: leader?.name || 'Líder',
        actionLabel: `Investigando ${site.name}`
      });
    }

    sfx.playLevelUp();
    
    // Add to searchedSites
    set(state => ({
      searchedSites: [...state.searchedSites, siteKey]
    }));

    // Grant XP and Gold
    const goldBonus = site.rewardGold || 120;
    const xpBonus = site.rewardXp || 180;
    
    // Distribute XP to party
    set(state => ({
      party: state.party.map(hero => ({
        ...hero,
        stats: hero.stats ? {
          ...hero.stats,
          xp: (hero.stats.xp || 0) + xpBonus
        } : hero.stats
      }))
    }));

    addLog(`🔍 [${site.name}] ${site.clueLore}`, 'loot');
    addLog(`✨ Recompensa de exploración: +${xpBonus} XP y hallazgos antiguos (+${goldBonus}G en valor).`, 'info');

    // Progress Dragon Clues Objective
    progressQuestObjective('DRAGON_HUNT', 'OBJ_CLUES', 1);

    // Check if 3 clues reached
    const huntQuest = quests.find(q => q.id === 'DRAGON_HUNT');
    const clueObj = huntQuest?.objectives?.find(o => o.id === 'OBJ_CLUES');
    const currentClues = (clueObj?.currentProgress || 0) + 1;

    if (currentClues >= 3) {
      addLog('🔥 ¡Las 3 Pistas del Dragón han sido reunidas! Las 5 entradas secretas al Dungeon Subterráneo han sido desveladas en el mapa.', 'loot');
      sfx.playVictory();
    } else {
      addLog(`📜 Pistas del Dragón recolectadas: ${Math.min(3, currentClues)}/3. Busca en otras Ruinas o Cuevas del mapa.`, 'info');
    }
  }
});
