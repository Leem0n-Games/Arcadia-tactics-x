import React from 'react';
import { ANCIENT_SITES } from '../../data/ancientSites';

interface AncientSitesListProps {
    searchedSites: string[];
    themeClasses: any;
}

export const AncientSitesList: React.FC<AncientSitesListProps> = ({ searchedSites, themeClasses }) => {
    return (
        <div className="space-y-3">
            <div className="border-b pb-2 border-slate-800">
                <h3 className={`text-xs font-bold uppercase tracking-widest ${themeClasses.accentText}`}>
                    Ubicaciones con Pistas de Dragón
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                    Explora estas ruinas y cuevas para reunir las 3 pistas necesarias.
                </p>
            </div>

            <div className="space-y-2.5">
                {ANCIENT_SITES.map(site => {
                    const isSearched = (searchedSites || []).includes(site.id);
                    return (
                        <div 
                            key={site.id} 
                            className={`p-2.5 rounded-xl border transition-all ${
                                isSearched 
                                    ? 'bg-slate-900/50 border-emerald-500/30 opacity-80' 
                                    : 'bg-slate-950/80 border-slate-800 hover:border-amber-500/40'
                            }`}
                        >
                            <div className="flex items-center justify-between gap-1">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-sm">{site.type === 'CAVE' ? '⛰️' : '🏛️'}</span>
                                    <span className="font-serif font-bold text-xs text-slate-200">{site.name}</span>
                                </div>
                                <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded ${
                                    isSearched ? 'bg-emerald-950 text-emerald-300' : 'bg-slate-800 text-amber-400'
                                }`}>
                                    {isSearched ? '✓ Registrado' : `(${site.q}, ${site.r})`}
                                </span>
                            </div>
                            <div className="text-[9px] text-amber-400/80 font-mono mt-0.5">{site.biomeName}</div>
                            <p className="text-[10px] text-slate-400 mt-1 leading-snug">{site.description}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
