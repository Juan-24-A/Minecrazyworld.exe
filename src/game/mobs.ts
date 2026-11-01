import * as THREE from 'three';
import { MobEntity, TNTEntity, ParticleEntity, BlockType } from '../types';
import { VoxelWorld } from './world';
import { sounds } from './audio';

export class EntityManager {
  public mobs: MobEntity[] = [];
  public tntList: TNTEntity[] = [];
  public particles: ParticleEntity[] = [];
  public scene: THREE.Scene;
  public world: VoxelWorld;
  private particleMeshGroup: THREE.Group = new THREE.Group();
  private mobMeshGroup: THREE.Group = new THREE.Group();
  private tntMeshGroup: THREE.Group = new THREE.Group();
  private particleGeo = new THREE.BoxGeometry(1, 1, 1);
  private particleMeshPool: THREE.Mesh[] = [];

  constructor(scene: THREE.Scene, world: VoxelWorld) {
    this.scene = scene;
    this.world = world;
    this.scene.add(this.particleMeshGroup);
    this.scene.add(this.mobMeshGroup);
    this.scene.add(this.tntMeshGroup);
  }

  // Create 3D Voxel Models for mobs
  private createMobMesh(type: MobEntity['type']): THREE.Group {
    const group = new THREE.Group();

    if (type === 'pig') {
      const pinkMat = new THREE.MeshLambertMaterial({ color: 0xf5a4b8 });
      const darkPinkMat = new THREE.MeshLambertMaterial({ color: 0xd9758f });
      const blackMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
      const whiteMat = new THREE.MeshLambertMaterial({ color: 0xffffff });

      // Body
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.7, 1.2), pinkMat);
      body.position.y = 0.6;
      group.add(body);

      // Head
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.6), pinkMat);
      head.position.set(0, 0.85, 0.8);
      group.add(head);

      // Snout
      const snout = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 0.15), darkPinkMat);
      snout.position.set(0, 0.75, 1.15);
      group.add(snout);

      // Eyes
      const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.05), blackMat);
      eyeR.position.set(0.2, 0.95, 1.11);
      const eyeL = eyeR.clone();
      eyeL.position.set(-0.2, 0.95, 1.11);
      group.add(eyeR, eyeL);

      // 4 Legs
      const legGeo = new THREE.BoxGeometry(0.25, 0.5, 0.25);
      const leg1 = new THREE.Mesh(legGeo, pinkMat);
      leg1.position.set(0.3, 0.25, 0.4);
      const leg2 = new THREE.Mesh(legGeo, pinkMat);
      leg2.position.set(-0.3, 0.25, 0.4);
      const leg3 = new THREE.Mesh(legGeo, pinkMat);
      leg3.position.set(0.3, 0.25, -0.4);
      const leg4 = new THREE.Mesh(legGeo, pinkMat);
      leg4.position.set(-0.3, 0.25, -0.4);
      group.add(leg1, leg2, leg3, leg4);
    } else if (type === 'sheep') {
      const woolMat = new THREE.MeshLambertMaterial({ color: 0xefefef });
      const skinMat = new THREE.MeshLambertMaterial({ color: 0xd9c5b2 });
      const blackMat = new THREE.MeshLambertMaterial({ color: 0x222222 });

      // Body (Wool)
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.8, 1.3), woolMat);
      body.position.y = 0.7;
      group.add(body);

      // Head
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.6), skinMat);
      head.position.set(0, 1.0, 0.85);
      group.add(head);

      // Eyes
      const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.04), blackMat);
      eyeR.position.set(0.18, 1.05, 1.16);
      const eyeL = eyeR.clone();
      eyeL.position.set(-0.18, 1.05, 1.16);
      group.add(eyeR, eyeL);

      // Legs
      const legGeo = new THREE.BoxGeometry(0.22, 0.6, 0.22);
      const leg1 = new THREE.Mesh(legGeo, skinMat);
      leg1.position.set(0.32, 0.3, 0.4);
      const leg2 = new THREE.Mesh(legGeo, skinMat);
      leg2.position.set(-0.32, 0.3, 0.4);
      const leg3 = new THREE.Mesh(legGeo, skinMat);
      leg3.position.set(0.32, 0.3, -0.4);
      const leg4 = new THREE.Mesh(legGeo, skinMat);
      leg4.position.set(-0.32, 0.3, -0.4);
      group.add(leg1, leg2, leg3, leg4);
    } else if (type === 'cow') {
      const cowMat = new THREE.MeshLambertMaterial({ color: 0x543d2b });
      const whiteMat = new THREE.MeshLambertMaterial({ color: 0xdedede });
      const snoutMat = new THREE.MeshLambertMaterial({ color: 0xcca393 });
      const hornMat = new THREE.MeshLambertMaterial({ color: 0xeeeeee });

      // Body
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.9, 1.4), cowMat);
      body.position.y = 0.8;
      group.add(body);

      // Head
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.6), cowMat);
      head.position.set(0, 1.1, 0.9);
      group.add(head);

      // Horns
      const hornR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.25, 0.1), hornMat);
      hornR.position.set(0.32, 1.45, 0.85);
      const hornL = hornR.clone();
      hornL.position.set(-0.32, 1.45, 0.85);
      group.add(hornR, hornL);

      // Snout
      const snout = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.3, 0.2), snoutMat);
      snout.position.set(0, 0.95, 1.25);
      group.add(snout);

      // Legs
      const legGeo = new THREE.BoxGeometry(0.25, 0.7, 0.25);
      const leg1 = new THREE.Mesh(legGeo, cowMat);
      leg1.position.set(0.35, 0.35, 0.45);
      const leg2 = new THREE.Mesh(legGeo, cowMat);
      leg2.position.set(-0.35, 0.35, 0.45);
      const leg3 = new THREE.Mesh(legGeo, cowMat);
      leg3.position.set(0.35, 0.35, -0.45);
      const leg4 = new THREE.Mesh(legGeo, cowMat);
      leg4.position.set(-0.35, 0.35, -0.45);
      group.add(leg1, leg2, leg3, leg4);
    } else if (type === 'zombie') {
      const skinMat = new THREE.MeshLambertMaterial({ color: 0x477c3e });
      const shirtMat = new THREE.MeshLambertMaterial({ color: 0x0099aa });
      const pantsMat = new THREE.MeshLambertMaterial({ color: 0x223366 });
      const blackMat = new THREE.MeshLambertMaterial({ color: 0x111111 });

      // Head
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.6), skinMat);
      head.position.set(0, 1.6, 0);
      group.add(head);

      // Eyes
      const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.08, 0.04), blackMat);
      eyeR.position.set(0.16, 1.62, 0.31);
      const eyeL = eyeR.clone();
      eyeL.position.set(-0.16, 1.62, 0.31);
      group.add(eyeR, eyeL);

      // Body (Shirt)
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.75, 0.35), shirtMat);
      body.position.set(0, 0.95, 0);
      group.add(body);

      // Outstretched Arms
      const armGeo = new THREE.BoxGeometry(0.2, 0.2, 0.7);
      const armR = new THREE.Mesh(armGeo, skinMat);
      armR.position.set(0.42, 1.15, 0.35);
      const armL = new THREE.Mesh(armGeo, skinMat);
      armL.position.set(-0.42, 1.15, 0.35);
      group.add(armR, armL);

      // Legs (Pants)
      const legGeo = new THREE.BoxGeometry(0.25, 0.7, 0.25);
      const legR = new THREE.Mesh(legGeo, pantsMat);
      legR.position.set(0.18, 0.35, 0);
      const legL = new THREE.Mesh(legGeo, pantsMat);
      legL.position.set(-0.18, 0.35, 0);
      group.add(legR, legL);
    } else if (type === 'creeper') {
      const greenMat = new THREE.MeshLambertMaterial({ color: 0x3fb838 });
      const darkGreenMat = new THREE.MeshLambertMaterial({ color: 0x226620 });
      const blackMat = new THREE.MeshLambertMaterial({ color: 0x0a0a0a });

      // Head
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.6), greenMat);
      head.position.set(0, 1.4, 0);
      group.add(head);

      // Creeper Face
      const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.04), blackMat);
      eyeR.position.set(0.14, 1.45, 0.31);
      const eyeL = eyeR.clone();
      eyeL.position.set(-0.14, 1.45, 0.31);
      const mouthTop = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 0.04), blackMat);
      mouthTop.position.set(0, 1.34, 0.31);
      const mouthBottom = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.16, 0.04), blackMat);
      mouthBottom.position.set(0, 1.23, 0.31);
      group.add(eyeR, eyeL, mouthTop, mouthBottom);

      // Body
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.7, 0.3), darkGreenMat);
      body.position.set(0, 0.75, 0);
      group.add(body);

      // 4 Feet
      const footGeo = new THREE.BoxGeometry(0.24, 0.45, 0.24);
      const f1 = new THREE.Mesh(footGeo, greenMat);
      f1.position.set(0.2, 0.22, 0.2);
      const f2 = new THREE.Mesh(footGeo, greenMat);
      f2.position.set(-0.2, 0.22, 0.2);
      const f3 = new THREE.Mesh(footGeo, greenMat);
      f3.position.set(0.2, 0.22, -0.2);
      const f4 = new THREE.Mesh(footGeo, greenMat);
      f4.position.set(-0.2, 0.22, -0.2);
      group.add(f1, f2, f3, f4);
    }

    return group;
  }

  public spawnMob(type: MobEntity['type'], x: number, y: number, z: number): MobEntity {
    const mesh = this.createMobMesh(type);
    mesh.position.set(x, y, z);
    this.mobMeshGroup.add(mesh);

    const mob: MobEntity = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      position: { x, y, z },
      rotationY: Math.random() * Math.PI * 2,
      health: type === 'zombie' ? 20 : type === 'creeper' ? 16 : 10,
      maxHealth: type === 'zombie' ? 20 : type === 'creeper' ? 16 : 10,
      velocity: { x: 0, y: 0, z: 0 },
      walkTimer: 0,
      walkDir: { x: 0, z: 0 },
      mesh,
    };

    this.mobs.push(mob);
    sounds.playPlace();
    return mob;
  }

  // Raycast to find mob under player crosshairs
  public findMobUnderRay(
    rayOrigin: THREE.Vector3,
    rayDir: THREE.Vector3,
    maxReach: number = 4.5
  ): { mob: MobEntity; distance: number } | null {
    let closestMob: MobEntity | null = null;
    let closestDist = maxReach;

    for (const mob of this.mobs) {
      // Mob center approximate position (eye/torso height)
      const mobHeight = mob.type === 'zombie' ? 1.4 : mob.type === 'creeper' ? 1.2 : 0.8;
      const mobPos = new THREE.Vector3(mob.position.x, mob.position.y + mobHeight / 2, mob.position.z);

      const toMob = mobPos.clone().sub(rayOrigin);
      const proj = toMob.dot(rayDir);

      if (proj > 0 && proj <= closestDist) {
        const closestPoint = rayOrigin.clone().addScaledVector(rayDir, proj);
        const distFromRay = closestPoint.distanceTo(mobPos);
        const hitRadius = mob.type === 'cow' || mob.type === 'sheep' ? 0.9 : 0.75;

        if (distFromRay <= hitRadius) {
          closestDist = proj;
          closestMob = mob;
        }
      }
    }

    if (closestMob) {
      return { mob: closestMob, distance: closestDist };
    }
    return null;
  }

  // Damage a mob, flash red, apply knockback and handle death
  public damageMob(
    mobId: string,
    amount: number,
    knockbackDir?: { x: number; z: number }
  ): { killed: boolean; mob?: MobEntity; damage: number } {
    const mobIndex = this.mobs.findIndex((m) => m.id === mobId);
    if (mobIndex === -1) return { killed: false, damage: 0 };

    const mob = this.mobs[mobIndex];
    mob.health -= amount;

    // 1. Knockback
    if (knockbackDir) {
      mob.velocity.x = knockbackDir.x * 5.5;
      mob.velocity.z = knockbackDir.z * 5.5;
      mob.velocity.y = 4.2;
    }

    // 2. Red Damage Flash
    if (mob.mesh) {
      const originalColors: { mesh: any; color: number }[] = [];
      mob.mesh.traverse((child: any) => {
        if (child.isMesh && child.material && 'color' in child.material) {
          originalColors.push({ mesh: child, color: (child.material as any).color.getHex() });
          (child.material as any).color.setHex(0xff2222);
        }
      });

      setTimeout(() => {
        originalColors.forEach(({ mesh, color }) => {
          if (mesh && mesh.material && 'color' in mesh.material) {
            (mesh.material as any).color.setHex(color);
          }
        });
      }, 200);
    }

    // 3. Hurt sound
    sounds.playHurt();

    // 4. Check death
    if (mob.health <= 0) {
      // Death puff of smoke
      this.spawnDeathParticles(mob.position.x, mob.position.y + 0.5, mob.position.z);
      sounds.playExplosion();

      // Remove from 3D scene
      if (mob.mesh) {
        this.mobMeshGroup.remove(mob.mesh);
      }
      this.mobs.splice(mobIndex, 1);
      return { killed: true, mob, damage: amount };
    }

    return { killed: false, mob, damage: amount };
  }

  // Death puff of white/smoke particles
  public spawnDeathParticles(x: number, y: number, z: number) {
    const count = 22;
    const colors = ['#ffffff', '#e2e8f0', '#cbd5e1', '#94a3b8'];
    for (let i = 0; i < count; i++) {
      const angleTheta = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2.2 + 0.6;
      this.particles.push({
        x: x + (Math.random() - 0.5) * 0.4,
        y: y + (Math.random() - 0.5) * 0.4,
        z: z + (Math.random() - 0.5) * 0.4,
        vx: Math.cos(angleTheta) * speed,
        vy: Math.random() * 2.2 + 0.8,
        vz: Math.sin(angleTheta) * speed,
        color: colors[i % colors.length],
        size: 0.14 + Math.random() * 0.1,
        life: 0.6 + Math.random() * 0.4,
        maxLife: 1.0,
      });
    }
  }

  // Sharp critical hit or diamond sparkle particles
  public spawnHitSparkParticles(x: number, y: number, z: number, isCritical: boolean = false) {
    const count = isCritical ? 14 : 7;
    const colors = isCritical ? ['#55ffff', '#00e5ff', '#ffffff', '#ffd700'] : ['#ff4444', '#ff8800', '#ffffff'];
    for (let i = 0; i < count; i++) {
      const angleTheta = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3.5 + 1.2;
      this.particles.push({
        x: x + (Math.random() - 0.5) * 0.2,
        y: y + (Math.random() - 0.5) * 0.2,
        z: z + (Math.random() - 0.5) * 0.2,
        vx: Math.cos(angleTheta) * speed,
        vy: Math.random() * 2.5 + 0.5,
        vz: Math.sin(angleTheta) * speed,
        color: colors[i % colors.length],
        size: isCritical ? 0.12 : 0.08,
        life: 0.4 + Math.random() * 0.25,
        maxLife: 0.65,
      });
    }
  }

  public spawnTNT(x: number, y: number, z: number, fuse: number = 3.0, radius: number = 4.5): TNTEntity {
    const tntGeo = new THREE.BoxGeometry(0.98, 0.98, 0.98);
    const tntMat = new THREE.MeshLambertMaterial({ color: 0xdd3333 });
    const mesh = new THREE.Mesh(tntGeo, tntMat);
    mesh.position.set(x, y, z);
    this.tntMeshGroup.add(mesh);

    sounds.playTNTHiss();

    const tnt: TNTEntity = {
      id: Math.random().toString(36).substring(2, 9),
      position: { x, y, z },
      velocity: { x: (Math.random() - 0.5) * 2, y: 4.5, z: (Math.random() - 0.5) * 2 },
      fuseTimer: fuse,
      radius,
      mesh,
    };

    this.tntList.push(tnt);
    return tnt;
  }

  public spawnBlockBreakParticles(x: number, y: number, z: number, blockType: BlockType) {
    const colorMap: { [key: number]: string } = {
      [BlockType.GRASS]: '#5b8c32',
      [BlockType.DIRT]: '#7a5130',
      [BlockType.STONE]: '#7a7a7a',
      [BlockType.COBBLESTONE]: '#636363',
      [BlockType.WOOD_LOG]: '#6e4f30',
      [BlockType.WOOD_PLANKS]: '#9e7344',
      [BlockType.LEAVES]: '#3d7829',
      [BlockType.GLASS]: '#c4e3f3',
      [BlockType.SAND]: '#dbcd8c',
      [BlockType.TNT]: '#c43333',
      [BlockType.DIAMOND_BLOCK]: '#5fe0db',
      [BlockType.GOLD_BLOCK]: '#f7d33b',
      [BlockType.EMERALD_BLOCK]: '#2fd16a',
      [BlockType.GLOWSTONE]: '#f5d769',
      [BlockType.OBSIDIAN]: '#221a36',
    };

    const color = colorMap[blockType] || '#888888';
    const count = 12;

    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x + Math.random() * 0.8 + 0.1,
        y: y + Math.random() * 0.8 + 0.1,
        z: z + Math.random() * 0.8 + 0.1,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 3 + 1,
        vz: (Math.random() - 0.5) * 4,
        color,
        size: 0.08 + Math.random() * 0.08,
        life: 0.6 + Math.random() * 0.3,
        maxLife: 0.9,
      });
    }
  }

  public spawnExplosionParticles(x: number, y: number, z: number) {
    const count = 50;
    const colors = ['#ffffff', '#ffcc00', '#ff6600', '#ff3300', '#444444', '#777777'];

    for (let i = 0; i < count; i++) {
      const speed = Math.random() * 8 + 2;
      const angleTheta = Math.random() * Math.PI * 2;
      const anglePhi = (Math.random() - 0.5) * Math.PI;

      this.particles.push({
        x,
        y,
        z,
        vx: Math.cos(angleTheta) * Math.cos(anglePhi) * speed,
        vy: Math.sin(anglePhi) * speed + 2,
        vz: Math.sin(angleTheta) * Math.cos(anglePhi) * speed,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 0.2 + Math.random() * 0.3,
        life: 0.8 + Math.random() * 0.6,
        maxLife: 1.4,
      });
    }
  }

  // Lightweight firework spark generator (low particle count & zero lag)
  public spawnFireworkParticles(x: number, y: number, z: number, count: number = 6) {
    if (this.particles.length > 30) {
      this.particles.splice(0, this.particles.length - 20);
    }
    const colors = ['#f43f5e', '#38bdf8', '#fbbf24', '#a855f7', '#ffffff', '#4ade80'];
    for (let i = 0; i < count; i++) {
      const angleTheta = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2.0 + 0.8;
      this.particles.push({
        x: x + (Math.random() - 0.5) * 0.25,
        y: y + (Math.random() - 0.5) * 0.25,
        z: z + (Math.random() - 0.5) * 0.25,
        vx: Math.cos(angleTheta) * speed,
        vy: Math.random() * 1.6 + 0.4,
        vz: Math.sin(angleTheta) * speed,
        color: colors[i % colors.length],
        size: 0.08,
        life: 0.35 + Math.random() * 0.15,
        maxLife: 0.5,
      });
    }
  }

  public update(dt: number, playerPos: THREE.Vector3) {
    // 1. Update Mobs
    this.mobs.forEach((mob) => {
      mob.walkTimer -= dt;
      if (mob.walkTimer <= 0) {
        mob.walkTimer = 2 + Math.random() * 4;
        if (Math.random() > 0.3) {
          mob.rotationY = Math.random() * Math.PI * 2;
          const speed = 1.2;
          mob.walkDir.x = Math.sin(mob.rotationY) * speed;
          mob.walkDir.z = Math.cos(mob.rotationY) * speed;
        } else {
          mob.walkDir.x = 0;
          mob.walkDir.z = 0;
        }
      }

      // Gravity
      mob.velocity.y -= 18 * dt;

      // Apply movement
      const nextX = mob.position.x + mob.walkDir.x * dt;
      const nextZ = mob.position.z + mob.walkDir.z * dt;
      const nextY = mob.position.y + mob.velocity.y * dt;

      // Check ground & obstacle
      const blockUnder = this.world.getBlock(Math.floor(nextX), Math.floor(nextY), Math.floor(nextZ));
      const blockAhead = this.world.getBlock(Math.floor(nextX), Math.floor(nextY + 0.5), Math.floor(nextZ));

      if (blockAhead !== BlockType.AIR && blockAhead !== BlockType.WATER) {
        // Jump over 1 block
        mob.velocity.y = 5.0;
      }

      if (blockUnder !== BlockType.AIR && blockUnder !== BlockType.WATER) {
        mob.velocity.y = 0;
        mob.position.y = Math.floor(nextY) + 1;
      } else {
        mob.position.y = nextY;
      }

      mob.position.x = nextX;
      mob.position.z = nextZ;

      if (mob.mesh) {
        mob.mesh.position.set(mob.position.x, mob.position.y, mob.position.z);
        mob.mesh.rotation.y = mob.rotationY;
      }
    });

    // 2. Update TNT
    for (let i = this.tntList.length - 1; i >= 0; i--) {
      const tnt = this.tntList[i];
      tnt.fuseTimer -= dt;

      // Flash white / scale pulse effect
      if (tnt.mesh) {
        const pulse = Math.sin(tnt.fuseTimer * 20) * 0.15 + 1.0;
        tnt.mesh.scale.set(pulse, pulse, pulse);
        const mat = tnt.mesh.material as THREE.MeshLambertMaterial;
        mat.color.setHex(Math.sin(tnt.fuseTimer * 25) > 0 ? 0xffffff : 0xdd3333);
      }

      // Physics
      tnt.velocity.y -= 20 * dt;
      tnt.position.x += tnt.velocity.x * dt;
      tnt.position.y += tnt.velocity.y * dt;
      tnt.position.z += tnt.velocity.z * dt;

      const groundY = this.world.getTopSolidY(Math.floor(tnt.position.x), Math.floor(tnt.position.z));
      if (tnt.position.y <= groundY + 1) {
        tnt.position.y = groundY + 1;
        tnt.velocity.x *= 0.8;
        tnt.velocity.z *= 0.8;
        tnt.velocity.y = 0;
      }

      if (tnt.mesh) {
        tnt.mesh.position.set(tnt.position.x, tnt.position.y, tnt.position.z);
      }

      // Explode when fuse ends
      if (tnt.fuseTimer <= 0) {
        this.world.explode(tnt.position.x, tnt.position.y, tnt.position.z, tnt.radius);
        this.spawnExplosionParticles(tnt.position.x, tnt.position.y + 0.5, tnt.position.z);
        sounds.playExplosion();

        // Remove mesh
        if (tnt.mesh) {
          this.tntMeshGroup.remove(tnt.mesh);
        }
        this.tntList.splice(i, 1);
      }
    }

    // 3. Update Particles (Zero-Lag Pooled Rendering)
    if (this.particles.length > 35) {
      this.particles.splice(0, this.particles.length - 35);
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      p.vy -= 14 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.z += p.vz * dt;
    }

    // Synchronize pooled particle meshes
    const activeCount = this.particles.length;
    while (this.particleMeshPool.length < activeCount) {
      const pMesh = new THREE.Mesh(this.particleGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }));
      this.particleMeshGroup.add(pMesh);
      this.particleMeshPool.push(pMesh);
    }

    for (let i = 0; i < this.particleMeshPool.length; i++) {
      const mesh = this.particleMeshPool[i];
      if (i < activeCount) {
        const p = this.particles[i];
        mesh.visible = true;
        mesh.position.set(p.x, p.y, p.z);
        mesh.scale.set(p.size, p.size, p.size);
        (mesh.material as THREE.MeshBasicMaterial).color.setStyle(p.color);
      } else {
        mesh.visible = false;
      }
    }
  }

  public killAllMobsInRadius(px: number, py: number, pz: number, radius: number): number {
    let killed = 0;
    const rSq = radius * radius;
    const remaining: MobEntity[] = [];

    for (const m of this.mobs) {
      const dx = m.position.x - px;
      const dy = m.position.y - py;
      const dz = m.position.z - pz;
      const dSq = dx * dx + dy * dy + dz * dz;

      if (dSq <= rSq) {
        if (m.mesh) this.mobMeshGroup.remove(m.mesh);
        this.spawnExplosionParticles(m.position.x, m.position.y + 0.5, m.position.z);
        killed++;
      } else {
        remaining.push(m);
      }
    }

    this.mobs = remaining;
    return killed;
  }

  public clearAll() {
    this.mobs.forEach((m) => {
      if (m.mesh) this.mobMeshGroup.remove(m.mesh);
    });
    this.mobs = [];

    this.tntList.forEach((t) => {
      if (t.mesh) this.tntMeshGroup.remove(t.mesh);
    });
    this.tntList = [];

    this.particles = [];
    this.particleMeshPool.forEach((m) => {
      m.visible = false;
    });
  }
}
