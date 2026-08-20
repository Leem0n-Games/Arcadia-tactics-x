export interface AncientSite {
  id: string;
  name: string;
  type: 'RUINS' | 'CAVE';
  q: number;
  r: number;
  biomeName: string;
  description: string;
  clueLore: string;
  d20Difficulty: number;
  rewardXp: number;
  rewardGold: number;
}

export const ANCIENT_SITES: AncientSite[] = [
  {
    id: 'SITE_ELDORIA_RUINS',
    name: 'Ruinas de Eldoria',
    type: 'RUINS',
    q: 12,
    r: -8,
    biomeName: 'Bosque del Norte',
    description: 'Antiguas agujas élficas cubiertas de enredaderas y musgo arcano donde se custodiaban códices sobre dragones primigenios.',
    clueLore: 'Descifras un grabado rúnico que describe las 5 fallas tectónicas de Arcadia y los signos ígneos que anuncian el despertar del Dragón Rojo.',
    d20Difficulty: 10,
    rewardXp: 180,
    rewardGold: 120
  },
  {
    id: 'SITE_SOLAR_TEMPLE',
    name: 'Templo Solar en Ruinas',
    type: 'RUINS',
    q: 20,
    r: 15,
    biomeName: 'Desierto de las Arenas Abrasadoras',
    description: 'Un colosal santuario de arenisca calcinada consagrado a los cultos del fuego y la llama eterna.',
    clueLore: 'En el altar central encuentras una estela con el diagrama de las 3 cámaras subterráneas y el sello arcano que custodia la entrada al dungeon.',
    d20Difficulty: 11,
    rewardXp: 200,
    rewardGold: 150
  },
  {
    id: 'SITE_IRON_CITADEL',
    name: 'Ruinas de la Ciudadela de Hierro',
    type: 'RUINS',
    q: 28,
    r: 0,
    biomeName: 'Picos de Hierro Orientales',
    description: 'Fortaleza enana en la cumbre oriental cuyos salones subterráneos albergan archivos de expediciones milenarias.',
    clueLore: 'Encuentras un compendio forjado en metal que detalla los 4 guardianes arcanos del dungeon subterráneo y cómo romper su formación.',
    d20Difficulty: 12,
    rewardXp: 220,
    rewardGold: 160
  },
  {
    id: 'SITE_OAKHAVEN_RUINS',
    name: 'Ruinas Sumergidas de Oakhaven',
    type: 'RUINS',
    q: -18,
    r: 18,
    biomeName: 'Pantano de los Lamentos',
    description: 'Baluarte devorado por aguas oscuras con bajorrelieves que ilustran el Gran Portal a la Guarida del Dragón.',
    clueLore: 'Bajo el lodo rescatas una tablilla intacta con el glifo de transporte que se activa al purgar el dungeon de guardianes.',
    d20Difficulty: 10,
    rewardXp: 190,
    rewardGold: 130
  },
  {
    id: 'SITE_VOLCANIC_CAVE',
    name: 'Cueva de los Ecos Volcánicos',
    type: 'CAVE',
    q: 8,
    r: -18,
    biomeName: 'Tierras Altas del Norte',
    description: 'Caverna profunda de roca basáltica donde retumban rugidos térmicos y emana un calor sofocante.',
    clueLore: 'En el fondo de la gruta hallas una escama colosal de dragón rojo incrustada en magma solidificado junto a marcas de garras titánicas.',
    d20Difficulty: 11,
    rewardXp: 210,
    rewardGold: 140
  },
  {
    id: 'SITE_SHADOW_CRYSTAL_CAVE',
    name: 'Caverna de Cristal Umbrío',
    type: 'CAVE',
    q: -15,
    r: -12,
    biomeName: 'Colinas del Bosque Susurrante',
    description: 'Caverna repleta de estalagmitas cristalinas que resuenan con vibraciones arcanas y nidos de dracos menores.',
    clueLore: 'Descubres el diario carbonizado de un legendario explorador con mapas de túneles que conducen a los fosos subterráneos de Arcadia.',
    d20Difficulty: 10,
    rewardXp: 180,
    rewardGold: 110
  },
  {
    id: 'SITE_ANCIENT_WINDS_FOSSE',
    name: 'Fosa de los Vientos Antiguos',
    type: 'CAVE',
    q: -8,
    r: 24,
    biomeName: 'Garganta del Desierto Sur',
    description: 'Fisura tectónica natural donde corrientes de aire sulfuroso revelan restos de antiguas ofrendas a la bestia alada.',
    clueLore: 'Examinas las paredes de la fosa y descubres fragmentos de pergamino con el ritual para abrir los portales de retorno tras la cacería.',
    d20Difficulty: 11,
    rewardXp: 200,
    rewardGold: 130
  },
  {
    id: 'SITE_GLACIAL_DEPTHS_CRYPT',
    name: 'Cripta Glaciar de las Profundidades',
    type: 'CAVE',
    q: 22,
    r: -14,
    biomeName: 'Cordillera Helada',
    description: 'Cueva de hielo milenario con túneles esculpidos que descienden hacia las profundidades olvidadas de Arcadia.',
    clueLore: 'En el permafrost extraes un amuleto con el mapa de las 5 entradas al dungeon subterráneo y cómo despertar el portal.',
    d20Difficulty: 12,
    rewardXp: 230,
    rewardGold: 170
  }
];

export const getAncientSiteAt = (q: number, r: number): AncientSite | undefined => {
  return ANCIENT_SITES.find(site => site.q === q && site.r === r);
};
