import React from 'react';
import { useGameStore } from '../store/gameStore';
import { useContentStore } from '../store/contentStore';
import { sfx } from '../services/SoundSystem';

interface QuestJournalModalProps {
  onClose: () => void;
}

export const QuestJournalModal: React.FC<QuestJournalModalProps> = ({ onClose }) => {
  const { quests } = useGameStore();
  const { items: dbItems } = useContentStore();

  const activeQuests = quests.filter(q => !q.completed);
  const completedQuests = quests.filter(q => q.completed);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xl animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-3xl max-h-[88dvh] bg-slate-950/85 border border-white/15 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100 backdrop-blur-2xl">
        
        {/* Header */}
        <div className="p-3.5 sm:p-4 px-4 sm:px-6 border-b border-white/10 flex items-center justify-between bg-white/5 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-lg shadow-inner">
              📜
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-amber-300 font-serif tracking-wide">Diario de Misiones</h2>
              <p className="text-[10px] text-slate-400">Tus gestas y objetivos en las tierras de Arcadia</p>
            </div>
          </div>
          <button
            onClick={() => { sfx.playUiClick(); onClose(); }}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center border border-white/15 transition-all font-bold active:scale-95 shadow-md"
            title="Cerrar Diario"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 custom-scrollbar">
          {quests.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <span className="text-4xl block mb-2">📭</span>
              <p className="text-xs">No hay campañas o misiones activas en este momento.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Active Quests */}
              <div>
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2.5 flex items-center space-x-2">
                  <span>⚔️ En Curso ({activeQuests.length})</span>
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {activeQuests.map(q => {
                    const allDone = q.objectives?.every(o => o.completed);
                    return (
                      <div key={q.id} className="bg-slate-900/60 border border-white/10 hover:border-amber-500/30 rounded-2xl p-4 shadow-lg transition-all space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-950/60 text-amber-400 border border-amber-600/30 uppercase">
                              {q.type}
                            </span>
                            <h4 className="text-sm font-bold text-slate-100 mt-1 font-serif">{q.title}</h4>
                            <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">{q.description}</p>
                          </div>
                          {allDone && (
                            <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-[10px] px-2.5 py-1 rounded-xl font-bold flex items-center space-x-1 animate-pulse shrink-0">
                              <span>✨ ¡Reclamable!</span>
                            </span>
                          )}
                        </div>

                        {/* Objectives checklist */}
                        <div className="bg-slate-950/60 border border-white/5 rounded-xl p-2.5 space-y-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Objetivos:</span>
                          <div className="space-y-1.5">
                            {q.objectives?.map(obj => {
                              const pct = Math.min(100, Math.round((obj.currentProgress / obj.requiredProgress) * 100));
                              return (
                                <div key={obj.id} className="text-xs space-y-1">
                                  <div className="flex items-center justify-between text-[11px]">
                                    <span className={`flex items-center space-x-1.5 ${obj.completed ? 'text-emerald-400 font-semibold line-through opacity-80' : 'text-slate-300'}`}>
                                      <span>{obj.completed ? '✅' : '📌'}</span>
                                      <span>{obj.description}</span>
                                    </span>
                                    <span className="font-mono text-slate-400 text-[10px]">
                                      {obj.currentProgress} / {obj.requiredProgress}
                                    </span>
                                  </div>
                                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-white/5">
                                    <div 
                                      className={`h-full transition-all duration-500 ${obj.completed ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Rewards Preview */}
                        {q.reward && (
                          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5 text-[11px] text-slate-300">
                            <span className="text-slate-400 font-bold text-[10px] uppercase">Recompensa:</span>
                            {q.reward.xp && (
                              <span className="bg-purple-950/60 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-lg flex items-center space-x-1 text-[10px]">
                                <span>✨</span>
                                <span className="font-bold">+{q.reward.xp.toLocaleString()} EXP</span>
                              </span>
                            )}
                            {q.reward.gold && (
                              <span className="bg-amber-950/60 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-lg flex items-center space-x-1 text-[10px]">
                                <span>🪙</span>
                                <span className="font-bold">+{q.reward.gold} Oro</span>
                              </span>
                            )}
                            {q.reward.items && q.reward.items.map(itemId => {
                              const itemData = dbItems[itemId] || Object.values(dbItems).find(i => i.id === itemId);
                              return (
                                <span key={itemId} className="bg-slate-900 text-amber-200 border border-amber-500/30 px-2 py-0.5 rounded-lg flex items-center space-x-1 text-[10px]" title={itemData?.name || itemId}>
                                  <span>🎁</span>
                                  <span>{itemData?.name || itemId}</span>
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Completed Quests */}
              {completedQuests.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center space-x-2">
                    <span>🏆 Completadas ({completedQuests.length})</span>
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {completedQuests.map(q => (
                      <div key={q.id} className="bg-slate-900/40 border border-emerald-500/20 rounded-2xl p-3 flex items-center justify-between opacity-80">
                        <div>
                          <h4 className="text-xs font-bold text-emerald-300 font-serif">{q.title}</h4>
                          <p className="text-[10px] text-slate-400">{q.description}</p>
                        </div>
                        <span className="bg-emerald-950 text-emerald-400 border border-emerald-500/40 text-[9px] px-2.5 py-0.5 rounded-full font-bold">
                          ✓ Completada
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 px-4 sm:px-6 border-t border-white/10 bg-white/5 flex justify-end shrink-0">
          <button
            onClick={() => { sfx.playUiClick(); onClose(); }}
            className="min-h-[44px] px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center"
          >
            Cerrar Diario
          </button>
        </div>

      </div>
    </div>
  );
};
