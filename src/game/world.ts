import { createNoise2D, createNoise3D } from 'simplex-noise';
import { BlockType, WorldType, DimensionType, WorldData } from '../types';

export const CHUNK_SIZE = 16;
export const CHUNK_HEIGHT = 40;
export const SEA_LEVEL = 7;

export class VoxelWorld {
  public seed: number;
  public worldType: WorldType;
  public dimension: DimensionType = 'overworld';
  public dimensionMaps: Map<DimensionType, Map<string, BlockType>> = new Map();
  public modifiedBlocks: Map<string, BlockType>;
  private noise2D: (x: number, y: number) => number;
  private noise3D: (x: number, y: number, z: number) => number;
  public dirtyChunks: Set<string> = new Set();
  public initialSpawnY: number = 15;

  constructor(seed: number = 12345, worldType: WorldType = 'default', dimension: DimensionType = 'overworld') {
    this.seed = seed;
    this.worldType = worldType;
    this.dimension = dimension;

    // Initialize map per dimension
    this.dimensionMaps.set('overworld', new Map());
    this.dimensionMaps.set('chocolate', new Map());
    this.dimensionMaps.set('nether', new Map());
    this.dimensionMaps.set('the_end', new Map());
    this.dimensionMaps.set('parallel', new Map());
    this.modifiedBlocks = this.dimensionMaps.get(dimension)!;

    const random = this.createSeededRandom(seed);
    this.noise2D = createNoise2D(random);
    this.noise3D = createNoise3D(random);
  }

  public setDimension(dim: DimensionType) {
    if (this.dimension === dim) return;
    this.dimension = dim;
    if (!this.dimensionMaps.has(dim)) {
      this.dimensionMaps.set(dim, new Map());
    }
    this.modifiedBlocks = this.dimensionMaps.get(dim)!;
    this.dirtyChunks.clear();
  }

  private createSeededRandom(seed: number) {
    let s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return () => {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  public getCoordKey(x: number, y: number, z: number): string {
    return `${x},${y},${z}`;
  }

  public getChunkKey(cx: number, cz: number): string {
    return `${cx},${cz}`;
  }

  // Get procedural block at coordinate if not modified
  public getProceduralBlock(x: number, y: number, z: number): BlockType {
    if (y < 0 || y >= CHUNK_HEIGHT) return BlockType.AIR;
    if (y === 0) return BlockType.BEDROCK;

    // ==========================================
    // 1. CHOCOLATE DIMENSION (Reino del Chocolate & Dulces)
    // ==========================================
    if (this.dimension === 'chocolate') {
      const sweetScale = 0.03;
      const n = this.noise2D(x * sweetScale + 100, z * sweetScale + 100);
      const detail = this.noise2D(x * 0.08, z * 0.08) * 2;
      const height = Math.floor(11 + n * 10 + detail);

      // Sweet caves / syrup tunnels
      const caveNoise = this.noise3D(x * 0.07, y * 0.08, z * 0.07);
      if (y > 3 && y < height - 1 && caveNoise > 0.5) {
        return BlockType.AIR;
      }

      // Waffle Trees with Cotton Candy Foliage
      const treeGridX = Math.floor(x / 7) * 7 + 3;
      const treeGridZ = Math.floor(z / 7) * 7 + 3;
      const treeHash = Math.abs(Math.sin(treeGridX * 17.123 + treeGridZ * 91.456 + this.seed) * 43758.5453) % 1;

      if (treeHash > 0.45) {
        const treeGroundY = Math.floor(11 + this.noise2D(treeGridX * sweetScale + 100, treeGridZ * sweetScale + 100) * 10 + this.noise2D(treeGridX * 0.08, treeGridZ * 0.08) * 2);
        if (treeGroundY > SEA_LEVEL) {
          const trunkHeight = 4 + Math.floor(treeHash * 3);
          // Waffle Trunk
          if (x === treeGridX && z === treeGridZ && y > treeGroundY && y <= treeGroundY + trunkHeight) {
            return BlockType.WAFFLE_BLOCK;
          }
          // Cotton candy canopy (Pink or Blue)
          const leafBottom = treeGroundY + trunkHeight - 2;
          const leafTop = treeGroundY + trunkHeight + 1;
          if (y >= leafBottom && y <= leafTop) {
            const dx = Math.abs(x - treeGridX);
            const dz = Math.abs(z - treeGridZ);
            const maxDist = y >= treeGroundY + trunkHeight ? 1 : 2;
            if (dx <= maxDist && dz <= maxDist && !(dx === maxDist && dz === maxDist && y === leafTop)) {
              if (!(x === treeGridX && z === treeGridZ && y <= treeGroundY + trunkHeight)) {
                return treeHash > 0.72 ? BlockType.COTTON_CANDY_BLUE : BlockType.COTTON_CANDY_PINK;
              }
            }
          }
        }
      }

      // Chocolate Liquid Lakes & Rivers
      if (y > height) {
        if (y <= SEA_LEVEL) {
          return BlockType.LIQUID_CHOCOLATE;
        }
        return BlockType.AIR;
      }

      // Surface: Milk, Dark or White Chocolate
      if (y === height) {
        if (y > 23) return BlockType.WHITE_CHOCOLATE; // White chocolate glased peaks
        const flavorNoise = this.noise2D(x * 0.04, z * 0.04);
        if (flavorNoise > 0.35) return BlockType.DARK_CHOCOLATE;
        return BlockType.CHOCOLATE_BLOCK;
      }

      // Subsurface: Crunchy Cookie Dough layer
      if (y >= height - 3) {
        return BlockType.COOKIE_BLOCK;
      }

      // Sweet Ores underground
      const oreNoise = this.noise3D(x * 0.15, y * 0.15, z * 0.15);
      if (oreNoise > 0.64) {
        if (oreNoise > 0.73) return BlockType.CANDY_CANE_BLOCK;
        return BlockType.SUGAR_ORE;
      }

      return BlockType.CARAMEL_STONE;
    }

    // ==========================================
    // 2. NETHER DIMENSION (Inframundo)
    // ==========================================
    if (this.dimension === 'nether') {
      if (y >= CHUNK_HEIGHT - 2) return BlockType.BEDROCK;
      if (y >= CHUNK_HEIGHT - 5) return BlockType.NETHERRACK;

      // Glowstone stalactites hanging from ceiling
      const glowNoise = this.noise3D(x * 0.1, (CHUNK_HEIGHT - y) * 0.2, z * 0.1);
      if (y > 28 && glowNoise > 0.6) {
        return BlockType.GLOWSTONE;
      }

      // Nether cavern terrain 3D noise
      const n3d = this.noise3D(x * 0.06, y * 0.08, z * 0.06);
      const isSolid = (y < 12 && n3d > -0.1) || (y > 24 && n3d > -0.1) || n3d > 0.25;

      if (!isSolid) {
        if (y <= 6) return BlockType.LAVA;
        return BlockType.AIR;
      }

      // Quartz & Gold in Nether
      const oreNoise = this.noise3D(x * 0.18, y * 0.18, z * 0.18);
      if (oreNoise > 0.72) return BlockType.QUARTZ_ORE;
      if (oreNoise > 0.68 && y < 15) return BlockType.GOLD_ORE;

      // Soul sand patches
      const soulNoise = this.noise2D(x * 0.05, z * 0.05);
      if (y <= 8 && soulNoise > 0.3) return BlockType.SOUL_SAND;

      return BlockType.NETHERRACK;
    }

    // ==========================================
    // 3. THE END DIMENSION (Vacío Cósmico & Islas)
    // ==========================================
    if (this.dimension === 'the_end') {
      const centerDist = Math.sqrt(x * x + z * z);
      const islandNoise = this.noise3D(x * 0.05, (y - 18) * 0.1, z * 0.05);
      
      // Central island and outer floating clusters
      const inCentral = centerDist < 35 && y > 10 && y < 24 && islandNoise + (1 - centerDist / 35) * 0.6 > 0.3;
      const inOuter = centerDist > 55 && y > 12 && y < 26 && islandNoise > 0.35;

      if (inCentral || inOuter) {
        // Obsidian towers on main island
        if (inCentral && (Math.abs(x % 14) <= 1 && Math.abs(z % 14) <= 1) && y <= 32) {
          return BlockType.OBSIDIAN;
        }
        if (y > 22 && islandNoise > 0.5) return BlockType.PURPUR_BLOCK;
        return BlockType.END_STONE;
      }

      return BlockType.AIR;
    }

    // ==========================================
    // 4. PARALLEL OVERWORLD (Overworld Invertido / Espejo)
    // ==========================================
    if (this.dimension === 'parallel') {
      const scale = 0.035;
      const heightScale = 10;
      const baseHeight = 11;

      const n = this.noise2D(x * scale + 500, z * scale + 500);
      const detail = this.noise2D(x * 0.08, z * 0.08) * 2;
      const height = Math.floor(baseHeight + n * heightScale + detail);

      // Inverted Caves
      const caveNoise = this.noise3D(x * 0.08, y * 0.09, z * 0.08);
      const isCave = y > 2 && y < height - 1 && caveNoise > 0.48;
      if (isCave) return BlockType.AIR;

      // Inverted Mirror Trees
      const treeGridX = Math.floor(x / 6) * 6 + 2;
      const treeGridZ = Math.floor(z / 6) * 6 + 2;
      const treeHash = Math.abs(Math.sin(treeGridX * 13.9 + treeGridZ * 79.1 + this.seed) * 43758.5453) % 1;

      if (treeHash > 0.52) {
        const treeGroundY = Math.floor(baseHeight + this.noise2D(treeGridX * scale + 500, treeGridZ * scale + 500) * heightScale + this.noise2D(treeGridX * 0.08, treeGridZ * 0.08) * 2);
        if (treeGroundY > SEA_LEVEL) {
          const trunkHeight = 4 + Math.floor(treeHash * 3);
          // Inverted Trunk
          if (x === treeGridX && z === treeGridZ && y > treeGroundY && y <= treeGroundY + trunkHeight) {
            return BlockType.PARALLEL_WOOD;
          }
          // Inverted Leaves Canopy
          const leafBottom = treeGroundY + trunkHeight - 2;
          const leafTop = treeGroundY + trunkHeight + 1;
          if (y >= leafBottom && y <= leafTop) {
            const dx = Math.abs(x - treeGridX);
            const dz = Math.abs(z - treeGridZ);
            const maxDist = y >= treeGroundY + trunkHeight ? 1 : 2;
            if (dx <= maxDist && dz <= maxDist && !(dx === maxDist && dz === maxDist && y === leafTop)) {
              if (!(x === treeGridX && z === treeGridZ && y <= treeGroundY + trunkHeight)) {
                return BlockType.PARALLEL_LEAVES;
              }
            }
          }
        }
      }

      if (y > height) {
        if (y <= SEA_LEVEL) {
          return BlockType.PARALLEL_WATER;
        }
        return BlockType.AIR;
      }

      // Surface blocks: Inverted Grass & Sand
      if (y === height) {
        if (y <= SEA_LEVEL + 1) {
          return BlockType.PARALLEL_SAND;
        }
        return BlockType.PARALLEL_GRASS;
      }

      if (y >= height - 3) {
        if (y <= SEA_LEVEL + 1) return BlockType.PARALLEL_SAND;
        return BlockType.PARALLEL_DIRT;
      }

      // Inverted subterranean mirror ores
      const oreNoise = this.noise3D(x * 0.16, y * 0.16, z * 0.16);
      if (oreNoise > 0.70) {
        return BlockType.PARALLEL_MIRROR_BLOCK;
      }

      return BlockType.PARALLEL_STONE;
    }

    // ==========================================
    // 5. OVERWORLD (Mundo Normal)
    // ==========================================
    if (this.worldType === 'flat') {
      if (y === 0) return BlockType.BEDROCK;
      if (y < 3) return BlockType.DIRT;
      if (y === 3) return BlockType.GRASS;
      return BlockType.AIR;
    }

    if (this.worldType === 'islands') {
      const islandNoise = this.noise3D(x * 0.04, y * 0.08, z * 0.04);
      const centerDist = Math.sqrt(x * x + z * z);
      const mask = Math.max(0, 1 - centerDist / 60);
      if (y > 10 && y < 28 && islandNoise * mask > 0.1) {
        const topNoise = this.noise2D(x * 0.08, z * 0.08);
        if (y > 22 + topNoise * 3) return BlockType.GRASS;
        if (y > 19) return BlockType.DIRT;
        return BlockType.STONE;
      }
      return BlockType.AIR;
    }

    if (this.worldType === 'desert') {
      const height = Math.floor(10 + this.noise2D(x * 0.03, z * 0.03) * 5);
      if (y > height) return BlockType.AIR;
      if (y === height) return BlockType.SAND;
      if (y >= height - 3) return BlockType.SAND;
      return BlockType.SANDSTONE;
    }

    // Default & Mountainous Biomes
    const scale = this.worldType === 'mountains' ? 0.02 : 0.035;
    const heightScale = this.worldType === 'mountains' ? 18 : 9;
    const baseHeight = this.worldType === 'mountains' ? 14 : 10;

    const n = this.noise2D(x * scale, z * scale);
    const detail = this.noise2D(x * 0.08, z * 0.08) * 2;
    const height = Math.floor(baseHeight + n * heightScale + detail);

    // Cave noise (3D tunnels)
    const caveNoise = this.noise3D(x * 0.08, y * 0.09, z * 0.08);
    const isCave = y > 2 && y < height - 1 && caveNoise > 0.48;

    if (isCave) return BlockType.AIR;

    // Check tree structures procedurally
    const treeGridX = Math.floor(x / 6) * 6 + 2;
    const treeGridZ = Math.floor(z / 6) * 6 + 2;
    const treeHash = Math.abs(Math.sin(treeGridX * 12.9898 + treeGridZ * 78.233 + this.seed) * 43758.5453) % 1;

    if (treeHash > 0.55) {
      const treeGroundY = Math.floor(baseHeight + this.noise2D(treeGridX * scale, treeGridZ * scale) * heightScale + this.noise2D(treeGridX * 0.08, treeGridZ * 0.08) * 2);
      if (treeGroundY > SEA_LEVEL) {
        const trunkHeight = 4 + Math.floor(treeHash * 3);
        // Trunk
        if (x === treeGridX && z === treeGridZ && y > treeGroundY && y <= treeGroundY + trunkHeight) {
          return BlockType.WOOD_LOG;
        }
        // Leaves canopy
        const leafBottom = treeGroundY + trunkHeight - 2;
        const leafTop = treeGroundY + trunkHeight + 1;
        if (y >= leafBottom && y <= leafTop) {
          const dx = Math.abs(x - treeGridX);
          const dz = Math.abs(z - treeGridZ);
          const maxDist = y >= treeGroundY + trunkHeight ? 1 : 2;
          if (dx <= maxDist && dz <= maxDist && !(dx === maxDist && dz === maxDist && y === leafTop)) {
            if (!(x === treeGridX && z === treeGridZ && y <= treeGroundY + trunkHeight)) {
              return BlockType.LEAVES;
            }
          }
        }
      }
    }

    if (y > height) {
      if (y <= SEA_LEVEL) {
        return BlockType.WATER;
      }
      return BlockType.AIR;
    }

    // Surface blocks
    if (y === height) {
      if (y <= SEA_LEVEL + 1) {
        return BlockType.SAND;
      }
      if (this.worldType === 'mountains' && y > 24) {
        return BlockType.STONE;
      }
      return BlockType.GRASS;
    }

    if (y >= height - 3) {
      if (y <= SEA_LEVEL + 1) return BlockType.SAND;
      return BlockType.DIRT;
    }

    // Underground Ores
    const oreNoise = this.noise3D(x * 0.15, y * 0.15, z * 0.15);
    if (oreNoise > 0.65) {
      if (y < 6 && oreNoise > 0.72) return BlockType.DIAMOND_ORE;
      if (y < 12 && oreNoise > 0.70) return BlockType.GOLD_ORE;
      if (y < 18 && oreNoise > 0.67) return BlockType.IRON_ORE;
      return BlockType.COAL_ORE;
    }

    return BlockType.STONE;
  }

  public getBlock(x: number, y: number, z: number): BlockType {
    if (y < 0 || y >= CHUNK_HEIGHT) return BlockType.AIR;
    const key = this.getCoordKey(x, y, z);
    if (this.modifiedBlocks.has(key)) {
      return this.modifiedBlocks.get(key)!;
    }
    return this.getProceduralBlock(x, y, z);
  }

  public setBlock(x: number, y: number, z: number, type: BlockType): boolean {
    if (y < 0 || y >= CHUNK_HEIGHT) return false;
    const key = this.getCoordKey(x, y, z);
    this.modifiedBlocks.set(key, type);

    // Mark chunk and neighbor chunks dirty if on border
    const cx = Math.floor(x / CHUNK_SIZE);
    const cz = Math.floor(z / CHUNK_SIZE);
    this.dirtyChunks.add(this.getChunkKey(cx, cz));

    const localX = (x % CHUNK_SIZE + CHUNK_SIZE) % CHUNK_SIZE;
    const localZ = (z % CHUNK_SIZE + CHUNK_SIZE) % CHUNK_SIZE;

    if (localX === 0) this.dirtyChunks.add(this.getChunkKey(cx - 1, cz));
    if (localX === CHUNK_SIZE - 1) this.dirtyChunks.add(this.getChunkKey(cx + 1, cz));
    if (localZ === 0) this.dirtyChunks.add(this.getChunkKey(cx, cz - 1));
    if (localZ === CHUNK_SIZE - 1) this.dirtyChunks.add(this.getChunkKey(cx, cz + 1));

    return true;
  }

  public getTopSolidY(x: number, z: number): number {
    for (let y = CHUNK_HEIGHT - 1; y >= 0; y--) {
      const b = this.getBlock(x, y, z);
      if (
        b !== BlockType.AIR &&
        b !== BlockType.WATER &&
        b !== BlockType.LIQUID_CHOCOLATE &&
        b !== BlockType.PARALLEL_WATER &&
        b !== BlockType.LAVA &&
        b !== BlockType.PORTAL_CHOCOLATE &&
        b !== BlockType.PORTAL_NETHER &&
        b !== BlockType.PORTAL_END &&
        b !== BlockType.PORTAL_PARALLEL
      ) {
        return y;
      }
    }
    return 12;
  }

  // Mass fill blocks (/fill cheat)
  public fillBlocks(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, type: BlockType): number {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.max(0, Math.min(y1, y2));
    const maxY = Math.min(CHUNK_HEIGHT - 1, Math.max(y1, y2));
    const minZ = Math.min(z1, z2);
    const maxZ = Math.max(z1, z2);

    let count = 0;
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        for (let z = minZ; z <= maxZ; z++) {
          this.setBlock(x, y, z, type);
          count++;
        }
      }
    }
    return count;
  }

  // Explosion block destruction (TNT or /explode)
  public explode(cx: number, cy: number, cz: number, radius: number = 4): { x: number; y: number; z: number; type: BlockType }[] {
    const destroyed: { x: number; y: number; z: number; type: BlockType }[] = [];
    const r2 = radius * radius;
    const iRadius = Math.ceil(radius);

    for (let dx = -iRadius; dx <= iRadius; dx++) {
      for (let dy = -iRadius; dy <= iRadius; dy++) {
        for (let dz = -iRadius; dz <= iRadius; dz++) {
          const distSq = dx * dx + dy * dy + dz * dz;
          if (distSq <= r2 + (Math.random() * 2 - 1)) {
            const x = Math.floor(cx + dx);
            const y = Math.floor(cy + dy);
            const z = Math.floor(cz + dz);

            if (y > 0 && y < CHUNK_HEIGHT) {
              const current = this.getBlock(x, y, z);
              if (current !== BlockType.AIR && current !== BlockType.BEDROCK && current !== BlockType.OBSIDIAN) {
                this.setBlock(x, y, z, BlockType.AIR);
                destroyed.push({ x, y, z, type: current });
              }
            }
          }
        }
      }
    }
    return destroyed;
  }

  // Build a complete functional portal structure with frame
  // Note: The End Portal is HORIZONTAL (5x5 lying flat on the ground with 3x3 horizontal pool)
  public buildPortalStructure(px: number, py: number, pz: number, dimType: DimensionType, axis: 'x' | 'z' = 'x') {
    if (dimType === 'the_end') {
      // Horizontal End Portal: 5x5 footprint on ground level
      for (let dx = -2; dx <= 2; dx++) {
        for (let dz = -2; dz <= 2; dz++) {
          const x = px + dx;
          const z = pz + dz;
          const isBorder = dx === -2 || dx === 2 || dz === -2 || dz === 2;

          // Solid floor underneath
          this.setBlock(x, py - 1, z, BlockType.OBSIDIAN);

          if (isBorder) {
            this.setBlock(x, py, z, BlockType.PURPUR_BLOCK);
          } else {
            // Horizontal Portal surface
            this.setBlock(x, py, z, BlockType.PORTAL_END);
          }

          // Clear air above
          this.setBlock(x, py + 1, z, BlockType.AIR);
          this.setBlock(x, py + 2, z, BlockType.AIR);
        }
      }
      return;
    }

    const frameBlock =
      dimType === 'chocolate'
        ? BlockType.CHOCOLATE_BLOCK
        : dimType === 'nether'
        ? BlockType.OBSIDIAN
        : dimType === 'parallel'
        ? BlockType.PARALLEL_MIRROR_BLOCK
        : BlockType.PURPUR_BLOCK;

    const portalBlock =
      dimType === 'chocolate'
        ? BlockType.PORTAL_CHOCOLATE
        : dimType === 'nether'
        ? BlockType.PORTAL_NETHER
        : dimType === 'parallel'
        ? BlockType.PORTAL_PARALLEL
        : BlockType.PORTAL_END;

    // 4 wide, 5 high vertical portal frame for other dimensions
    for (let dy = 0; dy < 5; dy++) {
      for (let dw = 0; dw < 4; dw++) {
        const x = axis === 'x' ? px + dw - 1 : px;
        const y = py + dy;
        const z = axis === 'z' ? pz + dw - 1 : pz;

        const isBorder = dy === 0 || dy === 4 || dw === 0 || dw === 3;
        if (isBorder) {
          this.setBlock(x, y, z, frameBlock);
        } else {
          this.setBlock(x, y, z, portalBlock);
        }
      }
    }
  }

  // Build the Sweet Garage ("Garaje Dulce") in the Chocolate Dimension
  public buildSweetGarage(gx: number, gy: number, gz: number) {
    const width = 8;
    const depth = 9;
    const height = 5;

    for (let x = 0; x < width; x++) {
      for (let z = 0; z < depth; z++) {
        const wx = gx + x;
        const wz = gz + z;

        // 1. Garage Floor: Checkered Cookie and Caramel Stone
        const isCheckered = (x + z) % 2 === 0;
        this.setBlock(wx, gy - 1, wz, isCheckered ? BlockType.COOKIE_BLOCK : BlockType.CARAMEL_STONE);

        // 2. Clear interior air
        for (let y = 0; y < height; y++) {
          this.setBlock(wx, gy + y, wz, BlockType.AIR);
        }

        // 3. Walls & Pillars
        const isCorner = (x === 0 || x === width - 1) && (z === 0 || z === depth - 1);
        const isSideWall = x === 0 || x === width - 1;
        const isBackWall = z === depth - 1;
        const isFrontEntrance = z === 0;

        for (let y = 0; y < height; y++) {
          const wy = gy + y;
          if (isCorner) {
            // Candy Cane pillars
            this.setBlock(wx, wy, wz, BlockType.CANDY_CANE_BLOCK);
          } else if (isSideWall || isBackWall) {
            // Waffle block walls with chocolate stripes
            const wallBlock = y === 2 ? BlockType.DARK_CHOCOLATE : BlockType.WAFFLE_BLOCK;
            this.setBlock(wx, wy, wz, wallBlock);
          } else if (isFrontEntrance) {
            // Open front garage doorway (only top arch)
            if (y === height - 1) {
              this.setBlock(wx, wy, wz, BlockType.CANDY_CANE_BLOCK);
            }
          }
        }

        // 4. Roof: White Chocolate with Cotton Candy Eaves
        this.setBlock(wx, gy + height, wz, BlockType.WHITE_CHOCOLATE);
        if (x === 0 || x === width - 1 || z === 0 || z === depth - 1) {
          this.setBlock(wx, gy + height + 1, wz, BlockType.COTTON_CANDY_PINK);
        }
      }
    }

    // Interior Sweet Lighting (Glowstone lanterns hanging from roof)
    this.setBlock(gx + 2, gy + height - 1, gz + 3, BlockType.GLOWSTONE);
    this.setBlock(gx + width - 3, gy + height - 1, gz + 3, BlockType.GLOWSTONE);
    this.setBlock(gx + 2, gy + height - 1, gz + depth - 3, BlockType.GLOWSTONE);
    this.setBlock(gx + width - 3, gy + height - 1, gz + depth - 3, BlockType.GLOWSTONE);
  }

  public serialize(name: string = 'Mi Mundo Voxel'): string {
    const modified: { [key: string]: number } = {};
    this.modifiedBlocks.forEach((type, key) => {
      modified[key] = type;
    });

    const data: WorldData = {
      name,
      seed: this.seed,
      worldType: this.worldType,
      dimension: this.dimension,
      timeOfDay: 6000,
      weather: 'clear',
      modifiedBlocks: modified,
      playerPosition: { x: 0, y: 20, z: 0 },
      savedAt: Date.now(),
    };
    return JSON.stringify(data);
  }

  public deserialize(jsonStr: string): boolean {
    try {
      const data: WorldData = JSON.parse(jsonStr);
      this.seed = data.seed || 12345;
      this.worldType = data.worldType || 'default';
      this.dimension = data.dimension || 'overworld';
      const random = this.createSeededRandom(this.seed);
      this.noise2D = createNoise2D(random);
      this.noise3D = createNoise3D(random);
      
      this.dimensionMaps.clear();
      this.dimensionMaps.set('overworld', new Map());
      this.dimensionMaps.set('chocolate', new Map());
      this.dimensionMaps.set('nether', new Map());
      this.dimensionMaps.set('the_end', new Map());
      this.dimensionMaps.set('parallel', new Map());
      this.modifiedBlocks = this.dimensionMaps.get(this.dimension)!;
      this.dirtyChunks.clear();

      if (data.modifiedBlocks) {
        Object.entries(data.modifiedBlocks).forEach(([key, type]) => {
          this.modifiedBlocks.set(key, type as BlockType);
          const [x, , z] = key.split(',').map(Number);
          const cx = Math.floor(x / CHUNK_SIZE);
          const cz = Math.floor(z / CHUNK_SIZE);
          this.dirtyChunks.add(this.getChunkKey(cx, cz));
        });
      }
      return true;
    } catch (e) {
      console.error('Failed to load world data:', e);
      return false;
    }
  }
}
