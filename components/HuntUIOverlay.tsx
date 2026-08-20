import React from 'react';
import { useGameStore } from '../store/gameStore';
import { CharacterClass } from '../types';

export const HuntUIOverlay: React.FC = () => {
  const { currentSchematic, huntSession, exitHuntMode, addLog, party } = useGameStore();
  const player = party[0];
  const playerClass = player?.stats?.class;

  const isRanger = [CharacterClass.RANGER, CharacterClass.ROGUE].includes(playerClass);
  const isMage = [CharacterClass.WIZARD, CharacterClass.SORCERER, CharacterClass.WARLOCK, CharacterClass.CLERIC, CharacterClass.DRUID, CharacterClass.BARD].includes(playerClass);
  const isWarrior = !isRanger && !isMage;

  if (!currentSchematic || !huntSession) return null;

  const { playerPos, preys, preysDefeatedCount, totalPreysCount, returnPortal } = huntSession;

  const performSpecialAction = () => {
    if (isRanger) {
      addLog("🐾 [Cazador] Colocando trampas de rastreo en el terreno...", "info");
    } else if (isMage) {
      addLog("🔮 [Mago] Visión Arcana: Revelando auras de enemigos cercanos...", "info");
      const nearbyPreys = preys.filter(p => !p.isDefeated && Math.hypot(p.x - playerPos.x, p.z - playerPos.z) < 12);
      nearbyPreys.forEach(p => addLog(`   ✨ Aura detectada: ${p.name} cerca de (${p.x}, ${p.z})`, "info"));
    } else if (isWarrior) {
      addLog("🛡️ [Guerrero] ¡Golpe de fuerza bruta! Buscando puntos de ruptura en el entorno...", "info");
    }
  };

  // Find nearest active prey
  const activePreys = preys.filter(p => !p.isDefeated);
  const nearestPrey = activePreys.sort((a, b) => {
    const distA = Math.hypot(a.x - playerPos.x, a.z - playerPos.z);
    const distB = Math.hypot(b.x - playerPos.x, b.z - playerPos.z);
    return distA - distB;
  })[0];

  const distToNearest = nearestPrey
    ? Math.round(Math.hypot(nearestPrey.x - playerPos.x, nearestPrey.z - playerPos.z))
    : 0;

  return (
    <div className="fixed inset-0 pointer-events-none flex flex-col justify-between p-2 sm:p-4 z-20 select-none">
      {/* Top Header Bar: Floating Capsule */}
      <div className="flex items-center justify-between pointer-events-auto gap-2 max-w-5xl mx-auto w-full">
        <div className="bg-slate-950/60 border border-white/15 rounded-2xl p-2 sm:px-3 shadow-2xl backdrop-blur-2xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-lg">
            ⛏️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-amber-300 font-bold text-xs sm:text-sm font-serif truncate">{currentSchematic.title}</h2>
              <span className="text-[9px] bg-white/5 text-amber-300 px-1.5 py-0.2 rounded border border-white/10 font-mono">
                {currentSchematic.width}x{currentSchematic.length}
              </span>
            </div>
            <p className="text-[9px] text-slate-400">
              Mazmorra Voxel · {currentSchematic.totalBlocks.toLocaleString()} Bloques
            </p>
          </div>
        </div>

        {/* Floating Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={performSpecialAction}
            className="bg-purple-950/70 hover:bg-purple-900/80 text-purple-200 font-bold text-[11px] px-3 py-2 rounded-xl border border-purple-500/40 backdrop-blur-xl shadow-lg flex items-center gap-1 active:scale-95 transition-all"
            title="Habilidad Especial de Clase"
          >
            <span>✨ {isRanger ? 'Trampa' : isMage ? 'Visión' : 'Romper'}</span>
          </button>
          <button
            onClick={exitHuntMode}
            className="bg-slate-900/70 hover:bg-slate-800 text-slate-200 font-bold text-[11px] px-3 py-2 rounded-xl border border-white/15 backdrop-blur-xl shadow-lg active:scale-95 transition-all"
          >
            ✕ Salir
          </button>
        </div>
      </div>

      {/* Top Right Mini Radar: Translucent Capsule */}
      <div className="absolute top-16 right-2 sm:right-4 pointer-events-auto bg-slate-950/65 border border-white/15 rounded-2xl p-2 shadow-2xl backdrop-blur-2xl">
        <div className="text-[8px] text-amber-400 font-bold uppercase tracking-wider mb-1 flex justify-between items-center gap-2">
          <span>Radar</span>
          <span className="text-slate-300 font-mono">{preysDefeatedCount}/{totalPreysCount}</span>
        </div>
        <div
          className="relative bg-slate-950/80 rounded-xl border border-white/10 overflow-hidden"
          style={{ width: '100px', height: '100px' }}
        >
          {/* Player Dot */}
          <div
            className="absolute w-2.5 h-2.5 bg-sky-400 rounded-full border border-white shadow-sm -translate-x-1/2 -translate-y-1/2 z-10"
            style={{
              left: `${(playerPos.x / currentSchematic.width) * 100}%`,
              top: `${(playerPos.z / currentSchematic.length) * 100}%`
            }}
          />
          {/* Preys Dots */}
          {preys.map(prey => (
            <div
              key={prey.id}
              className={`absolute w-2 h-2 rounded-full -translate-x-1/2 -translate-y-1/2 ${prey.isDefeated ? 'bg-slate-600 opacity-30' : 'bg-red-500 animate-pulse'}`}
              style={{
                left: `${(prey.x / currentSchematic.width) * 100}%`,
                top: `${(prey.z / currentSchematic.length) * 100}%`
              }}
              title={prey.name}
            />
          ))}
          {/* Return Portal Dot */}
          {returnPortal && returnPortal.active && (
            <div
              className="absolute w-3 h-3 bg-fuchsia-400 rounded-full border border-white shadow-[0_0_8px_rgba(217,70,239,0.8)] -translate-x-1/2 -translate-y-1/2 z-20 animate-bounce"
              style={{
                left: `${(returnPortal.x / currentSchematic.width) * 100}%`,
                top: `${(returnPortal.z / currentSchematic.length) * 100}%`
              }}
              title="Portal de Retorno"
            />
          )}
        </div>
      </div>

      {/* Bottom Center Interaction Pill: Floating Glass */}
      <div className="flex flex-col items-center pb-2 pointer-events-auto max-w-md mx-auto w-full">
        <div className="bg-slate-950/65 border border-white/15 rounded-2xl p-2.5 px-3.5 shadow-2xl backdrop-blur-2xl w-full text-center">
          <div className="text-[10px] uppercase tracking-wider font-bold text-amber-300 mb-0.5">
            {nearestPrey && !nearestPrey.isDefeated ? `Objetivo: ${nearestPrey.name}` : '¡Zona Despejada!'}
          </div>
          <p className="text-[10px] text-slate-300 mb-2">
            {nearestPrey && !nearestPrey.isDefeated
              ? `Distancia: ~${distToNearest} bloques.`
              : 'Has derrotado a las criaturas de este sector.'}
          </p>

          <div className="flex flex-wrap justify-center gap-1.5">
            {activePreys.map(prey => {
              const dist = Math.round(Math.hypot(prey.x - playerPos.x, prey.z - playerPos.z));
              return (
                <button
                  key={prey.id}
                  onClick={() => {
                    if (dist <= 15) {
                      useGameStore.getState().attackPreyInHunt(prey.id);
                    } else {
                      addLog(`⚠️ Estás muy lejos de ${prey.name} (~${dist} blq). Acércate para atacar.`, 'info');
                    }
                  }}
                  className="bg-red-950/70 hover:bg-red-900 text-red-200 border border-red-500/40 px-2.5 py-1 rounded-xl text-[10px] font-black flex items-center gap-1 transition-all shadow active:scale-95"
                >
                  <span>{prey.icon || '🐉'}</span>
                  <span>Atacar {prey.name} ({dist} blq)</span>
                </button>
              );
            })}
          </div>

          {returnPortal && returnPortal.active && (
            <div className="mt-2 pt-2 border-t border-white/10">
              <button
                onClick={exitHuntMode}
                className="w-full bg-fuchsia-700 hover:bg-fuchsia-600 text-white font-bold py-1.5 rounded-xl text-[10px] shadow-[0_0_12px_rgba(217,70,239,0.5)] transition-all flex items-center justify-center gap-1.5 active:scale-95"
              >
                <span>🌀 Cruzar Portal y Regresar</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
