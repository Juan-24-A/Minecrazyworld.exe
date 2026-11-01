export enum BlockType {
  AIR = 0,
  GRASS = 1,
  DIRT = 2,
  STONE = 3,
  COBBLESTONE = 4,
  BEDROCK = 5,
  WOOD_LOG = 6,
  WOOD_PLANKS = 7,
  LEAVES = 8,
  GLASS = 9,
  SAND = 10,
  SANDSTONE = 11,
  WATER = 12,
  LAVA = 13,
  BRICKS = 14,
  BOOKSHELF = 15,
  TNT = 16,
  OBSIDIAN = 17,
  DIAMOND_BLOCK = 18,
  GOLD_BLOCK = 19,
  EMERALD_BLOCK = 20,
  IRON_BLOCK = 21,
  REDSTONE_BLOCK = 22,
  GLOWSTONE = 23,
  COAL_ORE = 24,
  IRON_ORE = 25,
  GOLD_ORE = 26,
  DIAMOND_ORE = 27,
  NETHERRACK = 28,
  END_STONE = 29,
  PUMPKIN = 30,
  CRAFTING_TABLE = 31,
  FURNACE = 32,
  WOOL_WHITE = 33,
  WOOL_RED = 34,
  WOOL_BLUE = 35,
  WOOL_GREEN = 36,
  WOOL_YELLOW = 37,
  WOOL_BLACK = 38,
  WOOL_PINK = 39,
  WOOL_PURPLE = 40,
  WOOL_ORANGE = 41,
  WOOL_CYAN = 42,
  BED_RED = 43,
  BED_BLUE = 44,
  BED_WHITE = 45,
  BED_GREEN = 46,
  CHOCOLATE_BLOCK = 47,
  DARK_CHOCOLATE = 48,
  WHITE_CHOCOLATE = 49,
  LIQUID_CHOCOLATE = 50,
  COOKIE_BLOCK = 51,
  CARAMEL_STONE = 52,
  COTTON_CANDY_PINK = 53,
  COTTON_CANDY_BLUE = 54,
  CANDY_CANE_BLOCK = 55,
  WAFFLE_BLOCK = 56,
  SUGAR_ORE = 57,
  PORTAL_CHOCOLATE = 58,
  PORTAL_NETHER = 59,
  PORTAL_END = 60,
  PURPUR_BLOCK = 61,
  SOUL_SAND = 62,
  NETHER_BRICKS = 63,
  QUARTZ_ORE = 64,
  PORTAL_PARALLEL = 65,
  PARALLEL_MIRROR_BLOCK = 66,
  PARALLEL_GRASS = 67,
  PARALLEL_DIRT = 68,
  PARALLEL_STONE = 69,
  PARALLEL_WOOD = 70,
  PARALLEL_LEAVES = 71,
  PARALLEL_WATER = 72,
  PARALLEL_SAND = 73,
  COMMAND_BLOCK = 74,
  STRUCTURE_BLOCK = 75,
  BARRIER = 76,
}

export type DimensionType = 'overworld' | 'chocolate' | 'nether' | 'the_end' | 'parallel';

export type ItemType = 
  | 'block'
  | 'sword_diamond'
  | 'pickaxe_diamond'
  | 'axe_diamond'
  | 'shovel_diamond'
  | 'bow'
  | 'flint_and_steel'
  | 'bucket_chocolate'
  | 'chocolate_bar'
  | 'mirror_shard'
  | 'ender_pearl'
  | 'golden_apple'
  | 'cooked_beef'
  | 'diamond_gem'
  | 'compass'
  | 'camioneta_item'
  | 'elytra'
  | 'firework_rocket'
  | 'admin_sword'
  | 'admin_wand'
  | 'admin_teleport_wand'
  | 'admin_kill_wand'
  | 'admin_nuke_wand'
  | 'admin_totem'
  | 'admin_weather_wand';

export interface InventoryItem {
  id: string;
  name: string;
  category: 'building' | 'natural' | 'decor' | 'minerals' | 'wool' | 'tools' | 'items' | 'sweets' | 'admin';
  isBlock: boolean;
  blockType?: BlockType;
  itemType?: ItemType;
  iconColor?: string;
  description: string;
}

export type GameMode = 'creative' | 'survival' | 'spectator';
export type WeatherType = 'clear' | 'rain' | 'thunder';
export type WorldType = 'default' | 'flat' | 'mountains' | 'islands' | 'desert';

export interface PlayerStats {
  health: number;
  maxHealth: number;
  hunger: number;
  maxHunger: number;
  gamemode: GameMode;
  dimension: DimensionType;
  isFlying: boolean;
  isNoclip: boolean;
  isGodmode: boolean;
  speedMultiplier: number;
  jumpMultiplier: number;
  selectedHotbarIndex: number;
  position: { x: number; y: number; z: number };
  rotation: { yaw: number; pitch: number };
  biome: string;
  fps: number;
  isDrivingTruck?: boolean;
  nearTruck?: boolean;
  truckColor?: string;
  isGliding?: boolean;
  boss?: BossStats;
}

export interface BossStats {
  name: string;
  health: number;
  maxHealth: number;
  active: boolean;
}

export interface MobEntity {
  id: string;
  type: 'pig' | 'sheep' | 'cow' | 'zombie' | 'creeper' | 'ender_dragon' | 'enderman';
  position: { x: number; y: number; z: number };
  rotationY: number;
  health: number;
  maxHealth: number;
  velocity: { x: number; y: number; z: number };
  walkTimer: number;
  walkDir: { x: number; z: number };
  mesh?: any;
}

export interface TNTEntity {
  id: string;
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  fuseTimer: number;
  radius: number;
  mesh?: any;
}

export interface ParticleEntity {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

export interface ChatMessage {
  id: string;
  sender: 'system' | 'player' | 'cheat';
  text: string;
  color?: string;
  timestamp: number;
}

export interface WorldData {
  name: string;
  seed: number;
  worldType: WorldType;
  dimension?: DimensionType;
  timeOfDay: number; // 0 to 24000
  weather: WeatherType;
  modifiedBlocks: { [coordKey: string]: BlockType };
  playerPosition: { x: number; y: number; z: number };
  savedAt: number;
}

export interface PlayerSkin {
  id: string;
  name: string;
  headColor: string;
  bodyColor: string;
  legsColor: string;
  capeColor?: string;
}

export interface RemotePlayer {
  id: string;
  name: string;
  skin: PlayerSkin;
  position: { x: number; y: number; z: number };
  rotation: { yaw: number; pitch: number };
  dimension?: DimensionType;
  heldItemBlock?: BlockType;
  isFlying?: boolean;
  isSneaking?: boolean;
  isMoving?: boolean;
  lastPing?: number;
  ping?: number;
  mesh?: any;
}

export type NetworkPacket = 
  | { type: 'join'; player: { id: string; name: string; skin: PlayerSkin; pos: { x: number; y: number; z: number }; dimension?: DimensionType } }
  | { type: 'leave'; playerId: string }
  | { type: 'move'; playerId: string; pos: { x: number; y: number; z: number }; rot: { yaw: number; pitch: number }; dimension?: DimensionType; heldItemBlock?: BlockType; isFlying?: boolean; isSneaking?: boolean; isMoving?: boolean }
  | { type: 'block_place'; x: number; y: number; z: number; blockType: BlockType; playerId: string }
  | { type: 'block_break'; x: number; y: number; z: number; blockType: BlockType; playerId: string }
  | { type: 'world_request'; requesterId: string }
  | { type: 'world_sync'; seed: number; worldType: WorldType; dimension?: DimensionType; modifiedBlocks: { [coordKey: string]: BlockType }; timeOfDay: number; weather: WeatherType }
  | { type: 'chat'; playerId: string; playerName: string; text: string; color?: string }
  | { type: 'tnt_spawn'; x: number; y: number; z: number; fuse: number }
  | { type: 'explosion'; x: number; y: number; z: number; radius: number }
  | { type: 'ping'; timestamp: number }
  | { type: 'pong'; timestamp: number };

export interface PublicServer {
  id: string;
  roomCode: string;
  name: string;
  description: string;
  hostName: string;
  playerCount: number;
  maxPlayers: number;
  worldType: WorldType;
  tag: string;
  region: string;
  ping: number;
}
