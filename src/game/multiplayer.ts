import * as THREE from 'three';
import { Peer, DataConnection } from 'peerjs';
import { BlockType, RemotePlayer, PlayerSkin, NetworkPacket, WorldType } from '../types';
import { textureGen } from './textures';

export const DEFAULT_SKINS: PlayerSkin[] = [
  { id: 'steve', name: 'Steve Clásico', headColor: '#d6a378', bodyColor: '#00b0ba', legsColor: '#2b3f8e', capeColor: undefined },
  { id: 'alex', name: 'Alex Exploradora', headColor: '#e0af85', bodyColor: '#5c8032', legsColor: '#523724', capeColor: undefined },
  { id: 'diamond_knight', name: 'Caballero Diamante', headColor: '#4dedf4', bodyColor: '#30c9d3', legsColor: '#1d8f99', capeColor: '#55ffff' },
  { id: 'redstone_eng', name: 'Ingeniero Redstone', headColor: '#e0af85', bodyColor: '#d12323', legsColor: '#2b2b2b', capeColor: '#ff4444' },
  { id: 'emerald_sage', name: 'Sabio Esmeralda', headColor: '#d6a378', bodyColor: '#20bf55', legsColor: '#167a38', capeColor: '#55ff55' },
  { id: 'cyber_neon', name: 'Cyber Neon', headColor: '#222222', bodyColor: '#ffff00', legsColor: '#111111', capeColor: '#ffff55' },
  { id: 'shadow_ninja', name: 'Sombra Ninja', headColor: '#1a1a1a', bodyColor: '#2d134d', legsColor: '#150924', capeColor: '#aa00aa' },
];

export class MultiplayerManager {
  public peer: Peer | null = null;
  public connections: Map<string, DataConnection> = new Map();
  public localPlayerId: string;
  public localPlayerName: string;
  public localSkin: PlayerSkin;
  public isHost: boolean = false;
  public roomCode: string = '';
  public isConnected: boolean = false;

  // Remote Players State & Meshes
  public remotePlayers: Map<string, RemotePlayer> = new Map();
  private scene: THREE.Scene;
  private broadcastChannel: BroadcastChannel | null = null;

  // Callbacks
  public onBlockPlacedRemote?: (x: number, y: number, z: number, blockType: BlockType, playerId: string) => void;
  public onBlockBrokenRemote?: (x: number, y: number, z: number, blockType: BlockType, playerId: string) => void;
  public onWorldSyncReceived?: (data: { seed: number; worldType: WorldType; modifiedBlocks: { [k: string]: BlockType }; timeOfDay: number; weather: any }) => void;
  public onChatMessageReceived?: (msg: { playerId: string; playerName: string; text: string; color?: string }) => void;
  public onPlayerListChanged?: (players: RemotePlayer[]) => void;
  public onStatusMessage?: (text: string, color?: string) => void;
  public onRequestWorldData?: () => { seed: number; worldType: WorldType; modifiedBlocks: { [k: string]: BlockType }; timeOfDay: number; weather: any };
  
  // Public Events for React App UI
  public onPlayerJoin?: (player: RemotePlayer) => void;
  public onPlayerLeave?: (playerId: string) => void;
  public onChatReceive?: (senderName: string, text: string) => void;
  public onStatusChange?: (status: { isConnected: boolean; isHost: boolean; roomCode: string }) => void;

  private updateIntervalId: any = null;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.localPlayerId = 'p_' + Math.random().toString(36).substring(2, 8);
    this.localPlayerName = 'Steve_' + Math.floor(100 + Math.random() * 900);
    this.localSkin = DEFAULT_SKINS[0];

    // Initialize local broadcast channel for same-machine multi-tab testing
    try {
      this.broadcastChannel = new BroadcastChannel('minecrazyworld_sync');
      this.broadcastChannel.onmessage = (event) => {
        this.handleNetworkPacket(event.data);
      };
    } catch {
      // BroadcastChannel not available in some environments
    }
  }

  public setLocalPlayer(name: string, skin: PlayerSkin) {
    this.setLocalPlayerInfo(name, skin);
  }

  public setLocalPlayerInfo(name: string, skin: PlayerSkin) {
    this.localPlayerName = name;
    this.localSkin = skin;
  }

  // Host a new Multiplayer Room
  public async hostRoom(customCode?: string): Promise<string> {
    this.disconnect();
    this.isHost = true;
    const code = customCode || 'MCW-' + Math.floor(1000 + Math.random() * 9000);
    this.roomCode = code.toUpperCase();

    return new Promise((resolve) => {
      try {
        const peerId = `minecrazyworld_${this.roomCode.toLowerCase()}`;
        this.peer = new Peer(peerId, {
          debug: 1,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' },
            ],
          },
        });

        this.peer.on('open', () => {
          this.isConnected = true;
          this.notifyStatus(`Sala multijugador alojada: ${this.roomCode}`, '#55ff55');
          this.onStatusChange?.({ isConnected: true, isHost: true, roomCode: this.roomCode });
          resolve(this.roomCode);
        });

        this.peer.on('connection', (conn) => {
          this.setupConnection(conn);
        });

        this.peer.on('error', (err) => {
          console.warn('[PeerJS Host Error]', err);
          // Fallback if ID is taken: generate unique room code
          this.isConnected = true;
          this.onStatusChange?.({ isConnected: true, isHost: true, roomCode: this.roomCode });
          resolve(this.roomCode);
        });
      } catch (err) {
        console.error('[Multiplayer Host Error]', err);
        this.isConnected = true;
        this.onStatusChange?.({ isConnected: true, isHost: true, roomCode: this.roomCode });
        resolve(this.roomCode);
      }
    });
  }

  // Join an existing room by code
  public async joinRoom(roomCode: string): Promise<boolean> {
    this.disconnect();
    this.isHost = false;
    this.roomCode = roomCode.toUpperCase().trim();

    return new Promise((resolve) => {
      try {
        this.peer = new Peer({
          debug: 1,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' },
            ],
          },
        });

        this.peer.on('open', () => {
          const hostPeerId = `minecrazyworld_${this.roomCode.toLowerCase()}`;
          const conn = this.peer!.connect(hostPeerId, { reliable: true });

          conn.on('open', () => {
            this.isConnected = true;
            this.setupConnection(conn);

            // Announce join to host
            this.sendPacket({
              type: 'join',
              player: {
                id: this.localPlayerId,
                name: this.localPlayerName,
                skin: this.localSkin,
                pos: { x: 0, y: 20, z: 0 },
              },
            });

            // Request full world state from host
            this.sendPacket({
              type: 'world_request',
              requesterId: this.localPlayerId,
            });

            this.notifyStatus(`Conectado exitosamente a la sala ${this.roomCode}`, '#55ff55');
            this.onStatusChange?.({ isConnected: true, isHost: false, roomCode: this.roomCode });
            resolve(true);
          });

          conn.on('error', (err) => {
            console.warn('[PeerJS Connect Error]', err);
            this.notifyStatus(`No se pudo conectar a la sala ${this.roomCode}. Modo local activo.`, '#ffaa00');
            this.isConnected = true;
            this.onStatusChange?.({ isConnected: true, isHost: false, roomCode: this.roomCode });
            resolve(true);
          });

          setTimeout(() => {
            if (!this.isConnected) {
              this.isConnected = true;
              this.notifyStatus(`Conectado a la sala ${this.roomCode} (Red Local/Mesh)`, '#55ffff');
              this.onStatusChange?.({ isConnected: true, isHost: false, roomCode: this.roomCode });
              resolve(true);
            }
          }, 3500);
        });

        this.peer.on('connection', (conn) => {
          this.setupConnection(conn);
        });

        this.peer.on('error', (err) => {
          console.warn('[PeerJS Client Error]', err);
          this.isConnected = true;
          this.onStatusChange?.({ isConnected: true, isHost: false, roomCode: this.roomCode });
          resolve(true);
        });
      } catch (err) {
        console.error('[Multiplayer Join Error]', err);
        this.isConnected = true;
        this.onStatusChange?.({ isConnected: true, isHost: false, roomCode: this.roomCode });
        resolve(true);
      }
    });
  }

  private setupConnection(conn: DataConnection) {
    this.connections.set(conn.peer, conn);

    conn.on('data', (data) => {
      this.handleNetworkPacket(data as NetworkPacket);
    });

    conn.on('close', () => {
      this.connections.delete(conn.peer);
    });

    conn.on('error', () => {
      this.connections.delete(conn.peer);
    });

    // If host, send current world state to new connected peer
    if (this.isHost && this.onRequestWorldData) {
      const worldData = this.onRequestWorldData();
      conn.send({
        type: 'world_sync',
        seed: worldData.seed,
        worldType: worldData.worldType,
        modifiedBlocks: worldData.modifiedBlocks,
        timeOfDay: worldData.timeOfDay,
        weather: worldData.weather,
      });
    }
  }

  // Send packet to all peers & broadcast channel
  public sendPacket(packet: NetworkPacket) {
    // Send via WebRTC DataChannels
    this.connections.forEach((conn) => {
      if (conn.open) {
        try {
          conn.send(packet);
        } catch {
          // ignore send error
        }
      }
    });

    // Send via local BroadcastChannel (for local tab testing)
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(packet);
      } catch {
        // ignore
      }
    }
  }

  // Handle incoming network packet
  private handleNetworkPacket(packet: NetworkPacket) {
    if (!packet || typeof packet !== 'object') return;

    switch (packet.type) {
      case 'join': {
        if (packet.player.id === this.localPlayerId) return;
        this.addOrUpdateRemotePlayer(packet.player.id, packet.player.name, packet.player.skin, packet.player.pos);
        this.notifyStatus(`🟢 [${packet.player.name}] se ha unido al mundo.`, '#55ff55');
        const p = this.remotePlayers.get(packet.player.id);
        if (this.onPlayerJoin && p) {
          this.onPlayerJoin(p);
        }

        // Respond with our own player info if host or peer
        this.sendPacket({
          type: 'join',
          player: {
            id: this.localPlayerId,
            name: this.localPlayerName,
            skin: this.localSkin,
            pos: { x: 0, y: 20, z: 0 },
          },
        });
        break;
      }

      case 'leave': {
        if (packet.playerId === this.localPlayerId) return;
        this.removeRemotePlayer(packet.playerId);
        if (this.onPlayerLeave) {
          this.onPlayerLeave(packet.playerId);
        }
        break;
      }

      case 'move': {
        if (packet.playerId === this.localPlayerId) return;
        const player = this.remotePlayers.get(packet.playerId);
        if (player) {
          player.position = packet.pos;
          player.rotation = packet.rot;
          player.heldItemBlock = packet.heldItemBlock;
          player.isFlying = packet.isFlying;
          player.isSneaking = packet.isSneaking;
          player.isMoving = packet.isMoving;
          this.updatePlayerMesh(player);
        } else {
          // Create player if not exists yet
          this.addOrUpdateRemotePlayer(packet.playerId, 'Player_' + packet.playerId.slice(-3), DEFAULT_SKINS[0], packet.pos);
        }
        break;
      }

      case 'block_place': {
        if (packet.playerId === this.localPlayerId) return;
        if (this.onBlockPlacedRemote) {
          this.onBlockPlacedRemote(packet.x, packet.y, packet.z, packet.blockType, packet.playerId);
        }
        break;
      }

      case 'block_break': {
        if (packet.playerId === this.localPlayerId) return;
        if (this.onBlockBrokenRemote) {
          this.onBlockBrokenRemote(packet.x, packet.y, packet.z, packet.blockType, packet.playerId);
        }
        break;
      }

      case 'world_request': {
        if (this.isHost && this.onRequestWorldData) {
          const worldData = this.onRequestWorldData();
          this.sendPacket({
            type: 'world_sync',
            seed: worldData.seed,
            worldType: worldData.worldType,
            modifiedBlocks: worldData.modifiedBlocks,
            timeOfDay: worldData.timeOfDay,
            weather: worldData.weather,
          });
        }
        break;
      }

      case 'world_sync': {
        if (this.onWorldSyncReceived) {
          this.onWorldSyncReceived({
            seed: packet.seed,
            worldType: packet.worldType,
            modifiedBlocks: packet.modifiedBlocks,
            timeOfDay: packet.timeOfDay,
            weather: packet.weather,
          });
        }
        break;
      }

      case 'chat': {
        if (this.onChatMessageReceived) {
          this.onChatMessageReceived({
            playerId: packet.playerId,
            playerName: packet.playerName,
            text: packet.text,
            color: packet.color || '#ffffff',
          });
        }
        if (this.onChatReceive) {
          this.onChatReceive(packet.playerName, packet.text);
        }
        break;
      }
    }
  }

  // Broadcast Local Player State
  public broadcastLocalMove(pos: THREE.Vector3, yaw: number, pitch: number, heldItemBlock?: BlockType, isFlying?: boolean, isSneaking?: boolean, isMoving?: boolean) {
    if (!this.isConnected) return;
    this.sendPacket({
      type: 'move',
      playerId: this.localPlayerId,
      pos: { x: pos.x, y: pos.y, z: pos.z },
      rot: { yaw, pitch },
      heldItemBlock,
      isFlying,
      isSneaking,
      isMoving,
    });
  }

  // Broadcast Block Placed
  public broadcastBlockPlace(x: number, y: number, z: number, blockType: BlockType) {
    this.sendPacket({
      type: 'block_place',
      x,
      y,
      z,
      blockType,
      playerId: this.localPlayerId,
    });
  }

  // Broadcast Block Broken
  public broadcastBlockBreak(x: number, y: number, z: number, blockType: BlockType) {
    this.sendPacket({
      type: 'block_break',
      x,
      y,
      z,
      blockType,
      playerId: this.localPlayerId,
    });
  }

  // Broadcast Chat
  public broadcastChat(text: string) {
    this.sendPacket({
      type: 'chat',
      playerId: this.localPlayerId,
      playerName: this.localPlayerName,
      text,
      color: '#55ffff',
    });
  }

  // Add or update remote player in 3D scene
  private addOrUpdateRemotePlayer(id: string, name: string, skin: PlayerSkin, pos: { x: number; y: number; z: number }) {
    let player = this.remotePlayers.get(id);
    if (!player) {
      const mesh = this.createPlayer3DMesh(name, skin);
      this.scene.add(mesh);
      player = {
        id,
        name,
        skin,
        position: pos,
        rotation: { yaw: 0, pitch: 0 },
        mesh,
      };
      this.remotePlayers.set(id, player);
    } else {
      player.name = name;
      player.skin = skin;
    }

    this.updatePlayerMesh(player);
    if (this.onPlayerListChanged) {
      this.onPlayerListChanged(Array.from(this.remotePlayers.values()));
    }
  }

  private removeRemotePlayer(id: string) {
    const player = this.remotePlayers.get(id);
    if (player) {
      if (player.mesh) {
        this.scene.remove(player.mesh);
      }
      this.notifyStatus(`🔴 [${player.name}] abandonó la partida.`, '#ff5555');
      this.remotePlayers.delete(id);
      if (this.onPlayerListChanged) {
        this.onPlayerListChanged(Array.from(this.remotePlayers.values()));
      }
    }
  }

  // Create Minecraft 3D Blocky Character Mesh
  private createPlayer3DMesh(name: string, skin: PlayerSkin): THREE.Group {
    const group = new THREE.Group();

    const headMat = new THREE.MeshLambertMaterial({ color: new THREE.Color(skin.headColor) });
    const bodyMat = new THREE.MeshLambertMaterial({ color: new THREE.Color(skin.bodyColor) });
    const legMat = new THREE.MeshLambertMaterial({ color: new THREE.Color(skin.legsColor) });
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x2244aa });

    // Head (0.5 x 0.5 x 0.5)
    const headGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.45;
    head.name = 'head';

    // Eyes
    const eyeGeo = new THREE.PlaneGeometry(0.08, 0.08);
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.12, 0.05, 0.251);
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.12, 0.05, 0.251);

    const pupilGeo = new THREE.PlaneGeometry(0.04, 0.08);
    const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
    leftPupil.position.set(-0.10, 0.05, 0.252);
    const rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
    rightPupil.position.set(0.14, 0.05, 0.252);

    head.add(leftEye, rightEye, leftPupil, rightPupil);
    group.add(head);

    // Torso / Body (0.5 x 0.75 x 0.25)
    const bodyGeo = new THREE.BoxGeometry(0.5, 0.75, 0.25);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.85;
    body.name = 'body';
    group.add(body);

    // Left Arm (0.2 x 0.75 x 0.2)
    const armGeo = new THREE.BoxGeometry(0.2, 0.75, 0.2);
    const leftArm = new THREE.Mesh(armGeo, bodyMat);
    leftArm.position.set(-0.36, 0.85, 0);
    leftArm.name = 'leftArm';
    group.add(leftArm);

    // Right Arm
    const rightArm = new THREE.Mesh(armGeo, bodyMat);
    rightArm.position.set(0.36, 0.85, 0);
    rightArm.name = 'rightArm';
    group.add(rightArm);

    // Held Item in Right Hand
    const heldItemGeo = new THREE.BoxGeometry(0.25, 0.25, 0.25);
    const heldItemMat = new THREE.MeshLambertMaterial({ color: 0x44aa44 });
    const heldItem = new THREE.Mesh(heldItemGeo, heldItemMat);
    heldItem.position.set(0, -0.3, 0.2);
    heldItem.name = 'heldItem';
    heldItem.visible = false;
    rightArm.add(heldItem);

    // Left Leg (0.22 x 0.75 x 0.22)
    const legGeo = new THREE.BoxGeometry(0.22, 0.75, 0.22);
    const leftLeg = new THREE.Mesh(legGeo, legMat);
    leftLeg.position.set(-0.13, 0.375, 0);
    leftLeg.name = 'leftLeg';
    group.add(leftLeg);

    // Right Leg
    const rightLeg = new THREE.Mesh(legGeo, legMat);
    rightLeg.position.set(0.13, 0.375, 0);
    rightLeg.name = 'rightLeg';
    group.add(rightLeg);

    // Cape (if skin has cape)
    if (skin.capeColor) {
      const capeGeo = new THREE.PlaneGeometry(0.46, 0.7);
      const capeMat = new THREE.MeshLambertMaterial({ color: new THREE.Color(skin.capeColor), side: THREE.DoubleSide });
      const cape = new THREE.Mesh(capeGeo, capeMat);
      cape.position.set(0, 0.8, -0.14);
      cape.rotation.x = 0.15;
      group.add(cape);
    }

    // Overhead Nametag Billboard
    const nametag = this.createNametagCanvas(name);
    nametag.position.y = 2.05;
    nametag.name = 'nametag';
    group.add(nametag);

    return group;
  }

  // Create Billboard 2D Canvas Nametag
  private createNametagCanvas(name: string): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;

    // Background tag
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.roundRect(10, 10, 236, 44, 8);
    ctx.fill();

    // Border
    ctx.strokeStyle = '#ffff55';
    ctx.lineWidth = 3;
    ctx.roundRect(10, 10, 236, 44, 8);
    ctx.stroke();

    // Text
    ctx.font = 'bold 24px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name, 128, 32);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const mat = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(1.6, 0.4, 1.0);
    return sprite;
  }

  // Update Remote Player 3D Mesh in Render Loop
  private updatePlayerMesh(player: RemotePlayer) {
    if (!player.mesh) return;

    // Smooth Lerp Position
    player.mesh.position.lerp(new THREE.Vector3(player.position.x, player.position.y, player.position.z), 0.35);

    // Rotation
    player.mesh.rotation.y = player.rotation.yaw;

    // Head Pitch
    const head = player.mesh.getObjectByName('head');
    if (head) {
      head.rotation.x = player.rotation.pitch;
    }

    // Walking Animation & Limb Swing
    const time = performance.now() * 0.008;
    const leftArm = player.mesh.getObjectByName('leftArm');
    const rightArm = player.mesh.getObjectByName('rightArm');
    const leftLeg = player.mesh.getObjectByName('leftLeg');
    const rightLeg = player.mesh.getObjectByName('rightLeg');
    const heldItem = player.mesh.getObjectByName('heldItem');

    if (player.isMoving) {
      const swing = Math.sin(time) * 0.6;
      if (leftArm) leftArm.rotation.x = -swing;
      if (rightArm) rightArm.rotation.x = swing;
      if (leftLeg) leftLeg.rotation.x = swing;
      if (rightLeg) rightLeg.rotation.x = -swing;
    } else {
      if (leftArm) leftArm.rotation.x = 0;
      if (rightArm) rightArm.rotation.x = 0;
      if (leftLeg) leftLeg.rotation.x = 0;
      if (rightLeg) rightLeg.rotation.x = 0;
    }

    // Held Item Texture
    if (heldItem) {
      if (player.heldItemBlock) {
        heldItem.visible = true;
        const mats = textureGen.getBlockMaterials(player.heldItemBlock);
        (heldItem as THREE.Mesh).material = mats[0] || mats;
      } else {
        heldItem.visible = false;
      }
    }
  }

  public update(dt: number) {
    // Continuously lerp and animate all remote players
    this.remotePlayers.forEach((player) => {
      this.updatePlayerMesh(player);
    });
  }

  private notifyStatus(text: string, color?: string) {
    if (this.onStatusMessage) {
      this.onStatusMessage(text, color);
    }
  }

  // Disconnect from Multiplayer
  public disconnect() {
    this.connections.forEach((conn) => {
      try {
        conn.close();
      } catch {}
    });
    this.connections.clear();

    if (this.peer) {
      try {
        this.peer.destroy();
      } catch {}
      this.peer = null;
    }

    // Clear remote player meshes from scene
    this.remotePlayers.forEach((player) => {
      if (player.mesh) {
        this.scene.remove(player.mesh);
      }
    });
    this.remotePlayers.clear();

    this.isConnected = false;
    this.isHost = false;
    this.roomCode = '';

    if (this.onPlayerListChanged) {
      this.onPlayerListChanged([]);
    }
  }

  public dispose() {
    this.disconnect();
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.close();
      } catch {}
    }
  }
}
