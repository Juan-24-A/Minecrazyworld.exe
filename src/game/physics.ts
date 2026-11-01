import * as THREE from 'three';
import { VoxelWorld } from './world';
import { BlockType, GameMode, BossStats } from '../types';
import { sounds } from './audio';

export interface PlayerPhysicsState {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  onGround: boolean;
  inWater: boolean;
  isFlying: boolean;
  isNoclip: boolean;
  isGodmode: boolean;
  speedMultiplier: number;
  jumpMultiplier: number;
  gamemode: GameMode;
  health: number;
  hunger: number;
  isSprinting: boolean;
  isSneaking: boolean;
  isGliding: boolean;
  fireworkBoostTimer: number;
  boss?: BossStats;
}

export class PlayerPhysics {
  public state: PlayerPhysicsState;
  public world: VoxelWorld;
  public spawnPoint: THREE.Vector3 | null = null;
  public playerWidth = 0.55;
  public playerHeight = 1.8;
  public eyeHeight = 1.62;
  private stepSoundTimer = 0;
  public lastDamageTime = 0;

  constructor(world: VoxelWorld, startPos: THREE.Vector3 = new THREE.Vector3(0, 20, 0)) {
    this.world = world;
    this.state = {
      pos: startPos.clone(),
      vel: new THREE.Vector3(),
      onGround: false,
      inWater: false,
      isFlying: false,
      isNoclip: false,
      isGodmode: false,
      speedMultiplier: 1.0,
      jumpMultiplier: 1.0,
      gamemode: 'creative',
      health: 20,
      hunger: 20,
      isSprinting: false,
      isSneaking: false,
      isGliding: false,
      fireworkBoostTimer: 0,
    };
  }

  public isSolid(x: number, y: number, z: number): boolean {
    const block = this.world.getBlock(Math.floor(x), Math.floor(y), Math.floor(z));
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

  public isLiquid(x: number, y: number, z: number): boolean {
    const block = this.world.getBlock(Math.floor(x), Math.floor(y), Math.floor(z));
    return (
      block === BlockType.WATER ||
      block === BlockType.LAVA ||
      block === BlockType.LIQUID_CHOCOLATE ||
      block === BlockType.PARALLEL_WATER
    );
  }

  public checkCollision(pos: THREE.Vector3): boolean {
    if (this.state.isNoclip) return false;

    const minX = pos.x - this.playerWidth / 2;
    const maxX = pos.x + this.playerWidth / 2;
    const minY = pos.y;
    const maxY = pos.y + this.playerHeight;
    const minZ = pos.z - this.playerWidth / 2;
    const maxZ = pos.z + this.playerWidth / 2;

    const startX = Math.floor(minX);
    const endX = Math.floor(maxX);
    const startY = Math.floor(minY);
    const endY = Math.floor(maxY);
    const startZ = Math.floor(minZ);
    const endZ = Math.floor(maxZ);

    for (let x = startX; x <= endX; x++) {
      for (let y = startY; y <= endY; y++) {
        for (let z = startZ; z <= endZ; z++) {
          if (this.isSolid(x, y, z)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  public update(
    dt: number,
    input: { forward: number; strafe: number; up: number; jump: boolean; sneak: boolean; sprint: boolean },
    yaw: number,
    pitch: number = 0
  ) {
    const s = this.state;
    const timeDelta = Math.min(dt, 0.1);

    // Check liquid
    s.inWater = this.isLiquid(s.pos.x, s.pos.y + 0.5, s.pos.z);

    // Cancel gliding if on ground or immersed in liquid
    if (s.isGliding && (s.onGround || s.inWater)) {
      s.isGliding = false;
      s.fireworkBoostTimer = 0;
    }

    // Creative / Survival modifiers
    let baseSpeed = s.gamemode === 'creative' ? 6.5 : 4.3;
    if (s.isFlying) baseSpeed = 11.0;
    if (s.isSprinting) baseSpeed *= 1.35;
    if (s.isSneaking) baseSpeed *= 0.45;
    if (s.inWater && !s.isFlying) baseSpeed *= 0.65;

    const moveSpeed = baseSpeed * s.speedMultiplier;

    // Movement direction from yaw
    const forwardVec = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw)).normalize();
    const rightVec = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw)).normalize();

    const effectiveForward = input.forward;

    const targetVel = new THREE.Vector3();
    targetVel.addScaledVector(forwardVec, effectiveForward);
    targetVel.addScaledVector(rightVec, input.strafe);
    if (targetVel.lengthSq() > 0) {
      targetVel.normalize().multiplyScalar(moveSpeed);
    }

    // Step sounds when moving on ground
    if (s.onGround && targetVel.lengthSq() > 1 && !s.isFlying && !s.isGliding) {
      this.stepSoundTimer += timeDelta * (s.isSprinting ? 1.5 : 1.0);
      if (this.stepSoundTimer > 0.35) {
        this.stepSoundTimer = 0;
        const groundBlock = this.world.getBlock(Math.floor(s.pos.x), Math.floor(s.pos.y - 0.2), Math.floor(s.pos.z));
        let soundMat: 'grass' | 'stone' | 'wood' | 'sand' = 'grass';
        if (groundBlock === BlockType.STONE || groundBlock === BlockType.COBBLESTONE || groundBlock === BlockType.BRICKS) soundMat = 'stone';
        else if (groundBlock === BlockType.WOOD_LOG || groundBlock === BlockType.WOOD_PLANKS) soundMat = 'wood';
        else if (groundBlock === BlockType.SAND || groundBlock === BlockType.SANDSTONE) soundMat = 'sand';
        sounds.playStep(soundMat);
      }
    }

    if (s.isGliding) {
      // Élitros Flight Aerodynamics & Firework Propulsion
      sounds.playElytraGlide();

      const lookDir = new THREE.Vector3(
        -Math.sin(yaw) * Math.cos(pitch),
        Math.sin(pitch),
        -Math.cos(yaw) * Math.cos(pitch)
      ).normalize();

      // Firework Propulsion Boost
      if (s.fireworkBoostTimer > 0) {
        s.fireworkBoostTimer -= timeDelta;
        const boostThrust = 26.0;
        s.vel.addScaledVector(lookDir, boostThrust * timeDelta * 2.8);
        if (s.vel.length() > 30.0) {
          s.vel.setLength(30.0);
        }
      } else {
        // Natural Gliding Aerodynamics
        const currentSpeed = Math.sqrt(s.vel.x * s.vel.x + s.vel.z * s.vel.z);

        if (pitch < -0.05) {
          // Diving downward: accelerate airspeed
          const divePower = -pitch * 16.0;
          s.vel.addScaledVector(lookDir, divePower * timeDelta);
        } else if (pitch > 0.1) {
          // Pitching up: convert forward momentum to climbing altitude
          if (currentSpeed > 5.0) {
            s.vel.y += pitch * 8.5 * timeDelta;
            s.vel.x *= 0.96;
            s.vel.z *= 0.96;
          }
        }

        // Aerodynamic lift & gentle sink rate
        const targetSink = pitch > 0 ? -1.0 : -2.2;
        s.vel.y = THREE.MathUtils.lerp(s.vel.y, targetSink, 0.08);

        // Keep momentum along forward yaw
        const forwardHorizontal = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw)).normalize();
        const targetSpeed = Math.max(12.0, Math.min(26.0, s.vel.length()));
        const targetHVel = forwardHorizontal.multiplyScalar(targetSpeed);
        s.vel.x = THREE.MathUtils.lerp(s.vel.x, targetHVel.x, 0.12);
        s.vel.z = THREE.MathUtils.lerp(s.vel.z, targetHVel.z, 0.12);

        // Gentle drag
        s.vel.x *= 0.994;
        s.vel.z *= 0.994;
      }

      // Exit gliding if player presses sneak
      if (input.sneak) {
        s.isGliding = false;
        s.fireworkBoostTimer = 0;
      }
    } else if (s.isFlying || s.isNoclip) {
      // Flying 3D movement
      s.vel.x = THREE.MathUtils.lerp(s.vel.x, targetVel.x, 0.25);
      s.vel.z = THREE.MathUtils.lerp(s.vel.z, targetVel.z, 0.25);

      let verticalInput = 0;
      if (input.jump) verticalInput += 1;
      if (input.sneak) verticalInput -= 1;
      const targetVelY = verticalInput * moveSpeed * 0.9;
      s.vel.y = THREE.MathUtils.lerp(s.vel.y, targetVelY, 0.25);

      if (s.isNoclip) {
        s.pos.addScaledVector(s.vel, timeDelta);
        return;
      }
    } else {
      // Gravity and Normal Movement
      const gravity = s.inWater ? -9.8 : -26.0;
      s.vel.y += gravity * timeDelta;
      s.vel.y = Math.max(s.vel.y, -40); // terminal velocity

      // Jump & Liquid Upward Movement
      if (input.jump || (s.inWater && input.up > 0)) {
        if (s.onGround) {
          const jumpPower = (s.inWater ? 5.5 : 8.4) * s.jumpMultiplier;
          s.vel.y = jumpPower;
          s.onGround = false;
        } else if (s.inWater) {
          s.vel.y = 5.2; // Swim / ascend upwards smoothly in all liquids
        }
      }

      // Horizontal friction & acceleration
      const accelRate = s.onGround ? 0.28 : 0.08;
      s.vel.x = THREE.MathUtils.lerp(s.vel.x, targetVel.x, accelRate);
      s.vel.z = THREE.MathUtils.lerp(s.vel.z, targetVel.z, accelRate);
    }

    // AABB Collision Resolution per Axis (X, Y, Z)
    const displacement = s.vel.clone().multiplyScalar(timeDelta);

    // 1. Resolve Y
    const newPosY = s.pos.clone();
    newPosY.y += displacement.y;
    if (this.checkCollision(newPosY)) {
      if (s.vel.y < 0) {
        s.onGround = true;
        const wasGliding = s.isGliding;
        s.isGliding = false;
        s.fireworkBoostTimer = 0;

        // Fall damage in survival (mitigated if gliding)
        if (s.gamemode === 'survival' && !s.isGodmode && s.vel.y < (wasGliding ? -22 : -14)) {
          const damage = Math.floor((-s.vel.y - 12) * 1.5);
          if (damage > 0) {
            this.takeDamage(damage);
          }
        }
      }
      s.vel.y = 0;
    } else {
      s.pos.y = newPosY.y;
      s.onGround = false;
    }

    // 2. Resolve X
    const newPosX = s.pos.clone();
    newPosX.x += displacement.x;
    if (this.checkCollision(newPosX)) {
      // Attempt step-up (auto-jump small 0.5-1.0 obstacles if moving forward)
      const stepUpPos = newPosX.clone();
      stepUpPos.y += 0.55;
      if (s.onGround && !this.checkCollision(stepUpPos)) {
        s.pos.copy(stepUpPos);
      } else {
        s.vel.x = 0;
      }
    } else {
      s.pos.x = newPosX.x;
    }

    // 3. Resolve Z
    const newPosZ = s.pos.clone();
    newPosZ.z += displacement.z;
    if (this.checkCollision(newPosZ)) {
      const stepUpPos = newPosZ.clone();
      stepUpPos.y += 0.55;
      if (s.onGround && !this.checkCollision(stepUpPos)) {
        s.pos.copy(stepUpPos);
      } else {
        s.vel.z = 0;
      }
    } else {
      s.pos.z = newPosZ.z;
    }

    // Void reset
    if (s.pos.y < -15) {
      if (s.gamemode === 'survival' && !s.isGodmode) {
        this.takeDamage(100);
      }
      this.respawn();
    }
  }

  public takeDamage(amount: number) {
    if (this.state.gamemode === 'creative' || this.state.isGodmode) return;
    const now = Date.now();
    if (now - this.lastDamageTime < 500) return;
    this.lastDamageTime = now;

    this.state.health = Math.max(0, this.state.health - amount);
    sounds.playHurt();

    if (this.state.health <= 0) {
      this.respawn();
    }
  }

  public setSpawnPoint(x: number, y: number, z: number) {
    this.spawnPoint = new THREE.Vector3(x + 0.5, y, z + 0.5);
  }

  public activateFireworkBoost(duration: number = 2.5) {
    this.state.isGliding = true;
    this.state.fireworkBoostTimer = duration;
  }

  public toggleGliding(force?: boolean): boolean {
    if (force !== undefined) {
      this.state.isGliding = force;
    } else {
      this.state.isGliding = !this.state.isGliding;
    }
    if (!this.state.isGliding) {
      this.state.fireworkBoostTimer = 0;
    }
    return this.state.isGliding;
  }

  public respawn() {
    if (this.spawnPoint) {
      this.state.pos.copy(this.spawnPoint);
    } else {
      const topY = this.world.getTopSolidY(0, 0);
      this.state.pos.set(0, topY + 2, 0);
    }
    this.state.vel.set(0, 0, 0);
    this.state.health = 20;
    this.state.hunger = 20;
  }
}
