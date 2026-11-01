import { DimensionType } from '../types';

export interface BiomeInfo {
  id: string;
  name: string;
  dimension: DimensionType;
  dimensionDisplayName: string;
  icon: string;
  description: string;
  targetCoords: { x: number; z: number };
  aliases: string[];
}

export const BIOME_CATALOG: BiomeInfo[] = [
  // 1. OVERWORLD (Mundo Normal)
  {
    id: 'plains',
    name: 'Planicies & Praderas',
    dimension: 'overworld',
    dimensionDisplayName: 'Overworld (Mundo Normal)',
    icon: '🌱',
    description: 'Extensas praderas verdes ideales para construir y cultivar aldeas.',
    targetCoords: { x: 0, z: 0 },
    aliases: ['planicie', 'pradera', 'praderas', 'plains', 'llanura', 'llanuras'],
  },
  {
    id: 'mountains',
    name: 'Montañas y Picos Rocosos',
    dimension: 'overworld',
    dimensionDisplayName: 'Overworld (Mundo Normal)',
    icon: '⛰️',
    description: 'Imponentes cordilleras escarpadas con cascadas y ricos yacimientos de carbón y hierro.',
    targetCoords: { x: 120, z: 120 },
    aliases: ['montana', 'montanas', 'mountains', 'picos', 'sierra', 'montes'],
  },
  {
    id: 'desert',
    name: 'Desierto Caluroso',
    dimension: 'overworld',
    dimensionDisplayName: 'Overworld (Mundo Normal)',
    icon: '🏜️',
    description: 'Océanos de arena dorada, dunas y estratos profundos de arenisca pura.',
    targetCoords: { x: 250, z: 250 },
    aliases: ['desierto', 'desert', 'dunas', 'arenisca', 'sand'],
  },
  {
    id: 'forest',
    name: 'Bosque Frondoso de Roble',
    dimension: 'overworld',
    dimensionDisplayName: 'Overworld (Mundo Normal)',
    icon: '🌲',
    description: 'Arboleda densa con gigantescos robles, sombra natural y hojas verdes.',
    targetCoords: { x: -100, z: 80 },
    aliases: ['bosque', 'forest', 'selva', 'arboleda', 'wood'],
  },
  {
    id: 'ocean',
    name: 'Costas y Océano',
    dimension: 'overworld',
    dimensionDisplayName: 'Overworld (Mundo Normal)',
    icon: '🌊',
    description: 'Extensos mares de agua translúcida con playas de arena suave.',
    targetCoords: { x: -200, z: -200 },
    aliases: ['oceano', 'ocean', 'playa', 'mar', 'costa', 'beach'],
  },
  {
    id: 'islands',
    name: 'Islas Voladoras & Arrecifes',
    dimension: 'overworld',
    dimensionDisplayName: 'Overworld (Mundo Normal)',
    icon: '🏝️',
    description: 'Formaciones de islas rodeadas de agua y acantilados.',
    targetCoords: { x: 300, z: -300 },
    aliases: ['islas', 'isla', 'islands', 'archipielago'],
  },

  // 2. DIMENSIÓN DE CHOCOLATE
  {
    id: 'chocolate',
    name: 'Valle de Chocolate y Caramelo',
    dimension: 'chocolate',
    dimensionDisplayName: 'Dimensión de Chocolate',
    icon: '🍫',
    description: 'Lagos de chocolate líquido, árboles de barquillo crujiente con hojas de algodón de azúcar.',
    targetCoords: { x: 0, z: 0 },
    aliases: ['valle_chocolate', 'chocolate', 'dulce', 'candyland', 'dulces', 'reino_dulce'],
  },
  {
    id: 'white_peaks',
    name: 'Picos de Chocolate Blanco',
    dimension: 'chocolate',
    dimensionDisplayName: 'Dimensión de Chocolate',
    icon: '🏔️',
    description: 'Cordilleras elevadas glaseadas con chocolate blanco puro y nubes de algodón rosa.',
    targetCoords: { x: 160, z: 160 },
    aliases: ['picos_blancos', 'white_peaks', 'chocolate_blanco', 'montana_dulce'],
  },
  {
    id: 'cookie_caves',
    name: 'Cavernas de Galleta y Azúcar',
    dimension: 'chocolate',
    dimensionDisplayName: 'Dimensión de Chocolate',
    icon: '🍪',
    description: 'Cuevas dulces subterráneas con vetas de mineral de azúcar cristalina y roca de caramelo.',
    targetCoords: { x: -80, z: -80 },
    aliases: ['cuevas_galleta', 'cookie_caves', 'galleta', 'galletas', 'azucar', 'sugar'],
  },

  // 3. NETHER (Inframundo)
  {
    id: 'nether',
    name: 'Páramo Ardiente del Nether',
    dimension: 'nether',
    dimensionDisplayName: 'Nether (Inframundo)',
    icon: '🔥',
    description: 'Mares de lava incandescente, acantilados de netherrack y estalactitas de glowstone.',
    targetCoords: { x: 0, z: 0 },
    aliases: ['nether', 'inframundo', 'nether_wastes', 'lava', 'fuego', 'hell'],
  },
  {
    id: 'soul_valley',
    name: 'Valle de Almas (Soul Sand)',
    dimension: 'nether',
    dimensionDisplayName: 'Nether (Inframundo)',
    icon: '💀',
    description: 'Cavernas oscuras tapizadas con bloques de arena de almas y minerales de cuarzo.',
    targetCoords: { x: 100, z: 100 },
    aliases: ['soul_valley', 'valle_almas', 'arena_de_almas', 'soul_sand', 'almas'],
  },

  // 4. THE END (El Fin)
  {
    id: 'the_end',
    name: 'Isla Central del Fin',
    dimension: 'the_end',
    dimensionDisplayName: 'The End (El Fin)',
    icon: '🌌',
    description: 'Isla monumental flotante de piedra del End coronada por gigantescos pilares de obsidiana.',
    targetCoords: { x: 0, z: 0 },
    aliases: ['the_end', 'end', 'isla_central', 'fin', 'vacio', 'central_island'],
  },
  {
    id: 'outer_islands',
    name: 'Islas Flotantes Exteriores',
    dimension: 'the_end',
    dimensionDisplayName: 'The End (El Fin)',
    icon: '🔮',
    description: 'Cúmulo exterior de asteroides cósmicos con bloques púrpuras purpur y misterios.',
    targetCoords: { x: 75, z: 75 },
    aliases: ['outer_islands', 'islas_exteriores', 'purpur', 'ciudades_end'],
  },

  // 5. MUNDO PARALELO (Parallel Overworld)
  {
    id: 'parallel',
    name: 'Dimensión Espejo Invertida',
    dimension: 'parallel',
    dimensionDisplayName: 'Mundo Paralelo',
    icon: '🪞',
    description: 'La realidad reflejada: césped magenta, aguas índigo, árboles espejo y minerales invertidos.',
    targetCoords: { x: 0, z: 0 },
    aliases: ['parallel', 'paralelo', 'espejo', 'mundo_espejo', 'invertido', 'dimension_espejo'],
  },
];

export function findBiome(query: string): BiomeInfo | undefined {
  const normalized = query.trim().toLowerCase().replace(/[\s\-_:]+/g, '_');
  return BIOME_CATALOG.find(
    (b) =>
      b.id === normalized ||
      b.aliases.includes(normalized) ||
      b.name.toLowerCase().includes(query.toLowerCase()) ||
      `${b.dimension}_${b.id}` === normalized
  );
}
