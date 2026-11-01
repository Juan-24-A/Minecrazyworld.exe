import * as THREE from 'three';
import { DimensionType, BlockType, InventoryItem } from '../types';
import { VoxelWorld } from './world';
import { sounds } from './audio';

export const TRUCK_COLORS = [
  { name: 'Rojo Fresa Candy', hex: '#e11d48', num: 0xe11d48 },
  { name: 'Azul Deportivo', hex: '#2563eb', num: 0x2563eb },
  { name: 'Verde Esmeralda', hex: '#16a34a', num: 0x16a34a },
  { name: 'Amarillo Neón', hex: '#eab308', num: 0xeab308 },
  { name: 'Púrpura Mágico', hex: '#9333ea', num: 0x9333ea },
  { name: 'Cian Turquesa', hex: '#06b6d4', num: 0x06b6d4 },
  { name: 'Rosa Chicle', hex: '#ec4899', num: 0xec4899 },
  { name: 'Negro Azabache', hex: '#18181b', num: 0x18181b },
  { name: 'Blanco Glaciar', hex: '#f8fafc', num: 0xf8fafc },
  { name: 'Chocolate Dulce', hex: '#6d3918', num: 0x6d3918 },
  { name: 'Naranja Caramelo', hex: '#f97316', num: 0xf97316 },
];

export interface TruckEntity {
  id: string;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  yaw: number;
  pitch: number;
  roll: number;
  wheelRotation: number;
  steerAngle: number;
  dimension: DimensionType;
  mesh: THREE.Group;
  frontWheelLeft: THREE.Group;
  frontWheelRight: THREE.Group;
  rearWheelLeft: THREE.Group;
  rearWheelRight: THREE.Group;
  headlights: THREE.PointLight[];
  isDriven: boolean;
  onGround: boolean;
  color: string;
  colorIndex: number;
  bodyMaterials: THREE.MeshLambertMaterial[];
}

export class TruckManager {
  public trucks: TruckEntity[] = [];
  public scene: THREE.Scene;
  public world: VoxelWorld;
  private truckGroup: THREE.Group = new THREE.Group();
  public drivingTruck: TruckEntity | null = null;
  private lastClickTime: number = 0;
  private exhaustTimer: number = 0;

  public onTruckCollected?: (item: InventoryItem) => void;
  public onChatLog?: (msg: { text: string; color?: string; sender?: 'system' | 'player' }) => void;

  constructor(scene: THREE.Scene, world: VoxelWorld) {
    this.scene = scene;
    this.world = world;
    this.scene.add(this.truckGroup);
  }

  // Build 3D Voxel Pickup Truck Model
  public createTruckMesh(initialColorHex: number = TRUCK_COLORS[0].num): {
    mesh: THREE.Group;
    frontWheelLeft: THREE.Group;
    frontWheelRight: THREE.Group;
    rearWheelLeft: THREE.Group;
    rearWheelRight: THREE.Group;
    headlights: THREE.PointLight[];
    bodyMaterials: THREE.MeshLambertMaterial[];
  } {
    const root = new THREE.Group();

    // Materials
    const bodyMat = new THREE.MeshLambertMaterial({ color: initialColorHex }); // Dynamic Body Color Gloss
    const darkTrimMat = new THREE.MeshLambertMaterial({ color: 0x2b2b2b });
    const chromeMat = new THREE.MeshLambertMaterial({ color: 0xe2e8f0 });
    const glassMat = new THREE.MeshLambertMaterial({
      color: 0x67e8f9,
      transparent: true,
      opacity: 0.65,
    });
    const tireMat = new THREE.MeshLambertMaterial({ color: 0x18181b });
    const rimMat = new THREE.MeshLambertMaterial({ color: 0xf1f5f9 });
    const headlightMat = new THREE.MeshLambertMaterial({
      color: 0xfef08a,
      emissive: new THREE.Color(0xfef08a),
      emissiveIntensity: 0.8,
    });
    const taillightMat = new THREE.MeshLambertMaterial({
      color: 0xef4444,
      emissive: new THREE.Color(0xef4444),
      emissiveIntensity: 0.8,
    });

    // 1. Lower Chassis (Frame)
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.35, 2.9), darkTrimMat);
    chassis.position.set(0, 0.45, 0);
    chassis.castShadow = true;
    chassis.receiveShadow = true;
    root.add(chassis);

    // 2. Main Body / Hood (Front)
    const hood = new THREE.Mesh(new THREE.BoxGeometry(1.48, 0.45, 1.1), bodyMat);
    hood.position.set(0, 0.85, 0.9);
    hood.castShadow = true;
    root.add(hood);

    // 3. Front Grille & Chrome Bumper
    const bumper = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.25, 0.2), chromeMat);
    bumper.position.set(0, 0.45, 1.5);
    root.add(bumper);

    const grille = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.3, 0.08), darkTrimMat);
    grille.position.set(0, 0.8, 1.46);
    root.add(grille);

    // 4. Headlights with real illumination
    const headlightR = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.06), headlightMat);
    headlightR.position.set(0.55, 0.85, 1.46);
    const headlightL = headlightR.clone();
    headlightL.position.set(-0.55, 0.85, 1.46);
    root.add(headlightR, headlightL);

    const lightR = new THREE.PointLight(0xfffbeb, 1.2, 16);
    lightR.position.set(0.55, 0.85, 1.7);
    const lightL = lightR.clone();
    lightL.position.set(-0.55, 0.85, 1.7);
    root.add(lightR, lightL);

    // 5. Cabin (Driver & Passenger compartment)
    const cabinRoof = new THREE.Mesh(new THREE.BoxGeometry(1.44, 0.12, 1.15), bodyMat);
    cabinRoof.position.set(0, 1.62, -0.15);
    root.add(cabinRoof);

    // Windshield (Front glass)
    const windshield = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.55, 0.08), glassMat);
    windshield.position.set(0, 1.35, 0.42);
    windshield.rotation.x = -0.22;
    root.add(windshield);

    // Rear cabin glass
    const rearWindow = new THREE.Mesh(new THREE.BoxGeometry(1.36, 0.5, 0.08), glassMat);
    rearWindow.position.set(0, 1.35, -0.7);
    root.add(rearWindow);

    // Side windows & Pillars
    const sidePillarGeo = new THREE.BoxGeometry(0.08, 0.55, 0.1);
    const p1 = new THREE.Mesh(sidePillarGeo, bodyMat);
    p1.position.set(0.68, 1.35, 0.4);
    const p2 = p1.clone();
    p2.position.set(-0.68, 1.35, 0.4);
    const p3 = p1.clone();
    p3.position.set(0.68, 1.35, -0.7);
    const p4 = p1.clone();
    p4.position.set(-0.68, 1.35, -0.7);
    root.add(p1, p2, p3, p4);

    // Interior Steering Wheel & Dashboard
    const dash = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.25, 0.3), darkTrimMat);
    dash.position.set(0, 1.05, 0.32);
    root.add(dash);

    const steer = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.03, 6, 12), chromeMat);
    steer.position.set(-0.35, 1.25, 0.2);
    steer.rotation.x = Math.PI / 4;
    root.add(steer);

    // 6. Pickup Truck Bed (Rear Cargo Space with open walls)
    const bedFloor = new THREE.Mesh(new THREE.BoxGeometry(1.44, 0.15, 1.1), darkTrimMat);
    bedFloor.position.set(0, 0.65, -1.05);
    root.add(bedFloor);

    // Side walls of the bed
    const bedWallGeo = new THREE.BoxGeometry(0.12, 0.42, 1.1);
    const bedWallL = new THREE.Mesh(bedWallGeo, bodyMat);
    bedWallL.position.set(-0.68, 0.85, -1.05);
    const bedWallR = new THREE.Mesh(bedWallGeo, bodyMat);
    bedWallR.position.set(0.68, 0.85, -1.05);
    root.add(bedWallL, bedWallR);

    // Tailgate (Back)
    const tailgate = new THREE.Mesh(new THREE.BoxGeometry(1.48, 0.42, 0.12), bodyMat);
    tailgate.position.set(0, 0.85, -1.56);
    root.add(tailgate);

    // Rear Bumper & Taillights
    const rearBumper = new THREE.Mesh(new THREE.BoxGeometry(1.56, 0.2, 0.15), chromeMat);
    rearBumper.position.set(0, 0.45, -1.56);
    root.add(rearBumper);

    const taillightR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.05), taillightMat);
    taillightR.position.set(0.62, 0.85, -1.62);
    const taillightL = taillightR.clone();
    taillightL.position.set(-0.62, 0.85, -1.62);
    root.add(taillightR, taillightL);

    // Exhaust pipe
    const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.35, 8), chromeMat);
    exhaust.rotation.x = Math.PI / 2;
    exhaust.position.set(0.5, 0.35, -1.65);
    root.add(exhaust);

    // 7. Four Rugged Wheels
    const makeWheel = () => {
      const wheelGroup = new THREE.Group();
      const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.3, 16), tireMat);
      tire.rotation.z = Math.PI / 2;
      tire.castShadow = true;
      wheelGroup.add(tire);

      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.32, 12), rimMat);
      rim.rotation.z = Math.PI / 2;
      wheelGroup.add(rim);

      const hubcap = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.28, 0.28), bodyMat);
      wheelGroup.add(hubcap);

      return wheelGroup;
    };

    const frontWheelL = makeWheel();
    frontWheelL.position.set(-0.85, 0.36, 0.95);
    const frontWheelR = makeWheel();
    frontWheelR.position.set(0.85, 0.36, 0.95);

    const rearWheelL = makeWheel();
    rearWheelL.position.set(-0.85, 0.36, -0.95);
    const rearWheelR = makeWheel();
    rearWheelR.position.set(0.85, 0.36, -0.95);

    root.add(frontWheelL, frontWheelR, rearWheelL, rearWheelR);

    return {
      mesh: root,
      frontWheelLeft: frontWheelL,
      frontWheelRight: frontWheelR,
      rearWheelLeft: rearWheelL,
      rearWheelRight: rearWheelR,
      headlights: [lightR, lightL],
      bodyMaterials: [bodyMat],
    };
  }

  // Spawn a new physical truck
  public spawnTruck(x: number, y: number, z: number, yaw: number = 0, dimension: DimensionType = 'chocolate', initialColorHex: number = TRUCK_COLORS[0].num): TruckEntity {
    const model = this.createTruckMesh(initialColorHex);
    model.mesh.position.set(x, y, z);
    model.mesh.rotation.y = yaw;
    this.truckGroup.add(model.mesh);

    const colorMatch = TRUCK_COLORS.find((c) => c.num === initialColorHex) || TRUCK_COLORS[0];

    const truck: TruckEntity = {
      id: `truck_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      position: new THREE.Vector3(x, y, z),
      velocity: new THREE.Vector3(0, 0, 0),
      yaw,
      pitch: 0,
      roll: 0,
      wheelRotation: 0,
      steerAngle: 0,
      dimension,
      mesh: model.mesh,
      frontWheelLeft: model.frontWheelLeft,
      frontWheelRight: model.frontWheelRight,
      rearWheelLeft: model.rearWheelLeft,
      rearWheelRight: model.rearWheelRight,
      headlights: model.headlights,
      isDriven: false,
      onGround: true,
      color: colorMatch.hex,
      colorIndex: TRUCK_COLORS.indexOf(colorMatch),
      bodyMaterials: model.bodyMaterials,
    };

    this.trucks.push(truck);
    return truck;
  }

  // Cycle the color of the active or nearest truck
  public cycleTruckColor(targetTruck?: TruckEntity): { color: string; name: string } {
    const truck = targetTruck || this.drivingTruck || this.trucks[0];
    if (!truck) return { color: '#e11d48', name: 'Rojo Fresa Candy' };
    truck.colorIndex = ((truck.colorIndex ?? 0) + 1) % TRUCK_COLORS.length;
    const entry = TRUCK_COLORS[truck.colorIndex];
    truck.color = entry.hex;
    truck.bodyMaterials.forEach((m) => m.color.set(entry.num));
    sounds.playColorChange();
    if (this.onChatLog) {
      this.onChatLog({
        text: `🎨 ¡Color de la camioneta cambiado a: ${entry.name}!`,
        color: entry.hex,
        sender: 'system',
      });
    }
    return { color: entry.hex, name: entry.name };
  }

  // Set truck color by hex or name
  public setTruckColor(colorInput: string | number, targetTruck?: TruckEntity): boolean {
    const truck = targetTruck || this.drivingTruck || this.trucks[0];
    if (!truck) return false;
    const inputStr = String(colorInput).toLowerCase();
    const found = TRUCK_COLORS.find(
      (c) => c.hex.toLowerCase() === inputStr || c.name.toLowerCase().includes(inputStr)
    );
    if (found) {
      truck.color = found.hex;
      truck.colorIndex = TRUCK_COLORS.indexOf(found);
      truck.bodyMaterials.forEach((m) => m.color.set(found.num));
      sounds.playColorChange();
      return true;
    }
    // Try as raw hex
    try {
      const hexNum = typeof colorInput === 'number' ? colorInput : parseInt(inputStr.replace('#', ''), 16);
      if (!isNaN(hexNum)) {
        truck.color = typeof colorInput === 'string' ? colorInput : `#${hexNum.toString(16).padStart(6, '0')}`;
        truck.bodyMaterials.forEach((m) => m.color.set(hexNum));
        sounds.playColorChange();
        return true;
      }
    } catch (e) {}
    return false;
  }

  public getTruckColorName(truck: TruckEntity | null): string | null {
    if (!truck) return null;
    const match = TRUCK_COLORS.find((c) => c.hex.toLowerCase() === truck.color?.toLowerCase());
    return match ? match.name : truck.color || null;
  }

  // Ensure sweet garage and parked truck exist in the Chocolate Dimension
  public ensureSweetGarageAndTruck() {
    const garageX = 10;
    const garageZ = 10;
    const groundY = this.world.getTopSolidY(garageX + 4, garageZ + 4);

    // Build the garage structure
    this.world.buildSweetGarage(garageX, groundY, garageZ);

    // Check if there is already a truck in chocolate dimension
    const existing = this.trucks.find((t) => t.dimension === 'chocolate');
    if (!existing) {
      // Park the camioneta right inside the garage facing forward (+Z)
      const truckX = garageX + 4.0;
      const truckZ = garageZ + 4.5;
      const truckY = groundY + 0.5;
      this.spawnTruck(truckX, truckY, truckZ, 0, 'chocolate');
    }
  }

  // Double click handling to collect truck as item
  public handleClick(playerPos: THREE.Vector3, playerAimDir: THREE.Vector3): boolean {
    const now = performance.now();
    const isDoubleClick = now - this.lastClickTime < 450;
    this.lastClickTime = now;

    // Find truck targeted or close to player
    const targetTruck = this.findTargetedTruck(playerPos, playerAimDir);
    if (!targetTruck) return false;

    if (isDoubleClick) {
      // Convert to item!
      this.collectTruckAsItem(targetTruck);
      return true;
    }

    // Single click: enter or exit driving
    if (this.drivingTruck === targetTruck) {
      this.exitDriving();
    } else {
      this.enterDriving(targetTruck);
    }
    return true;
  }

  public findTargetedTruck(playerPos: THREE.Vector3, aimDir: THREE.Vector3): TruckEntity | null {
    let closest: TruckEntity | null = null;
    let closestDist = 5.5; // within 5.5 blocks

    for (const truck of this.trucks) {
      if (truck.dimension !== this.world.dimension) continue;
      const toTruck = truck.position.clone().sub(playerPos);
      const dist = toTruck.length();
      if (dist < closestDist) {
        // Check if aimed roughly towards truck
        const dot = toTruck.clone().normalize().dot(aimDir);
        if (dot > 0.4 || dist < 2.5) {
          closest = truck;
          closestDist = dist;
        }
      }
    }
    return closest;
  }

  public getNearestTruck(playerPos: THREE.Vector3, maxDist = 6.0): TruckEntity | null {
    let closest: TruckEntity | null = null;
    let closestDist = maxDist;
    for (const truck of this.trucks) {
      if (truck.dimension !== this.world.dimension) continue;
      const dist = truck.position.distanceTo(playerPos);
      if (dist < closestDist) {
        closest = truck;
        closestDist = dist;
      }
    }
    return closest;
  }

  // Turn physical truck into inventory item
  public collectTruckAsItem(truck: TruckEntity) {
    if (this.drivingTruck === truck) {
      this.exitDriving();
    }

    // Remove from 3D scene
    this.truckGroup.remove(truck.mesh);
    this.trucks = this.trucks.filter((t) => t !== truck);

    // Audio & Particles
    sounds.playTruckItemPickup();

    const item: InventoryItem = {
      id: 'camioneta_item',
      name: '🛻 Camioneta Dulce',
      category: 'tools',
      isBlock: false,
      itemType: 'camioneta_item',
      iconColor: '#e11d48',
      description: '¡Colócala en cualquier dimensión para conducir! Hazle doble clic para volver a guardarla como ítem.',
    };

    if (this.onTruckCollected) {
      this.onTruckCollected(item);
    }

    if (this.onChatLog) {
      this.onChatLog({
        text: '🛻 ¡Has recogido la Camioneta Dulce como ítem! Llévala contigo a cualquier dimensión.',
        color: '#ff55ee',
        sender: 'system',
      });
    }
  }

  public enterDriving(truck: TruckEntity) {
    this.drivingTruck = truck;
    truck.isDriven = true;
    sounds.playTruckHorn();
    if (this.onChatLog) {
      this.onChatLog({
        text: '🚗 ¡Estás conduciendo la Camioneta! [WASD] Conducir | [Espacio] Turbo | [E / Clic] Bajar | [Doble Clic] Guardar como ítem.',
        color: '#55ffff',
        sender: 'system',
      });
    }
  }

  public exitDriving() {
    if (this.drivingTruck) {
      this.drivingTruck.isDriven = false;
      this.drivingTruck = null;
    }
  }

  // Update physical simulation of all trucks
  public update(
    dt: number,
    input: { forward: number; strafe: number; up: number; jump: boolean; sneak: boolean; sprint: boolean },
    playerPos: THREE.Vector3,
    spawnParticle: (x: number, y: number, z: number, color: string) => void
  ) {
    const timeDelta = Math.min(dt, 0.1);
    this.exhaustTimer += timeDelta;

    for (let i = 0; i < this.trucks.length; i++) {
      const truck = this.trucks[i];
      if (truck.dimension !== this.world.dimension) {
        truck.mesh.visible = false;
        continue;
      }
      truck.mesh.visible = true;

      // 1. Driving Controls & Acceleration
      if (truck === this.drivingTruck) {
        // Engine sound
        const speedMagnitude = truck.velocity.length();
        sounds.playTruckEngine(Math.min(1.0, speedMagnitude / 14));

        // Steer angle
        const targetSteer = -input.strafe * 0.45;
        truck.steerAngle = THREE.MathUtils.lerp(truck.steerAngle, targetSteer, 0.2);

        // Forward vector points towards the front of the truck (hood / headlights at +Z in local space)
        const forwardVector = new THREE.Vector3(Math.sin(truck.yaw), 0, Math.cos(truck.yaw));

        // Turn yaw when moving
        if (Math.abs(truck.velocity.length()) > 0.3) {
          const driveDir = truck.velocity.dot(forwardVector) > 0 ? 1 : -1;
          truck.yaw += truck.steerAngle * driveDir * Math.min(2.8, speedMagnitude * 0.3) * timeDelta * 3.5;
        }

        // Forward / Reverse throttle:
        // W (forward > 0) accelerates towards the front (forwardVector)
        // S (forward < 0) accelerates towards the back (-forwardVector)
        const accel = input.forward > 0 ? 22 : input.forward < 0 ? -15 : 0;

        if (accel !== 0) {
          truck.velocity.addScaledVector(forwardVector, accel * timeDelta);
        }

        // Turbo Jump with Space!
        if (input.jump && truck.onGround) {
          truck.velocity.y = 7.5;
          truck.onGround = false;
          sounds.playJump();
        }

        // Exhaust smoke puffs at the rear of the truck
        if (this.exhaustTimer > 0.08 && accel !== 0) {
          this.exhaustTimer = 0;
          const exhaustPos = truck.position
            .clone()
            .add(forwardVector.clone().multiplyScalar(-1.5));
          exhaustPos.y += 0.35;
          spawnParticle(exhaustPos.x, exhaustPos.y, exhaustPos.z, '#ff99aa');
        }
      } else {
        // Player pushes truck when running into it
        const toTruck = truck.position.clone().sub(playerPos);
        const dist = toTruck.length();
        if (dist < 1.8) {
          const pushForce = toTruck.normalize().multiplyScalar(4.0 * timeDelta);
          pushForce.y = 0;
          truck.velocity.add(pushForce);
        }
      }

      // 2. Gravity
      truck.velocity.y -= 22 * timeDelta;
      truck.velocity.y = Math.max(-30, truck.velocity.y);

      // 3. Rolling Friction & Drag
      const friction = truck.onGround ? 0.94 : 0.985;
      truck.velocity.x *= friction;
      truck.velocity.z *= friction;

      // 4. Position update & Voxel Terrain Collision
      const nextX = truck.position.x + truck.velocity.x * timeDelta;
      const nextZ = truck.position.z + truck.velocity.z * timeDelta;
      const nextY = truck.position.y + truck.velocity.y * timeDelta;

      // Ground height under truck center and wheels
      const groundY = this.world.getTopSolidY(Math.floor(nextX), Math.floor(nextZ));

      // Obstacle detection in front for 1-block step climbing (suspension ramp!)
      const forwardDir = new THREE.Vector3(Math.sin(truck.yaw), 0, Math.cos(truck.yaw));
      const frontX = Math.floor(nextX + forwardDir.x * 1.2);
      const frontZ = Math.floor(nextZ + forwardDir.z * 1.2);
      const frontGroundY = this.world.getTopSolidY(frontX, frontZ);

      if (frontGroundY === groundY + 1 && truck.onGround && truck.velocity.length() > 1.0) {
        // Smoothly climb 1 block step
        truck.velocity.y = 5.5;
      }

      // Wall collision check
      const wallCheck = this.world.getBlock(Math.floor(nextX), Math.floor(truck.position.y + 0.8), Math.floor(nextZ));
      if (
        wallCheck !== BlockType.AIR &&
        wallCheck !== BlockType.WATER &&
        wallCheck !== BlockType.LIQUID_CHOCOLATE &&
        wallCheck !== BlockType.PARALLEL_WATER
      ) {
        // Bounce off wall
        truck.velocity.x *= -0.4;
        truck.velocity.z *= -0.4;
      } else {
        truck.position.x = nextX;
        truck.position.z = nextZ;
      }

      // Ground resolution
      if (nextY <= groundY + 0.45) {
        truck.position.y = groundY + 0.45;
        truck.velocity.y = 0;
        truck.onGround = true;
      } else {
        truck.position.y = nextY;
        truck.onGround = false;
      }

      // 5. Wheel Animations
      const speed = truck.velocity.length();
      truck.wheelRotation += speed * timeDelta * 4;

      truck.frontWheelLeft.rotation.y = truck.steerAngle;
      truck.frontWheelRight.rotation.y = truck.steerAngle;
      truck.frontWheelLeft.rotation.x = truck.wheelRotation;
      truck.frontWheelRight.rotation.x = truck.wheelRotation;
      truck.rearWheelLeft.rotation.x = truck.wheelRotation;
      truck.rearWheelRight.rotation.x = truck.wheelRotation;

      // 6. Update Mesh Transformation
      truck.mesh.position.copy(truck.position);
      truck.mesh.rotation.y = truck.yaw;

      // 7. If player is driving, pin player position to the driver's seat
      if (truck === this.drivingTruck) {
        const seatOffset = new THREE.Vector3(-0.35, 1.2, 0.1).applyAxisAngle(new THREE.Vector3(0, 1, 0), truck.yaw);
        playerPos.copy(truck.position).add(seatOffset);
      }
    }
  }

  public clearAll() {
    this.exitDriving();
    while (this.truckGroup.children.length > 0) {
      this.truckGroup.remove(this.truckGroup.children[0]);
    }
    this.trucks = [];
  }
}
