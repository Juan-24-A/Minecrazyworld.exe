import * as THREE from 'three';
import { VoxelWorld, CHUNK_SIZE, CHUNK_HEIGHT } from './world';
import { PlayerPhysics } from './physics';
import { EntityManager } from './mobs';
import { textureGen } from './textures';
import { sounds } from './audio';
import { BlockType, InventoryItem, WeatherType, GameMode, DimensionType } from '../types';
import { MultiplayerManager } from './multiplayer';
import { TruckManager } from './truck';
import { findStructure, generateStructure, STRUCTURE_CATALOG, buildEndCity, buildEndShip } from './structures';
import { findBiome, BIOME_CATALOG } from './biomes';
import { EnderDragon } from './enderDragon';

export interface RaycastHit {
  blockX: number;
  blockY: number;
  blockZ: number;
  faceNormal: THREE.Vector3;
  distance: number;
  blockType: BlockType;
}

export class VoxelEngine {
  public container: HTMLElement;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public world: VoxelWorld;
  public physics: PlayerPhysics;
  public entities: EntityManager;
  public multiplayer: MultiplayerManager;
  public trucks: TruckManager;

  // Truck and item callbacks
  public onTruckCollected?: (item: InventoryItem) => void;
  public onTruckPlaced?: () => void;

  // Command & Structure block callbacks and state
  public commandBlockMemory: Map<string, string> = new Map();
  public onOpenCommandBlockUI?: (target: { x: number; y: number; z: number; command?: string }) => void;
  public onOpenStructureBlockUI?: (target: { x: number; y: number; z: number }) => void;

  // Dimension & Portal state
  public isWarping: boolean = false;
  public portalCooldown: number = 0;
  public onDimensionChange?: (dimension: DimensionType, isWarping: boolean) => void;
  public onElytraCollected?: () => void;

  // Boss & End dimension state
  public enderDragon: EnderDragon | null = null;
  public isEnderDragonDefeated: boolean = false;
  private evaluatedEndCityChunks: Set<string> = new Set();
  private elytraPickups: { group: THREE.Group; baseY: number; collected: boolean }[] = [];

  // Chunk meshes
  private chunkMeshMap: Map<string, THREE.Group> = new Map();
  public renderDistance: number = 3; // radius in chunks (3x3 to 5x5)

  // Lighting & Day/Night
  public timeOfDay: number = 6000; // 0=dawn, 6000=noon, 12000=dusk, 18000=midnight
  public timeSpeed: number = 2.0; // speed of day/night
  public weather: WeatherType = 'clear';
  private sunLight: THREE.DirectionalLight;
  private ambientLight: THREE.HemisphereLight;
  private sunMesh: THREE.Mesh;
  private moonMesh: THREE.Mesh;
  private cloudsMesh: THREE.Group;
  private starsMesh: THREE.Points;
  private rainMesh: THREE.Points;

  // Selection & Breaking
  private highlightBox: THREE.LineSegments;
  private crackMesh: THREE.Mesh;
  public targetHit: RaycastHit | null = null;
  public breakingProgress: number = 0; // 0 to 1
  public isBreaking: boolean = false;
  private breakingCoords: { x: number; y: number; z: number } | null = null;
  public breakCooldownFrames: number = 0;
  public breakCooldownTimer: number = 0;
  public placeCooldownFrames: number = 0;
  public placeCooldownTimer: number = 0;

  // First-person held item
  public heldItemMesh: THREE.Group;
  private heldItemSwing: number = 0;
  private heldItemBob: number = 0;

  // Camera & Input
  public yaw: number = 0;
  public pitch: number = 0;
  public fov: number = 75;
  public sensitivity: number = 0.0022;
  public isPointerLocked: boolean = false;

  public activeItem: InventoryItem | null = null;
  public isSleeping: boolean = false;
  private animFrameId: number = 0;
  private lastTime: number = performance.now();
  private networkBroadcastTimer: number = 0;
  public onStatsUpdate?: (stats: any) => void;
  public onChatLog?: (msg: { text: string; color?: string; sender?: 'system' | 'player' | 'cheat' }) => void;
  public onSleepChange?: (sleeping: boolean) => void;

  private isDisposed: boolean = false;

  constructor(container: HTMLElement, worldType: any = 'default', seed: number = 12345) {
    this.container = container;
    this.world = new VoxelWorld(seed, worldType);
    this.physics = new PlayerPhysics(this.world, new THREE.Vector3(0, 20, 0));

    // Three.js Scene Setup
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x87ceeb, 20, 75);

    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(this.fov, aspect, 0.1, 200);
    this.camera.rotation.order = 'YXZ';

    this.renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    container.appendChild(this.renderer.domElement);

    this.entities = new EntityManager(this.scene, this.world);
    this.multiplayer = new MultiplayerManager(this.scene);
    this.trucks = new TruckManager(this.scene, this.world);

    this.trucks.onTruckCollected = (item) => {
      if (this.onTruckCollected) {
        this.onTruckCollected(item);
      }
    };
    this.trucks.onChatLog = (msg) => {
      if (this.onChatLog) {
        this.onChatLog(msg);
      }
    };

    // Setup Multiplayer Callbacks
    this.setupMultiplayerHooks();

    // Setup Lighting & Sun/Moon/Clouds
    this.ambientLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.7);
    this.scene.add(this.ambientLight);

    this.sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
    this.sunLight.position.set(50, 100, 50);
    this.scene.add(this.sunLight);

    // Sun & Moon
    const sunGeo = new THREE.PlaneGeometry(16, 16);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xfffaed, side: THREE.DoubleSide });
    this.sunMesh = new THREE.Mesh(sunGeo, sunMat);
    this.scene.add(this.sunMesh);

    const moonGeo = new THREE.PlaneGeometry(12, 12);
    const moonMat = new THREE.MeshBasicMaterial({ color: 0xeeeeff, side: THREE.DoubleSide });
    this.moonMesh = new THREE.Mesh(moonGeo, moonMat);
    this.scene.add(this.moonMesh);

    // Stars
    const starGeo = new THREE.BufferGeometry();
    const starPos: number[] = [];
    for (let i = 0; i < 400; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 90;
      starPos.push(r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi));
    }
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
    this.starsMesh = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 1.2 }));
    this.scene.add(this.starsMesh);

    // Clouds
    this.cloudsMesh = this.generateClouds();
    this.scene.add(this.cloudsMesh);

    // Rain
    const rainGeo = new THREE.BufferGeometry();
    const rainPos: number[] = [];
    for (let i = 0; i < 800; i++) {
      rainPos.push((Math.random() - 0.5) * 40, Math.random() * 30, (Math.random() - 0.5) * 40);
    }
    rainGeo.setAttribute('position', new THREE.Float32BufferAttribute(rainPos, 3));
    this.rainMesh = new THREE.Points(rainGeo, new THREE.PointsMaterial({ color: 0x6688cc, size: 0.25, transparent: true, opacity: 0.6 }));
    this.rainMesh.visible = false;
    this.scene.add(this.rainMesh);

    // Highlight wireframe box
    const boxGeo = new THREE.BoxGeometry(1.002, 1.002, 1.002);
    const edges = new THREE.EdgesGeometry(boxGeo);
    this.highlightBox = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 }));
    this.highlightBox.visible = false;
    this.scene.add(this.highlightBox);

    // Crack Overlay Mesh
    const crackMat = new THREE.MeshBasicMaterial({
      map: textureGen.getCrackTexture(0),
      transparent: true,
      depthTest: true,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    this.crackMesh = new THREE.Mesh(new THREE.BoxGeometry(1.004, 1.004, 1.004), crackMat);
    this.crackMesh.visible = false;
    this.scene.add(this.crackMesh);

    // Held Item
    this.heldItemMesh = new THREE.Group();
    this.camera.add(this.heldItemMesh);
    this.heldItemMesh.position.set(0.35, -0.32, -0.6);
    this.heldItemMesh.rotation.set(0.2, -0.4, 0.1);
    this.scene.add(this.camera);

    // Initial Spawning & World build
    this.physics.respawn();
    this.rebuildAllChunks();

    // Spawn some initial passive mobs
    this.spawnInitialMobs();

    // Start loop
    this.loop = this.loop.bind(this);
    this.animFrameId = requestAnimationFrame(this.loop);
  }

  private setupMultiplayerHooks() {
    this.multiplayer.onBlockPlacedRemote = (x, y, z, blockType, playerId) => {
      this.world.setBlock(x, y, z, blockType);
      sounds.playPlace();
    };

    this.multiplayer.onBlockBrokenRemote = (x, y, z, blockType, playerId) => {
      this.world.setBlock(x, y, z, BlockType.AIR);
      this.entities.spawnBlockBreakParticles(x, y, z, blockType);
      sounds.playBreak();
    };

    this.multiplayer.onRequestWorldData = () => {
      const modifiedObj: { [k: string]: BlockType } = {};
      this.world.modifiedBlocks.forEach((v, k) => {
        modifiedObj[k] = v;
      });
      return {
        seed: this.world.seed,
        worldType: this.world.worldType,
        modifiedBlocks: modifiedObj,
        timeOfDay: this.timeOfDay,
        weather: this.weather,
      };
    };

    this.multiplayer.onWorldSyncReceived = (data) => {
      this.world.seed = data.seed;
      this.world.worldType = data.worldType;
      this.world.modifiedBlocks.clear();
      if (data.modifiedBlocks) {
        Object.entries(data.modifiedBlocks).forEach(([k, v]) => {
          this.world.modifiedBlocks.set(k, v);
        });
      }
      this.timeOfDay = data.timeOfDay;
      this.weather = data.weather;
      this.rebuildAllChunks();
      if (this.onChatLog) {
        this.onChatLog({ text: '🌍 ¡Mundo sincronizado con el anfitrión del servidor!', color: '#55ff55', sender: 'system' });
      }
    };

    this.multiplayer.onChatMessageReceived = (msg) => {
      if (this.onChatLog) {
        this.onChatLog({ text: `<${msg.playerName}> ${msg.text}`, color: msg.color || '#ffffff', sender: 'player' });
      }
    };

    this.multiplayer.onStatusMessage = (text, color) => {
      if (this.onChatLog) {
        this.onChatLog({ text, color: color || '#ffff55', sender: 'system' });
      }
    };
  }

  private spawnInitialMobs() {
    ['pig', 'sheep', 'cow', 'pig'].forEach((type) => {
      const mx = (Math.random() - 0.5) * 20;
      const mz = (Math.random() - 0.5) * 20;
      const my = this.world.getTopSolidY(Math.floor(mx), Math.floor(mz)) + 1;
      this.entities.spawnMob(type as any, mx, my, mz);
    });
  }

  private generateClouds(): THREE.Group {
    const group = new THREE.Group();
    const cloudMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
    for (let x = -3; x <= 3; x++) {
      for (let z = -3; z <= 3; z++) {
        if (Math.random() > 0.4) {
          const cloud = new THREE.Mesh(new THREE.BoxGeometry(18, 2, 18), cloudMat);
          cloud.position.set(x * 24, 36, z * 24);
          group.add(cloud);
        }
      }
    }
    return group;
  }

  // Render Chunks with InstancedMesh per BlockType for high FPS
  private buildChunkMesh(cx: number, cz: number): THREE.Group {
    const chunkGroup = new THREE.Group();
    const startX = cx * CHUNK_SIZE;
    const startZ = cz * CHUNK_SIZE;

    // Group blocks by type
    const blocksByType: Map<BlockType, THREE.Matrix4[]> = new Map();

    const dummyMatrix = new THREE.Matrix4();
    const dummyPos = new THREE.Vector3();

    for (let lx = 0; lx < CHUNK_SIZE; lx++) {
      for (let lz = 0; lz < CHUNK_SIZE; lz++) {
        const wx = startX + lx;
        const wz = startZ + lz;

        for (let wy = 0; wy < CHUNK_HEIGHT; wy++) {
          const type = this.world.getBlock(wx, wy, wz);
          if (type === BlockType.AIR) continue;

          // Face culling: only include block if at least one adjacent face is transparent/air
          const isTransparent = (b: BlockType) =>
            b === BlockType.AIR ||
            b === BlockType.BARRIER ||
            b === BlockType.WATER ||
            b === BlockType.LEAVES ||
            b === BlockType.GLASS ||
            b === BlockType.LIQUID_CHOCOLATE ||
            b === BlockType.PORTAL_CHOCOLATE ||
            b === BlockType.PORTAL_NETHER ||
            b === BlockType.PORTAL_END ||
            b === BlockType.PORTAL_PARALLEL ||
            b === BlockType.PARALLEL_LEAVES ||
            b === BlockType.PARALLEL_WATER ||
            b === BlockType.COTTON_CANDY_PINK ||
            b === BlockType.COTTON_CANDY_BLUE;

          const top = this.world.getBlock(wx, wy + 1, wz);
          const bottom = this.world.getBlock(wx, wy - 1, wz);
          const left = this.world.getBlock(wx - 1, wy, wz);
          const right = this.world.getBlock(wx + 1, wy, wz);
          const front = this.world.getBlock(wx, wy, wz + 1);
          const back = this.world.getBlock(wx, wy, wz - 1);

          const isExposed =
            isTransparent(top) ||
            isTransparent(bottom) ||
            isTransparent(left) ||
            isTransparent(right) ||
            isTransparent(front) ||
            isTransparent(back);

          if (!isExposed) continue;

          dummyPos.set(wx + 0.5, wy + 0.5, wz + 0.5);
          dummyMatrix.makeTranslation(dummyPos.x, dummyPos.y, dummyPos.z);

          if (!blocksByType.has(type)) {
            blocksByType.set(type, []);
          }
          blocksByType.get(type)!.push(dummyMatrix.clone());
        }
      }
    }

    const boxGeo = new THREE.BoxGeometry(1, 1, 1);

    blocksByType.forEach((matrices, blockType) => {
      const materials = textureGen.getBlockMaterials(blockType);
      const instMesh = new THREE.InstancedMesh(boxGeo, materials, matrices.length);
      instMesh.castShadow = false;
      instMesh.receiveShadow = false;

      matrices.forEach((mat, idx) => {
        instMesh.setMatrixAt(idx, mat);
      });
      instMesh.instanceMatrix.needsUpdate = true;
      chunkGroup.add(instMesh);
    });

    return chunkGroup;
  }

  public rebuildAllChunks() {
    this.chunkMeshMap.forEach((grp) => {
      this.scene.remove(grp);
    });
    this.chunkMeshMap.clear();
    this.world.dirtyChunks.clear();

    const playerChunkX = Math.floor(this.physics.state.pos.x / CHUNK_SIZE);
    const playerChunkZ = Math.floor(this.physics.state.pos.z / CHUNK_SIZE);
    this.lastPlayerChunkX = playerChunkX;
    this.lastPlayerChunkZ = playerChunkZ;

    for (let cx = playerChunkX - this.renderDistance; cx <= playerChunkX + this.renderDistance; cx++) {
      for (let cz = playerChunkZ - this.renderDistance; cz <= playerChunkZ + this.renderDistance; cz++) {
        const key = this.world.getChunkKey(cx, cz);
        const group = this.buildChunkMesh(cx, cz);
        this.chunkMeshMap.set(key, group);
        this.scene.add(group);
      }
    }
  }

  private updateDirtyChunks() {
    if (this.world.dirtyChunks.size === 0) return;

    this.world.dirtyChunks.forEach((chunkKey) => {
      const [cxStr, czStr] = chunkKey.split(',');
      const cx = parseInt(cxStr, 10);
      const cz = parseInt(czStr, 10);

      // Remove old chunk mesh
      if (this.chunkMeshMap.has(chunkKey)) {
        const oldGroup = this.chunkMeshMap.get(chunkKey)!;
        this.scene.remove(oldGroup);
      }

      // Build new
      const newGroup = this.buildChunkMesh(cx, cz);
      this.chunkMeshMap.set(chunkKey, newGroup);
      this.scene.add(newGroup);
    });

    this.world.dirtyChunks.clear();
  }

  // Synchronize camera transform with current physics position and look angles immediately
  public syncCamera() {
    this.camera.position.set(
      this.physics.state.pos.x,
      this.physics.state.pos.y + this.physics.eyeHeight,
      this.physics.state.pos.z
    );
    this.camera.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;
    this.camera.updateMatrixWorld();
  }

  private lastPlayerChunkX: number = 999999;
  private lastPlayerChunkZ: number = 999999;

  public updateLoadedChunksAroundPlayer() {
    const pcx = Math.floor(this.physics.state.pos.x / CHUNK_SIZE);
    const pcz = Math.floor(this.physics.state.pos.z / CHUNK_SIZE);
    if (pcx === this.lastPlayerChunkX && pcz === this.lastPlayerChunkZ) return;

    this.lastPlayerChunkX = pcx;
    this.lastPlayerChunkZ = pcz;

    // Load newly visible chunks within render distance
    for (let cx = pcx - this.renderDistance; cx <= pcx + this.renderDistance; cx++) {
      for (let cz = pcz - this.renderDistance; cz <= pcz + this.renderDistance; cz++) {
        const key = this.world.getChunkKey(cx, cz);
        if (!this.chunkMeshMap.has(key)) {
          // Check End City procedural generation in The End outer islands
          if (this.world.dimension === 'the_end') {
            this.tryGenerateEndCityInChunk(cx, cz);
          }

          const group = this.buildChunkMesh(cx, cz);
          this.chunkMeshMap.set(key, group);
          this.scene.add(group);
        }
      }
    }

    // Cull chunks too far away
    const unloadDist = this.renderDistance + 2;
    const toRemove: string[] = [];
    this.chunkMeshMap.forEach((group, key) => {
      const [cxStr, czStr] = key.split(',');
      const cx = parseInt(cxStr, 10);
      const cz = parseInt(czStr, 10);
      if (Math.abs(cx - pcx) > unloadDist || Math.abs(cz - pcz) > unloadDist) {
        this.scene.remove(group);
        toRemove.push(key);
      }
    });
    for (const key of toRemove) {
      this.chunkMeshMap.delete(key);
    }
  }

  // 5% chance for End City, and 2% chance in the End City for floating End Ship with Elytra
  private tryGenerateEndCityInChunk(cx: number, cz: number) {
    const chunkKey = `${cx},${cz}`;
    if (this.evaluatedEndCityChunks.has(chunkKey)) return;
    this.evaluatedEndCityChunks.add(chunkKey);

    const distCenter = Math.sqrt(cx * cx + cz * cz);
    if (distCenter < 4) return; // Only in outer islands beyond the central dragon arena

    // Guaranteed test/discovery location at chunk (5, 5) -> X: 80, Z: 80
    const isGuaranteed = cx === 5 && cz === 5;

    // 5% chance of finding an End City
    const cityHash = Math.abs(Math.sin(cx * 374.13 + cz * 157.91 + this.world.seed * 71.3) * 43758.5453) % 1;
    const hasCity = isGuaranteed || cityHash < 0.05;

    if (!hasCity) return;

    // 2% chance that the End City contains a floating End Ship with Elytras
    const shipHash = Math.abs(Math.sin(cx * 911.3 + cz * 423.7 + this.world.seed * 19.7) * 23421.631) % 1;
    const hasShip = isGuaranteed || shipHash < 0.02;

    const originX = cx * CHUNK_SIZE + 3;
    const originZ = cz * CHUNK_SIZE + 3;
    const originY = Math.max(16, this.world.getTopSolidY(originX, originZ) + 1);

    const city = buildEndCity(this.world, originX, originY, originZ, hasShip);

    if (hasShip && city.elytraPos) {
      this.spawnElytraPickup(city.elytraPos.x, city.elytraPos.y, city.elytraPos.z);
      if (this.onChatLog) {
        this.onChatLog({
          text: `⛵ ¡Has avistado una Ciudad del Fin con un Barco Flotante! (Contiene Élitros a bordo en [X: ${city.elytraPos.x}, Y: ${city.elytraPos.y}, Z: ${city.elytraPos.z}])`,
          color: '#d870ff',
          sender: 'system',
        });
      }
    } else {
      if (this.onChatLog) {
        this.onChatLog({
          text: `🏛️ ¡Has descubierto una Ciudad del Fin (End City) en [X: ${originX}, Z: ${originZ}]!`,
          color: '#55ffff',
          sender: 'system',
        });
      }
    }
  }

  // Helper to determine if a block is solid and targetable for raycast (ignoring fluids and portals across all dimensions)
  public isTargetableBlock(block: BlockType): boolean {
    return (
      block !== BlockType.AIR &&
      block !== BlockType.WATER &&
      block !== BlockType.LAVA &&
      block !== BlockType.LIQUID_CHOCOLATE &&
      block !== BlockType.PARALLEL_WATER &&
      block !== BlockType.PORTAL_CHOCOLATE &&
      block !== BlockType.PORTAL_NETHER &&
      block !== BlockType.PORTAL_END &&
      block !== BlockType.PORTAL_PARALLEL
    );
  }

  // Fast Voxel Raycaster (Amanatides & Woo DDA with high precision boundary handling)
  public raycastBlock(maxDist = 6.0): RaycastHit | null {
    this.syncCamera();
    const origin = this.camera.position;
    const dir = new THREE.Vector3();
    this.camera.getWorldDirection(dir);
    if (dir.lengthSq() < 1e-6) return null;
    dir.normalize();

    // Small numerical offset to avoid boundary precision artifacts
    const eps = 1e-5;
    const startX = origin.x + dir.x * eps;
    const startY = origin.y + dir.y * eps;
    const startZ = origin.z + dir.z * eps;

    let x = Math.floor(startX);
    let y = Math.floor(startY);
    let z = Math.floor(startZ);

    const stepX = dir.x > 0 ? 1 : (dir.x < 0 ? -1 : 0);
    const stepY = dir.y > 0 ? 1 : (dir.y < 0 ? -1 : 0);
    const stepZ = dir.z > 0 ? 1 : (dir.z < 0 ? -1 : 0);

    const tDeltaX = stepX !== 0 ? Math.abs(1 / dir.x) : Infinity;
    const tDeltaY = stepY !== 0 ? Math.abs(1 / dir.y) : Infinity;
    const tDeltaZ = stepZ !== 0 ? Math.abs(1 / dir.z) : Infinity;

    let tMaxX = stepX > 0 ? (x + 1 - startX) * tDeltaX : (stepX < 0 ? (startX - x) * tDeltaX : Infinity);
    let tMaxY = stepY > 0 ? (y + 1 - startY) * tDeltaY : (stepY < 0 ? (startY - y) * tDeltaY : Infinity);
    let tMaxZ = stepZ > 0 ? (z + 1 - startZ) * tDeltaZ : (stepZ < 0 ? (startZ - z) * tDeltaZ : Infinity);

    if (tMaxX <= 0) tMaxX = tDeltaX;
    if (tMaxY <= 0) tMaxY = tDeltaY;
    if (tMaxZ <= 0) tMaxZ = tDeltaZ;

    const normal = new THREE.Vector3();
    let dist = 0;

    while (dist <= maxDist) {
      if (tMaxX <= tMaxY && tMaxX <= tMaxZ) {
        x += stepX;
        dist = tMaxX;
        tMaxX += tDeltaX;
        normal.set(-stepX, 0, 0);
      } else if (tMaxY <= tMaxZ) {
        y += stepY;
        dist = tMaxY;
        tMaxY += tDeltaY;
        normal.set(0, -stepY, 0);
      } else {
        z += stepZ;
        dist = tMaxZ;
        tMaxZ += tDeltaZ;
        normal.set(0, 0, -stepZ);
      }

      if (dist > maxDist) break;

      const block = this.world.getBlock(x, y, z);
      if (this.isTargetableBlock(block)) {
        // Calculate the exact face normal using ray slab entry
        // Guarantees placed blocks attach to the exact face the player is targeting
        const tx = dir.x !== 0 ? (dir.x > 0 ? (x - origin.x) / dir.x : (x + 1 - origin.x) / dir.x) : -Infinity;
        const ty = dir.y !== 0 ? (dir.y > 0 ? (y - origin.y) / dir.y : (y + 1 - origin.y) / dir.y) : -Infinity;
        const tz = dir.z !== 0 ? (dir.z > 0 ? (z - origin.z) / dir.z : (z + 1 - origin.z) / dir.z) : -Infinity;

        const maxT = Math.max(tx, ty, tz);
        const exactNormal = new THREE.Vector3();
        if (maxT === ty) {
          exactNormal.set(0, dir.y > 0 ? -1 : 1, 0);
        } else if (maxT === tx) {
          exactNormal.set(dir.x > 0 ? -1 : 1, 0, 0);
        } else {
          exactNormal.set(0, 0, dir.z > 0 ? -1 : 1);
        }

        return {
          blockX: x,
          blockY: y,
          blockZ: z,
          faceNormal: exactNormal,
          distance: dist,
          blockType: block,
        };
      }
    }

    return null;
  }

  // Update Held Item View Model
  public updateHeldItem(item: InventoryItem | null) {
    this.activeItem = item;

    // Clear old held item
    while (this.heldItemMesh.children.length > 0) {
      this.heldItemMesh.remove(this.heldItemMesh.children[0]);
    }

    if (!item) return;

    if (item.isBlock && item.blockType) {
      const geo = new THREE.BoxGeometry(0.24, 0.24, 0.24);
      const mats = textureGen.getBlockMaterials(item.blockType);
      const mesh = new THREE.Mesh(geo, mats);
      this.heldItemMesh.add(mesh);
    } else {
      // 3D Tool Model
      const color = item.iconColor || '#5fe0db';
      const handleMat = new THREE.MeshLambertMaterial({ color: 0x8a5528 });
      const bladeMat = new THREE.MeshLambertMaterial({ color });

      const handle = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.35, 0.04), handleMat);
      handle.position.y = -0.1;
      this.heldItemMesh.add(handle);

      if (item.itemType?.startsWith('sword')) {
        const guard = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.06), bladeMat);
        guard.position.y = 0.06;
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.38, 0.03), bladeMat);
        blade.position.y = 0.26;
        this.heldItemMesh.add(guard, blade);
      } else if (item.itemType?.startsWith('pickaxe')) {
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.06, 0.06), bladeMat);
        head.position.y = 0.12;
        this.heldItemMesh.add(head);
      } else if (item.itemType === 'ender_pearl') {
        const pearl = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), new THREE.MeshLambertMaterial({ color: 0x1f665e, emissive: 0x0a332e }));
        this.heldItemMesh.add(pearl);
      } else if (item.itemType === 'elytra') {
        const wingMat = new THREE.MeshLambertMaterial({ color: 0x475569 });
        const wingL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.35, 0.18), wingMat);
        wingL.position.set(-0.06, 0.1, 0);
        wingL.rotation.z = 0.3;
        const wingR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.35, 0.18), wingMat);
        wingR.position.set(0.06, 0.1, 0);
        wingR.rotation.z = -0.3;
        this.heldItemMesh.add(wingL, wingR);
      } else if (item.itemType === 'firework_rocket') {
        const tubeMat = new THREE.MeshLambertMaterial({ color: 0xf8fafc });
        const redMat = new THREE.MeshLambertMaterial({ color: 0xdc2626 });
        const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.28, 8), tubeMat);
        tube.position.y = 0.08;
        const tip = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.12, 8), redMat);
        tip.position.y = 0.28;
        this.heldItemMesh.add(tube, tip);
      } else {
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.06), bladeMat);
        head.position.y = 0.1;
        this.heldItemMesh.add(head);
      }
    }
  }

  // Trigger attack/break swing animation
  public swingHand() {
    this.heldItemSwing = 1.0;
  }

  // Attack mob or Ender Dragon boss under crosshair
  public attackEntity(): boolean {
    const camPos = this.camera.position.clone();
    const camDir = this.camera.getWorldDirection(new THREE.Vector3()).normalize();

    // Weapon damage calculations
    const weapon = this.activeItem?.itemType;
    const isDiamondSword = weapon === 'sword_diamond';
    const isAdminSword = weapon === 'admin_sword';
    let damage = 2; // Hand / default
    let weaponName = 'tus puños';

    if (isAdminSword) {
      damage = 9999;
      weaponName = '⚔️ la Espada del Creador (Admin God Blade)';
    } else if (isDiamondSword) {
      damage = 10;
      weaponName = 'la Espada de Diamante';
    } else if (weapon === 'axe_diamond') {
      damage = 7;
      weaponName = 'el Hacha de Diamante';
    } else if (weapon === 'pickaxe_diamond') {
      damage = 5;
      weaponName = 'el Pico de Diamante';
    } else if (weapon === 'shovel_diamond') {
      damage = 4;
      weaponName = 'la Pala de Diamante';
    }

    // 1. Check Ender Dragon (if in The End and alive)
    if (this.world.dimension === 'the_end' && this.enderDragon && this.enderDragon.isAlive) {
      const hitDragon = this.enderDragon.checkRayHit(camPos, camDir, 14.0);
      if (hitDragon) {
        this.swingHand();
        sounds.playSwordSlash(isDiamondSword);
        this.enderDragon.takeDamage(damage);
        this.entities.spawnHitSparkParticles(
          this.enderDragon.position.x,
          this.enderDragon.position.y,
          this.enderDragon.position.z,
          isDiamondSword
        );

        if (this.onChatLog) {
          this.onChatLog({
            text: `⚔️ ¡Golpeaste a la Dragona de Ender con ${weaponName}! (${damage} de daño) - Salud: ${Math.max(0, Math.ceil(this.enderDragon.health))} / ${this.enderDragon.maxHealth} HP`,
            color: isDiamondSword ? '#55ffff' : '#ffaa00',
            sender: 'system',
          });
        }
        return true;
      }
    }

    // 2. Check standard mobs
    const hitMobResult = this.entities.findMobUnderRay(camPos, camDir, 4.5);
    if (hitMobResult) {
      // Check if a solid block is between player and mob
      const blockHit = this.raycastBlock(hitMobResult.distance);
      if (!blockHit) {
        this.swingHand();
        sounds.playSwordSlash(isDiamondSword);

        const knockbackDir = {
          x: -Math.sin(this.yaw),
          z: -Math.cos(this.yaw),
        };

        const res = this.entities.damageMob(hitMobResult.mob.id, damage, knockbackDir);
        this.entities.spawnHitSparkParticles(
          hitMobResult.mob.position.x,
          hitMobResult.mob.position.y + 0.6,
          hitMobResult.mob.position.z,
          isDiamondSword
        );

        const mobNames: Record<string, string> = {
          pig: 'Cerdo',
          sheep: 'Oveja',
          cow: 'Vaca',
          zombie: 'Zombi',
          creeper: 'Creeper',
          enderman: 'Enderman',
        };
        const mName = mobNames[hitMobResult.mob.type] || hitMobResult.mob.type;

        if (this.onChatLog) {
          if (res.killed) {
            this.onChatLog({
              text: `💥 ¡Has derrotado a ${mName} con ${weaponName}! (${damage} de daño)`,
              color: '#ff5555',
              sender: 'system',
            });
          } else {
            this.onChatLog({
              text: `⚔️ ¡Golpeaste a ${mName} con ${weaponName}! (${damage} de daño) - Salud: ${Math.ceil(res.mob?.health || 0)} HP`,
              color: isDiamondSword ? '#55ffff' : '#ffff55',
              sender: 'system',
            });
          }
        }
        return true;
      }
    }

    return false;
  }

  // Spawn Ender Dragon boss in The End
  public spawnEnderDragonBoss() {
    if (this.enderDragon) {
      this.enderDragon.dispose();
    }
    this.enderDragon = new EnderDragon(this.scene, this.world);
    this.enderDragon.onDefeated = () => {
      this.isEnderDragonDefeated = true;
      this.rebuildAllChunks();
      sounds.playCheatSuccess();
      this.entities.spawnFireworkParticles(0, 32, 0, 30);
      if (this.onChatLog) {
        this.onChatLog({
          text: '🏆 ¡HAS DERROTADO A LA DRAGONA DE ENDER!',
          color: '#d870ff',
          sender: 'system',
        });
        this.onChatLog({
          text: '🌌 El Portal de retorno al Overworld ha sido abierto en el centro de la isla (X: 0, Z: 0). ¡Entra cuando quieras para regresar al Overworld!',
          color: '#55ffff',
          sender: 'system',
        });
      }
    };

    if (this.onChatLog) {
      this.onChatLog({
        text: '🐲 ¡HA APARECIDO LA DRAGONA DE ENDER! Derrótala para abrir el portal de regreso al Overworld.',
        color: '#d870ff',
        sender: 'system',
      });
    }
  }

  // Spawn floating Elytra pickup inside End Ship treasure room
  public spawnElytraPickup(x: number, y: number, z: number) {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    // Pedestal base
    const baseMat = new THREE.MeshLambertMaterial({ color: 0x221a36 });
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 0.15, 8), baseMat);
    base.position.y = -0.3;
    group.add(base);

    // Elytra Wings model
    const wingMat = new THREE.MeshLambertMaterial({ color: 0x475569, emissive: 0x3b0764, side: THREE.DoubleSide });
    const wingL = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.04, 0.8), wingMat);
    wingL.position.set(-0.25, 0, 0);
    wingL.rotation.z = 0.25;
    wingL.rotation.y = 0.15;

    const wingR = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.04, 0.8), wingMat);
    wingR.position.set(0.25, 0, 0);
    wingR.rotation.z = -0.25;
    wingR.rotation.y = -0.15;

    // Center mantle
    const mantleMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
    const mantle = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 0.4), mantleMat);

    group.add(wingL, wingR, mantle);

    this.scene.add(group);
    this.elytraPickups.push({
      group,
      baseY: y,
      collected: false,
    });
  }

  // Place Block or Use Item
  public useItem() {
    if (this.placeCooldownFrames > 0 || this.placeCooldownTimer > 0) {
      return;
    }
    this.swingHand();
    const hit = this.raycastBlock(6.0);

    // Chocolate Bar Eating (Restores full hunger + Gives speed boost)
    if (this.activeItem?.itemType === 'chocolate_bar') {
      this.physics.state.hunger = 20;
      this.physics.state.speedMultiplier = 1.5;
      sounds.playClick();
      if (this.onChatLog) {
        this.onChatLog({
          text: '🍫 ¡Ñam! Has saboreado una deliciosa Barra de Chocolate (+Velocidad y Hambre al máximo).',
          color: '#ffaa00',
          sender: 'system',
        });
      }
      setTimeout(() => {
        if (!this.isDisposed && this.physics.state.speedMultiplier === 1.5) {
          this.physics.state.speedMultiplier = 1.0;
        }
      }, 20000);
      return;
    }

    // Golden Apple Eating
    if (this.activeItem?.itemType === 'golden_apple') {
      this.physics.state.health = 20;
      this.physics.state.hunger = 20;
      sounds.playSpawnPoint();
      if (this.onChatLog) {
        this.onChatLog({
          text: '🍎 ¡Has consumido una Manzana Dorada legendaria! (Vida y Hambre restauradas al 100%).',
          color: '#ffd700',
          sender: 'system',
        });
      }
      return;
    }

    // Cooked Beef Eating
    if (this.activeItem?.itemType === 'cooked_beef') {
      this.physics.state.hunger = Math.min(20, this.physics.state.hunger + 8);
      sounds.playClick();
      if (this.onChatLog) {
        this.onChatLog({
          text: '🥩 Has comido un Filete Asado (+8 de Hambre).',
          color: '#ffbb88',
          sender: 'system',
        });
      }
      return;
    }

    // Ender Pearl Teleport Cheat/Item
    if (this.activeItem?.itemType === 'ender_pearl') {
      const targetPos = hit
        ? new THREE.Vector3(hit.blockX + hit.faceNormal.x, hit.blockY + hit.faceNormal.y + 1, hit.blockZ + hit.faceNormal.z)
        : this.camera.position.clone().add(this.camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(20));
      
      this.physics.state.pos.copy(targetPos);
      sounds.playTeleport();
      this.entities.spawnExplosionParticles(targetPos.x, targetPos.y, targetPos.z);
      if (this.onChatLog) this.onChatLog({ text: `Teletransportado a [${Math.round(targetPos.x)}, ${Math.round(targetPos.y)}, ${Math.round(targetPos.z)}]`, color: '#3cd070' });
      return;
    }

    // Admin Tools Handlers
    // 1. Admin God Blade Right-Click Energy Slash
    if (this.activeItem?.itemType === 'admin_sword') {
      sounds.playSwordSlash(true);
      sounds.playExplosion();
      const p = this.physics.state.pos;
      const fwd = this.camera.getWorldDirection(new THREE.Vector3());
      this.entities.spawnExplosionParticles(p.x + fwd.x * 2.5, p.y + 1.2 + fwd.y * 2.5, p.z + fwd.z * 2.5);
      if (this.onChatLog) {
        this.onChatLog({
          text: '⚔️ [Admin] ¡Corte de Energía Divina liberado!',
          color: '#ef4444',
          sender: 'system',
        });
      }
      return;
    }

    // 2. Admin Instant Teleport Wand (Long-distance raycast up to 120 blocks)
    if (this.activeItem?.itemType === 'admin_teleport_wand') {
      const farHit = this.raycastBlock(120.0);
      const targetPos = farHit
        ? new THREE.Vector3(farHit.blockX + farHit.faceNormal.x + 0.5, farHit.blockY + farHit.faceNormal.y + 0.1, farHit.blockZ + farHit.faceNormal.z + 0.5)
        : this.camera.position.clone().add(this.camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(40));

      this.physics.state.pos.copy(targetPos);
      sounds.playTeleport();
      this.entities.spawnExplosionParticles(targetPos.x, targetPos.y + 1, targetPos.z);
      if (this.onChatLog) {
        this.onChatLog({
          text: `⚡ [Admin Teleport] Teletransportado instantáneamente a [${Math.round(targetPos.x)}, ${Math.round(targetPos.y)}, ${Math.round(targetPos.z)}]`,
          color: '#a855f7',
          sender: 'system',
        });
      }
      return;
    }

    // 3. Admin Debug Stick (Inspect & Transform Block)
    if (this.activeItem?.itemType === 'admin_wand') {
      if (!hit) {
        if (this.onChatLog) {
          this.onChatLog({
            text: '🪄 [Admin Debug Stick] Apunta hacia un bloque para inspeccionar o cambiar sus propiedades.',
            color: '#06b6d4',
            sender: 'system',
          });
        }
        return;
      }

      const blockNames: Record<number, string> = {
        [BlockType.AIR]: 'Aire',
        [BlockType.GRASS]: 'Césped',
        [BlockType.DIRT]: 'Tierra',
        [BlockType.STONE]: 'Piedra',
        [BlockType.COBBLESTONE]: 'Adoquín',
        [BlockType.WOOD_PLANKS]: 'Madera de Roble',
        [BlockType.BEDROCK]: 'Lecho de Roca (Bedrock)',
        [BlockType.DIAMOND_ORE]: 'Mena de Diamante',
        [BlockType.DIAMOND_BLOCK]: 'Bloque de Diamante',
        [BlockType.GOLD_BLOCK]: 'Bloque de Oro',
        [BlockType.OBSIDIAN]: 'Obsidiana',
        [BlockType.COMMAND_BLOCK]: 'Bloque de Comandos',
        [BlockType.STRUCTURE_BLOCK]: 'Bloque de Estructuras',
        [BlockType.BARRIER]: 'Barrera Invisible (Barrier)',
        [BlockType.END_STONE]: 'Piedra del End',
        [BlockType.PURPUR_BLOCK]: 'Bloque de Purpur',
      };

      const bName = blockNames[hit.blockType] || `Bloque #${hit.blockType}`;
      const dim = this.world.dimension.toUpperCase();

      // If sneaking or shifting, cycle block type
      if (this.physics.state.isSneaking) {
        const cycle = [
          BlockType.DIAMOND_BLOCK,
          BlockType.GOLD_BLOCK,
          BlockType.OBSIDIAN,
          BlockType.COMMAND_BLOCK,
          BlockType.STRUCTURE_BLOCK,
          BlockType.BARRIER,
          BlockType.GLASS,
          BlockType.STONE,
        ];
        const nextIdx = (cycle.indexOf(hit.blockType) + 1) % cycle.length;
        const nextType = cycle[nextIdx];
        this.world.setBlock(hit.blockX, hit.blockY, hit.blockZ, nextType);
        sounds.playClick();
        this.entities.spawnHitSparkParticles(hit.blockX + 0.5, hit.blockY + 0.5, hit.blockZ + 0.5, true);
        if (this.onChatLog) {
          this.onChatLog({
            text: `🪄 [Admin Debug Stick] Bloque transformado a: ${blockNames[nextType] || nextType}`,
            color: '#38bdf8',
            sender: 'system',
          });
        }
      } else {
        sounds.playClick();
        if (this.onChatLog) {
          this.onChatLog({
            text: `🪄 [Admin Debug] ${bName} en [${hit.blockX}, ${hit.blockY}, ${hit.blockZ}] | Dimensión: ${dim} | Cara normal: (${hit.faceNormal.x}, ${hit.faceNormal.y}, ${hit.faceNormal.z}) (Shift+Clic para transformar)`,
            color: '#06b6d4',
            sender: 'system',
          });
        }
      }
      return;
    }

    // 4. Admin Kill Wand (Entities Purge in 50 blocks)
    if (this.activeItem?.itemType === 'admin_kill_wand') {
      const p = this.physics.state.pos;
      const count = this.entities.killAllMobsInRadius(p.x, p.y, p.z, 50.0);
      sounds.playExplosion();
      this.entities.spawnExplosionParticles(p.x, p.y + 1, p.z);
      if (this.onChatLog) {
        this.onChatLog({
          text: `💀 [Admin Kill Wand] ¡${count} entidades eliminadas en un radio de 50 bloques!`,
          color: '#f43f5e',
          sender: 'system',
        });
      }
      return;
    }

    // 5. Admin Nuke Wand (Explosion & shockwave)
    if (this.activeItem?.itemType === 'admin_nuke_wand') {
      const targetHit = this.raycastBlock(60.0);
      const targetPos = targetHit
        ? new THREE.Vector3(targetHit.blockX + 0.5, targetHit.blockY + 0.5, targetHit.blockZ + 0.5)
        : this.camera.position.clone().add(this.camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(20));

      sounds.playExplosion();
      sounds.playFireworkBurst();
      this.entities.spawnExplosionParticles(targetPos.x, targetPos.y, targetPos.z);
      this.entities.spawnFireworkParticles(targetPos.x, targetPos.y + 2, targetPos.z, 12);
      this.entities.killAllMobsInRadius(targetPos.x, targetPos.y, targetPos.z, 14.0);

      if (this.onChatLog) {
        this.onChatLog({
          text: `💥 [Admin Nuke] ¡Detonación táctica de alta potencia ejecutada en [${Math.round(targetPos.x)}, ${Math.round(targetPos.y)}, ${Math.round(targetPos.z)}]!`,
          color: '#ea580c',
          sender: 'system',
        });
      }
      return;
    }

    // 6. Admin Totem (Godmode, Flight & Max Stats)
    if (this.activeItem?.itemType === 'admin_totem') {
      this.physics.state.health = 20;
      this.physics.state.hunger = 20;
      this.physics.state.isFlying = !this.physics.state.isFlying;
      this.physics.state.speedMultiplier = this.physics.state.isFlying ? 2.2 : 1.0;
      sounds.playSpawnPoint();
      const p = this.physics.state.pos;
      this.entities.spawnHitSparkParticles(p.x, p.y + 1, p.z, true);

      if (this.onChatLog) {
        this.onChatLog({
          text: `🌟 [Admin Tótem] ¡Poderes Supremos Activados! Vuelo: ${this.physics.state.isFlying ? 'ACTIVADO (x2.2 Vel)' : 'DESACTIVADO'}, Salud y Comida: 100%.`,
          color: '#fbbf24',
          sender: 'system',
        });
      }
      return;
    }

    // 7. Admin Weather & Time Controller
    if (this.activeItem?.itemType === 'admin_weather_wand') {
      // Toggle Time (Day <-> Night)
      this.timeOfDay = (this.timeOfDay + 0.5) % 1.0;
      // Cycle Weather (clear -> rain -> thunder -> clear)
      const nextWeather = this.weather === 'clear' ? 'rain' : this.weather === 'rain' ? 'thunder' : 'clear';
      this.weather = nextWeather;
      sounds.playClick();

      if (this.onChatLog) {
        this.onChatLog({
          text: `☀️ [Admin Clima] Clima cambiado a: ${nextWeather.toUpperCase()} | Ciclo solar invertido (${this.timeOfDay < 0.5 ? 'Día' : 'Noche'}).`,
          color: '#38bdf8',
          sender: 'system',
        });
      }
      return;
    }

    // Elytra Deployment (Toggle Flight / Gliding)
    if (this.activeItem?.itemType === 'elytra') {
      const willGlide = !this.physics.state.isGliding;
      this.physics.toggleGliding(willGlide);
      if (willGlide) {
        // If on ground, boost slightly upward to launch
        if (this.physics.state.onGround) {
          this.physics.state.vel.y = 8.0;
          this.physics.state.onGround = false;
        }
        sounds.playElytraGlide();
        if (this.onChatLog) {
          this.onChatLog({
            text: '🪽 ¡Élitros desplegados! Planea por el aire y usa fuegos artificiales para propulsarte.',
            color: '#c084fc',
            sender: 'system',
          });
        }
      } else {
        if (this.onChatLog) {
          this.onChatLog({
            text: '🪽 Élitros replegados.',
            color: '#94a3b8',
            sender: 'system',
          });
        }
      }
      return;
    }

    // Firework Rocket Propulsion
    if (this.activeItem?.itemType === 'firework_rocket') {
      sounds.playFireworkLaunch();
      const lookDir = this.camera.getWorldDirection(new THREE.Vector3());

      // If on ground, launch into the air
      if (this.physics.state.onGround) {
        this.physics.state.vel.y = 9.5;
        this.physics.state.pos.y += 0.5;
        this.physics.state.onGround = false;
      }

      // Activate boost and glide
      this.physics.activateFireworkBoost(2.5);
      this.physics.state.vel.addScaledVector(lookDir, 16.0);

      // Spawn subtle lightweight firework trail (minimal particles, zero lag)
      const p = this.physics.state.pos;
      this.entities.spawnFireworkParticles(p.x, p.y + 0.2, p.z, 4);

      // Light burst sound and small spark burst after brief delay
      setTimeout(() => {
        if (!this.isDisposed) {
          sounds.playFireworkBurst();
          const curPos = this.physics.state.pos;
          this.entities.spawnFireworkParticles(curPos.x, curPos.y + 0.5, curPos.z, 5);
        }
      }, 500);

      if (this.onChatLog) {
        this.onChatLog({
          text: '🎆 ¡Propulsión pirotécnica activada! Velocidad supersónica alcanzada.',
          color: '#ef4444',
          sender: 'system',
        });
      }
      return;
    }

    // Camioneta Dulce Item placement
    if (this.activeItem?.itemType === 'camioneta_item') {
      const spawnPos = hit
        ? new THREE.Vector3(hit.blockX + hit.faceNormal.x + 0.5, hit.blockY + hit.faceNormal.y + 0.5, hit.blockZ + hit.faceNormal.z + 0.5)
        : this.physics.state.pos.clone().add(this.camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(3.0));

      this.trucks.spawnTruck(spawnPos.x, spawnPos.y, spawnPos.z, this.yaw, this.world.dimension);
      sounds.playPlace();
      sounds.playTruckHorn();
      this.entities.spawnBlockBreakParticles(Math.floor(spawnPos.x), Math.floor(spawnPos.y), Math.floor(spawnPos.z), BlockType.COTTON_CANDY_PINK);

      if (this.onTruckPlaced) {
        this.onTruckPlaced();
      }

      if (this.onChatLog) {
        this.onChatLog({
          text: '🛻 ¡Camioneta colocada en el terreno! Puedes subirte o guardarla con doble clic.',
          color: '#55ff55',
          sender: 'system',
        });
      }
      return;
    }

    // Enter / Exit Truck driving if aiming near truck
    const aimDir = this.camera.getWorldDirection(new THREE.Vector3());
    const targetedTruck = this.trucks.findTargetedTruck(this.physics.state.pos, aimDir);
    if (targetedTruck && !this.activeItem?.isBlock) {
      if (this.trucks.drivingTruck === targetedTruck) {
        this.trucks.exitDriving();
      } else {
        this.trucks.enterDriving(targetedTruck);
      }
      return;
    }

    if (!hit) return;

    // Chocolate Bucket Activation (Liquid Chocolate / Activate Chocolate Portal)
    if (this.activeItem?.itemType === 'bucket_chocolate') {
      const isChoc =
        hit.blockType === BlockType.CHOCOLATE_BLOCK ||
        hit.blockType === BlockType.DARK_CHOCOLATE ||
        hit.blockType === BlockType.WHITE_CHOCOLATE;

      if (isChoc || hit.blockType === BlockType.AIR) {
        const activated = this.tryActivateChocolatePortal(hit.blockX, hit.blockY, hit.blockZ);
        if (activated) return;
      }
    }

    // Mirror Shard / Parallel Portal Ignition
    if (this.activeItem?.itemType === 'mirror_shard' || (this.activeItem?.itemType === 'flint_and_steel' && hit.blockType === BlockType.PARALLEL_MIRROR_BLOCK)) {
      const activated = this.tryActivateParallelPortal(hit.blockX, hit.blockY, hit.blockZ);
      if (activated) return;
    }

    // Bed Interaction (Set spawn point & sleep / skip night)
    const isBed =
      hit.blockType === BlockType.BED_RED ||
      hit.blockType === BlockType.BED_BLUE ||
      hit.blockType === BlockType.BED_WHITE ||
      hit.blockType === BlockType.BED_GREEN;

    if (isBed && !this.physics.state.isSneaking) {
      this.interactWithBed(hit.blockX, hit.blockY, hit.blockZ);
      return;
    }

    // Command Block (Bloque de Trucos) Interaction
    if (hit.blockType === BlockType.COMMAND_BLOCK && !this.physics.state.isSneaking) {
      const saved = this.getCommandBlockData(hit.blockX, hit.blockY, hit.blockZ);
      sounds.playClick();
      if (this.onOpenCommandBlockUI) {
        this.onOpenCommandBlockUI({
          x: hit.blockX,
          y: hit.blockY,
          z: hit.blockZ,
          command: saved,
        });
      }
      return;
    }

    // Structure Block (Bloque de Estructuras) Interaction
    if (hit.blockType === BlockType.STRUCTURE_BLOCK && !this.physics.state.isSneaking) {
      sounds.playClick();
      if (this.onOpenStructureBlockUI) {
        this.onOpenStructureBlockUI({
          x: hit.blockX,
          y: hit.blockY,
          z: hit.blockZ,
        });
      }
      return;
    }

    // Flint and steel (TNT detonation or Nether Portal ignition)
    if (this.activeItem?.itemType === 'flint_and_steel') {
      if (hit.blockType === BlockType.TNT) {
        this.world.setBlock(hit.blockX, hit.blockY, hit.blockZ, BlockType.AIR);
        this.entities.spawnTNT(hit.blockX + 0.5, hit.blockY + 0.5, hit.blockZ + 0.5, 3.0);
        return;
      }
      if (hit.blockType === BlockType.OBSIDIAN) {
        const activated = this.tryActivateNetherPortal(hit.blockX, hit.blockY, hit.blockZ);
        if (activated) return;
      }
    }

    // Place Block
    if (this.activeItem?.isBlock && this.activeItem.blockType !== undefined) {
      if (!hit) return;
      const px = hit.blockX + hit.faceNormal.x;
      const py = hit.blockY + hit.faceNormal.y;
      const pz = hit.blockZ + hit.faceNormal.z;

      // Don't place inside player body
      if (!this.physics.state.isNoclip) {
        const halfW = this.physics.playerWidth / 2;
        const pMinX = this.physics.state.pos.x - halfW;
        const pMaxX = this.physics.state.pos.x + halfW;
        const pMinY = this.physics.state.pos.y;
        const pMaxY = this.physics.state.pos.y + this.physics.playerHeight;
        const pMinZ = this.physics.state.pos.z - halfW;
        const pMaxZ = this.physics.state.pos.z + halfW;

        if (
          px < pMaxX && px + 1 > pMinX &&
          py < pMaxY && py + 1 > pMinY &&
          pz < pMaxZ && pz + 1 > pMinZ
        ) {
          return;
        }
      }

      this.world.setBlock(px, py, pz, this.activeItem.blockType);
      this.multiplayer.broadcastBlockPlace(px, py, pz, this.activeItem.blockType);
      sounds.playPlace();

      // Enforce 10-frame / 0.18s cooldown to prevent double-placing or placing against newly placed block
      this.placeCooldownFrames = 10;
      this.placeCooldownTimer = 0.18;

      // If placed Command Block or Structure Block, open configuration UI for convenience
      if (this.activeItem.blockType === BlockType.COMMAND_BLOCK) {
        setTimeout(() => {
          if (!this.isDisposed && this.onOpenCommandBlockUI) {
            this.onOpenCommandBlockUI({ x: px, y: py, z: pz, command: '' });
          }
        }, 120);
      } else if (this.activeItem.blockType === BlockType.STRUCTURE_BLOCK) {
        setTimeout(() => {
          if (!this.isDisposed && this.onOpenStructureBlockUI) {
            this.onOpenStructureBlockUI({ x: px, y: py, z: pz });
          }
        }, 120);
      }
    }
  }

  // Detect and ignite chocolate portal within frame or build one
  public tryActivateChocolatePortal(bx: number, by: number, bz: number): boolean {
    const isChocolate = (t: BlockType) =>
      t === BlockType.CHOCOLATE_BLOCK || t === BlockType.DARK_CHOCOLATE || t === BlockType.WHITE_CHOCOLATE;

    // Scan nearby area for a frame (search +/- 3 in X or Z, and +1..+4 in Y)
    let frameFound = false;

    // Try X-axis frame
    for (let ox = -2; ox <= 2; ox++) {
      for (let oy = -1; oy <= 2; oy++) {
        const x = bx + ox;
        const y = by + oy;
        // Check if (x, y..y+2) is hollow air and surrounded by chocolate
        const isHollow = this.world.getBlock(x, y, bz) === BlockType.AIR || this.world.getBlock(x, y, bz) === BlockType.LIQUID_CHOCOLATE;
        const bottomChoc = isChocolate(this.world.getBlock(x, y - 1, bz));
        const leftChoc = isChocolate(this.world.getBlock(x - 1, y, bz));
        const rightChoc = isChocolate(this.world.getBlock(x + 1, y, bz));

        if (isHollow && (bottomChoc || leftChoc || rightChoc)) {
          // Fill opening with chocolate portal blocks
          for (let dy = 0; dy < 3; dy++) {
            for (let dx = 0; dx < 2; dx++) {
              const cur = this.world.getBlock(x + dx, y + dy, bz);
              if (cur === BlockType.AIR || cur === BlockType.LIQUID_CHOCOLATE) {
                this.world.setBlock(x + dx, y + dy, bz, BlockType.PORTAL_CHOCOLATE);
              }
            }
          }
          frameFound = true;
          break;
        }
      }
      if (frameFound) break;
    }

    // If no complete frame found, construct a complete portal right at the spot!
    if (!frameFound) {
      this.world.buildPortalStructure(bx, Math.max(1, by), bz, 'chocolate', 'x');
    }

    sounds.playSpawnPoint();
    this.entities.spawnExplosionParticles(bx, by + 1, bz);
    if (this.onChatLog) {
      this.onChatLog({
        text: '🍫 ¡Portal a la Dimensión de Chocolate activado! Entra en el portal para viajar.',
        color: '#ffbb33',
        sender: 'system',
      });
    }
    return true;
  }

  // Detect and ignite Nether portal
  public tryActivateNetherPortal(bx: number, by: number, bz: number): boolean {
    // Fill nearby hollow obsidian opening or build complete portal
    let activated = false;
    for (let ox = -2; ox <= 2; ox++) {
      for (let oy = -1; oy <= 2; oy++) {
        const x = bx + ox;
        const y = by + oy;
        const isHollow = this.world.getBlock(x, y, bz) === BlockType.AIR;
        const hasObsidian =
          this.world.getBlock(x, y - 1, bz) === BlockType.OBSIDIAN ||
          this.world.getBlock(x - 1, y, bz) === BlockType.OBSIDIAN ||
          this.world.getBlock(x + 1, y, bz) === BlockType.OBSIDIAN;

        if (isHollow && hasObsidian) {
          for (let dy = 0; dy < 3; dy++) {
            for (let dx = 0; dx < 2; dx++) {
              if (this.world.getBlock(x + dx, y + dy, bz) === BlockType.AIR) {
                this.world.setBlock(x + dx, y + dy, bz, BlockType.PORTAL_NETHER);
              }
            }
          }
          activated = true;
          break;
        }
      }
      if (activated) break;
    }

    if (!activated) {
      this.world.buildPortalStructure(bx, Math.max(1, by), bz, 'nether', 'x');
    }

    sounds.playSpawnPoint();
    this.entities.spawnExplosionParticles(bx, by + 1, bz);
    if (this.onChatLog) {
      this.onChatLog({
        text: '🔥 ¡Portal del Nether activado con fuego y obsidiana!',
        color: '#ff5555',
        sender: 'system',
      });
    }
    return true;
  }

  // Detect and ignite Parallel Overworld portal
  public tryActivateParallelPortal(bx: number, by: number, bz: number): boolean {
    let activated = false;
    for (let ox = -2; ox <= 2; ox++) {
      for (let oy = -1; oy <= 2; oy++) {
        const x = bx + ox;
        const y = by + oy;
        const isHollow = this.world.getBlock(x, y, bz) === BlockType.AIR;
        const hasMirror =
          this.world.getBlock(x, y - 1, bz) === BlockType.PARALLEL_MIRROR_BLOCK ||
          this.world.getBlock(x - 1, y, bz) === BlockType.PARALLEL_MIRROR_BLOCK ||
          this.world.getBlock(x + 1, y, bz) === BlockType.PARALLEL_MIRROR_BLOCK;

        if (isHollow && hasMirror) {
          for (let dy = 0; dy < 3; dy++) {
            for (let dx = 0; dx < 2; dx++) {
              if (this.world.getBlock(x + dx, y + dy, bz) === BlockType.AIR) {
                this.world.setBlock(x + dx, y + dy, bz, BlockType.PORTAL_PARALLEL);
              }
            }
          }
          activated = true;
          break;
        }
      }
      if (activated) break;
    }

    if (!activated) {
      this.world.buildPortalStructure(bx, Math.max(1, by), bz, 'parallel', 'x');
    }

    sounds.playSpawnPoint();
    this.entities.spawnExplosionParticles(bx, by + 1, bz);
    if (this.onChatLog) {
      this.onChatLog({
        text: '🪞 ¡Portal al Overworld Paralelo activado! Entra para cruzar al mundo inverso.',
        color: '#00ffff',
        sender: 'system',
      });
    }
    return true;
  }

  // Dimension Warp Transition
  public travelToDimension(targetDim: DimensionType) {
    if (this.isWarping) return;
    this.isWarping = true;
    this.portalCooldown = 4.0;
    sounds.playPortalWarp();

    const fromDim = this.world.dimension;

    if (this.onDimensionChange) {
      this.onDimensionChange(targetDim, true);
    }

    const dimNames: Record<DimensionType, string> = {
      overworld: '🌍 Mundo Normal (Overworld)',
      chocolate: '🍫 Dimensión de Chocolate & Dulces',
      nether: '🔥 Inframundo (Nether)',
      the_end: '🌌 El Vacío del Fin (The End)',
      parallel: '🪞 Overworld Paralelo (Mundo Invertido)',
    };

    if (this.onChatLog) {
      this.onChatLog({
        text: `🌀 Viajando a la dimensión: ${dimNames[targetDim]}...`,
        color: targetDim === 'chocolate' ? '#ffaa44' : targetDim === 'nether' ? '#ff5555' : targetDim === 'parallel' ? '#ff55ee' : '#55ffff',
        sender: 'system',
      });
    }

    setTimeout(() => {
      if (this.isDisposed) return;
      this.world.setDimension(targetDim);

      // Position player safely in the new dimension
      const targetX = Math.round(this.physics.state.pos.x);
      const targetZ = Math.round(this.physics.state.pos.z);
      const safeY = Math.max(12, this.world.getTopSolidY(targetX, targetZ) + 1);

      this.physics.state.pos.set(targetX, safeY, targetZ);
      this.physics.state.vel.set(0, 0, 0);

      // User directive:
      // "arregla de que cuando sales de un portal aparezcas cerca de un portal del end, evita que aparezca cerca un portal del end"
      if (targetDim === 'overworld') {
        // Exiting to Overworld: do NOT spawn any End portal near the player!
        // Only build the return portal to the dimension the player came from (if not the_end or overworld)
        if (fromDim !== 'overworld' && fromDim !== 'the_end') {
          const retPortalZ = targetZ - 4;
          const retPortalY = this.world.getTopSolidY(targetX, retPortalZ);
          this.world.buildPortalStructure(targetX, retPortalY, retPortalZ, fromDim, 'x');
        }
      } else if (targetDim === 'the_end') {
        // User directive: Ender Dragon boss battle in The End.
        // The return portal to the overworld opens at (0, 0) when the dragon is defeated.
        if (!this.isEnderDragonDefeated && !this.enderDragon) {
          this.spawnEnderDragonBoss();
        }
      } else {
        // Build return portal for other dimensions
        this.world.buildPortalStructure(targetX, safeY - 1, targetZ - 3, targetDim, 'x');
        if (targetDim === 'chocolate') {
          this.trucks.ensureSweetGarageAndTruck();
        }
      }

      // If leaving The End, clean up boss instance
      if (targetDim !== 'the_end' && this.enderDragon) {
        this.enderDragon.dispose();
        this.enderDragon = null;
      }

      // Rebuild chunks for new dimension
      this.rebuildAllChunks();

      this.isWarping = false;
      if (this.onDimensionChange) {
        this.onDimensionChange(targetDim, false);
      }

      if (this.onChatLog) {
        this.onChatLog({
          text: `✨ ¡Has llegado a ${dimNames[targetDim]}!`,
          color: '#55ff55',
          sender: 'system',
        });
      }
    }, 1400);
  }

  // Truck interaction methods
  public handleTruckDoubleClick(): boolean {
    const aimDir = this.camera.getWorldDirection(new THREE.Vector3());
    const truck = this.trucks.findTargetedTruck(this.physics.state.pos, aimDir);
    if (truck) {
      this.trucks.collectTruckAsItem(truck);
      return true;
    }
    return false;
  }

  public toggleDriveTruck(): boolean {
    if (this.trucks.drivingTruck) {
      this.trucks.exitDriving();
      return true;
    }
    const aimDir = this.camera.getWorldDirection(new THREE.Vector3());
    const truck = this.trucks.findTargetedTruck(this.physics.state.pos, aimDir);
    if (truck) {
      this.trucks.enterDriving(truck);
      return true;
    }
    return false;
  }

  public isNearTruck(): boolean {
    const aimDir = this.camera.getWorldDirection(new THREE.Vector3());
    return !!this.trucks.findTargetedTruck(this.physics.state.pos, aimDir);
  }

  public updatePhysicsAndTrucks(
    dt: number,
    keys: { forward: number; strafe: number; up: number; jump: boolean; sneak: boolean; sprint: boolean }
  ) {
    this.trucks.update(dt, keys, this.physics.state.pos, (x, y, z) => {
      this.entities.spawnBlockBreakParticles(Math.floor(x), Math.floor(y), Math.floor(z), BlockType.COTTON_CANDY_PINK);
    });
    if (!this.trucks.drivingTruck) {
      this.physics.update(dt, keys, this.yaw, this.pitch);
    }
  }

  public cycleTruckColor(): string | null {
    if (this.trucks.drivingTruck) {
      const col = this.trucks.cycleTruckColor(this.trucks.drivingTruck);
      if (this.onChatLog) {
        this.onChatLog({
          text: `🎨 Color de la Camioneta cambiado a: ${col.name}`,
          color: '#55ffff',
          sender: 'system',
        });
      }
      return col.name;
    }
    const aimDir = this.camera.getWorldDirection(new THREE.Vector3());
    const truck = this.trucks.findTargetedTruck(this.physics.state.pos, aimDir) || this.trucks.getNearestTruck(this.physics.state.pos, 5.5);
    if (truck) {
      const col = this.trucks.cycleTruckColor(truck);
      if (this.onChatLog) {
        this.onChatLog({
          text: `🎨 Color de la Camioneta cambiado a: ${col.name}`,
          color: '#55ffff',
          sender: 'system',
        });
      }
      return col.name;
    }
    return null;
  }

  public getDrivingTruckColor(): string | null {
    return this.trucks.getTruckColorName(this.trucks.drivingTruck);
  }

  public interactWithBed(bx: number, by: number, bz: number) {
    if (this.isSleeping) return;

    // Set Respawn Point on top of bed
    this.physics.setSpawnPoint(bx, by + 1, bz);

    // Check night time (12500 - 23500 ticks) or rain/thunder
    const isNight = this.timeOfDay >= 12500 || this.timeOfDay <= 500;
    const isStorm = this.weather === 'thunder' || this.weather === 'rain';

    if (isNight || isStorm) {
      this.startSleepSequence(bx, by, bz);
    } else {
      sounds.playSpawnPoint();
      if (this.onChatLog) {
        this.onChatLog({
          text: '🛏️ ¡Punto de regeneración establecido! (Solo puedes dormir durante la noche o durante tormentas).',
          color: '#55ffff',
          sender: 'system',
        });
      }
    }
  }

  public startSleepSequence(bx: number, by: number, bz: number) {
    this.isSleeping = true;
    if (this.onSleepChange) this.onSleepChange(true);
    sounds.playSleep();

    if (this.onChatLog) {
      this.onChatLog({
        text: '💤 Te acuestas en la cama... Saltando la noche...',
        color: '#ffbb33',
        sender: 'system',
      });
    }

    setTimeout(() => {
      if (this.isDisposed) return;
      // Skip night: advance time to morning (1000 ticks) and clear stormy weather
      this.timeOfDay = 1000;
      this.weather = 'clear';
      this.physics.state.health = 20;
      this.physics.state.hunger = 20;
      this.isSleeping = false;
      if (this.onSleepChange) this.onSleepChange(false);

      if (this.onChatLog) {
        this.onChatLog({
          text: '☀️ ¡Punto de regeneración establecido! Has descansado plácidamente y ha amanecido un nuevo día.',
          color: '#55ff55',
          sender: 'system',
        });
      }

      // Broadcast time sync if in multiplayer
      if (this.multiplayer.isConnected) {
        this.multiplayer.broadcastChat('ha descansado en la cama y la noche ha pasado.');
      }
    }, 1600);
  }

  // Start / Continue Breaking Block
  public handleBreaking(dt: number, isMouseDown: boolean) {
    // Decrement break cooldown timer & frame counter
    if (this.breakCooldownFrames > 0) {
      this.breakCooldownFrames--;
    }
    if (this.breakCooldownTimer > 0) {
      this.breakCooldownTimer -= dt;
    }

    if (!isMouseDown) {
      this.breakingProgress = 0;
      this.isBreaking = false;
      this.breakingCoords = null;
      this.crackMesh.visible = false;
      return;
    }

    // Cooldown check (at least 10 frames cooldown, prevents breaking 2 blocks on one click or piercing into adjacent/behind blocks)
    if (this.breakCooldownFrames > 0 || this.breakCooldownTimer > 0) {
      return;
    }

    const hit = this.raycastBlock(6.0);
    this.targetHit = hit;

    if (!hit) {
      this.breakingProgress = 0;
      this.isBreaking = false;
      this.breakingCoords = null;
      this.crackMesh.visible = false;
      return;
    }

    this.isBreaking = true;

    // Instant breaking in creative or diamond pickaxe!
    const isInstant = this.physics.state.gamemode === 'creative' || this.activeItem?.itemType === 'pickaxe_diamond';

    if (isInstant) {
      this.breakBlockAt(hit.blockX, hit.blockY, hit.blockZ, hit.blockType);
      this.swingHand();
      this.breakingProgress = 0;
      this.crackMesh.visible = false;
      this.breakingCoords = null;
      this.targetHit = null;

      // Cooldown of at least 10 frames (12 frames, 0.20s)
      // This guarantees that a single click can NEVER break 2 blocks, and when holding mouse, blocks break cleanly one-by-one
      this.breakCooldownFrames = 12;
      this.breakCooldownTimer = 0.20;
      return;
    }

    // Survival breaking time
    if (!this.breakingCoords || this.breakingCoords.x !== hit.blockX || this.breakingCoords.y !== hit.blockY || this.breakingCoords.z !== hit.blockZ) {
      this.breakingCoords = { x: hit.blockX, y: hit.blockY, z: hit.blockZ };
      this.breakingProgress = 0;
    }

    const breakSpeed = 2.5; // seconds
    this.breakingProgress += dt / breakSpeed;
    this.swingHand();

    const stage = Math.min(9, Math.floor(this.breakingProgress * 10));
    (this.crackMesh.material as THREE.MeshBasicMaterial).map = textureGen.getCrackTexture(stage);
    (this.crackMesh.material as THREE.MeshBasicMaterial).needsUpdate = true;
    this.crackMesh.position.set(hit.blockX + 0.5, hit.blockY + 0.5, hit.blockZ + 0.5);
    this.crackMesh.visible = true;

    if (this.breakingProgress >= 1.0) {
      this.breakBlockAt(hit.blockX, hit.blockY, hit.blockZ, hit.blockType);
      this.breakingProgress = 0;
      this.crackMesh.visible = false;
      this.breakingCoords = null;
      this.targetHit = null;

      // Cooldown of at least 10 frames after survival break as well
      this.breakCooldownFrames = 10;
      this.breakCooldownTimer = 0.18;
    }
  }

  public breakBlockAt(x: number, y: number, z: number, type: BlockType) {
    if (type === BlockType.BEDROCK && this.physics.state.gamemode === 'survival') return;

    if (type === BlockType.TNT) {
      // Ignites TNT
      this.world.setBlock(x, y, z, BlockType.AIR);
      this.multiplayer.broadcastBlockBreak(x, y, z, BlockType.AIR);
      this.entities.spawnTNT(x + 0.5, y + 0.5, z + 0.5, 3.0);
      return;
    }

    this.world.setBlock(x, y, z, BlockType.AIR);
    this.multiplayer.broadcastBlockBreak(x, y, z, type);
    this.entities.spawnBlockBreakParticles(x, y, z, type);
    sounds.playBreak();
  }

  // Helper to build a portal in front of the player
  public spawnPortalInFront(portalType: string): { success: boolean; message: string } {
    let raw = portalType.toLowerCase().trim();
    raw = raw.replace(/^['"()]+|['"()]+$/g, '').trim();

    if (!raw || raw.includes('tipo') || raw.includes('como') || raw.includes('quieres')) {
      return {
        success: false,
        message: 'Uso: //portal=portal_type=(tipo). Ejemplos: //portal=portal_type=(end), //portal=portal_type=(chocolate), //portal=portal_type=(nether), //portal=portal_type=(parallel).',
      };
    }

    let pType: DimensionType = 'chocolate';
    let displayName = 'Dimensión de Chocolate';

    if (raw.includes('end') || raw.includes('fin')) {
      pType = 'the_end';
      displayName = '🌌 The End (Portal Horizontal)';
    } else if (raw.includes('neth') || raw.includes('infer')) {
      pType = 'nether';
      displayName = '🔥 El Nether (Inframundo)';
    } else if (raw.includes('paral') || raw.includes('espejo') || raw.includes('invert')) {
      pType = 'parallel';
      displayName = '🪞 Overworld Paralelo (Invertido)';
    } else if (raw.includes('choc') || raw.includes('dulce')) {
      pType = 'chocolate';
      displayName = '🍫 Dimensión de Chocolate';
    } else if (raw.includes('over') || raw.includes('normal')) {
      pType = 'overworld';
      displayName = '🌍 Overworld';
    } else {
      return {
        success: false,
        message: `Tipo de portal "${portalType}" no reconocido. Usa: end, chocolate, nether, parallel o overworld.`,
      };
    }

    const dirX = -Math.sin(this.yaw);
    const dirZ = -Math.cos(this.yaw);
    const dist = pType === 'the_end' ? 4 : 3;
    const px = Math.floor(this.physics.state.pos.x + dirX * dist);
    const py = Math.floor(this.physics.state.pos.y);
    const pz = Math.floor(this.physics.state.pos.z + dirZ * dist);
    const axis = Math.abs(dirX) > Math.abs(dirZ) ? 'z' : 'x';

    this.world.buildPortalStructure(px, py, pz, pType, axis);
    this.rebuildAllChunks();
    sounds.playSpawnPoint();
    this.entities.spawnExplosionParticles(px, py + 1, pz);

    return {
      success: true,
      message: `✨ Truco activado: ¡Portal a ${displayName} construido frente a ti!`,
    };
  }

  // Command Block Memory getters & setters
  public getCommandBlockData(x: number, y: number, z: number): string | undefined {
    return this.commandBlockMemory.get(`${x},${y},${z}`);
  }

  public setCommandBlockData(x: number, y: number, z: number, cmd: string) {
    this.commandBlockMemory.set(`${x},${y},${z}`, cmd);
  }

  // Generate structure in front of player
  public generateStructureInFront(structQuery: string): { success: boolean; message: string } {
    const struct = findStructure(structQuery);
    if (!struct) {
      const names = STRUCTURE_CATALOG.map((s) => s.id).join(', ');
      return {
        success: false,
        message: `Estructura "${structQuery}" no encontrada.\nUso: /structureGenerate=structureType=<nombre>\nEstructuras disponibles: ${names}`,
      };
    }

    const dirX = -Math.sin(this.yaw);
    const dirZ = -Math.cos(this.yaw);
    const dist = Math.max(3, Math.ceil(struct.dimensions.x / 2) + 2);
    const originX = Math.floor(this.physics.state.pos.x + dirX * dist - struct.dimensions.x / 2);
    const originY = Math.floor(this.physics.state.pos.y);
    const originZ = Math.floor(this.physics.state.pos.z + dirZ * dist - struct.dimensions.z / 2);

    const res = generateStructure(this.world, struct.id, originX, originY, originZ);
    if (res.success) {
      this.rebuildAllChunks();
      sounds.playSpawnPoint();
      this.entities.spawnExplosionParticles(originX + struct.dimensions.x / 2, originY + 1, originZ + struct.dimensions.z / 2);
      return {
        success: true,
        message: `🏗️ ¡Estructura "${struct.name}" (${struct.dimensions.x}x${struct.dimensions.y}x${struct.dimensions.z}) generada exitosamente en [${originX}, ${originY}, ${originZ}]!`,
      };
    }
    return { success: false, message: `Error al generar la estructura "${struct.name}".` };
  }

  // Generate structure at explicit coordinates (e.g. from Structure Block Modal)
  public generateStructureAt(structId: string, x: number, y: number, z: number): { success: boolean; message: string } {
    const res = generateStructure(this.world, structId, x, y, z);
    if (res.success && res.info) {
      this.rebuildAllChunks();
      sounds.playSpawnPoint();
      this.entities.spawnExplosionParticles(x + res.info.dimensions.x / 2, y + 1, z + res.info.dimensions.z / 2);
      return {
        success: true,
        message: `🏗️ ¡Estructura "${res.info.name}" colocada en [${x}, ${y}, ${z}]!`,
      };
    }
    return {
      success: false,
      message: `No se pudo generar la estructura "${structId}".`,
    };
  }

  // Teleport to Biome across dimensions
  public teleportToBiome(biomeQuery: string): { success: boolean; message: string } {
    const biome = findBiome(biomeQuery);
    if (!biome) {
      const list = BIOME_CATALOG.map((b) => `${b.id} (${b.dimensionDisplayName})`).join(', ');
      return {
        success: false,
        message: `Bioma "${biomeQuery}" no encontrado.\nUso: /tpBiome=dimensionType=<nombre_bioma>\nBiomas disponibles: ${list}`,
      };
    }

    // Switch dimension if needed
    if (this.world.dimension !== biome.dimension) {
      this.travelToDimension(biome.dimension);
    }

    const tx = biome.targetCoords.x;
    const tz = biome.targetCoords.z;
    const groundY = this.world.getTopSolidY(tx, tz);
    const ty = Math.max(2, groundY + 1);

    this.physics.state.pos.set(tx, ty, tz);
    this.physics.state.vel.set(0, 0, 0);
    this.rebuildAllChunks();
    sounds.playTeleport();
    this.entities.spawnExplosionParticles(tx, ty, tz);

    return {
      success: true,
      message: `🌌 ¡Teletransportado exitosamente al bioma ${biome.icon} "${biome.name}" en ${biome.dimensionDisplayName} [${tx}, ${ty}, ${tz}]!`,
    };
  }

  // Locate the nearest End City (5% chance) or End Ship with Elytra (2% chance)
  public locateEndCity(requireShip: boolean = false): { success: boolean; message: string } {
    if (this.world.dimension !== 'the_end') {
      return {
        success: false,
        message: 'Las End Cities solo existen en la dimensión El Fin (The End). Viaja primero al End.',
      };
    }

    const pcx = Math.floor(this.physics.state.pos.x / CHUNK_SIZE);
    const pcz = Math.floor(this.physics.state.pos.z / CHUNK_SIZE);
    let bestDist = 999999;
    let bestCoords: { x: number; z: number } | null = null;

    for (let r = 1; r <= 35; r++) {
      for (let dx = -r; dx <= r; dx++) {
        for (let dz = -r; dz <= r; dz++) {
          if (Math.abs(dx) !== r && Math.abs(dz) !== r) continue;
          const cx = pcx + dx;
          const cz = pcz + dz;
          const distCenter = Math.sqrt(cx * cx + cz * cz);
          if (distCenter < 4) continue; // outer islands only

          const isGuaranteed = cx === 5 && cz === 5;
          const cityHash = Math.abs(Math.sin(cx * 374.13 + cz * 157.91 + this.world.seed * 71.3) * 43758.5453) % 1;
          const hasCity = isGuaranteed || cityHash < 0.05;

          if (hasCity) {
            const shipHash = Math.abs(Math.sin(cx * 911.3 + cz * 423.7 + this.world.seed * 19.7) * 23421.631) % 1;
            const hasShip = isGuaranteed || shipHash < 0.02;

            if (!requireShip || hasShip) {
              const wx = cx * CHUNK_SIZE + 4;
              const wz = cz * CHUNK_SIZE + 4;
              const dist = Math.hypot(wx - this.physics.state.pos.x, wz - this.physics.state.pos.z);
              if (dist < bestDist) {
                bestDist = dist;
                bestCoords = { x: wx, z: wz };
              }
            }
          }
        }
      }
      if (bestCoords) break;
    }

    if (bestCoords) {
      const topY = Math.max(16, this.world.getTopSolidY(bestCoords.x, bestCoords.z) + 1);
      const structName = requireShip ? 'Barco del Fin con Élitros' : 'Ciudad del Fin (End City)';
      return {
        success: true,
        message: `📍 ${structName} más cercana en [X: ${bestCoords.x}, Y: ${topY}, Z: ${bestCoords.z}] (a ${Math.round(bestDist)} bloques). Escribe /tp ${bestCoords.x} ${topY} ${bestCoords.z} para teletransportarte.`,
      };
    }

    return {
      success: false,
      message: 'No se encontró ninguna estructura en el rango cercano.',
    };
  }

  // Execute Cheats and Commands
  public executeCommand(cmd: string): { success: boolean; message: string } {
    const raw = cmd.trim();
    // Normalize slashes (supports //, /, or raw commands)
    const withoutSlashes = raw.replace(/^\/+/, '').trim();
    const lower = withoutSlashes.toLowerCase();

    // 1. Check specifically for /structureGenerate=structureType=...
    const structAssignMatch =
      lower.match(/^structuregenerate\s*=\s*structuretype\s*=\s*\(?([^()]+)\)?/i) ||
      lower.match(/^structure_generate\s*=\s*structuretype\s*=\s*\(?([^()]+)\)?/i) ||
      lower.match(/^structuretype\s*=\s*\(?([^()]+)\)?/i) ||
      lower.match(/^structuregenerate\s+structuretype\s*=\s*\(?([^()]+)\)?/i) ||
      lower.match(/^structuregenerate\s+([^\s=]+)/i) ||
      lower.match(/^structure_generate\s+([^\s=]+)/i) ||
      lower.match(/^structure\s*=\s*structuretype\s*=\s*\(?([^()]+)\)?/i);

    if (structAssignMatch) {
      return this.generateStructureInFront(structAssignMatch[1]);
    }

    if (lower.startsWith('structuregenerate') || lower.startsWith('structure_generate')) {
      const names = STRUCTURE_CATALOG.map((s) => s.id).join(', ');
      return {
        success: false,
        message: `Uso del comando: /structureGenerate=structureType=<nombre_estructura>\nEstructuras disponibles: ${names}`,
      };
    }

    // 2. Check specifically for /tpBiome=dimensionType=...
    const tpBiomeAssignMatch =
      lower.match(/^tpbiome\s*=\s*dimensiontype\s*=\s*\(?([^()]+)\)?/i) ||
      lower.match(/^tp_biome\s*=\s*dimensiontype\s*=\s*\(?([^()]+)\)?/i) ||
      lower.match(/^tpbiome\s+dimensiontype\s*=\s*\(?([^()]+)\)?/i) ||
      lower.match(/^tpbiome\s+([^\s=]+)/i) ||
      lower.match(/^tp_biome\s+([^\s=]+)/i) ||
      lower.match(/^dimensiontype\s*=\s*\(?([^()]+)\)?/i) ||
      lower.match(/^biome\s*=\s*dimensiontype\s*=\s*\(?([^()]+)\)?/i);

    if (tpBiomeAssignMatch) {
      return this.teleportToBiome(tpBiomeAssignMatch[1]);
    }

    if (lower.startsWith('tpbiome') || lower.startsWith('tp_biome')) {
      const names = BIOME_CATALOG.map((b) => `${b.id} (${b.dimensionDisplayName})`).join(', ');
      return {
        success: false,
        message: `Uso del comando: /tpBiome=dimensionType=<nombre_bioma>\nBiomas disponibles: ${names}`,
      };
    }

    // 3. Check specifically for //portal=portal_type=(...) or //portal=portal_type=... syntax
    const portalAssignMatch =
      lower.match(/^portal\s*=\s*portal_type\s*=\s*\(?([^()]+)\)?/i) ||
      lower.match(/^portal_type\s*=\s*\(?([^()]+)\)?/i) ||
      lower.match(/^portal\s*=\s*\(?([^()]+)\)?/i);

    if (portalAssignMatch) {
      return this.spawnPortalInFront(portalAssignMatch[1]);
    }

    if (lower.startsWith('portal=portal_type') || lower.startsWith('portal_type=')) {
      return {
        success: false,
        message: 'Uso del truco: //portal=portal_type=(tipo). Ejemplos: //portal=portal_type=(end), //portal=portal_type=(chocolate), //portal=portal_type=(nether), //portal=portal_type=(parallel).',
      };
    }

    const parts = lower.split(' ');
    const action = parts[0];

    switch (action) {
      case 'gamemode':
      case 'gm': {
        const mode = parts[1];
        if (mode === 'creative' || mode === 'c' || mode === '1') {
          this.physics.state.gamemode = 'creative';
          this.physics.state.isFlying = false;
          sounds.playCheatSuccess();
          return { success: true, message: 'Modo de juego cambiado a MODO CREATIVO (Bloques ilimitados, vuelo, minado instantáneo).' };
        } else if (mode === 'survival' || mode === 's' || mode === '0') {
          this.physics.state.gamemode = 'survival';
          this.physics.state.isFlying = false;
          sounds.playCheatSuccess();
          return { success: true, message: 'Modo de juego cambiado a SUPERVIVENCIA (Vida, hambre, gravedad y daño).' };
        } else if (mode === 'spectator' || mode === 'sp' || mode === '3') {
          this.physics.state.gamemode = 'spectator';
          this.physics.state.isFlying = true;
          this.physics.state.isNoclip = true;
          sounds.playCheatSuccess();
          return { success: true, message: 'Modo de juego cambiado a ESPECTADOR (Vuelo libre y noclip total).' };
        }
        return { success: false, message: 'Uso: /gamemode <creative|survival|spectator>' };
      }

      case 'creative': {
        this.physics.state.gamemode = 'creative';
        this.physics.state.isFlying = false;
        sounds.playCheatSuccess();
        return { success: true, message: 'Modo de juego cambiado a MODO CREATIVO (Bloques ilimitados, vuelo, minado instantáneo).' };
      }

      case 'survival': {
        this.physics.state.gamemode = 'survival';
        this.physics.state.isFlying = false;
        sounds.playCheatSuccess();
        return { success: true, message: 'Modo de juego cambiado a SUPERVIVENCIA (Vida, hambre, gravedad y daño).' };
      }

      case 'spectator': {
        this.physics.state.gamemode = 'spectator';
        this.physics.state.isFlying = true;
        this.physics.state.isNoclip = true;
        sounds.playCheatSuccess();
        return { success: true, message: 'Modo de juego cambiado a ESPECTADOR (Vuelo libre y noclip total).' };
      }

      case 'elytra':
      case 'elitros': {
        const active = this.physics.toggleGliding();
        sounds.playElytraGlide();
        return {
          success: true,
          message: `Élitros ${active ? 'ACTIVADOS (¡usa fuegos artificiales con clic derecho para propulsarte!)' : 'DESACTIVADOS'}.`,
        };
      }

      case 'truck':
      case 'camioneta': {
        if (parts[1] === 'color' || parts[1] === 'colour') {
          const colName = this.cycleTruckColor();
          if (colName) {
            return { success: true, message: `Color de la camioneta cambiado a: ${colName}` };
          }
          return { success: false, message: 'No estás cerca de ninguna camioneta o no estás conduciendo.' };
        }
        return { success: true, message: 'Comandos de camioneta: /truck color (o presiona la tecla [C] conduciendo)' };
      }

      case 'give': {
        const itemName = parts[1] || 'diamond_block';
        return { success: true, message: `Has recibido recursos infinitos de ${itemName.toUpperCase()}. ¡Disponible en tu inventario creativo (tecla E)!` };
      }

      case 'time': {
        if (parts[1] === 'set') {
          const val = parts[2];
          if (val === 'day') this.timeOfDay = 6000;
          else if (val === 'night') this.timeOfDay = 18000;
          else if (val === 'noon') this.timeOfDay = 6000;
          else if (val === 'midnight') this.timeOfDay = 18000;
          else {
            const num = parseInt(val, 10);
            if (!isNaN(num)) this.timeOfDay = num % 24000;
          }
          sounds.playCheatSuccess();
          return { success: true, message: `Hora establecida a ${Math.round(this.timeOfDay)} ticks.` };
        }
        return { success: false, message: 'Uso: /time set <day|night|noon|midnight|0-24000>' };
      }

      case 'weather': {
        const w = parts[1];
        if (w === 'clear' || w === 'rain' || w === 'thunder') {
          this.weather = w as WeatherType;
          sounds.playCheatSuccess();
          return { success: true, message: `Clima cambiado a: ${w.toUpperCase()}` };
        }
        return { success: false, message: 'Uso: /weather <clear|rain|thunder>' };
      }

      case 'fly': {
        this.physics.state.isFlying = !this.physics.state.isFlying;
        sounds.playCheatSuccess();
        return { success: true, message: `Vuelo ${this.physics.state.isFlying ? 'ACTIVADO (Espacio para subir, Shift para bajar)' : 'DESACTIVADO'}.` };
      }

      case 'god':
      case 'godmode': {
        this.physics.state.isGodmode = !this.physics.state.isGodmode;
        sounds.playCheatSuccess();
        return { success: true, message: `Modo Dios (Invulnerabilidad) ${this.physics.state.isGodmode ? 'ACTIVADO' : 'DESACTIVADO'}.` };
      }

      case 'noclip': {
        this.physics.state.isNoclip = !this.physics.state.isNoclip;
        if (this.physics.state.isNoclip) this.physics.state.isFlying = true;
        sounds.playCheatSuccess();
        return { success: true, message: `Noclip (Atravesar paredes) ${this.physics.state.isNoclip ? 'ACTIVADO' : 'DESACTIVADO'}.` };
      }

      case 'speed': {
        const mult = parseFloat(parts[1]);
        if (!isNaN(mult) && mult > 0) {
          this.physics.state.speedMultiplier = mult;
          sounds.playCheatSuccess();
          return { success: true, message: `Velocidad multiplicada por ${mult}x.` };
        }
        return { success: false, message: 'Uso: /speed <multiplicador> (Ej: /speed 2.5)' };
      }

      case 'jump': {
        const mult = parseFloat(parts[1]);
        if (!isNaN(mult) && mult > 0) {
          this.physics.state.jumpMultiplier = mult;
          sounds.playCheatSuccess();
          return { success: true, message: `Salto multiplicado por ${mult}x.` };
        }
        return { success: false, message: 'Uso: /jump <multiplicador> (Ej: /jump 2.0)' };
      }

      case 'tp':
      case 'teleport': {
        if (parts[1] === 'spawn') {
          this.physics.respawn();
          sounds.playTeleport();
          return { success: true, message: 'Teletransportado al punto de aparición inicial.' };
        }

        // Check if targeting a remote player name
        if (parts[1] && isNaN(parseFloat(parts[1]))) {
          const targetName = parts[1].toLowerCase();
          for (const remotePlayer of this.multiplayer.remotePlayers.values()) {
            if (remotePlayer.name.toLowerCase().includes(targetName)) {
              this.physics.state.pos.set(remotePlayer.position.x, remotePlayer.position.y + 1, remotePlayer.position.z);
              sounds.playTeleport();
              return { success: true, message: `Teletransportado hacia el jugador ${remotePlayer.name} [${Math.round(remotePlayer.position.x)}, ${Math.round(remotePlayer.position.y)}, ${Math.round(remotePlayer.position.z)}].` };
            }
          }
        }

        const tx = parseFloat(parts[1]);
        const ty = parseFloat(parts[2]);
        const tz = parseFloat(parts[3]);
        if (!isNaN(tx) && !isNaN(ty) && !isNaN(tz)) {
          this.physics.state.pos.set(tx, ty, tz);
          sounds.playTeleport();
          return { success: true, message: `Teletransportado a [${tx}, ${ty}, ${tz}].` };
        }
        return { success: false, message: 'Uso: /tp <x> <y> <z> o /tp <nombre_jugador> o /tp spawn' };
      }

      case 'fill': {
        const x1 = parseInt(parts[1], 10);
        const y1 = parseInt(parts[2], 10);
        const z1 = parseInt(parts[3], 10);
        const x2 = parseInt(parts[4], 10);
        const y2 = parseInt(parts[5], 10);
        const z2 = parseInt(parts[6], 10);
        const blockName = parts[7] || 'stone';

        const blockType = (BlockType as any)[blockName.toUpperCase()] || BlockType.STONE;
        const count = this.world.fillBlocks(x1, y1, z1, x2, y2, z2, blockType);
        sounds.playCheatSuccess();
        return { success: true, message: `Se rellenaron ${count} bloques con ${blockName}.` };
      }

      case 'tnt':
      case 'nuke': {
        const count = parseInt(parts[1], 10) || 5;
        for (let i = 0; i < count; i++) {
          const offsetX = (Math.random() - 0.5) * 8;
          const offsetZ = (Math.random() - 0.5) * 8;
          this.entities.spawnTNT(this.physics.state.pos.x + offsetX, this.physics.state.pos.y + 6, this.physics.state.pos.z + offsetZ, 2.5);
        }
        return { success: true, message: `¡Lluvia de ${count} dinamitas TNT generada!` };
      }

      case 'explode': {
        const radius = parseFloat(parts[1]) || 5;
        this.world.explode(this.physics.state.pos.x, this.physics.state.pos.y, this.physics.state.pos.z, radius);
        this.entities.spawnExplosionParticles(this.physics.state.pos.x, this.physics.state.pos.y, this.physics.state.pos.z);
        sounds.playExplosion();
        return { success: true, message: `¡Explosión de radio ${radius} detonada!` };
      }

      case 'summon': {
        const mob = (parts[1] || 'pig') as any;
        const count = parseInt(parts[2], 10) || 1;
        for (let i = 0; i < count; i++) {
          const px = this.physics.state.pos.x + (Math.random() - 0.5) * 4;
          const pz = this.physics.state.pos.z + (Math.random() - 0.5) * 4;
          const py = this.world.getTopSolidY(Math.floor(px), Math.floor(pz)) + 1;
          this.entities.spawnMob(mob, px, py, pz);
        }
        sounds.playCheatSuccess();
        return { success: true, message: `Invocado(s) ${count} ${mob}(s).` };
      }

      case 'kill': {
        this.physics.respawn();
        sounds.playHurt();
        return { success: true, message: 'Jugador reiniciado en el punto de spawn.' };
      }

      case 'clear': {
        this.entities.clearAll();
        return { success: true, message: 'Todas las entidades y mobs del mundo han sido limpiados.' };
      }

      case 'heal': {
        this.physics.state.health = 20;
        this.physics.state.hunger = 20;
        sounds.playCheatSuccess();
        return { success: true, message: 'Salud y comida restauradas al 100%.' };
      }

      case 'locate': {
        const target = (parts[1] || '').toLowerCase();
        if (target === 'end_city' || target === 'city' || target === 'endcity') {
          return this.locateEndCity(false);
        }
        if (target === 'end_ship' || target === 'ship' || target === 'barco' || target === 'barco_end') {
          return this.locateEndCity(true);
        }
        return {
          success: false,
          message: 'Estructuras localizables: /locate end_city, /locate end_ship',
        };
      }

      case 'dragon':
      case 'ender_dragon': {
        if (this.world.dimension !== 'the_end') {
          return {
            success: false,
            message: 'La Dragona de Ender solo puede ser invocada en la dimensión El Fin (The End). Viaja primero al End con /dimension the_end.',
          };
        }
        this.isEnderDragonDefeated = false;
        this.spawnEnderDragonBoss();
        return {
          success: true,
          message: '🐲 ¡Dragona de Ender invocada en el centro de El Fin!',
        };
      }

      case 'spawnpoint':
      case 'setspawn': {
        const sx = parts[1] !== undefined ? parseFloat(parts[1]) : Math.floor(this.physics.state.pos.x);
        const sy = parts[2] !== undefined ? parseFloat(parts[2]) : Math.floor(this.physics.state.pos.y);
        const sz = parts[3] !== undefined ? parseFloat(parts[3]) : Math.floor(this.physics.state.pos.z);
        this.physics.setSpawnPoint(sx, sy, sz);
        sounds.playSpawnPoint();
        return { success: true, message: `🛏️ Punto de regeneración establecido en [${Math.round(sx)}, ${Math.round(sy)}, ${Math.round(sz)}].` };
      }

      case 'spawn': {
        this.physics.respawn();
        sounds.playTeleport();
        return { success: true, message: 'Teletransportado a tu punto de regeneración.' };
      }

      case 'sleep':
      case 'dormir': {
        this.startSleepSequence(Math.floor(this.physics.state.pos.x), Math.floor(this.physics.state.pos.y), Math.floor(this.physics.state.pos.z));
        return { success: true, message: '💤 Has iniciado el descanso. Saltando la noche...' };
      }

      case 'dimension':
      case 'dim': {
        const dim = (parts[1] || 'chocolate').toLowerCase();
        let target: DimensionType = 'overworld';
        if (dim.includes('choc')) target = 'chocolate';
        else if (dim.includes('neth') || dim.includes('infer')) target = 'nether';
        else if (dim.includes('end') || dim.includes('fin')) target = 'the_end';
        else if (dim.includes('paral') || dim.includes('espejo') || dim.includes('invert')) target = 'parallel';
        else if (dim.includes('over') || dim.includes('normal')) target = 'overworld';

        this.travelToDimension(target);
        return { success: true, message: `Iniciando teletransporte dimensional a ${target}...` };
      }

      case 'portal': {
        const typeArg = parts.slice(1).join(' ').trim();
        const extracted = typeArg.replace(/^(?:portal_type\s*=\s*)?\(?([^()]+)\)?$/i, '$1').trim();
        return this.spawnPortalInFront(extracted || 'chocolate');
      }

      case 'structuregenerate':
      case 'structure_generate':
      case 'structure': {
        const arg = parts.slice(1).join(' ').trim();
        const extracted = arg.replace(/^(?:structuretype\s*=\s*)?\(?([^()]+)\)?$/i, '$1').trim();
        return this.generateStructureInFront(extracted || 'casa_madera');
      }

      case 'tpbiome':
      case 'tp_biome':
      case 'biome': {
        const arg = parts.slice(1).join(' ').trim();
        const extracted = arg.replace(/^(?:dimensiontype\s*=\s*)?\(?([^()]+)\)?$/i, '$1').trim();
        return this.teleportToBiome(extracted || 'chocolate');
      }

      case 'help': {
        return {
          success: true,
          message:
            'Comandos de Trucos en Minecrazyworld:\n' +
            '• /structureGenerate=structureType=<nombre> (construir estructuras: casa_madera, templo_desierto, garaje_dulce, torre_vigia, fuente_agua, cabaña_dulce, arbol_gigante, portal_chocolate, portal_nether, portal_end, portal_parallel)\n' +
            '• /tpBiome=dimensionType=<nombre_bioma> (teletransportarse a biomas: plains, mountains, desert, forest, ocean, chocolate, white_peaks, cookie_caves, nether, soul_valley, the_end, outer_islands, parallel)\n' +
            '• //portal=portal_type=(end|chocolate|nether|parallel) (invocar portal instantáneo)\n' +
            '• /portal <chocolate|parallel|nether|end> (construir portal frente a ti)\n' +
            '• /dimension <chocolate|parallel|nether|the_end|overworld> (viajar de dimensión)\n' +
            '• /spawnpoint [x y z] (fijar punto de regeneración)\n' +
            '• /spawn (ir a tu punto de regeneración)\n' +
            '• /sleep o /dormir (dormir y saltar la noche)\n' +
            '• /gamemode <creative|survival|spectator> (o /creative, /survival, /spectator)\n' +
            '• /elytra (activar/desactivar vuelo con élitros)\n' +
            '• /truck color (cambiar color de la camioneta)\n' +
            '• /god (modo dios - invulnerabilidad)\n' +
            '• /fly (alternar vuelo libre)\n' +
            '• /jump <mult> (saltar más alto, ej: /jump 2.5)\n' +
            '• /speed <mult> (super velocidad, ej: /speed 2.0)\n' +
            '• /tp <x> <y> <z> o /tp <jugador> o /tp spawn (teletransporte)\n' +
            '• /time set <day|night|noon|midnight>\n' +
            '• /weather <clear|rain|thunder>\n' +
            '• /noclip (atravesar paredes)\n' +
            '• /give <bloque/item> (recursos infinitos)\n' +
            '• /summon <pig|sheep|cow|zombie|creeper>\n' +
            '• /tnt [cantidad] (lluvia de dinamitas)\n' +
            '• /explode [radio]\n' +
            '• /fill <x1> <y1> <z1> <x2> <y2> <z2> <bloque>\n' +
            '• /heal (restaurar vida)\n' +
            '• /clear (limpiar entidades)',
        };
      }

      default:
        return { success: false, message: `Comando desconocido "/${action}". Escribe /help para ver la lista de trucos.` };
    }
  }

  // Main Render Loop
  private loop() {
    if (this.isDisposed) return;
    this.animFrameId = requestAnimationFrame(this.loop);

    const now = performance.now();
    const dt = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;

    // Update Multiplayer Avatars & Lerp
    this.multiplayer.update(dt);

    // Decrement Place Cooldown
    if (this.placeCooldownFrames > 0) {
      this.placeCooldownFrames--;
    }
    if (this.placeCooldownTimer > 0) {
      this.placeCooldownTimer -= dt;
    }

    // Portal Cooldown Countdown
    if (this.portalCooldown > 0) {
      this.portalCooldown -= dt;
    }

    // Portal Collision & Dimension Transition Check
    if (this.portalCooldown <= 0 && !this.isWarping) {
      const px = this.physics.state.pos.x;
      const py = this.physics.state.pos.y;
      const pz = this.physics.state.pos.z;

      const minX = Math.floor(px - 0.35);
      const maxX = Math.floor(px + 0.35);
      const minY = Math.floor(py - 0.2);
      const maxY = Math.floor(py + 1.8);
      const minZ = Math.floor(pz - 0.35);
      const maxZ = Math.floor(pz + 0.35);

      let touchingPortal: BlockType | null = null;
      for (let x = minX; x <= maxX; x++) {
        for (let y = minY; y <= maxY; y++) {
          for (let z = minZ; z <= maxZ; z++) {
            const b = this.world.getBlock(x, y, z);
            if (
              b === BlockType.PORTAL_CHOCOLATE ||
              b === BlockType.PORTAL_NETHER ||
              b === BlockType.PORTAL_END ||
              b === BlockType.PORTAL_PARALLEL
            ) {
              touchingPortal = b;
              break;
            }
          }
          if (touchingPortal) break;
        }
        if (touchingPortal) break;
      }

      if (touchingPortal === BlockType.PORTAL_CHOCOLATE) {
        const target = this.world.dimension === 'chocolate' ? 'overworld' : 'chocolate';
        this.travelToDimension(target);
      } else if (touchingPortal === BlockType.PORTAL_NETHER) {
        const target = this.world.dimension === 'nether' ? 'overworld' : 'nether';
        this.travelToDimension(target);
      } else if (touchingPortal === BlockType.PORTAL_END) {
        const target = this.world.dimension === 'the_end' ? 'overworld' : 'the_end';
        this.travelToDimension(target);
      } else if (touchingPortal === BlockType.PORTAL_PARALLEL) {
        const target = this.world.dimension === 'parallel' ? 'overworld' : 'parallel';
        this.travelToDimension(target);
      }
    }

    // Broadcast Local Movement
    this.networkBroadcastTimer += dt;
    if (this.networkBroadcastTimer > 0.05) {
      this.networkBroadcastTimer = 0;
      const isMoving = Math.abs(this.physics.state.vel.x) > 0.1 || Math.abs(this.physics.state.vel.z) > 0.1;
      this.multiplayer.broadcastLocalMove(
        this.physics.state.pos,
        this.yaw,
        this.pitch,
        this.activeItem?.blockType,
        this.physics.state.isFlying,
        this.physics.state.isSneaking,
        isMoving
      );
    }

    // 1. Atmosphere & Lighting per Dimension
    let skyColor = new THREE.Color(0x87ceeb);
    let fogColor = new THREE.Color(0x87ceeb);
    let lightIntensity = 1.2;

    if (this.world.dimension === 'chocolate') {
      // Warm golden caramel & sweet confectionery sky
      skyColor.setHex(0xd6894c);
      fogColor.setHex(0xf3b784);
      lightIntensity = 1.35;
      this.starsMesh.visible = false;
      this.sunMesh.visible = true;
      this.moonMesh.visible = false;
      this.cloudsMesh.visible = true;
      this.rainMesh.visible = false;
    } else if (this.world.dimension === 'parallel') {
      // Inverted negative chromatic atmosphere (deep violet-magenta & solarized cyan fog)
      skyColor.setHex(0x19002e);
      fogColor.setHex(0x3a0050);
      lightIntensity = 1.4;
      this.starsMesh.visible = true;
      this.sunMesh.visible = true;
      this.moonMesh.visible = true;
      this.cloudsMesh.visible = true;
      this.rainMesh.visible = false;
    } else if (this.world.dimension === 'nether') {
      // Blood red hellish gloom
      skyColor.setHex(0x280505);
      fogColor.setHex(0x4a0a0a);
      lightIntensity = 0.85;
      this.starsMesh.visible = false;
      this.sunMesh.visible = false;
      this.moonMesh.visible = false;
      this.cloudsMesh.visible = false;
      this.rainMesh.visible = false;
    } else if (this.world.dimension === 'the_end') {
      // Cosmic starry void
      skyColor.setHex(0x0c0618);
      fogColor.setHex(0x1a0e30);
      lightIntensity = 0.65;
      this.starsMesh.visible = true;
      this.sunMesh.visible = false;
      this.moonMesh.visible = false;
      this.cloudsMesh.visible = false;
      this.rainMesh.visible = false;
    } else {
      // Overworld Day / Night Cycle
      this.sunMesh.visible = true;
      this.moonMesh.visible = true;
      this.cloudsMesh.visible = true;

      this.timeOfDay = (this.timeOfDay + dt * 20 * this.timeSpeed) % 24000;
      const sunAngle = (this.timeOfDay / 24000) * Math.PI * 2 - Math.PI / 2;

      // Sun & Moon Positions
      const sunDist = 80;
      this.sunMesh.position.set(this.physics.state.pos.x + Math.cos(sunAngle) * sunDist, Math.sin(sunAngle) * sunDist, this.physics.state.pos.z + 20);
      this.sunMesh.lookAt(this.physics.state.pos.x, 0, this.physics.state.pos.z);

      this.moonMesh.position.set(this.physics.state.pos.x - Math.cos(sunAngle) * sunDist, -Math.sin(sunAngle) * sunDist, this.physics.state.pos.z - 20);
      this.moonMesh.lookAt(this.physics.state.pos.x, 0, this.physics.state.pos.z);

      this.sunLight.position.copy(this.sunMesh.position);

      const sunHeight = Math.sin(sunAngle);
      if (sunHeight < -0.1) {
        // Night
        skyColor.setHex(0x050814);
        fogColor.setHex(0x050814);
        lightIntensity = 0.25;
        this.starsMesh.visible = true;
      } else if (sunHeight < 0.2) {
        // Sunset / Sunrise
        skyColor.setHex(0xd96b34);
        fogColor.setHex(0xd96b34);
        lightIntensity = 0.7;
        this.starsMesh.visible = false;
      } else {
        // Day
        skyColor.setHex(0x87ceeb);
        fogColor.setHex(0x87ceeb);
        lightIntensity = 1.2;
        this.starsMesh.visible = false;
      }

      if (this.weather === 'rain' || this.weather === 'thunder') {
        skyColor.lerp(new THREE.Color(0x3a4552), 0.7);
        fogColor.lerp(new THREE.Color(0x3a4552), 0.7);
        lightIntensity *= 0.6;
        this.rainMesh.visible = true;
        this.rainMesh.position.set(this.physics.state.pos.x, this.physics.state.pos.y, this.physics.state.pos.z);
      } else {
        this.rainMesh.visible = false;
      }
    }

    this.scene.background = skyColor;
    if (this.scene.fog) {
      this.scene.fog.color = fogColor;
    }
    this.sunLight.intensity = lightIntensity;

    // 2. Camera positioning
    this.camera.position.set(
      this.physics.state.pos.x,
      this.physics.state.pos.y + this.physics.eyeHeight,
      this.physics.state.pos.z
    );

    this.camera.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;

    // 3. Held Item Bobbing & Swing
    if (this.heldItemSwing > 0) {
      this.heldItemSwing -= dt * 4;
      const swingRot = Math.sin(this.heldItemSwing * Math.PI) * 0.7;
      this.heldItemMesh.rotation.x = 0.2 + swingRot;
      this.heldItemMesh.rotation.z = 0.1 - swingRot * 0.5;
    } else {
      this.heldItemMesh.rotation.set(0.2, -0.4, 0.1);
    }

    // 4. Update Target Highlight
    const hit = this.raycastBlock(6.0);
    this.targetHit = hit;
    if (hit) {
      this.highlightBox.position.set(hit.blockX + 0.5, hit.blockY + 0.5, hit.blockZ + 0.5);
      this.highlightBox.visible = true;
    } else {
      this.highlightBox.visible = false;
    }

    // 5. Update Entities & Particles
    this.entities.update(dt, this.physics.state.pos);

    // Update Ender Dragon Boss & Boss Bar
    if (this.world.dimension === 'the_end' && this.enderDragon) {
      this.enderDragon.update(dt, this.physics.state.pos);
      this.physics.state.boss = {
        name: 'Dragona de Ender',
        health: this.enderDragon.health,
        maxHealth: this.enderDragon.maxHealth,
        active: this.enderDragon.isAlive,
      };

      // Dragon swooping damage
      if (this.enderDragon.phase === 'swoop' && this.enderDragon.isAlive) {
        const distToPlayer = this.enderDragon.position.distanceTo(this.physics.state.pos);
        if (distToPlayer < 3.2 && !this.physics.state.isGodmode) {
          this.physics.state.health = Math.max(0, this.physics.state.health - 4);
          sounds.playHurt();
          const knock = this.physics.state.pos.clone().sub(this.enderDragon.position).normalize();
          this.physics.state.vel.x += knock.x * 12;
          this.physics.state.vel.y += 5.5;
          this.physics.state.vel.z += knock.z * 12;
        }
      }
    } else {
      this.physics.state.boss = undefined;
    }

    // Update Elytra item pickups
    for (let i = this.elytraPickups.length - 1; i >= 0; i--) {
      const item = this.elytraPickups[i];
      if (item.collected) continue;

      item.group.rotation.y += dt * 1.5;
      item.group.position.y = item.baseY + Math.sin(performance.now() * 0.003) * 0.15;

      const dist = item.group.position.distanceTo(this.physics.state.pos);
      if (dist < 2.2) {
        item.collected = true;
        this.scene.remove(item.group);
        this.entities.spawnHitSparkParticles(item.group.position.x, item.group.position.y, item.group.position.z, true);
        sounds.playCheatSuccess();

        if (this.onElytraCollected) {
          this.onElytraCollected();
        }
        if (this.onChatLog) {
          this.onChatLog({
            text: '🪽 ¡ENHORABUENA! Has obtenido las Élitros (Elytras) del Barco Flotante del End.',
            color: '#d870ff',
            sender: 'system',
          });
          this.onChatLog({
            text: '💡 Equípatelas o pulsa Espacio en el aire para desplegarlas y planear por el vacío y los mundos.',
            color: '#ffff55',
            sender: 'system',
          });
        }
        this.elytraPickups.splice(i, 1);
      }
    }

    // 6. Update Chunk dirty meshes & load newly visible chunks
    this.updateDirtyChunks();
    this.updateLoadedChunksAroundPlayer();

    // 7. Render
    this.renderer.render(this.scene, this.camera);

    // 8. Stats callback
    if (this.onStatsUpdate) {
      this.onStatsUpdate({
        health: this.physics.state.health,
        maxHealth: 20,
        hunger: this.physics.state.hunger,
        maxHunger: 20,
        gamemode: this.physics.state.gamemode,
        dimension: this.world.dimension,
        isFlying: this.physics.state.isFlying,
        isNoclip: this.physics.state.isNoclip,
        isGodmode: this.physics.state.isGodmode,
        speedMultiplier: this.physics.state.speedMultiplier,
        jumpMultiplier: this.physics.state.jumpMultiplier,
        position: {
          x: Math.round(this.physics.state.pos.x * 10) / 10,
          y: Math.round(this.physics.state.pos.y * 10) / 10,
          z: Math.round(this.physics.state.pos.z * 10) / 10,
        },
        rotation: { yaw: this.yaw, pitch: this.pitch },
        biome: this.world.worldType.toUpperCase(),
        timeOfDay: this.timeOfDay,
        weather: this.weather,
        isDrivingTruck: this.trucks.drivingTruck !== null,
        nearTruck: this.isNearTruck(),
        truckColor: this.getDrivingTruckColor() || this.trucks.getTruckColorName(this.trucks.getNearestTruck(this.physics.state.pos, 5.5)),
        isGliding: this.physics.state.isGliding,
        boss: this.physics.state.boss,
      });
    }
  }

  public resize() {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  public dispose() {
    this.isDisposed = true;
    cancelAnimationFrame(this.animFrameId);
    this.multiplayer.dispose();
    if (this.renderer && this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
    this.entities.clearAll();
  }
}
