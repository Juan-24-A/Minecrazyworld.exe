import { BlockType } from '../types';
import { VoxelWorld } from './world';

export interface StructureInfo {
  id: string;
  name: string;
  category: 'building' | 'portal' | 'natural' | 'sweets';
  icon: string;
  description: string;
  dimensions: { x: number; y: number; z: number };
  aliases: string[];
}

export const STRUCTURE_CATALOG: StructureInfo[] = [
  {
    id: 'casa_madera',
    name: 'Casa de Madera Clásica',
    category: 'building',
    icon: '🏡',
    description: 'Acogedora casa de roble y adoquín con ventanas de cristal, cama roja, mesa de crafteo, horno y techo a dos aguas.',
    dimensions: { x: 7, y: 6, z: 7 },
    aliases: ['casa', 'house', 'wood_house', 'casa_de_madera', 'cabana'],
  },
  {
    id: 'templo_desierto',
    name: 'Templo del Desierto',
    category: 'building',
    icon: '🏜️',
    description: 'Pirámide y torres de arenisca con patrones de lana azul y naranja, cámara interior y cripta secreta.',
    dimensions: { x: 9, y: 7, z: 9 },
    aliases: ['templo', 'desert_temple', 'templo_de_arena', 'piramide'],
  },
  {
    id: 'garaje_dulce',
    name: 'Garaje Dulce',
    category: 'sweets',
    icon: '🛻',
    description: 'Estructura dulce con suelo ajedrezado de galleta y caramelo, columnas de bastón de caramelo, paredes de barquillo y linternas.',
    dimensions: { x: 8, y: 6, z: 9 },
    aliases: ['garage', 'sweet_garage', 'garaje', 'garaje_camioneta'],
  },
  {
    id: 'torre_vigia',
    name: 'Torre Vigía Medieval',
    category: 'building',
    icon: '🏰',
    description: 'Alta torre defensiva de piedra y adoquín de 12 bloques con almenas defensivas y un faro superior de piedra luminosa.',
    dimensions: { x: 5, y: 12, z: 5 },
    aliases: ['torre', 'watchtower', 'castillo', 'torreon', 'tower'],
  },
  {
    id: 'fuente_agua',
    name: 'Fuente Monumental de Agua',
    category: 'building',
    icon: '⛲',
    description: 'Fuente circular de piedra pulida con estanques de agua cristalina, obelisco central y lámparas de glowstone sumergidas.',
    dimensions: { x: 7, y: 5, z: 7 },
    aliases: ['fuente', 'fountain', 'water_fountain', 'estanque'],
  },
  {
    id: 'cabaña_dulce',
    name: 'Cabaña de Golosinas',
    category: 'sweets',
    icon: '🍬',
    description: 'Cabaña estilo cuento con paredes de waffle, suelo de chocolate negro, tejado de algodón de azúcar rosa y celeste y pilares de caramelo.',
    dimensions: { x: 7, y: 6, z: 7 },
    aliases: ['cabana_dulce', 'candy_cottage', 'casa_dulce', 'casa_caramelo', 'candy_house'],
  },
  {
    id: 'arbol_gigante',
    name: 'Árbol Gigante Milenario',
    category: 'natural',
    icon: '🌳',
    description: 'Gran tronco de roble 2x2 que se alza 13 bloques hacia el cielo, coronado por una inmensa y frondosa copa de hojas esférica.',
    dimensions: { x: 9, y: 14, z: 9 },
    aliases: ['arbol', 'tree', 'giant_tree', 'arbol_roble', 'arbolote'],
  },
  {
    id: 'portal_chocolate',
    name: 'Portal al Mundo de Chocolate',
    category: 'portal',
    icon: '🍫',
    description: 'Portal funcional con marco de chocolate sólido y vórtice de caramelo mágico hacia el reino de los dulces.',
    dimensions: { x: 4, y: 5, z: 2 },
    aliases: ['portal_dulce', 'portal_choc', 'portal_reino_dulce', 'chocolate_portal'],
  },
  {
    id: 'portal_nether',
    name: 'Portal del Nether',
    category: 'portal',
    icon: '🔥',
    description: 'Portal clásico con marco indestructible de obsidiana y núcleo dimensional de fuego púrpura hacia el Inframundo.',
    dimensions: { x: 4, y: 5, z: 2 },
    aliases: ['nether_portal', 'portal_inframundo', 'portal_fuego'],
  },
  {
    id: 'portal_end',
    name: 'Portal del End (Fin)',
    category: 'portal',
    icon: '🌌',
    description: 'Portal horizontal sobre el terreno 5x5 con marcos de bloque purpur, base de obsidiana y estanque estelar hacia el Vacío.',
    dimensions: { x: 5, y: 2, z: 5 },
    aliases: ['end_portal', 'portal_the_end', 'portal_vacio'],
  },
  {
    id: 'portal_parallel',
    name: 'Portal del Mundo Paralelo',
    category: 'portal',
    icon: '🪞',
    description: 'Portal con marco de bloques espejo reflectantes y vórtice dimensional invertido hacia la dimensión reflejada.',
    dimensions: { x: 4, y: 5, z: 2 },
    aliases: ['parallel_portal', 'portal_espejo', 'portal_invertido'],
  },
  {
    id: 'end_city',
    name: 'Ciudad del Fin (End City)',
    category: 'building',
    icon: '🏛️',
    description: 'Impresionante fortaleza del End con torres de bloques purpur, pasadizos flotantes, almenas y salas del tesoro.',
    dimensions: { x: 16, y: 22, z: 16 },
    aliases: ['endcity', 'ciudad_del_fin', 'ciudad_end', 'end_fortress'],
  },
  {
    id: 'barco_end',
    name: 'Barco Flotante del End (End Ship)',
    category: 'building',
    icon: '⛵',
    description: 'Nave espacial flotante de bloques purpur y mástiles. Contiene la cámara del tesoro con las legendarias Élitros (Elytra).',
    dimensions: { x: 8, y: 12, z: 16 },
    aliases: ['end_ship', 'barco_flotante', 'barco_elytra', 'endship'],
  },
];

// Helper to find a structure by ID or alias
export function findStructure(query: string): StructureInfo | undefined {
  const normalized = query.trim().toLowerCase().replace(/[\s\-_]+/g, '_');
  return STRUCTURE_CATALOG.find(
    (s) => s.id === normalized || s.aliases.includes(normalized) || s.name.toLowerCase().includes(query.toLowerCase())
  );
}

// Generate structure at given world coordinates
export function generateStructure(world: VoxelWorld, structId: string, originX: number, originY: number, originZ: number): { success: boolean; info?: StructureInfo; blockCount: number } {
  const struct = findStructure(structId);
  if (!struct) {
    return { success: false, blockCount: 0 };
  }

  let count = 0;
  const setB = (x: number, y: number, z: number, type: BlockType) => {
    world.setBlock(x, y, z, type);
    count++;
  };

  switch (struct.id) {
    // 1. CASA DE MADERA (7x6x7)
    case 'casa_madera': {
      const W = 7;
      const D = 7;
      const H = 4;

      // Base & Floor
      for (let x = 0; x < W; x++) {
        for (let z = 0; z < D; z++) {
          setB(originX + x, originY - 1, originZ + z, BlockType.COBBLESTONE);
          // Clear inside
          for (let y = 0; y < H + 2; y++) {
            setB(originX + x, originY + y, originZ + z, BlockType.AIR);
          }
        }
      }

      // Walls & Corners
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          for (let z = 0; z < D; z++) {
            const isCorner = (x === 0 || x === W - 1) && (z === 0 || z === D - 1);
            const isEdge = x === 0 || x === W - 1 || z === 0 || z === D - 1;
            const isDoor = z === 0 && (x === 3);
            const isWindow = (y === 1 || y === 2) && ((z === 0 && (x === 1 || x === 5)) || (z === D - 1 && (x === 2 || x === 4)) || (x === 0 && z === 3) || (x === W - 1 && z === 3));

            if (isCorner) {
              setB(originX + x, originY + y, originZ + z, BlockType.WOOD_LOG);
            } else if (isDoor) {
              setB(originX + x, originY + y, originZ + z, BlockType.AIR);
            } else if (isWindow) {
              setB(originX + x, originY + y, originZ + z, BlockType.GLASS);
            } else if (isEdge) {
              setB(originX + x, originY + y, originZ + z, BlockType.WOOD_PLANKS);
            }
          }
        }
      }

      // Roof Gable (A dos aguas)
      for (let offset = 0; offset <= 3; offset++) {
        const ry = originY + H + offset;
        for (let z = -1; z <= D; z++) {
          setB(originX + offset, ry, originZ + z, BlockType.WOOD_PLANKS);
          setB(originX + (W - 1 - offset), ry, originZ + z, BlockType.WOOD_PLANKS);
        }
      }

      // Interior Furniture
      setB(originX + 1, originY, originZ + 5, BlockType.BED_RED);
      setB(originX + 1, originY, originZ + 4, BlockType.BED_WHITE);
      setB(originX + 5, originY, originZ + 5, BlockType.CRAFTING_TABLE);
      setB(originX + 5, originY, originZ + 4, BlockType.FURNACE);
      setB(originX + 5, originY, originZ + 3, BlockType.BOOKSHELF);
      setB(originX + 3, originY + H - 1, originZ + 3, BlockType.GLOWSTONE);
      break;
    }

    // 2. TEMPLO DEL DESIERTO (9x7x9)
    case 'templo_desierto': {
      const W = 9;
      const D = 9;

      // Base
      for (let x = 0; x < W; x++) {
        for (let z = 0; z < D; z++) {
          setB(originX + x, originY - 1, originZ + z, BlockType.SANDSTONE);
          for (let y = 0; y < 7; y++) {
            setB(originX + x, originY + y, originZ + z, BlockType.AIR);
          }
        }
      }

      // Outer Sandstone Pyramid stepped
      for (let y = 0; y < 4; y++) {
        for (let x = 0; x < W; x++) {
          for (let z = 0; z < D; z++) {
            const isEdge = x === 0 || x === W - 1 || z === 0 || z === D - 1;
            if (isEdge) {
              setB(originX + x, originY + y, originZ + z, BlockType.SANDSTONE);
            }
          }
        }
      }

      // Front Decorative Towers
      for (let y = 0; y < 6; y++) {
        // Left Tower
        for (let tx = 0; tx <= 2; tx++) {
          for (let tz = 0; tz <= 2; tz++) {
            const isMarker = y === 3 && tx === 1 && tz === 0;
            const isSecondary = y === 2 && tx === 1 && tz === 0;
            const block = isMarker ? BlockType.WOOL_BLUE : isSecondary ? BlockType.WOOL_ORANGE : BlockType.SANDSTONE;
            setB(originX + tx, originY + y, originZ + tz, block);
          }
        }
        // Right Tower
        for (let tx = W - 3; tx < W; tx++) {
          for (let tz = 0; tz <= 2; tz++) {
            const isMarker = y === 3 && tx === W - 2 && tz === 0;
            const isSecondary = y === 2 && tx === W - 2 && tz === 0;
            const block = isMarker ? BlockType.WOOL_BLUE : isSecondary ? BlockType.WOOL_ORANGE : BlockType.SANDSTONE;
            setB(originX + tx, originY + y, originZ + tz, block);
          }
        }
      }

      // Entrance arch
      setB(originX + 4, originY, originZ, BlockType.AIR);
      setB(originX + 4, originY + 1, originZ, BlockType.AIR);

      // Central Pillar with Glowstone
      setB(originX + 4, originY, originZ + 4, BlockType.SANDSTONE);
      setB(originX + 4, originY + 1, originZ + 4, BlockType.GLOWSTONE);

      // Secret Treasure Pit under center
      setB(originX + 4, originY - 2, originZ + 4, BlockType.GOLD_BLOCK);
      setB(originX + 3, originY - 2, originZ + 4, BlockType.DIAMOND_BLOCK);
      setB(originX + 5, originY - 2, originZ + 4, BlockType.TNT);
      setB(originX + 4, originY - 2, originZ + 5, BlockType.TNT);
      break;
    }

    // 3. GARAJE DULCE
    case 'garaje_dulce': {
      world.buildSweetGarage(originX, originY, originZ);
      count += 180;
      break;
    }

    // 4. TORRE VIGÍA MEDIEVAL (5x12x5)
    case 'torre_vigia': {
      const W = 5;
      const H = 12;

      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          for (let z = 0; z < W; z++) {
            const isEdge = x === 0 || x === W - 1 || z === 0 || z === W - 1;
            const isDoor = y < 2 && z === 0 && x === 2;

            if (isDoor) {
              setB(originX + x, originY + y, originZ + z, BlockType.AIR);
            } else if (isEdge) {
              const blk = (x + y + z) % 3 === 0 ? BlockType.STONE : BlockType.COBBLESTONE;
              setB(originX + x, originY + y, originZ + z, blk);
            } else {
              // Inside: air, floors at intervals
              if (y === 0 || y === 4 || y === 8 || y === H - 2) {
                setB(originX + x, originY + y, originZ + z, BlockType.WOOD_PLANKS);
              } else {
                setB(originX + x, originY + y, originZ + z, BlockType.AIR);
              }
            }
          }
        }
      }

      // Battlements / Almenas at the top
      for (let x = 0; x < W; x++) {
        for (let z = 0; z < W; z++) {
          const isEdge = x === 0 || x === W - 1 || z === 0 || z === W - 1;
          const isCorner = (x === 0 || x === W - 1) && (z === 0 || z === W - 1);
          const isEmbrasure = (x === 2 && (z === 0 || z === W - 1)) || (z === 2 && (x === 0 || x === W - 1));

          if (isCorner || (isEdge && !isEmbrasure)) {
            setB(originX + x, originY + H, originZ + z, BlockType.COBBLESTONE);
          }
        }
      }

      // Center glowing beacon
      setB(originX + 2, originY + H - 1, originZ + 2, BlockType.GLOWSTONE);
      break;
    }

    // 5. FUENTE MONUMENTAL DE AGUA (7x5x7)
    case 'fuente_agua': {
      const R = 3;
      const cx = originX + 3;
      const cz = originZ + 3;

      // Base basin
      for (let dx = -R; dx <= R; dx++) {
        for (let dz = -R; dz <= R; dz++) {
          const dist = Math.sqrt(dx * dx + dz * dz);
          const x = cx + dx;
          const z = cz + dz;

          if (dist <= R + 0.5) {
            setB(x, originY - 1, z, BlockType.STONE);
            if (dist >= R - 0.4) {
              // Border wall
              setB(x, originY, z, BlockType.BRICKS);
            } else {
              // Water pool
              setB(x, originY, z, BlockType.WATER);
            }
          }
        }
      }

      // Center Spire
      for (let y = 0; y <= 4; y++) {
        if (y === 3) {
          setB(cx, originY + y, cz, BlockType.GLOWSTONE);
        } else if (y === 4) {
          setB(cx, originY + y, cz, BlockType.WATER);
        } else {
          setB(cx, originY + y, cz, BlockType.STONE);
        }
      }
      break;
    }

    // 6. CABAÑA DE GOLOSINAS (7x6x7)
    case 'cabaña_dulce': {
      const W = 7;
      const D = 7;
      const H = 4;

      // Foundation & interior
      for (let x = 0; x < W; x++) {
        for (let z = 0; z < D; z++) {
          setB(originX + x, originY - 1, originZ + z, BlockType.DARK_CHOCOLATE);
          for (let y = 0; y < H + 2; y++) {
            setB(originX + x, originY + y, originZ + z, BlockType.AIR);
          }
        }
      }

      // Walls
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          for (let z = 0; z < D; z++) {
            const isCorner = (x === 0 || x === W - 1) && (z === 0 || z === D - 1);
            const isEdge = x === 0 || x === W - 1 || z === 0 || z === D - 1;
            const isDoor = z === 0 && x === 3;
            const isWindow = (y === 1 || y === 2) && ((z === 0 && (x === 1 || x === 5)) || (z === D - 1 && x === 3));

            if (isCorner) {
              setB(originX + x, originY + y, originZ + z, BlockType.CANDY_CANE_BLOCK);
            } else if (isDoor) {
              setB(originX + x, originY + y, originZ + z, BlockType.AIR);
            } else if (isWindow) {
              setB(originX + x, originY + y, originZ + z, BlockType.WHITE_CHOCOLATE);
            } else if (isEdge) {
              setB(originX + x, originY + y, originZ + z, BlockType.WAFFLE_BLOCK);
            }
          }
        }
      }

      // Cotton Candy Roof
      for (let offset = 0; offset <= 3; offset++) {
        const ry = originY + H + offset;
        const roofBlock = offset % 2 === 0 ? BlockType.COTTON_CANDY_PINK : BlockType.COTTON_CANDY_BLUE;
        for (let z = -1; z <= D; z++) {
          setB(originX + offset, ry, originZ + z, roofBlock);
          setB(originX + (W - 1 - offset), ry, originZ + z, roofBlock);
        }
      }

      // Sugar ore & Glowstone chandelier
      setB(originX + 3, originY + H - 1, originZ + 3, BlockType.GLOWSTONE);
      setB(originX + 1, originY, originZ + 5, BlockType.BED_RED);
      setB(originX + 5, originY, originZ + 5, BlockType.SUGAR_ORE);
      break;
    }

    // 7. ÁRBOL GIGANTE (9x14x9)
    case 'arbol_gigante': {
      const cx = originX + 4;
      const cz = originZ + 4;
      const trunkH = 10;

      // 2x2 Trunk
      for (let y = 0; y < trunkH; y++) {
        setB(cx, originY + y, cz, BlockType.WOOD_LOG);
        setB(cx + 1, originY + y, cz, BlockType.WOOD_LOG);
        setB(cx, originY + y, cz + 1, BlockType.WOOD_LOG);
        setB(cx + 1, originY + y, cz + 1, BlockType.WOOD_LOG);
      }

      // Roots flare
      setB(cx - 1, originY, cz, BlockType.WOOD_LOG);
      setB(cx + 2, originY, cz, BlockType.WOOD_LOG);
      setB(cx, originY, cz - 1, BlockType.WOOD_LOG);
      setB(cx, originY, cz + 2, BlockType.WOOD_LOG);

      // Spherical canopy
      const canopyCenterY = originY + trunkH;
      const R = 4;
      for (let dx = -R; dx <= R; dx++) {
        for (let dy = -R; dy <= R; dy++) {
          for (let dz = -R; dz <= R; dz++) {
            const dist = Math.sqrt(dx * dx + dy * dy * 1.3 + dz * dz);
            if (dist <= R + 0.4) {
              const lx = cx + dx;
              const ly = canopyCenterY + dy;
              const lz = cz + dz;
              // Don't overwrite trunk center
              if (!(dx >= 0 && dx <= 1 && dz >= 0 && dz <= 1 && dy <= 0)) {
                setB(lx, ly, lz, BlockType.LEAVES);
              }
            }
          }
        }
      }

      // Hidden glowstone in foliage
      setB(cx, canopyCenterY - 1, cz, BlockType.GLOWSTONE);
      setB(cx + 1, canopyCenterY - 1, cz + 1, BlockType.GLOWSTONE);
      break;
    }

    // 8. PORTAL DE CHOCOLATE
    case 'portal_chocolate': {
      world.buildPortalStructure(originX, originY, originZ, 'chocolate', 'x');
      count += 20;
      break;
    }

    // 9. PORTAL DEL NETHER
    case 'portal_nether': {
      world.buildPortalStructure(originX, originY, originZ, 'nether', 'x');
      count += 20;
      break;
    }

    // 10. PORTAL DEL END
    case 'portal_end': {
      world.buildPortalStructure(originX, originY, originZ, 'the_end', 'x');
      count += 25;
      break;
    }

    // 11. PORTAL DEL MUNDO PARALELO
    case 'portal_parallel': {
      world.buildPortalStructure(originX, originY, originZ, 'parallel', 'x');
      count += 20;
      break;
    }

    // 12. END CITY (Ciudad del Fin)
    case 'end_city': {
      const cityRes = buildEndCity(world, originX, originY, originZ, false);
      count += cityRes.blockCount;
      break;
    }

    // 13. BARCO FLOTANTE DEL END (End Ship con Élitros)
    case 'barco_end': {
      const shipRes = buildEndShip(world, originX, originY + 4, originZ);
      count += shipRes.blockCount;
      break;
    }

    default:
      return { success: false, blockCount: 0 };
  }

  return { success: true, info: struct, blockCount: count };
}

// Build an End City structure
export function buildEndCity(
  world: VoxelWorld,
  originX: number,
  originY: number,
  originZ: number,
  hasShip: boolean = false
): { blockCount: number; shipPos?: { x: number; y: number; z: number }; elytraPos?: { x: number; y: number; z: number } } {
  let count = 0;
  const setB = (x: number, y: number, z: number, b: BlockType) => {
    world.setBlock(x, y, z, b);
    count++;
  };

  const W = 7;
  const H = 16;

  // 1. Main End City Tower
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      for (let z = 0; z < W; z++) {
        const isEdge = x === 0 || x === W - 1 || z === 0 || z === W - 1;
        const isCorner = (x === 0 || x === W - 1) && (z === 0 || z === W - 1);
        const isDoor = y < 3 && z === 0 && (x === 2 || x === 3 || x === 4);

        if (isDoor) {
          setB(originX + x, originY + y, originZ + z, BlockType.AIR);
        } else if (isCorner) {
          setB(originX + x, originY + y, originZ + z, BlockType.OBSIDIAN);
        } else if (isEdge) {
          // Windows on alternating floors
          const isWindow = (y === 3 || y === 8 || y === 13) && (x === 3 || z === 3);
          if (isWindow) {
            setB(originX + x, originY + y, originZ + z, BlockType.GLASS);
          } else {
            setB(originX + x, originY + y, originZ + z, BlockType.PURPUR_BLOCK);
          }
        } else {
          // Interior floors
          if (y === 0 || y === 5 || y === 10 || y === 15) {
            setB(originX + x, originY + y, originZ + z, BlockType.END_STONE);
          } else {
            setB(originX + x, originY + y, originZ + z, BlockType.AIR);
          }
        }
      }
    }
  }

  // Battlements on Main Tower roof
  for (let x = 0; x < W; x++) {
    for (let z = 0; z < W; z++) {
      const isEdge = x === 0 || x === W - 1 || z === 0 || z === W - 1;
      const isCorner = (x === 0 || x === W - 1) && (z === 0 || z === W - 1);
      const isCenter = x === 3 && z === 3;

      if (isCorner || (isEdge && (x % 2 === 0 || z % 2 === 0))) {
        setB(originX + x, originY + H, originZ + z, BlockType.PURPUR_BLOCK);
      }
      if (isCenter) {
        // Beacon on top
        setB(originX + x, originY + H, originZ + z, BlockType.GLOWSTONE);
      }
    }
  }

  // Treasure room on 2nd floor (y = 11)
  setB(originX + 3, originY + 11, originZ + 3, BlockType.DIAMOND_BLOCK);
  setB(originX + 2, originY + 11, originZ + 3, BlockType.EMERALD_BLOCK);
  setB(originX + 4, originY + 11, originZ + 3, BlockType.GOLD_BLOCK);
  setB(originX + 3, originY + 12, originZ + 3, BlockType.GLOWSTONE);

  // 2. High Skybridge connecting to Secondary Tower
  const bridgeY = originY + 7;
  for (let bx = W - 1; bx < W + 5; bx++) {
    for (let bz = 2; bz <= 4; bz++) {
      setB(originX + bx, bridgeY, originZ + bz, BlockType.PURPUR_BLOCK);
      setB(originX + bx, bridgeY + 1, originZ + bz, BlockType.AIR);
      setB(originX + bx, bridgeY + 2, originZ + bz, BlockType.AIR);

      // Bridge railings
      if (bz === 2 || bz === 4) {
        setB(originX + bx, bridgeY + 1, originZ + bz, BlockType.PURPUR_BLOCK);
      }
    }
  }

  // 3. Secondary Wing Tower (5x5, height 12)
  const twX = originX + W + 5;
  const twZ = originZ + 1;
  const twW = 5;
  const twH = 12;

  for (let y = 0; y < twH; y++) {
    for (let x = 0; x < twW; x++) {
      for (let z = 0; z < twW; z++) {
        const isEdge = x === 0 || x === twW - 1 || z === 0 || z === twW - 1;
        const isBridgeEntrance = x === 0 && (z === 1 || z === 2 || z === 3) && y >= bridgeY - originY && y <= bridgeY - originY + 2;

        if (isBridgeEntrance) {
          setB(twX + x, originY + y, twZ + z, BlockType.AIR);
        } else if (isEdge) {
          setB(twX + x, originY + y, twZ + z, BlockType.PURPUR_BLOCK);
        } else {
          if (y === 0 || y === bridgeY - originY || y === twH - 1) {
            setB(twX + x, originY + y, twZ + z, BlockType.END_STONE);
          } else {
            setB(twX + x, originY + y, twZ + z, BlockType.AIR);
          }
        }
      }
    }
  }

  // Secondary Tower Roof Spire
  setB(twX + 2, originY + twH, twZ + 2, BlockType.GLOWSTONE);
  setB(twX + 2, originY + twH + 1, twZ + 2, BlockType.PURPUR_BLOCK);

  // 4. If hasShip: Generate Floating End Ship moored nearby
  let shipPos: { x: number; y: number; z: number } | undefined;
  let elytraPos: { x: number; y: number; z: number } | undefined;

  if (hasShip) {
    const shipOriginX = originX + W + 8;
    const shipOriginY = originY + 10;
    const shipOriginZ = originZ - 2;

    const shipRes = buildEndShip(world, shipOriginX, shipOriginY, shipOriginZ);
    count += shipRes.blockCount;
    shipPos = { x: shipOriginX, y: shipOriginY, z: shipOriginZ };
    elytraPos = shipRes.elytraPos;
  }

  return { blockCount: count, shipPos, elytraPos };
}

// Build a Floating End Ship (Barco Flotante del End)
export function buildEndShip(
  world: VoxelWorld,
  originX: number,
  originY: number,
  originZ: number
): { blockCount: number; elytraPos: { x: number; y: number; z: number } } {
  let count = 0;
  const setB = (x: number, y: number, z: number, b: BlockType) => {
    world.setBlock(x, y, z, b);
    count++;
  };

  const L = 14; // Length along Z
  const W = 6;  // Width along X
  const H = 6;  // Hull height

  // 1. Ship Hull (Curved boat bottom and sides)
  for (let z = 0; z < L; z++) {
    const isProw = z <= 2;     // Front bow / prow
    const isStern = z >= L - 3; // Rear stern
    const currentW = isProw ? Math.max(2, W - (3 - z) * 2) : W;

    const offsetX = Math.floor((W - currentW) / 2);

    for (let x = 0; x < currentW; x++) {
      const worldX = originX + offsetX + x;
      const worldZ = originZ + z;

      // Keel (bottom of boat)
      setB(worldX, originY, worldZ, BlockType.PURPUR_BLOCK);

      // Lower Hull
      for (let y = 1; y <= 2; y++) {
        const isWall = x === 0 || x === currentW - 1 || z === 0 || z === L - 1;
        if (isWall) {
          setB(worldX, originY + y, worldZ, BlockType.PURPUR_BLOCK);
        } else {
          setB(worldX, originY + y, worldZ, BlockType.AIR);
        }
      }

      // Deck Floor at y = 3
      setB(worldX, originY + 3, worldZ, BlockType.WOOD_PLANKS);

      // Deck Railings at y = 4
      const isRailing = (x === 0 || x === currentW - 1) && !isStern;
      if (isRailing) {
        setB(worldX, originY + 4, worldZ, BlockType.PURPUR_BLOCK);
      } else {
        setB(worldX, originY + 4, worldZ, BlockType.AIR);
      }
    }
  }

  // 2. Dragon Figurehead at Bow (Z = -1)
  const prowX = originX + Math.floor(W / 2);
  setB(prowX, originY + 2, originZ - 1, BlockType.OBSIDIAN);
  setB(prowX, originY + 3, originZ - 1, BlockType.OBSIDIAN);
  setB(prowX, originY + 3, originZ - 2, BlockType.OBSIDIAN); // Snout
  setB(prowX - 1, originY + 4, originZ - 1, BlockType.GLOWSTONE); // Left Eye
  setB(prowX + 1, originY + 4, originZ - 1, BlockType.GLOWSTONE); // Right Eye

  // 3. Main Mast with Crossyard Sail at Z = 5
  const mastX = originX + Math.floor(W / 2);
  const mastZ = originZ + 5;
  for (let y = 4; y <= 11; y++) {
    setB(mastX, originY + y, mastZ, BlockType.WOOD_LOG);
  }
  // Crossbeam yard
  for (let dx = -2; dx <= 2; dx++) {
    setB(mastX + dx, originY + 9, mastZ, BlockType.WOOD_PLANKS);
    setB(mastX + dx, originY + 8, mastZ, BlockType.WOOL_WHITE);
  }
  // Crow's nest on mast
  setB(mastX, originY + 12, mastZ, BlockType.GLOWSTONE);

  // 4. Stern Castle / Captain's Treasure Cabin (Z = 9 to 13)
  for (let z = 9; z <= 13; z++) {
    for (let x = 0; x < W; x++) {
      for (let y = 4; y <= 7; y++) {
        const isWall = x === 0 || x === W - 1 || z === 9 || z === 13;
        const isDoor = z === 9 && (x === 2 || x === 3) && (y === 4 || y === 5);
        const isRoof = y === 7;

        if (isDoor) {
          setB(originX + x, originY + y, originZ + z, BlockType.AIR);
        } else if (isRoof) {
          setB(originX + x, originY + y, originZ + z, BlockType.PURPUR_BLOCK);
        } else if (isWall) {
          if ((x === 0 || x === W - 1) && z === 11 && y === 5) {
            setB(originX + x, originY + y, originZ + z, BlockType.GLASS); // Cabin windows
          } else {
            setB(originX + x, originY + y, originZ + z, BlockType.PURPUR_BLOCK);
          }
        } else {
          setB(originX + x, originY + y, originZ + z, BlockType.AIR);
        }
      }
    }
  }

  // 5. Elytra Pedestal in Captain's Treasure Room (at X: originX + 3, Z: originZ + 11)
  const pedestalX = originX + 3;
  const pedestalY = originY + 4;
  const pedestalZ = originZ + 11;

  setB(pedestalX, pedestalY, pedestalZ, BlockType.GOLD_BLOCK);
  setB(pedestalX - 1, pedestalY, pedestalZ, BlockType.DIAMOND_BLOCK);
  setB(pedestalX + 1, pedestalY, pedestalZ, BlockType.EMERALD_BLOCK);
  setB(pedestalX, pedestalY + 3, pedestalZ, BlockType.GLOWSTONE); // Ceiling lantern

  // Location for Elytra pickup
  const elytraPos = { x: pedestalX, y: pedestalY + 1, z: pedestalZ };

  return { blockCount: count, elytraPos };
}
