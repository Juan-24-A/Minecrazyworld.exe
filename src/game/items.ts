import { BlockType, InventoryItem } from '../types';

export const INVENTORY_CATALOG: InventoryItem[] = [
  // Natural Blocks
  { id: 'grass', name: 'Bloque de Césped', category: 'natural', isBlock: true, blockType: BlockType.GRASS, iconColor: '#5b8c32', description: 'El bloque vegetal clásico de la superficie.' },
  { id: 'dirt', name: 'Tierra', category: 'natural', isBlock: true, blockType: BlockType.DIRT, iconColor: '#7a5130', description: 'Tierra fértil para cultivar y construir.' },
  { id: 'sand', name: 'Arena', category: 'natural', isBlock: true, blockType: BlockType.SAND, iconColor: '#dbcd8c', description: 'Arena suave de playas y desiertos.' },
  { id: 'sandstone', name: 'Arenisca', category: 'natural', isBlock: true, blockType: BlockType.SANDSTONE, iconColor: '#d6be78', description: 'Bloque sólido tallado en arena.' },
  { id: 'wood_log', name: 'Tronco de Roble', category: 'natural', isBlock: true, blockType: BlockType.WOOD_LOG, iconColor: '#6e4f30', description: 'Madera pura de árboles.' },
  { id: 'leaves', name: 'Hojas de Roble', category: 'natural', isBlock: true, blockType: BlockType.LEAVES, iconColor: '#3d7829', description: 'Follaje verde de árbol.' },
  { id: 'water', name: 'Agua', category: 'natural', isBlock: true, blockType: BlockType.WATER, iconColor: '#306fb8', description: 'Bloque de agua translúcida.' },
  { id: 'lava', name: 'Lava', category: 'natural', isBlock: true, blockType: BlockType.LAVA, iconColor: '#d94b14', description: 'Magma fundido e incandescente.' },
  { id: 'pumpkin', name: 'Calabaza', category: 'natural', isBlock: true, blockType: BlockType.PUMPKIN, iconColor: '#d67418', description: 'Calabaza silvestre tallable.' },

  // Building Blocks
  { id: 'stone', name: 'Piedra', category: 'building', isBlock: true, blockType: BlockType.STONE, iconColor: '#7a7a7a', description: 'Roca lisa y resistente subterránea.' },
  { id: 'cobblestone', name: 'Adoquín (Cobblestone)', category: 'building', isBlock: true, blockType: BlockType.COBBLESTONE, iconColor: '#636363', description: 'Piedra picada para fortalezas y castillos.' },
  { id: 'wood_planks', name: 'Tablas de Madera', category: 'building', isBlock: true, blockType: BlockType.WOOD_PLANKS, iconColor: '#9e7344', description: 'Madera refinada para casas y muebles.' },
  { id: 'bricks', name: 'Ladrillos', category: 'building', isBlock: true, blockType: BlockType.BRICKS, iconColor: '#964335', description: 'Ladrillos de arcilla horneada.' },
  { id: 'glass', name: 'Cristal / Vidrio', category: 'building', isBlock: true, blockType: BlockType.GLASS, iconColor: '#c4e3f3', description: 'Bloque transparente de vidrio.' },
  { id: 'bedrock', name: 'Roca Madre (Bedrock)', category: 'building', isBlock: true, blockType: BlockType.BEDROCK, iconColor: '#2b2b2b', description: 'Indestructible en modo supervivencia.' },
  { id: 'obsidian', name: 'Obsidiana', category: 'building', isBlock: true, blockType: BlockType.OBSIDIAN, iconColor: '#1d1729', description: 'Vidrio volcánico ultra resistente.' },
  { id: 'netherrack', name: 'Netherrack', category: 'building', isBlock: true, blockType: BlockType.NETHERRACK, iconColor: '#6e1919', description: 'Roca ardiente del inframundo.' },
  { id: 'end_stone', name: 'Piedra del End', category: 'building', isBlock: true, blockType: BlockType.END_STONE, iconColor: '#e0dfb4', description: 'Roca mística de dimensiones lejanas.' },

  // Minerals & Ores
  { id: 'diamond_block', name: 'Bloque de Diamante', category: 'minerals', isBlock: true, blockType: BlockType.DIAMOND_BLOCK, iconColor: '#5fe0db', description: 'Bloque sólido del mineral más valioso.' },
  { id: 'gold_block', name: 'Bloque de Oro', category: 'minerals', isBlock: true, blockType: BlockType.GOLD_BLOCK, iconColor: '#f7d33b', description: 'Bloque de oro puro brillante.' },
  { id: 'emerald_block', name: 'Bloque de Esmeralda', category: 'minerals', isBlock: true, blockType: BlockType.EMERALD_BLOCK, iconColor: '#2fd16a', description: 'Gema verde de gran valor.' },
  { id: 'iron_block', name: 'Bloque de Hierro', category: 'minerals', isBlock: true, blockType: BlockType.IRON_BLOCK, iconColor: '#dedede', description: 'Hierro puro forjado.' },
  { id: 'redstone_block', name: 'Bloque de Redstone', category: 'minerals', isBlock: true, blockType: BlockType.REDSTONE_BLOCK, iconColor: '#c91616', description: 'Fuente de energía y circuitos.' },
  { id: 'coal_ore', name: 'Mineral de Carbón', category: 'minerals', isBlock: true, blockType: BlockType.COAL_ORE, iconColor: '#444444', description: 'Combustible esencial en piedra.' },
  { id: 'iron_ore', name: 'Mineral de Hierro', category: 'minerals', isBlock: true, blockType: BlockType.IRON_ORE, iconColor: '#bfa08c', description: 'Vetas de hierro listas para fundir.' },
  { id: 'gold_ore', name: 'Mineral de Oro', category: 'minerals', isBlock: true, blockType: BlockType.GOLD_ORE, iconColor: '#d6ba58', description: 'Vetas de oro en roca.' },
  { id: 'diamond_ore', name: 'Mineral de Diamante', category: 'minerals', isBlock: true, blockType: BlockType.DIAMOND_ORE, iconColor: '#63cfc6', description: 'El mineral más codiciado bajo tierra.' },

  // Decor & Utility
  { id: 'bed_red', name: 'Cama Roja', category: 'decor', isBlock: true, blockType: BlockType.BED_RED, iconColor: '#c92a2a', description: '¡Establece tu punto de reaparición y salta la noche al dormir!' },
  { id: 'bed_blue', name: 'Cama Azul', category: 'decor', isBlock: true, blockType: BlockType.BED_BLUE, iconColor: '#2b6cb0', description: 'Cama de lana azul para descansar plácidamente.' },
  { id: 'bed_white', name: 'Cama Blanca', category: 'decor', isBlock: true, blockType: BlockType.BED_WHITE, iconColor: '#e2e8f0', description: 'Cama blanca clásica para fijar tu spawn.' },
  { id: 'bed_green', name: 'Cama Verde', category: 'decor', isBlock: true, blockType: BlockType.BED_GREEN, iconColor: '#2f855a', description: 'Cama de lana verde para pasar la noche.' },
  { id: 'portal_chocolate', name: 'Portal de Chocolate', category: 'decor', isBlock: true, blockType: BlockType.PORTAL_CHOCOLATE, iconColor: '#8a4b27', description: '¡Entra en el vórtice dulce para viajar a la Dimensión de Chocolate!' },
  { id: 'portal_nether', name: 'Portal del Nether', category: 'decor', isBlock: true, blockType: BlockType.PORTAL_NETHER, iconColor: '#9333ea', description: 'Portal dimensional al inframundo del Nether.' },
  { id: 'portal_end', name: 'Portal del End', category: 'decor', isBlock: true, blockType: BlockType.PORTAL_END, iconColor: '#097969', description: 'Portal al vacío estelar del End.' },
  { id: 'tnt', name: 'Dinamita TNT', category: 'decor', isBlock: true, blockType: BlockType.TNT, iconColor: '#c43333', description: '¡Explota al ser golpeada o activada!' },
  { id: 'glowstone', name: 'Piedra Luminosa (Glowstone)', category: 'decor', isBlock: true, blockType: BlockType.GLOWSTONE, iconColor: '#f5d769', description: 'Emite luz cálida en la oscuridad.' },
  { id: 'bookshelf', name: 'Librería', category: 'decor', isBlock: true, blockType: BlockType.BOOKSHELF, iconColor: '#8a6538', description: 'Estantes llenos de libros de magia.' },
  { id: 'crafting_table', name: 'Mesa de Crafteo', category: 'decor', isBlock: true, blockType: BlockType.CRAFTING_TABLE, iconColor: '#8c5d2b', description: 'Crea herramientas y armaduras.' },
  { id: 'furnace', name: 'Horno', category: 'decor', isBlock: true, blockType: BlockType.FURNACE, iconColor: '#545454', description: 'Funde minerales y cocina alimentos.' },
  { id: 'command_block', name: 'Bloque de Trucos (Comandos)', category: 'admin', isBlock: true, blockType: BlockType.COMMAND_BLOCK, iconColor: '#d97706', description: '¡Bloque de Trucos interactivo! Haz clic derecho para programar y ejecutar comandos de trampas y poderes.' },
  { id: 'structure_block', name: 'Bloque de Estructuras', category: 'admin', isBlock: true, blockType: BlockType.STRUCTURE_BLOCK, iconColor: '#0891b2', description: '¡Bloque de Estructuras! Haz clic derecho para cargar y generar casas, templos, garajes y portales.' },
  { id: 'barrier_block', name: '🚫 Barrera Invisible (Barrier)', category: 'admin', isBlock: true, blockType: BlockType.BARRIER, iconColor: '#ef4444', description: 'Bloque sólido invisible para administradores. Crea límites y muros infranqueables.' },

  // Administrator Tools & Master Gadgets
  { id: 'admin_sword', name: '⚔️ Espada del Creador (Admin God Blade)', category: 'admin', isBlock: false, itemType: 'admin_sword', iconColor: '#dc2626', description: '¡Elimina de un solo golpe (9999 de daño) a cualquier mob o jefe (incluida la Dragona de Ender) con rayos cósmicos!' },
  { id: 'admin_teleport_wand', name: '⚡ Brújula de Teletransporte Instantáneo', category: 'admin', isBlock: false, itemType: 'admin_teleport_wand', iconColor: '#a855f7', description: 'Haz clic derecho hacia cualquier bloque visible (hasta 120 bloques) para teletransportarte de inmediato allí.' },
  { id: 'admin_wand', name: '🪄 Vara de Control de Administrador (Debug Stick)', category: 'admin', isBlock: false, itemType: 'admin_wand', iconColor: '#06b6d4', description: 'Haz clic derecho sobre cualquier bloque para inspeccionar coordenadas, tipo y bioma. ¡Shift+Clic para transformarlo!' },
  { id: 'admin_kill_wand', name: '💀 Aniquilador de Entidades (Kill Wand)', category: 'admin', isBlock: false, itemType: 'admin_kill_wand', iconColor: '#f43f5e', description: 'Haz clic derecho para desvanecer instantáneamente a todas las criaturas y mobs en un radio de 50 bloques.' },
  { id: 'admin_nuke_wand', name: '💥 Detonador Táctico Admin (Nuke Wand)', category: 'admin', isBlock: false, itemType: 'admin_nuke_wand', iconColor: '#ea580c', description: 'Haz clic derecho para desatar una explosión nuclear táctica con efectos de choque y fuegos pirotécnicos.' },
  { id: 'admin_totem', name: '🌟 Tótem del Administrador Supremo', category: 'admin', isBlock: false, itemType: 'admin_totem', iconColor: '#fbbf24', description: 'Haz clic derecho para activar el Modo Dios (Godmode), Vuelo libre, restaurar 100% de vida y súper velocidad.' },
  { id: 'admin_weather_wand', name: '☀️ Controlador de Tiempo y Clima', category: 'admin', isBlock: false, itemType: 'admin_weather_wand', iconColor: '#38bdf8', description: 'Haz clic derecho para alternar entre Día y Noche o cambiar el clima entre Despejado, Lluvia y Tormenta.' },

  // Sweets & Chocolate Dimension
  { id: 'chocolate_block', name: 'Bloque de Chocolate', category: 'sweets', isBlock: true, blockType: BlockType.CHOCOLATE_BLOCK, iconColor: '#6d3918', description: 'Chocolate con leche puro. ¡Construye un marco de portal con este bloque!' },
  { id: 'dark_chocolate', name: 'Chocolate Negro Puro', category: 'sweets', isBlock: true, blockType: BlockType.DARK_CHOCOLATE, iconColor: '#3d1d0c', description: 'Chocolate amargo ultra resistente para marcos de portal.' },
  { id: 'white_chocolate', name: 'Chocolate Blanco Dulce', category: 'sweets', isBlock: true, blockType: BlockType.WHITE_CHOCOLATE, iconColor: '#f7ebd2', description: 'Cremoso y dulce bloque de chocolate blanco.' },
  { id: 'liquid_chocolate', name: 'Chocolate Líquido', category: 'sweets', isBlock: true, blockType: BlockType.LIQUID_CHOCOLATE, iconColor: '#522b14', description: 'Sirope de chocolate caliente espeso y delicioso.' },
  { id: 'cookie_block', name: 'Bloque de Galleta', category: 'sweets', isBlock: true, blockType: BlockType.COOKIE_BLOCK, iconColor: '#d49b4b', description: 'Galleta crocante con chispas de chocolate.' },
  { id: 'caramel_stone', name: 'Piedra de Caramelo', category: 'sweets', isBlock: true, blockType: BlockType.CARAMEL_STONE, iconColor: '#b86d1d', description: 'Roca cristalizada de azúcar tostada.' },
  { id: 'waffle_block', name: 'Bloque de Barquillo / Waffle', category: 'sweets', isBlock: true, blockType: BlockType.WAFFLE_BLOCK, iconColor: '#c98a3e', description: 'Crujiente waffle artesanal para troncos de árboles dulces.' },
  { id: 'cotton_candy_pink', name: 'Algodón de Azúcar Rosa', category: 'sweets', isBlock: true, blockType: BlockType.COTTON_CANDY_PINK, iconColor: '#f472b6', description: 'Nube esponjosa de azúcar sabor fresa.' },
  { id: 'cotton_candy_blue', name: 'Algodón de Azúcar Celeste', category: 'sweets', isBlock: true, blockType: BlockType.COTTON_CANDY_BLUE, iconColor: '#60a5fa', description: 'Nube dulce sabor mora azul.' },
  { id: 'candy_cane_block', name: 'Bastón de Caramelo', category: 'sweets', isBlock: true, blockType: BlockType.CANDY_CANE_BLOCK, iconColor: '#ef4444', description: 'Rayas blancas y rojas sabor menta.' },
  { id: 'sugar_ore', name: 'Mineral de Azúcar Cristalina', category: 'sweets', isBlock: true, blockType: BlockType.SUGAR_ORE, iconColor: '#e0f2fe', description: 'Cristales de azúcar brillante en roca dulce.' },
  { id: 'purpur_block', name: 'Bloque de Púrpura', category: 'building', isBlock: true, blockType: BlockType.PURPUR_BLOCK, iconColor: '#a855f7', description: 'Bloque de las ciudades del End.' },
  { id: 'soul_sand', name: 'Arena de Almas', category: 'natural', isBlock: true, blockType: BlockType.SOUL_SAND, iconColor: '#574133', description: 'Arena oscura del Nether.' },
  { id: 'nether_bricks', name: 'Ladrillos del Nether', category: 'building', isBlock: true, blockType: BlockType.NETHER_BRICKS, iconColor: '#451111', description: 'Fortaleza del inframundo.' },
  { id: 'quartz_ore', name: 'Mineral de Cuarzo', category: 'minerals', isBlock: true, blockType: BlockType.QUARTZ_ORE, iconColor: '#f1f5f9', description: 'Cristales de cuarzo del Nether.' },

  // Parallel Overworld / Inverted Dimension Items
  { id: 'parallel_mirror_block', name: 'Bloque de Espejo Paralelo', category: 'building', isBlock: true, blockType: BlockType.PARALLEL_MIRROR_BLOCK, iconColor: '#00e5ff', description: 'Marco reflectante para crear el Portal al Overworld Paralelo.' },
  { id: 'parallel_grass', name: 'Césped Invertido', category: 'natural', isBlock: true, blockType: BlockType.PARALLEL_GRASS, iconColor: '#ff2ad4', description: 'Césped magenta brillante del Overworld Paralelo.' },
  { id: 'parallel_dirt', name: 'Tierra Invertida', category: 'natural', isBlock: true, blockType: BlockType.PARALLEL_DIRT, iconColor: '#0ea5e9', description: 'Tierra azul cian del mundo espejo.' },
  { id: 'parallel_stone', name: 'Piedra Invertida', category: 'natural', isBlock: true, blockType: BlockType.PARALLEL_STONE, iconColor: '#a21caf', description: 'Roca negativa con vetas fluorescentes.' },
  { id: 'parallel_wood', name: 'Tronco Espejo Invertido', category: 'natural', isBlock: true, blockType: BlockType.PARALLEL_WOOD, iconColor: '#38bdf8', description: 'Madera luminosa de árboles invertidos.' },
  { id: 'parallel_leaves', name: 'Hojas Invertidas', category: 'natural', isBlock: true, blockType: BlockType.PARALLEL_LEAVES, iconColor: '#ec4899', description: 'Follaje fluorescente rosa-violeta.' },
  { id: 'parallel_sand', name: 'Arena Cósmica Invertida', category: 'natural', isBlock: true, blockType: BlockType.PARALLEL_SAND, iconColor: '#312e81', description: 'Arena oscura azul índigo.' },
  { id: 'mirror_shard', name: 'Fragmento de Espejo Paralelo', category: 'tools', isBlock: false, itemType: 'mirror_shard', iconColor: '#67e8f9', description: '¡Haz clic en un marco de Espejo Paralelo para abrir el Portal al Overworld Paralelo!' },

  // Wool & Colors
  { id: 'wool_white', name: 'Lana Blanca', category: 'wool', isBlock: true, blockType: BlockType.WOOL_WHITE, iconColor: '#e0e0e0', description: 'Lana suave de oveja blanca.' },
  { id: 'wool_red', name: 'Lana Roja', category: 'wool', isBlock: true, blockType: BlockType.WOOL_RED, iconColor: '#b52b2b', description: 'Lana teñida de rojo carmesí.' },
  { id: 'wool_blue', name: 'Lana Azul', category: 'wool', isBlock: true, blockType: BlockType.WOOL_BLUE, iconColor: '#3258c7', description: 'Lana teñida de azul zafiro.' },
  { id: 'wool_green', name: 'Lana Verde', category: 'wool', isBlock: true, blockType: BlockType.WOOL_GREEN, iconColor: '#3c962f', description: 'Lana teñida de verde esmeralda.' },
  { id: 'wool_yellow', name: 'Lana Amarilla', category: 'wool', isBlock: true, blockType: BlockType.WOOL_YELLOW, iconColor: '#e3c629', description: 'Lana teñida de amarillo oro.' },
  { id: 'wool_black', name: 'Lana Negra', category: 'wool', isBlock: true, blockType: BlockType.WOOL_BLACK, iconColor: '#212121', description: 'Lana teñida de negro azabache.' },
  { id: 'wool_pink', name: 'Lana Rosa', category: 'wool', isBlock: true, blockType: BlockType.WOOL_PINK, iconColor: '#e87db0', description: 'Lana teñida de rosa pastel.' },
  { id: 'wool_purple', name: 'Lana Púrpura', category: 'wool', isBlock: true, blockType: BlockType.WOOL_PURPLE, iconColor: '#7b2bb5', description: 'Lana teñida de púrpura real.' },
  { id: 'wool_orange', name: 'Lana Naranja', category: 'wool', isBlock: true, blockType: BlockType.WOOL_ORANGE, iconColor: '#e07119', description: 'Lana teñida de naranja vivo.' },
  { id: 'wool_cyan', name: 'Lana Cian', category: 'wool', isBlock: true, blockType: BlockType.WOOL_CYAN, iconColor: '#2898a3', description: 'Lana teñida de cian turquesa.' },

  // Tools & Weapons
  { id: 'sword_diamond', name: 'Espada de Diamante', category: 'tools', isBlock: false, itemType: 'sword_diamond', iconColor: '#47d1c9', description: 'Inflige gran daño a enemigos y mobs.' },
  { id: 'pickaxe_diamond', name: 'Pico de Diamante', category: 'tools', isBlock: false, itemType: 'pickaxe_diamond', iconColor: '#47d1c9', description: 'Mina cualquier roca instantáneamente.' },
  { id: 'axe_diamond', name: 'Hacha de Diamante', category: 'tools', isBlock: false, itemType: 'axe_diamond', iconColor: '#47d1c9', description: 'Tala árboles a gran velocidad.' },
  { id: 'shovel_diamond', name: 'Pala de Diamante', category: 'tools', isBlock: false, itemType: 'shovel_diamond', iconColor: '#47d1c9', description: 'Excava tierra, arena y grava.' },
  { id: 'bow', name: 'Arco Mágico', category: 'tools', isBlock: false, itemType: 'bow', iconColor: '#8a6538', description: 'Dispara proyectiles veloces.' },
  { id: 'flint_and_steel', name: 'Mechero / Chisquero', category: 'tools', isBlock: false, itemType: 'flint_and_steel', iconColor: '#b0b0b0', description: 'Enciende fuegos y activa el Portal del Nether en un marco de obsidiana.' },
  { id: 'bucket_chocolate', name: 'Cubo de Chocolate Líquido', category: 'tools', isBlock: false, itemType: 'bucket_chocolate', iconColor: '#7c3f1d', description: '¡Vierte chocolate líquido dentro de un marco de chocolate para abrir el Portal a la Dimensión de Chocolate!' },
  { id: 'elytra', name: '🪽 Élitros (Elytras)', category: 'tools', isBlock: false, itemType: 'elytra', iconColor: '#93a3af', description: '¡Alas aerodinámicas para planear por los cielos! Salta desde las alturas o pulsa Espacio en el aire para planear.' },
  { id: 'camioneta_item', name: '🛻 Camioneta Dulce', category: 'tools', isBlock: false, itemType: 'camioneta_item', iconColor: '#e11d48', description: '¡Colócala en cualquier dimensión para conducir! Pulsa [C] para cambiarle el color.' },

  // Items & Food
  { id: 'firework_rocket', name: '🎆 Cohete de Fuegos Artificiales', category: 'items', isBlock: false, itemType: 'firework_rocket', iconColor: '#ef4444', description: '¡Haz clic derecho para propulsar tus Élitros a gran velocidad con un espectáculo pirotécnico!' },
  { id: 'chocolate_bar', name: 'Barra de Chocolate Deliciosa', category: 'sweets', isBlock: false, itemType: 'chocolate_bar', iconColor: '#5a2d14', description: '¡Delicioso chocolate que restaura toda tu hambre y da velocidad!' },
  { id: 'ender_pearl', name: 'Perla de Ender', category: 'items', isBlock: false, itemType: 'ender_pearl', iconColor: '#23736b', description: '¡Lánzala con clic derecho para teletransportarte al instante!' },
  { id: 'golden_apple', name: 'Manzana Dorada', category: 'items', isBlock: false, itemType: 'golden_apple', iconColor: '#ffd700', description: 'Restaura vida completa y otorga regeneración.' },
  { id: 'cooked_beef', name: 'Filete Asado', category: 'items', isBlock: false, itemType: 'cooked_beef', iconColor: '#964835', description: 'Satisface el hambre rápidamente.' },
  { id: 'diamond_gem', name: 'Diamante', category: 'items', isBlock: false, itemType: 'diamond_gem', iconColor: '#5fe0db', description: 'Gema preciosa legendaria.' },
  { id: 'compass', name: 'Brújula', category: 'items', isBlock: false, itemType: 'compass', iconColor: '#c73c3c', description: 'Apunta siempre hacia el punto de spawn.' },
];

export const DEFAULT_HOTBAR: InventoryItem[] = [
  INVENTORY_CATALOG.find((i) => i.id === 'grass') || INVENTORY_CATALOG[0],
  INVENTORY_CATALOG.find((i) => i.id === 'dirt') || INVENTORY_CATALOG[1],
  INVENTORY_CATALOG.find((i) => i.id === 'stone') || INVENTORY_CATALOG[2],
  INVENTORY_CATALOG.find((i) => i.id === 'wood_planks') || INVENTORY_CATALOG[3],
  INVENTORY_CATALOG.find((i) => i.id === 'bed_red') || INVENTORY_CATALOG[4],
  INVENTORY_CATALOG.find((i) => i.id === 'chocolate_block') || INVENTORY_CATALOG[5],
  INVENTORY_CATALOG.find((i) => i.id === 'bucket_chocolate') || INVENTORY_CATALOG[6],
  INVENTORY_CATALOG.find((i) => i.id === 'chocolate_bar') || INVENTORY_CATALOG[7],
  INVENTORY_CATALOG.find((i) => i.id === 'sword_diamond') || INVENTORY_CATALOG[8],
];
