import React from 'react';
import { TerrainType } from '../../types';
import { TERRAIN_NAMES, TERRAIN_MOVEMENT_COST } from '../../constants';

interface BiomeAtlasListProps {
    themeClasses: any;
}

interface BiomeRegion {
    id: string;
    name: string;
    icon: string;
    climate: string;
    dangerLevel: string;
    description: string;
    keyTerrains: string;
    notableSites: string;
}

const ARCADIA_BIOMES: BiomeRegion[] = [
    {
        id: 'CENTRAL',
        name: 'Tierras Centrales de Arcadia',
        icon: '🏰',
        climate: 'Templado y Fértil',
        dangerLevel: 'Bajo (Nv. 1-2)',
        description: 'El corazón pacífico del continente donde se alza la Capital de Arcadia. Rodeada de extensas praderas verdes, campos cultivados y caminos adoquinados seguros.',
        keyTerrains: 'Praderas, Llanuras, Bosques jóvenes',
        notableSites: 'Plaza Mayor del Castillo, Aldeas campesinas'
    },
    {
        id: 'WOODS',
        name: 'Bosques Susurrantes',
        icon: '🌲',
        climate: 'Húmedo y Umbrío',
        dangerLevel: 'Medio (Nv. 2-3)',
        description: 'Frondoso manto forestal ancestral situado al oeste. Sus densas copas ocultan campamentos de asalto goblin, ruinas cubiertas de enredaderas y criaturas feéricas.',
        keyTerrains: 'Bosque Antiguo, Selva Virgen',
        notableSites: 'Guarida de Grommash, Ermitas élficas'
    },
    {
        id: 'PEAKS',
        name: 'Picos de Hierro y Cañones',
        icon: '⛰️',
        climate: 'Rocoso y Ventoso',
        dangerLevel: 'Medio-Alto (Nv. 3-4)',
        description: 'Imponentes cordilleras que flanquean el este de Arcadia. Ricas en vetas de mineral y antiguas forjas subterráneas, pero habitadas por trasgos de roca y bestias aladas.',
        keyTerrains: 'Picos Montañosos, Minas, Ruinas de Piedra',
        notableSites: 'Minas Abandonadas de Kaer, Cumbres del Eco'
    },
    {
        id: 'DESERT',
        name: 'Arenas Abrasadas de Zun',
        icon: '🏜️',
        climate: 'Árido y Tórrido',
        dangerLevel: 'Alto (Nv. 4-5)',
        description: 'Vasto mar de dunas doradas y cañones de arenisca en el sur del reino. Los vientos borran los caminos y bajo la arena reposan necrópolis y monolitos olvidados.',
        keyTerrains: 'Dunas del Desierto, Cañones Áridos',
        notableSites: 'Templo del Sol Olvidado, Oasis de Cristal'
    },
    {
        id: 'NORTH',
        name: 'El Norte Glacial',
        icon: '❄️',
        climate: 'Polar y Gélido',
        dangerLevel: 'Peligroso (Nv. 5+)',
        description: 'Yermos perpetuamente congelados custodiados por murallas de hielo. Las tormentas de nieve reducen la visibilidad y es el territorio predilecto de dragones y gigantes.',
        keyTerrains: 'Tundra Nevada, Glaciares, Picos Helados',
        notableSites: 'Muralla de Escarcha, Guaridas de Dragón'
    },
    {
        id: 'SWAMP',
        name: 'Ciénaga de las Penas',
        icon: '🦎',
        climate: 'Cálido, Cenagoso y Nocivo',
        dangerLevel: 'Alto (Nv. 3-5)',
        description: 'Pantano brumoso y traicionero donde el lodo ralentiza el avance de las tropas. Las emanaciones de gas y aguas turbias ocultan secretos y brujas de los pantanos.',
        keyTerrains: 'Ciénaga Fangosa, Manglares',
        notableSites: 'Cueva de los Lamentos, Altares Tóxicos'
    },
    {
        id: 'SHADOW',
        name: 'Reino de las Sombras (Abismo)',
        icon: '🌌',
        climate: 'Aire Corrupto y Vacío',
        dangerLevel: 'Extremo (Nv. 5+)',
        description: 'La dimensión invertida reflejada bajo la realidad. Ríos de magma ardiente, hongos bioluminiscentes carmesí y abismos insondables donde acechan aberraciones arcanas.',
        keyTerrains: 'Bosque Fúngico Arcano, Magma, Abismo',
        notableSites: 'Portales de Transmutación, Fisuras del Vacío'
    }
];

export const BiomeAtlasList: React.FC<BiomeAtlasListProps> = ({ themeClasses }) => {
    return (
        <div className="space-y-3">
            <div className="border-b pb-2 border-slate-800">
                <h3 className={`text-xs font-bold uppercase tracking-widest ${themeClasses.accentText}`}>
                    Atlas Geográfico y Biomas
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                    Guía de supervivencia regional, peligros y orografía de Arcadia.
                </p>
            </div>

            <div className="space-y-2.5">
                {ARCADIA_BIOMES.map(biome => (
                    <div 
                        key={biome.id}
                        className="p-3 rounded-2xl bg-slate-950/80 border border-white/10 hover:border-amber-500/40 transition-all"
                    >
                        <div className="flex items-center justify-between gap-1 mb-1">
                            <div className="flex items-center gap-1.5">
                                <span className="text-base">{biome.icon}</span>
                                <h4 className="font-serif font-bold text-xs text-amber-200">{biome.name}</h4>
                            </div>
                            <span className="text-[8px] font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-white/10 text-slate-300 font-bold">
                                {biome.dangerLevel}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 text-[9px] text-slate-400 font-mono mb-1.5">
                            <span>Clima: <span className="text-sky-300">{biome.climate}</span></span>
                        </div>

                        <p className="text-[10px] text-slate-300 leading-snug mb-2">
                            {biome.description}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1 border-t border-white/5 text-[9px]">
                            <div className="text-slate-400">
                                <span className="text-slate-500 uppercase font-bold">Terrenos: </span>
                                <span className="text-slate-300">{biome.keyTerrains}</span>
                            </div>
                            <div className="text-slate-400">
                                <span className="text-slate-500 uppercase font-bold">Puntos Clave: </span>
                                <span className="text-amber-400">{biome.notableSites}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
