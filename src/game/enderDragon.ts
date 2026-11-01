import * as THREE from 'three';
import { VoxelWorld } from './world';
import { sounds } from './audio';
import { BlockType } from '../types';

export class EnderDragon {
  public scene: THREE.Scene;
  public world: VoxelWorld;
  public group: THREE.Group = new THREE.Group();

  public health: number = 200;
  public maxHealth: number = 200;
  public isAlive: boolean = true;

  public position: THREE.Vector3 = new THREE.Vector3(0, 32, 0);
  public velocity: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  public yaw: number = 0;
  public pitch: number = 0;

  // AI State
  public phase: 'orbit' | 'swoop' | 'hover' | 'dying' = 'orbit';
  private orbitAngle: number = 0;
  private orbitRadius: number = 24;
  private orbitSpeed: number = 0.55;
  private swoopTimer: number = 8.0;
  private swoopTarget: THREE.Vector3 = new THREE.Vector3();
  private wingTime: number = 0;
  private deathTimer: number = 0;
  private flashRedTimer: number = 0;

  // Meshes for animation
  private wingL!: THREE.Group;
  private wingR!: THREE.Group;
  private headGroup!: THREE.Group;
  private tailSegments: THREE.Mesh[] = [];
  private materials: THREE.MeshLambertMaterial[] = [];
  private originalColors: number[] = [];

  public onDefeated?: () => void;

  constructor(scene: THREE.Scene, world: VoxelWorld) {
    this.scene = scene;
    this.world = world;
    this.buildDragonModel();
    this.scene.add(this.group);
    this.group.position.copy(this.position);
  }

  private buildDragonModel() {
    // Colors
    const blackColor = 0x141414;
    const darkGrayColor = 0x242424;
    const purpleEyeColor = 0xd946ef;
    const purpleWingColor = 0x3b0764;
    const darkHornColor = 0x333333;

    const blackMat = new THREE.MeshLambertMaterial({ color: blackColor });
    const darkGrayMat = new THREE.MeshLambertMaterial({ color: darkGrayColor });
    const wingMat = new THREE.MeshLambertMaterial({ color: purpleWingColor, side: THREE.DoubleSide });
    const hornMat = new THREE.MeshLambertMaterial({ color: darkHornColor });
    const eyeMat = new THREE.MeshBasicMaterial({ color: purpleEyeColor });

    // Store for red damage flashing
    [blackMat, darkGrayMat, wingMat, hornMat].forEach((mat) => {
      this.materials.push(mat);
      this.originalColors.push(mat.color.getHex());
    });

    // 1. Central Body
    const bodyGeo = new THREE.BoxGeometry(1.8, 1.4, 3.2);
    const bodyMesh = new THREE.Mesh(bodyGeo, blackMat);
    bodyMesh.castShadow = true;
    this.group.add(bodyMesh);

    // Spine Plates on Body
    for (let i = -1; i <= 1; i++) {
      const plate = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.45, 0.5), darkGrayMat);
      plate.position.set(0, 0.85, i * 0.8);
      this.group.add(plate);
    }

    // 2. Neck Segments (leading forward to head)
    const neckSegments = 3;
    for (let i = 0; i < neckSegments; i++) {
      const neck = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.9), blackMat);
      neck.position.set(0, 0.35 + i * 0.25, 1.8 + i * 0.8);
      this.group.add(neck);

      // Spine on neck
      const neckSpine = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.3, 0.4), darkGrayMat);
      neckSpine.position.set(0, 0.9 + i * 0.25, 1.8 + i * 0.8);
      this.group.add(neckSpine);
    }

    // 3. Head & Snout & Glowing Eyes & Horns
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 1.2, 4.4);

    // Main head cranium
    const headCranium = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.9, 1.2), blackMat);
    this.headGroup.add(headCranium);

    // Snout / Upper Jaw
    const snout = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.6, 1.3), darkGrayMat);
    snout.position.set(0, -0.15, 0.9);
    this.headGroup.add(snout);

    // Lower Jaw
    const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.25, 1.1), blackMat);
    jaw.position.set(0, -0.45, 0.8);
    this.headGroup.add(jaw);

    // Glowing Purple Eyes
    const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.16, 0.08), eyeMat);
    eyeR.position.set(0.48, 0.15, 0.6);
    const eyeL = eyeR.clone();
    eyeL.position.set(-0.48, 0.15, 0.6);
    this.headGroup.add(eyeR, eyeL);

    // Horns on Head
    const hornR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.4, 0.7), hornMat);
    hornR.position.set(0.38, 0.55, -0.4);
    hornR.rotation.x = -0.3;
    hornR.rotation.y = 0.2;
    const hornL = hornR.clone();
    hornL.position.set(-0.38, 0.55, -0.4);
    hornL.rotation.y = -0.2;
    this.headGroup.add(hornR, hornL);

    this.group.add(this.headGroup);

    // 4. Articulated Wings (Left and Right)
    this.wingL = new THREE.Group();
    this.wingL.position.set(0.9, 0.4, 0.5);

    // Wing Bone inner
    const boneL1 = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.25, 0.35), darkGrayMat);
    boneL1.position.set(1.2, 0, 0);
    this.wingL.add(boneL1);

    // Wing Bone outer (curving backward)
    const boneL2 = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.2, 0.25), darkGrayMat);
    boneL2.position.set(3.4, 0.1, -0.5);
    boneL2.rotation.y = -0.3;
    this.wingL.add(boneL2);

    // Wing Membrane
    const membraneL = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.05, 2.8), wingMat);
    membraneL.position.set(2.4, -0.05, -1.0);
    this.wingL.add(membraneL);
    this.group.add(this.wingL);

    // Mirror Right Wing
    this.wingR = new THREE.Group();
    this.wingR.position.set(-0.9, 0.4, 0.5);

    const boneR1 = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.25, 0.35), darkGrayMat);
    boneR1.position.set(-1.2, 0, 0);
    this.wingR.add(boneR1);

    const boneR2 = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.2, 0.25), darkGrayMat);
    boneR2.position.set(-3.4, 0.1, -0.5);
    boneR2.rotation.y = 0.3;
    this.wingR.add(boneR2);

    const membraneR = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.05, 2.8), wingMat);
    membraneR.position.set(-2.4, -0.05, -1.0);
    this.wingR.add(membraneR);
    this.group.add(this.wingR);

    // 5. Segmented Tail
    for (let i = 0; i < 4; i++) {
      const size = 0.9 - i * 0.15;
      const tailMesh = new THREE.Mesh(new THREE.BoxGeometry(size, size, 1.0), blackMat);
      tailMesh.position.set(0, 0.15 - i * 0.05, -2.1 - i * 0.95);
      this.tailSegments.push(tailMesh);
      this.group.add(tailMesh);

      // Tail fin/spine
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.45 - i * 0.05, 0.5), darkGrayMat);
      fin.position.set(0, 0.55 - i * 0.05, -2.1 - i * 0.95);
      this.group.add(fin);
    }

    // Scale entire dragon to majestic boss proportions
    this.group.scale.set(1.4, 1.4, 1.4);
  }

  public update(dt: number, playerPos: THREE.Vector3) {
    if (!this.isAlive && this.phase !== 'dying') return;

    // Handle damage flashing
    if (this.flashRedTimer > 0) {
      this.flashRedTimer -= dt;
      if (this.flashRedTimer <= 0) {
        this.materials.forEach((mat, idx) => {
          mat.color.setHex(this.originalColors[idx]);
        });
      }
    }

    // 1. Dying Phase
    if (this.phase === 'dying') {
      this.deathTimer += dt;
      // Ascend slowly to sky
      this.position.y += 3.5 * dt;
      this.position.x += (0 - this.position.x) * 0.5 * dt;
      this.position.z += (0 - this.position.z) * 0.5 * dt;
      this.yaw += 1.8 * dt;

      // Slow fading wing flaps
      this.wingTime += dt * 3.0;
      this.wingL.rotation.z = Math.sin(this.wingTime) * 0.4;
      this.wingR.rotation.z = -Math.sin(this.wingTime) * 0.4;

      this.group.position.copy(this.position);
      this.group.rotation.y = this.yaw;

      if (this.deathTimer >= 4.0) {
        this.destroyAndOpenExitPortal();
      }
      return;
    }

    // 2. Flight Animation & Wing Flapping
    const flapSpeed = this.phase === 'swoop' ? 9.0 : 5.0;
    this.wingTime += dt * flapSpeed;
    const flapAngle = Math.sin(this.wingTime) * 0.45;
    this.wingL.rotation.z = flapAngle;
    this.wingR.rotation.z = -flapAngle;

    // Subtle snake-like wiggle on tail segments
    this.tailSegments.forEach((tail, idx) => {
      tail.rotation.y = Math.sin(this.wingTime * 0.5 + idx * 0.6) * 0.15;
    });

    // 3. AI State Machine
    this.swoopTimer -= dt;

    if (this.phase === 'orbit') {
      this.orbitAngle += this.orbitSpeed * dt;
      const targetX = Math.sin(this.orbitAngle) * this.orbitRadius;
      const targetZ = Math.cos(this.orbitAngle) * this.orbitRadius;
      const targetY = 28 + Math.sin(this.orbitAngle * 2) * 6; // sinusoidal elevation

      const toTarget = new THREE.Vector3(targetX, targetY, targetZ).sub(this.position);
      this.position.addScaledVector(toTarget, 1.2 * dt);

      // Look in direction of flight
      const targetYaw = Math.atan2(toTarget.x, toTarget.z);
      this.yaw = THREE.MathUtils.lerp(this.yaw, targetYaw, 3 * dt);

      // Trigger swoop attack every 12-16 seconds
      if (this.swoopTimer <= 0) {
        this.phase = 'swoop';
        this.swoopTimer = 14.0 + Math.random() * 5.0;
        this.swoopTarget.copy(playerPos);
        sounds.playDragonRoar();
      }
    } else if (this.phase === 'swoop') {
      // Dive towards swoop target (near player)
      const toPlayer = new THREE.Vector3(this.swoopTarget.x, this.swoopTarget.y + 1.2, this.swoopTarget.z).sub(this.position);
      const dist = toPlayer.length();

      const swoopSpeed = 16.0;
      toPlayer.normalize();
      this.position.addScaledVector(toPlayer, swoopSpeed * dt);

      const targetYaw = Math.atan2(toPlayer.x, toPlayer.z);
      this.yaw = THREE.MathUtils.lerp(this.yaw, targetYaw, 4 * dt);
      this.pitch = THREE.MathUtils.lerp(this.pitch, toPlayer.y * 0.5, 3 * dt);

      // If reached close to player or ground, ascend back to orbit
      if (dist < 4.0 || this.position.y <= 16.0 || this.swoopTimer < 8.0) {
        this.phase = 'orbit';
        sounds.playDragonRoar();
      }
    }

    this.group.position.copy(this.position);
    this.group.rotation.y = this.yaw;
    this.group.rotation.x = this.pitch;
  }

  // Raycast collision detection with Dragon
  public checkRayHit(rayOrigin: THREE.Vector3, rayDir: THREE.Vector3, maxReach = 9.0): boolean {
    if (!this.isAlive || this.phase === 'dying') return false;

    // Check distance to dragon center
    const toDragon = this.position.clone().sub(rayOrigin);
    const distToDragon = toDragon.length();
    if (distToDragon > maxReach + 4.5) return false;

    // Project dragon onto ray
    const proj = toDragon.dot(rayDir);
    if (proj < 0 || proj > maxReach) return false;

    const closestPoint = rayOrigin.clone().addScaledVector(rayDir, proj);
    const distFromRay = closestPoint.distanceTo(this.position);

    // Dragon has a generous hit sphere radius (~3.4 blocks)
    return distFromRay <= 3.4;
  }

  public takeDamage(amount: number): boolean {
    if (!this.isAlive || this.phase === 'dying') return false;

    this.health = Math.max(0, this.health - amount);
    this.flashRed();

    // Sound and flinch
    sounds.playDragonRoar();
    this.position.y += 0.8;

    if (this.health <= 0) {
      this.isAlive = false;
      this.phase = 'dying';
      this.deathTimer = 0;
      sounds.playDragonDeath();
    }

    return true;
  }

  private flashRed() {
    this.flashRedTimer = 0.22;
    this.materials.forEach((mat) => {
      mat.color.setHex(0xff2222);
    });
  }

  private destroyAndOpenExitPortal() {
    this.scene.remove(this.group);
    this.isAlive = false;

    // Generate Exit Portal at the center of the Main Island (X: 0, Z: 0)
    // Central Bedrock Fountain with 3x3 PORTAL_END pool and center pillar with Dragon Egg!
    const centerX = 0;
    const centerZ = 0;
    const groundY = this.world.getTopSolidY(centerX, centerZ);

    // 1. Bedrock basin
    for (let dx = -2; dx <= 2; dx++) {
      for (let dz = -2; dz <= 2; dz++) {
        const x = centerX + dx;
        const z = centerZ + dz;
        const isBorder = Math.abs(dx) === 2 || Math.abs(dz) === 2;

        // Base foundation
        this.world.setBlock(x, groundY, z, BlockType.BEDROCK);

        if (isBorder) {
          // Bedrock Rim
          this.world.setBlock(x, groundY + 1, z, BlockType.BEDROCK);
          this.world.setBlock(x, groundY + 2, z, BlockType.AIR);
        } else if (dx === 0 && dz === 0) {
          // Center Bedrock Pillar with Dragon Egg
          this.world.setBlock(x, groundY + 1, z, BlockType.BEDROCK);
          this.world.setBlock(x, groundY + 2, z, BlockType.BEDROCK);
          this.world.setBlock(x, groundY + 3, z, BlockType.OBSIDIAN); // Dragon Egg
        } else {
          // Horizontal Exit Portal Blocks (Pool)
          this.world.setBlock(x, groundY + 1, z, BlockType.PORTAL_END);
          this.world.setBlock(x, groundY + 2, z, BlockType.AIR);
          this.world.setBlock(x, groundY + 3, z, BlockType.AIR);
        }
      }
    }

    if (this.onDefeated) {
      this.onDefeated();
    }
  }

  public dispose() {
    this.scene.remove(this.group);
  }
}
