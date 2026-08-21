import React, { useRef, useEffect, useState } from 'react';
import { GameState, Dimension, BattleAction, UITheme, CharacterClass, EquipmentSlot, SpellType, isFriendly, WeatherType, TerrainType } from '../types';
import { useGameStore } from '../store/gameStore';
import { WorldGenerator } from '../services/WorldGenerator';
import { sfx } from '../services/SoundSystem';
import { InventoryScreen } from './InventoryScreen';
import { WorldMapScreen } from './WorldMapScreen';
import { NarrativeEventModal } from './NarrativeEventModal';
import { InitiativePanel } from './battle/InitiativePanel';
import { SPELLS as SPELL_DB, CLASS_SPELLS as CLASS_SPELLS_DB } from '../constants';
import { useContentStore } from '../store/contentStore';
import { getThemeConfig, THEMES } from '../services/themeSystem';
import { RestModal } from './RestModal';
import { DiceRoll3DOverlay } from './battle/DiceRoll3DOverlay';
import { TurnTimerUI } from './battle/TurnTimerUI';
import { CombatDiceLogDrawer } from './battle/CombatDiceLogDrawer';
import { useTurnTransition } from '../hooks/useTurnTransition';
import { TurnTransitionOverlay } from './battle/TurnTransitionOverlay';
import { NpcGiftModal } from './NpcGiftModal';
import { AdventurersGuildModal } from './AdventurersGuildModal';
import { GameGuideModal } from './GameGuideModal';
import { getAncientSiteAt, ANCIENT_SITES } from '../data/ancientSites';
import { BG3RadialMenu } from './BG3RadialMenu';
import { UnitPortrait } from './ui/UnitPortrait';
import { OverworldMinimap } from './overworld/OverworldMinimap';

export const UIOverlay: React.FC = () => {
  const [isZenMode, setIsZenMode] = useState(() => localStorage.getItem('zen_mode') === 'true');
  const [showSystemMenu, setShowSystemMenu] = useState(false);
  const [showSkillDrawer, setShowSkillDrawer] = useState(false);
  const [showCombatDiceLog, setShowCombatDiceLog] = useState(false);
  const [showRestModal, setShowRestModal] = useState(false);
  const [showNpcModal, setShowNpcModal] = useState(false);
  const [showGuildModal, setShowGuildModal] = useState(false);
  const [showGameGuideModal, setShowGameGuideModal] = useState(false);
  const [showQuestModal, setShowQuestModal] = useState(false);
  const [targetIdx, setTargetIdx] = useState(0);

  const toggleZenMode = () => {
    const nextVal = !isZenMode;
    setIsZenMode(nextVal);
    localStorage.setItem('zen_mode', String(nextVal));
    sfx.playUiHover();
  };
  
  const { 
      logs, gameState, party, turnOrder, currentTurnIndex, initiativeRolls, battleRound,
      isInventoryOpen, isMapOpen, toggleInventory, toggleMap, playerPos, dimension, movePlayerOverworld,
      standingOnPortal, standingOnSettlement, usePortal, enterSettlement, saveGame, loadGame, quitToMenu, 
      battleEntities, activeOverworldEnemies, selectAction, selectSpell, selectedAction, selectedSpell, hasMoved, hasActed,
      lootDrops, collectLoot, uiTheme, setUITheme, toggleSettings, activeDiceRoll, clearDiceRoll, startHuntMode,
      handleTileInteraction, cameraAzimuthOffset, cameraZoomFactor, setCameraGestureState, gracePeriodEndTime,
      quests, startBattle, startDragonDungeonBattle, searchedSites, investigateAncientSite
  } = useGameStore();

  const [now, setNow] = useState(Date.now());
  const [notificationExpanded, setNotificationExpanded] = useState(false);
  const [notificationPinned, setNotificationPinned] = useState(false);
  const [lastNotificationId, setLastNotificationId] = useState<string | number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const recentLog = logs.length > 0 ? logs[logs.length - 1] : null;

  useEffect(() => {
    if (recentLog) {
      const logId = recentLog.id || recentLog.timestamp || recentLog.message;
      if (logId !== lastNotificationId) {
        setLastNotificationId(logId);
        setNotificationExpanded(true);
        setNotificationPinned(false);

        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }

        timerRef.current = setTimeout(() => {
          setNotificationExpanded(false);
        }, 2000);
      }
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [recentLog, lastNotificationId]);

  const handleNotificationClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setNotificationPinned(true);
    setNotificationExpanded(true);
    sfx.playUiHover();
  };

  const handleCollapseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setNotificationExpanded(false);
    setNotificationPinned(false);
    sfx.playUiHover();
  };

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (notificationExpanded) {
      handleCollapseClick(e);
    } else {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setNotificationPinned(true);
      setNotificationExpanded(true);
      sfx.playUiHover();
    }
  };

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(interval);
  }, []);

  const isGracePeriod = now < gracePeriodEndTime;
  const isTown = gameState === GameState.TOWN_EXPLORATION;

  const currentPlayerCell = React.useMemo(() => {
      if (isTown) return { weather: WeatherType.NONE, poiType: undefined } as any;
      return WorldGenerator.getTile(playerPos.x, playerPos.y, dimension);
  }, [playerPos, dimension, isTown]);

  const standingOnDragonLair = currentPlayerCell?.poiType === 'DRAGON_LAIR';
  const ancientSiteData = React.useMemo(() => {
      return getAncientSiteAt(playerPos.x, playerPos.y);
  }, [playerPos.x, playerPos.y]);
  const standingOnAncientSite = !!ancientSiteData || currentPlayerCell?.poiType === 'ANCIENT_RUINS' || currentPlayerCell?.poiType === 'MYSTIC_CAVE' || currentPlayerCell?.terrain === TerrainType.RUINS || currentPlayerCell?.terrain === TerrainType.CAVE_FLOOR;
  const isSiteSearched = ancientSiteData ? (searchedSites || []).includes(ancientSiteData.id) : false;

  const dragonHuntQuest = quests.find(q => q.id === 'DRAGON_HUNT');
  const dragonCluesObj = dragonHuntQuest?.objectives?.find(o => o.id === 'OBJ_CLUES');
  const hasDragonClues = dragonCluesObj?.completed;
  const currentDragonClues = dragonCluesObj?.currentProgress || 0;
  
  const handleEnterDragonLair = () => {
    startDragonDungeonBattle();
  };

  const currentWeather = currentPlayerCell.weather;
  const themeConfig = getThemeConfig(uiTheme);

  const activeEntityId = turnOrder[currentTurnIndex];
  const activeEntity = battleEntities.find(e => e.id === activeEntityId);
  const isPlayerTurn = activeEntity?.type === 'PLAYER';

  const activeActionMode = selectedAction || (!hasMoved ? BattleAction.MOVE : !hasActed ? BattleAction.ATTACK : null);

  // In-range targets for mobile one-thumb targeting
  const inRangeEnemies = React.useMemo(() => {
      if (gameState !== GameState.BATTLE_TACTICAL || !isPlayerTurn || !activeEntity || hasActed) return [];
      if (activeActionMode !== BattleAction.ATTACK && activeActionMode !== BattleAction.MAGIC) return [];

      let range = 1;
      if (activeActionMode === BattleAction.ATTACK) {
          const mainHand = activeEntity.equipment?.[EquipmentSlot.MAIN_HAND];
          if (mainHand && (mainHand.name?.toLowerCase().includes('bow') || mainHand.name?.toLowerCase().includes('cross') || activeEntity.stats?.class === CharacterClass.RANGER)) {
              range = 6;
          } else {
              range = 1;
          }
      } else if (activeActionMode === BattleAction.MAGIC) {
          range = selectedSpell?.range || 6;
      }

      const isSpellHealOrBuff = selectedSpell && (selectedSpell.type === SpellType.HEAL || selectedSpell.type === SpellType.BUFF);

      return battleEntities.filter(e => {
          if (e.stats.hp <= 0) return false;
          const isAlly = isFriendly(activeEntity, e);
          if (isSpellHealOrBuff) {
              if (!isAlly) return false;
          } else {
              if (isAlly) return false;
          }
          const dist = Math.max(Math.abs(activeEntity.position.x - e.position.x), Math.abs(activeEntity.position.y - e.position.y));
          return dist <= range;
      });
  }, [gameState, isPlayerTurn, activeEntity, hasActed, activeActionMode, selectedSpell, battleEntities]);

  const currentTargetEnemy = inRangeEnemies.length > 0 ? inRangeEnemies[targetIdx % inRangeEnemies.length] : null;

  const { showEnemyBanner } = useTurnTransition(currentTurnIndex, activeEntity, () => {
      setShowSkillDrawer(false);
  });

  const currentLootDrop = isPlayerTurn && activeEntity 
      ? lootDrops.find(d => d.position.x === activeEntity.position.x && d.position.y === activeEntity.position.y) 
      : null;

  const { spells: contentSpells, classSpells: contentClassSpells } = useContentStore();

  const availableSpells = (isPlayerTurn && activeEntity?.stats.class) 
    ? (contentClassSpells[activeEntity.stats.class] || []).map(id => contentSpells[id.toUpperCase()] || contentSpells[id]).filter(Boolean) 
    : [];

  const handleAction = (action: BattleAction) => {
      if (action === BattleAction.MAGIC) {
          setShowSkillDrawer(true);
      } else {
          selectAction(action);
      }
  };

  const handleSpellClick = (spellId: string) => {
      selectSpell(spellId);
      selectAction(BattleAction.MAGIC); 
      setShowSkillDrawer(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable) {
        return;
      }

      const key = e.key && e.key.toLowerCase ? e.key.toLowerCase() : String(e.key).toLowerCase();

      if (e.key === 'Escape') {
        e.preventDefault();
        if (showSkillDrawer) {
          setShowSkillDrawer(false);
          sfx.playUiClick();
        } else if (selectedAction) {
          selectAction(null);
          sfx.playUiClick();
        } else if (isInventoryOpen) {
          toggleInventory();
        } else {
          toggleSettings();
        }
        return;
      }

      if (key === 'j') {
        e.preventDefault();
        setShowQuestModal(prev => !prev);
        sfx.playUiClick();
        return;
      }

      if (key === 'g') {
        e.preventDefault();
        setShowGameGuideModal(prev => !prev);
        sfx.playUiClick();
        return;
      }

      if (gameState === GameState.BATTLE_TACTICAL) {
        const activeEntityId = turnOrder[currentTurnIndex];
        const activeEntity = battleEntities.find(ent => ent.id === activeEntityId);
        const isPlayerTurn = activeEntity?.type === 'PLAYER';

        if (isPlayerTurn && activeEntity) {
          if (key === '1') {
            e.preventDefault();
            if (!hasMoved) {
              handleAction(BattleAction.MOVE);
              sfx.playUiClick();
            }
          } else if (key === '2') {
            e.preventDefault();
            if (!hasActed) {
              handleAction(BattleAction.ATTACK);
              sfx.playUiClick();
            }
          } else if (key === '3') {
            e.preventDefault();
            if (!hasActed) {
              handleAction(BattleAction.MAGIC);
              sfx.playUiClick();
            }
          } else if (key === '4') {
            e.preventDefault();
            toggleInventory();
          } else if (key === '5') {
            e.preventDefault();
            if (!hasActed) {
              handleAction(BattleAction.WAIT);
              sfx.playUiClick();
            }
          }

          if (e.key === ' ' || key === 'spacebar') {
            e.preventDefault();
            const { selectedTile: currentSelectedTile } = useGameStore.getState();
            if (currentSelectedTile) {
              handleTileInteraction(currentSelectedTile.x, currentSelectedTile.z);
            } else if (!hasActed) {
              handleAction(BattleAction.WAIT);
              sfx.playUiClick();
            }
            return;
          }

          const isUp = key === 'w' || e.key === 'ArrowUp';
          const isDown = key === 's' || e.key === 'ArrowDown';
          const isLeft = key === 'a' || e.key === 'ArrowLeft';
          const isRight = key === 'd' || e.key === 'ArrowRight';

          if (isUp || isDown || isLeft || isRight) {
            e.preventDefault();
            const { selectedTile: currentSelectedTile } = useGameStore.getState();
            const basePos = currentSelectedTile || { x: activeEntity.position.x, z: activeEntity.position.y };
            let targetX = basePos.x;
            let targetZ = basePos.z;

            if (isUp) targetZ -= 1;
            if (isDown) targetZ += 1;
            if (isLeft) targetX -= 1;
            if (isRight) targetX += 1;

            const mapSize = 14;
            targetX = Math.max(0, Math.min(mapSize - 1, targetX));
            targetZ = Math.max(0, Math.min(mapSize - 1, targetZ));

            useGameStore.setState({ selectedTile: { x: targetX, z: targetZ } });
            sfx.playUiHover();
            return;
          }
        }

        if (key === 'q') {
          e.preventDefault();
          const { cameraAzimuthOffset: currentOffset, setCameraGestureState: updateCamera } = useGameStore.getState();
          updateCamera({ cameraAzimuthOffset: currentOffset - Math.PI / 12 });
          sfx.playUiHover();
        } else if (key === 'e') {
          e.preventDefault();
          const { cameraAzimuthOffset: currentOffset, setCameraGestureState: updateCamera } = useGameStore.getState();
          updateCamera({ cameraAzimuthOffset: currentOffset + Math.PI / 12 });
          sfx.playUiHover();
        }

        if (key === 'z') {
          e.preventDefault();
          const { cameraZoomFactor: currentZoom, setCameraGestureState: updateCamera } = useGameStore.getState();
          const nextZoom = Math.max(0.45, currentZoom - 0.1);
          updateCamera({ cameraZoomFactor: nextZoom });
          sfx.playUiHover();
        } else if (key === 'x') {
          e.preventDefault();
          const { cameraZoomFactor: currentZoom, setCameraGestureState: updateCamera } = useGameStore.getState();
          const nextZoom = Math.min(2.2, currentZoom + 0.1);
          updateCamera({ cameraZoomFactor: nextZoom });
          sfx.playUiHover();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameState, turnOrder, currentTurnIndex, battleEntities, hasMoved, hasActed, selectedAction, showSkillDrawer, isInventoryOpen]);

  const isCautionMode = gameState === GameState.OVERWORLD && activeOverworldEnemies.some(e => {
      if (e.dimension !== dimension) return false;
      const dist = (Math.abs(e.q - playerPos.x) + Math.abs(e.q + e.r - playerPos.x - playerPos.y) + Math.abs(e.r - playerPos.y)) / 2;
      return dist <= e.visionRange;
  });

  if (gameState === GameState.CHARACTER_CREATION) return null;

  return (
    <>
        {dimension === Dimension.UPSIDE_DOWN && <div className="pointer-events-none fixed inset-0 z-0 shadow-[inset_0_0_150px_rgba(88,28,135,0.4)] animate-pulse" style={{ animationDuration: '4s' }} />}
        
        {isCautionMode && (
            <div className="pointer-events-none fixed top-16 left-0 right-0 h-8 z-10 flex items-center justify-center">
                <span className="bg-red-950/70 text-red-200 px-3 py-0.5 rounded-full font-bold tracking-[0.2em] text-[9px] border border-red-500/40 backdrop-blur-xl animate-pulse shadow-lg">
                    ⚠ AMENAZA CERCANA
                </span>
            </div>
        )}

        {isInventoryOpen && <InventoryScreen />}
        {isMapOpen && <WorldMapScreen />}
        {!isZenMode && !isMapOpen && <OverworldMinimap />}
        <NarrativeEventModal />
        {showGameGuideModal && <GameGuideModal onClose={() => setShowGameGuideModal(false)} />}

        {/* Floating Side-Tab Notification Hub (Left Edge) */}
        {!isZenMode && (
            <div className="fixed left-0 top-[35%] z-50 flex items-start pointer-events-auto select-none">
                <div 
                    onClick={handleToggleClick}
                    className={`flex items-center bg-slate-950/85 backdrop-blur-2xl border-y border-r border-amber-500/30 shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden rounded-r-2xl
                        ${notificationExpanded 
                            ? 'translate-x-0 w-72 sm:w-96 px-4 py-3' 
                            : 'translate-x-0 w-11 px-3 py-4 hover:bg-slate-900/95 border-amber-500/20'
                        }
                    `}
                    style={{ minHeight: '48px' }}
                    title={notificationExpanded ? "Toca para fijar o colapsar" : "Expandir registro de eventos"}
                >
                    {!notificationExpanded ? (
                        /* Collapsed Tab State */
                        <div className="flex flex-col items-center justify-center gap-1.5 text-amber-400 w-full">
                            <span className="text-sm animate-bounce">📜</span>
                            <span className="text-[7px] tracking-widest font-black uppercase origin-center rotate-90 my-1">LOG</span>
                            {recentLog && (
                                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full shadow-[0_0_6px_rgba(239,68,68,0.8)]" />
                            )}
                        </div>
                    ) : (
                        /* Expanded Detailed State */
                        <div 
                            onClick={handleNotificationClick}
                            className="flex items-start gap-2.5 w-full text-left animate-in fade-in slide-in-from-left-2 duration-200"
                        >
                            {/* Event Category Icon */}
                            <div className="shrink-0 text-base mt-0.5">
                                {recentLog?.type === 'combat' ? '⚔️' : recentLog?.type === 'loot' ? '🎁' : recentLog?.type === 'levelup' ? '⭐' : '📜'}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                    <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md leading-none border
                                        ${recentLog?.type === 'combat' ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                                        : recentLog?.type === 'loot' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                                        : recentLog?.type === 'levelup' ? 'bg-amber-400 text-slate-950 border-amber-300 font-extrabold' 
                                        : 'bg-white/5 border-white/10 text-slate-300'}
                                    `}>
                                        {recentLog?.type || 'EVENTO'}
                                    </span>
                                    
                                    <div className="flex items-center gap-1">
                                        {notificationPinned ? (
                                            <span className="text-[8px] text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-1 py-0.5 rounded flex items-center gap-0.5 animate-pulse">
                                                📌 FIJADO
                                            </span>
                                        ) : (
                                            <span className="text-[7px] text-slate-500 font-bold italic animate-pulse">
                                                Se cierra en 2s...
                                            </span>
                                        )}
                                    </div>
                                </div>
                                
                                {/* The Message */}
                                <p className="text-[11px] font-bold leading-relaxed font-mono text-slate-100 pr-1 select-text break-words">
                                    {recentLog?.message || "No hay eventos recientes."}
                                </p>
                            </div>

                            {/* Retract/Close Button */}
                            <button 
                                onClick={handleCollapseClick}
                                className="shrink-0 w-6 h-6 rounded-lg bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white flex items-center justify-center border border-white/5 transition-all text-[10px] active:scale-90"
                                title="Colapsar"
                            >
                                ✕
                            </button>
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* Global Floating HUD: 100% Transparent Pass-through container */}
        <div className="pointer-events-none fixed inset-0 z-20 flex flex-col justify-between p-2 sm:p-4 overflow-hidden">
            {/* Top Bar: Floating Translucent Glass Capsule */}
            <div className="w-full max-w-5xl mx-auto pointer-events-auto">
                <div className="flex justify-between items-center gap-2 bg-slate-950/50 backdrop-blur-2xl border border-white/15 p-1.5 sm:p-2.5 px-3 sm:px-4 rounded-2xl shadow-2xl overflow-hidden">
                    
                    {gameState === GameState.BATTLE_TACTICAL ? (
                        <div className="flex-1 flex justify-center min-w-0">
                            <InitiativePanel 
                                turnOrder={turnOrder}
                                currentTurnIndex={currentTurnIndex}
                                battleEntities={battleEntities}
                                initiativeRolls={initiativeRolls}
                                roundNumber={battleRound || 1}
                            />
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col justify-center min-w-0 pr-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[7px] sm:text-[8px] tracking-wider uppercase font-black text-amber-400 bg-amber-500/15 px-1.5 py-0.5 rounded leading-none border border-amber-500/30 shadow-sm">
                                    {dimension === Dimension.UPSIDE_DOWN ? 'SOMBRA' : 'LUZ'}
                                </span>
                                <h2 className="text-[11px] sm:text-xs font-serif font-black text-slate-100 truncate leading-none drop-shadow">
                                    {isTown ? 'Asentamiento Seguro' : dimension === Dimension.UPSIDE_DOWN ? 'Reino de las Sombras' : 'Arcadia'}
                                </h2>
                            </div>
                            {!isZenMode && (
                                <div className="flex items-center gap-1.5 mt-0.5 text-[8px] sm:text-[9px] text-slate-400 font-bold">
                                    <span className="truncate flex items-center gap-0.5">
                                        🌤️ {isTown ? 'Protegido' : currentWeather === WeatherType.ASH ? 'Aire Corrupto' : currentWeather === WeatherType.RAIN ? 'Lluvia' : currentWeather === WeatherType.FOG ? 'Niebla' : currentWeather === WeatherType.SNOW ? 'Nevada' : 'Despejado'}
                                    </span>
                                    {isGracePeriod && (
                                        <span className="text-sky-400 font-extrabold animate-pulse flex items-center gap-0.5">
                                            🛡️ GRACIA
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex gap-1.5 items-center shrink-0">
                        <CircleBtn onClick={toggleInventory} icon="🎒" themeClass={themeConfig.classes.circleButton} title="Inventario (I)" />
                        
                        <div className="relative">
                            <CircleBtn onClick={() => setShowSystemMenu(!showSystemMenu)} icon="⚙️" themeClass={themeConfig.classes.circleButton} title="Opciones y Acciones de Campaña" />
                            {showSystemMenu && (
                                <div className="absolute top-full right-0 mt-2.5 w-60 sm:w-64 rounded-2xl shadow-2xl overflow-hidden flex flex-col z-50 border bg-slate-950/90 backdrop-blur-3xl border-amber-500/25 animate-in fade-in slide-in-from-top-2 duration-150">
                                    {/* Section 1: Campamiento y Cacería (Only available out of tactical combat) */}
                                    {!isZenMode && gameState !== GameState.BATTLE_TACTICAL && (
                                        <>
                                            <div className="px-3.5 py-1.5 text-[8px] sm:text-[9px] uppercase font-black tracking-widest border-b border-white/10 bg-white/5 text-amber-400">
                                                Campamento y Aventura
                                            </div>
                                            <button 
                                                onClick={() => { startHuntMode(); setShowSystemMenu(false); }} 
                                                className="px-3.5 py-2 text-left text-xs font-bold border-b border-white/5 hover:bg-amber-500/10 hover:text-amber-300 transition-colors flex items-center gap-2.5"
                                            >
                                                <span className="text-sm">⛏️</span> <span>Modo Cacería (3D)</span>
                                            </button>
                                            <button 
                                                onClick={() => { setShowRestModal(true); setShowSystemMenu(false); }} 
                                                className="px-3.5 py-2 text-left text-xs font-bold border-b border-white/5 hover:bg-amber-500/10 hover:text-amber-300 transition-colors flex items-center gap-2.5"
                                            >
                                                <span className="text-sm">⛺</span> <span>Descanso y Posada</span>
                                            </button>
                                        </>
                                    )}

                                    {/* Section 2: Registros e Información */}
                                    <div className="px-3.5 py-1.5 text-[8px] sm:text-[9px] uppercase font-black tracking-widest border-y border-white/10 bg-white/5 text-slate-400">
                                        Registros e Información
                                    </div>
                                    <button 
                                        onClick={() => { toggleMap(); setShowSystemMenu(false); }} 
                                        className="px-3.5 py-2 text-left text-xs font-bold border-b border-white/5 hover:bg-amber-500/10 hover:text-amber-300 transition-colors flex items-center gap-2.5"
                                    >
                                        <span className="text-sm">🗺️</span> <span>Bitácora y Atlas</span>
                                    </button>
                                    {!isZenMode && (
                                        <button 
                                            onClick={() => { setShowCombatDiceLog(true); setShowSystemMenu(false); }} 
                                            className="px-3.5 py-2 text-left text-xs font-bold border-b border-white/5 hover:bg-amber-500/10 hover:text-amber-300 transition-colors flex items-center gap-2.5"
                                        >
                                            <span className="text-sm">🎲</span> <span>Historial de Dados 5E</span>
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => { setShowGameGuideModal(true); setShowSystemMenu(false); }} 
                                        className="px-3.5 py-2 text-left text-xs font-bold border-b border-white/5 hover:bg-amber-500/10 hover:text-amber-300 transition-colors flex items-center gap-2.5"
                                    >
                                        <span className="text-sm">🧭</span> <span>Guía de Referencia 5E</span>
                                    </button>

                                    {/* Section 3: Opciones del Sistema */}
                                    <div className="px-3.5 py-1.5 text-[8px] sm:text-[9px] uppercase font-black tracking-widest border-y border-white/10 bg-white/5 text-slate-400">
                                        Sistema de Juego
                                    </div>
                                    <button 
                                        onClick={() => { toggleSettings(); setShowSystemMenu(false); }} 
                                        className="px-3.5 py-2 text-left text-xs font-bold border-b border-white/5 hover:bg-amber-500/10 hover:text-amber-300 transition-colors flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <span className="text-sm">🎨</span> <span>Tema Visual</span>
                                        </div>
                                        <span className="text-xs bg-slate-800 border border-white/10 px-1.5 py-0.5 rounded text-amber-400 font-serif leading-none">{themeConfig.icon}</span>
                                    </button>
                                    <button 
                                        onClick={() => { saveGame(); setShowSystemMenu(false); }} 
                                        className="px-3.5 py-2 text-left text-xs font-bold border-b border-white/5 hover:bg-white/10 transition-colors"
                                    >
                                        💾 Guardar Partida
                                    </button>
                                    <button 
                                        onClick={() => { loadGame(); setShowSystemMenu(false); }} 
                                        className="px-3.5 py-2 text-left text-xs font-bold border-b border-white/5 hover:bg-white/10 transition-colors"
                                    >
                                        📂 Cargar Partida
                                    </button>
                                    <button 
                                        onClick={() => { quitToMenu(); setShowSystemMenu(false); }} 
                                        className="px-3.5 py-2 text-left text-xs font-black text-red-400 hover:bg-red-950/40 transition-colors"
                                    >
                                        🚪 Menú Principal
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Notifications / POI Interaction Pills in Safe Middle Area */}
            <div className="absolute top-18 sm:top-20 left-0 right-0 flex flex-col items-center pointer-events-none space-y-2 px-3 z-10">
                {/* Floating Interactive Points of Interest Pills (Overworld) */}
                <div className="pointer-events-auto flex flex-col items-center gap-1.5">
                    {gameState === GameState.OVERWORLD && standingOnAncientSite && (
                        <div className="flex items-center gap-2 p-2 px-3.5 rounded-2xl bg-slate-950/60 border border-amber-500/30 backdrop-blur-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                            <span className="text-lg">{ancientSiteData?.type === 'CAVE' ? '⛰️' : '🏛️'}</span>
                            <div className="flex flex-col text-left">
                                <h4 className="text-xs font-serif font-black text-amber-300 leading-tight">
                                    {ancientSiteData?.name || (currentPlayerCell.terrain === TerrainType.CAVE_FLOOR ? 'Cueva Antigua' : 'Ruinas Antiguas')}
                                </h4>
                                <span className="text-[8px] text-slate-400 font-mono">
                                    {isSiteSearched ? '✓ Ya explorado' : `Pistas: ${currentDragonClues}/3`}
                                </span>
                            </div>
                            <button
                                onClick={() => investigateAncientSite(ancientSiteData?.id)}
                                disabled={isSiteSearched}
                                className={`ml-2 py-1 px-3 rounded-xl font-black text-[10px] uppercase flex items-center gap-1.5 transition-all active:scale-95 border
                                    ${isSiteSearched ? 'bg-slate-800/60 text-slate-500 border-white/5' : 'bg-amber-500/90 text-slate-950 border-amber-300 shadow-md shadow-amber-900/30'}
                                `}
                            >
                                <span>🔍</span>
                                <span>Investigar</span>
                            </button>
                        </div>
                    )}

                    {gameState === GameState.OVERWORLD && standingOnDragonLair && (
                        <div className="flex items-center gap-2 p-2 px-3.5 rounded-2xl bg-red-950/60 border border-red-500/40 backdrop-blur-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                            <span className="text-lg">🐉</span>
                            <div className="flex flex-col text-left">
                                <h4 className="text-xs font-serif font-black text-red-200 leading-tight">Guarida del Dragón</h4>
                                <span className="text-[8px] text-red-400/80 font-mono">Peligro Crítico</span>
                            </div>
                            <button
                                onClick={handleEnterDragonLair}
                                className="ml-2 py-1 px-3 rounded-xl font-black text-[10px] uppercase bg-red-600 hover:bg-red-500 text-white border border-red-400 shadow-lg active:scale-95 flex items-center gap-1"
                            >
                                ⚔️ Entrar
                            </button>
                        </div>
                    )}

                    {gameState === GameState.OVERWORLD && standingOnSettlement && (
                        <div className="flex items-center gap-2 p-2 px-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 backdrop-blur-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                            <span className="text-lg">🏰</span>
                            <div className="flex flex-col text-left">
                                <h4 className="text-xs font-serif font-black text-emerald-200 leading-tight">Pueblo / Asentamiento</h4>
                                <span className="text-[8px] text-emerald-400/80 font-mono">Zona Segura</span>
                            </div>
                            <button
                                onClick={enterSettlement}
                                className="ml-2 py-1 px-3 rounded-xl font-black text-[10px] uppercase bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400 shadow-lg active:scale-95 flex items-center gap-1"
                            >
                                🛡️ Entrar
                            </button>
                        </div>
                    )}

                    {gameState === GameState.OVERWORLD && standingOnPortal && (
                        <div className="flex items-center gap-2 p-2 px-3.5 rounded-2xl bg-purple-950/60 border border-purple-500/40 backdrop-blur-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                            <span className="text-lg">🌀</span>
                            <div className="flex flex-col text-left">
                                <h4 className="text-xs font-serif font-black text-purple-200 leading-tight">Portal Dimensional</h4>
                                <span className="text-[8px] text-purple-400/80 font-mono">Cambio de Plano</span>
                            </div>
                            <button
                                onClick={usePortal}
                                className="ml-2 py-1 px-3 rounded-xl font-black text-[10px] uppercase bg-purple-600 hover:bg-purple-500 text-white border border-purple-400 shadow-lg active:scale-95 flex items-center gap-1"
                            >
                                ✨ Cruzar
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Tactical Floating Bar: Pure Pass-Through with Floating Nodes */}
            <div className="w-full max-w-5xl mx-auto flex flex-col gap-2 pointer-events-none relative z-30">
                {/* Tactical Target Cycling & Confirmation Strip */}
                {gameState === GameState.BATTLE_TACTICAL && isPlayerTurn && (activeActionMode === BattleAction.ATTACK || activeActionMode === BattleAction.MAGIC) && inRangeEnemies.length > 0 && currentTargetEnemy && (
                    <div className="flex items-center justify-between gap-2 p-1.5 px-3 rounded-2xl bg-slate-950/60 backdrop-blur-2xl border border-amber-500/30 shadow-2xl pointer-events-auto animate-in slide-in-from-bottom-3 duration-200">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            {inRangeEnemies.length > 1 && (
                                <button 
                                    onClick={() => setTargetIdx(i => (i - 1 + inRangeEnemies.length) % inRangeEnemies.length)}
                                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border border-white/10 shrink-0 transition-colors active:scale-90"
                                    title="Objetivo Anterior"
                                >
                                    ◀
                                </button>
                            )}
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                <div className="w-8 h-8 rounded-xl border border-amber-500/40 bg-slate-900 overflow-hidden shrink-0 flex items-center justify-center shadow">
                                    <UnitPortrait entity={currentTargetEnemy} scale={1.7} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span className="text-[10px] font-black text-amber-200 truncate block">🎯 {currentTargetEnemy.name}</span>
                                    <div className="w-full h-1.5 bg-slate-900 rounded-full mt-0.5 overflow-hidden border border-white/5">
                                        <div className="h-full bg-rose-500 transition-all duration-300" style={{ width: `${(currentTargetEnemy.stats.hp / currentTargetEnemy.stats.maxHp) * 100}%` }} />
                                    </div>
                                </div>
                            </div>
                            {inRangeEnemies.length > 1 && (
                                <button 
                                    onClick={() => setTargetIdx(i => (i + 1) % inRangeEnemies.length)}
                                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border border-white/10 shrink-0 transition-colors active:scale-90"
                                    title="Siguiente Objetivo"
                                >
                                    ▶
                                </button>
                            )}
                        </div>
                        <button
                            onClick={() => handleTileInteraction(currentTargetEnemy.position.x, currentTargetEnemy.position.y)}
                            className="h-9 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-black rounded-xl shadow-lg border border-amber-300 active:scale-95 transition-all uppercase whitespace-nowrap"
                        >
                            Confirmar
                        </button>
                    </div>
                )}

                {/* Bottom Left Character Pill + Bottom Right BG3 Radial Hub */}
                <div className="flex items-end justify-between gap-2 pointer-events-none">
                    {/* Active Combatant Floating Capsule */}
                    <div className="flex-1 flex flex-col gap-1.5 pointer-events-auto max-w-[240px] sm:max-w-xs">
                        {gameState === GameState.BATTLE_TACTICAL && activeEntity && (
                            <div className="flex items-center gap-2 p-1.5 sm:p-2 rounded-2xl bg-slate-950/55 backdrop-blur-2xl border border-white/15 shadow-2xl animate-in slide-in-from-left-3 duration-200">
                                <div className="relative w-9 h-9 rounded-xl border border-amber-500/40 overflow-hidden shrink-0 bg-slate-900 flex items-center justify-center shadow">
                                    <UnitPortrait entity={activeEntity} scale={1.7} />
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                                    <span className="text-[11px] font-black text-white truncate leading-tight">{activeEntity.name}</span>
                                    <div className="flex gap-1.5">
                                        <div className="flex-1 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/5" title={`HP: ${activeEntity.stats.hp}/${activeEntity.stats.maxHp}`}>
                                            <div className="h-full bg-rose-500 transition-all duration-300" style={{ width: `${(activeEntity.stats.hp / activeEntity.stats.maxHp) * 100}%` }} />
                                        </div>
                                        <div className="flex-1 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/5" title={`Stamina: ${activeEntity.stats.stamina}/${activeEntity.stats.maxStamina}`}>
                                            <div className="h-full bg-amber-500 transition-all duration-300" style={{ width: `${(activeEntity.stats.stamina / activeEntity.stats.maxStamina) * 100}%` }} />
                                        </div>
                                    </div>
                                </div>
                                {isPlayerTurn && (
                                    <div className="flex flex-col items-center gap-1 shrink-0 ml-1">
                                        <TurnTimerUI durationSeconds={30} />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Overworld Party Mini Strip (Shown outside of combat) */}
                        {gameState !== GameState.BATTLE_TACTICAL && party.length > 0 && (
                            <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                                {party.map(p => (
                                    <div key={p.id} className="flex items-center gap-1.5 p-1 pr-2.5 rounded-xl bg-slate-950/50 backdrop-blur-xl border border-white/10 shadow shrink-0">
                                        <div className="w-6 h-6 rounded-lg border border-white/10 overflow-hidden bg-slate-900 shrink-0">
                                            <UnitPortrait entity={p} scale={1.5} />
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[9px] font-bold text-slate-200 leading-none">{p.name}</span>
                                            <div className="w-8 h-1 bg-slate-900 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500" style={{ width: `${(p.stats.hp / p.stats.maxHp) * 100}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* BG3 Radial Menu Hub */}
                    {gameState === GameState.BATTLE_TACTICAL && isPlayerTurn && activeEntity && (
                        <div className="shrink-0 pointer-events-auto">
                            <BG3RadialMenu 
                                activeEntity={activeEntity}
                                hasMoved={hasMoved}
                                hasActed={hasActed}
                                activeActionMode={activeActionMode}
                                onAction={handleAction}
                                onWait={() => selectAction(BattleAction.WAIT)}
                                onRun={() => selectAction(BattleAction.RUN)}
                                themeConfig={themeConfig}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Floating Grimoire Modal (If opened via Hotkey or Expand) */}
        {showSkillDrawer && (
            <div className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-md flex items-end sm:items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200 pointer-events-auto" onClick={() => setShowSkillDrawer(false)}>
                <div 
                    className="w-full max-w-lg rounded-2xl border border-purple-500/30 bg-slate-950/85 backdrop-blur-2xl shadow-2xl p-4 animate-in slide-in-from-bottom-6 duration-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex justify-between items-center mb-3 border-b border-white/10 pb-2">
                        <h3 className="text-xs font-serif font-black uppercase tracking-widest text-purple-300 flex items-center gap-2">
                            <span>✨</span> <span>Grimorio de Conjuros</span>
                        </h3>
                        <button onClick={() => setShowSkillDrawer(false)} className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs">✕</button>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[45vh] overflow-y-auto custom-scrollbar pr-1">
                        {availableSpells.length > 0 ? availableSpells.map(spell => {
                            const canCast = spell.level === 0 || (activeEntity?.stats.spellSlots.current ?? 0) > 0;
                            return (
                                <button 
                                    key={spell.id} 
                                    disabled={!canCast}
                                    onClick={() => handleSpellClick(spell.id)}
                                    className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl border border-white/10 bg-slate-900/60 hover:bg-purple-950/40 hover:border-purple-400/60 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-center group active:scale-95"
                                >
                                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg bg-black/40 border border-slate-700 group-hover:border-purple-400 shadow-inner">
                                        {spell.type === 'HEAL' ? '💚' : spell.type === 'BUFF' ? '🛡️' : '⚡'}
                                    </div>
                                    <div>
                                        <div className="text-[11px] font-bold text-slate-200 group-hover:text-purple-200">{spell.name}</div>
                                        <div className="text-[8px] text-purple-400/80 uppercase font-black tracking-wider mt-0.5">
                                            {spell.level === 0 ? 'Truco' : `Nv. ${spell.level}`}
                                        </div>
                                    </div>
                                </button>
                            );
                        }) : <div className="col-span-full text-center text-xs text-slate-500 py-6">Sin conjuros disponibles.</div>}
                    </div>
                </div>
            </div>
        )}

        {showCombatDiceLog && (
            <CombatDiceLogDrawer logs={logs} onClose={() => setShowCombatDiceLog(false)} themeConfig={themeConfig} />
        )}

        {showRestModal && (
            <RestModal onClose={() => setShowRestModal(false)} />
        )}

        {showNpcModal && (
            <NpcGiftModal onClose={() => setShowNpcModal(false)} />
        )}

        {showGuildModal && (
            <AdventurersGuildModal onClose={() => setShowGuildModal(false)} />
        )}

        {activeDiceRoll && (
            <DiceRoll3DOverlay rollData={activeDiceRoll} onClose={clearDiceRoll} />
        )}

        {gameState === GameState.BATTLE_TACTICAL && activeEntityId && (
            <TurnTransitionOverlay currentTurnEntityId={activeEntityId} entities={battleEntities} />
        )}
    </>
  );
};

const CircleBtn = ({ onClick, icon, themeClass, title }: any) => (
    <button 
        onClick={onClick} 
        title={title}
        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all shadow-lg active:scale-90 text-sm sm:text-base select-none shrink-0 bg-slate-900/60 hover:bg-slate-800/80 border border-white/15 text-slate-200 cursor-pointer backdrop-blur-md"
    >
        {icon}
    </button>
);
