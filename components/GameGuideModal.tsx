import React from 'react';
import { sfx } from '../services/SoundSystem';

interface GameGuideModalProps {
  onClose: () => void;
}

export const GameGuideModal: React.FC<GameGuideModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xl animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-2xl max-h-[88dvh] bg-slate-950/85 border border-white/15 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100 backdrop-blur-2xl">
        
        {/* Header */}
        <div className="p-3.5 sm:p-4 px-4 sm:px-6 border-b border-white/10 flex items-center justify-between bg-white/5 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-lg shadow-inner">
              🧭
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-amber-300 font-serif tracking-wide">Guía de Aventura</h2>
              <p className="text-[10px] text-slate-400">El ciclo principal de juego en Arcadia Tactics</p>
            </div>
          </div>
          <button
            onClick={() => { sfx.playUiClick(); onClose(); }}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center border border-white/15 transition-all font-bold active:scale-95 shadow-md"
            title="Cerrar Guía"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs sm:text-sm custom-scrollbar">
          
          {/* Introduction */}
          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-3.5 leading-relaxed text-slate-300 text-xs">
            Arcadia Tactics combina la exploración hexagonal por turnos en el overworld, combates tácticos 3D por turnos basados en D&D 5E, gestión de grupo y misiones de gremio.
          </div>

          {/* Flow Steps */}
          <div className="space-y-3">
            
            {/* Step 1 */}
            <div className="flex items-start space-x-3 bg-slate-900/50 border border-white/10 rounded-2xl p-3.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center font-black text-amber-300 text-xs shrink-0">
                1
              </div>
              <div>
                <h4 className="font-bold text-amber-300 text-xs sm:text-sm font-serif">Héroe y Grupo</h4>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                  Configura tu héroe y compañeros: clase, atributos D&D 5E, hechizos y habilidades tácticas.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start space-x-3 bg-slate-900/50 border border-white/10 rounded-2xl p-3.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center font-black text-amber-300 text-xs shrink-0">
                2
              </div>
              <div>
                <h4 className="font-bold text-amber-300 text-xs sm:text-sm font-serif">Exploración del Overworld</h4>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                  Muévete por hexágonos del mapa, recolecta recursos, descubre mazmorras y vigila las patrullas enemigas. Usa el mapa del mundo para orientarte.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start space-x-3 bg-slate-900/50 border border-white/10 rounded-2xl p-3.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center font-black text-amber-300 text-xs shrink-0">
                3
              </div>
              <div>
                <h4 className="font-bold text-amber-300 text-xs sm:text-sm font-serif">Pueblos, Gremios y Descanso</h4>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                  Visita el Gremio de Aventureros para aceptar contratos, comerciar en la tienda y descansar en la posada para reponer vida y ranuras de conjuros.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex items-start space-x-3 bg-slate-900/50 border border-white/10 rounded-2xl p-3.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center font-black text-amber-300 text-xs shrink-0">
                4
              </div>
              <div>
                <h4 className="font-bold text-amber-300 text-xs sm:text-sm font-serif">Combate Táctico 3D</h4>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                  Enfréntate en arenas tridimensionales: aprovecha el dial radial, flanking, altura del terreno, hechizos de área y tiradas de dados D20 para vencer.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="p-3 px-4 sm:px-6 border-t border-white/10 bg-white/5 flex justify-end shrink-0">
          <button
            onClick={() => { sfx.playUiClick(); onClose(); }}
            className="min-h-[44px] px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
};
