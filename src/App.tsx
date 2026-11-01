import React, { useEffect, useRef, useState, useCallback } from 'react';
import { VoxelEngine } from './game/engine';
import { HUD } from './components/HUD';
import { CreativeInventory } from './components/CreativeInventory';
import { CheatsModal } from './components/CheatsModal';
import { CommandConsole } from './components/CommandConsole';
import { SettingsModal } from './components/SettingsModal';
import { MultiplayerModal } from './components/MultiplayerModal';
import { CommandBlockModal, CommandBlockTarget } from './components/CommandBlockModal';
import { StructureBlockModal, StructureBlockTarget } from './components/StructureBlockModal';
import { TouchControls } from './components/TouchControls';
import { DEFAULT_HOTBAR, INVENTORY_CATALOG } from './game/items';
import { DEFAULT_SKINS } from './game/multiplayer';
import { InventoryItem, PlayerStats, ChatMessage, WorldType, RemotePlayer, PlayerSkin, DimensionType } from './types';
import { sounds } from './game/audio';

const STORAGE_KEY = 'minecrazyworld_world_save_v1';
const PLAYER_NAME_KEY = 'minecrazyworld_player_name';
const PLAYER_SKIN_KEY = 'minecrazyworld_player_skin';

export default function App() {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<VoxelEngine | null>(null);

  // Game UI State
  const [isLocked, setIsLocked] = useState(false);
  const [isSleeping, setIsSleeping] = useState(false);
  const [isWarping, setIsWarping] = useState(false);
  const [currentDimension, setCurrentDimension] = useState<DimensionType>('overworld');
  const [hotbar, setHotbar] = useState<InventoryItem[]>(DEFAULT_HOTBAR);
  const [selectedSlot, setSelectedSlot] = useState(0);

  // Modals
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isCheatsOpen, setIsCheatsOpen] = useState(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMultiplayerOpen, setIsMultiplayerOpen] = useState(false);
  const [commandBlockTarget, setCommandBlockTarget] = useState<CommandBlockTarget | null>(null);
  const [structureBlockTarget, setStructureBlockTarget] = useState<StructureBlockTarget | null>(null);

  // Multiplayer State
  const [isMultiplayerConnected, setIsMultiplayerConnected] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [currentRoomCode, setCurrentRoomCode] = useState('');
  const [connectedPlayers, setConnectedPlayers] = useState<RemotePlayer[]>([]);
  const [localPlayerName, setLocalPlayerName] = useState<string>(() => {
    return localStorage.getItem(PLAYER_NAME_KEY) || `Steve_${Math.floor(100 + Math.random() * 900)}`;
  });
  const [localSkin, setLocalSkin] = useState<PlayerSkin>(() => {
    try {
      const saved = localStorage.getItem(PLAYER_SKIN_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_SKINS[0];
  });

  // Settings
  const [renderDistance, setRenderDistance] = useState(3);
  const [fov, setFov] = useState(75);
  const [sensitivity, setSensitivity] = useState(0.0022);
  const [timeSpeed, setTimeSpeed] = useState(2.0);

  // Touch device check
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Player stats for HUD
  const [stats, setStats] = useState<PlayerStats>({
    health: 20,
    maxHealth: 20,
    hunger: 20,
    maxHunger: 20,
    gamemode: 'creative',
    dimension: 'overworld',
    isFlying: false,
    isNoclip: false,
    isGodmode: false,
    speedMultiplier: 1.0,
    jumpMultiplier: 1.0,
    selectedHotbarIndex: 0,
    position: { x: 0, y: 20, z: 0 },
    rotation: { yaw: 0, pitch: 0 },
    biome: 'DEFAULT',
    fps: 60,
  });

  // Chat & Command History
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'system',
      text: '¡Bienvenido a Minecrazyworld! Modo Creativo ilimitado y trucos activos. Presiona [T] para trucos, [E] para bloques y [M] para multijugador.',
      color: '#ffff55',
      timestamp: Date.now(),
    },
  ]);

  // Keys & Input state
  const keysRef = useRef<{
    forward: number;
    strafe: number;
    up: number;
    jump: boolean;
    sneak: boolean;
    sprint: boolean;
  }>({
    forward: 0,
    strafe: 0,
    up: 0,
    jump: false,
    sneak: false,
    sprint: false,
  });

  const isMouseDownRef = useRef(false);
  const lastSpaceTapRef = useRef(0);
  const lastFlightToggleRef = useRef(0);
  const lastLeftClickRef = useRef(0);

  const addNotification = useCallback((text: string, color: string = '#ffff55') => {
    setChatMessages((prev) => [
      ...prev,
      { id: Math.random().toString(), sender: 'system', text, color, timestamp: Date.now() },
    ]);
  }, []);

  // Initialize 3D Voxel Engine
  useEffect(() => {
    if (!canvasContainerRef.current) return;

    // Detect touch capability
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      setIsTouchDevice(true);
    }

    const engine = new VoxelEngine(canvasContainerRef.current, 'default', Math.floor(Math.random() * 100000));
    engineRef.current = engine;

    // Set initial player info in multiplayer manager
    engine.multiplayer.setLocalPlayer(localPlayerName, localSkin);

    // Setup multiplayer callbacks
    engine.multiplayer.onPlayerJoin = (player) => {
      addNotification(`👋 El jugador "${player.name}" se ha unido a Minecrazyworld.`, '#55ff55');
      setConnectedPlayers(Array.from(engine.multiplayer.remotePlayers.values()));
      sounds.playCheatSuccess();
    };

    engine.multiplayer.onPlayerLeave = (playerId) => {
      addNotification(`🚪 Un jugador se ha desconectado de la sala.`, '#ffaa00');
      setConnectedPlayers(Array.from(engine.multiplayer.remotePlayers.values()));
    };

    engine.multiplayer.onChatReceive = (senderName, text) => {
      setChatMessages((prev) => [
        ...prev,
        { id: Math.random().toString(), sender: 'player', text: `<${senderName}> ${text}`, timestamp: Date.now() },
      ]);
    };

    engine.multiplayer.onStatusChange = (status) => {
      setIsMultiplayerConnected(status.isConnected);
      setIsHost(status.isHost);
      setCurrentRoomCode(status.roomCode || '');
      setConnectedPlayers(Array.from(engine.multiplayer.remotePlayers.values()));
    };

    // Load auto-save if available
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        engine.world.deserialize(saved);
        engine.rebuildAllChunks();
      }
    } catch (e) {
      console.warn('Could not load save:', e);
    }

    // Set callbacks
    engine.onStatsUpdate = (newStats) => {
      setStats((prev) => ({ ...prev, ...newStats }));
    };

    engine.onChatLog = ({ text, color }) => {
      addNotification(text, color);
    };

    engine.onSleepChange = (sleeping) => {
      setIsSleeping(sleeping);
    };

    engine.onDimensionChange = (dimension, warping) => {
      setIsWarping(warping);
      setCurrentDimension(dimension);
    };

    engine.onTruckCollected = (item) => {
      setHotbar((prev) => {
        const next = [...prev];
        next[selectedSlot] = item;
        return next;
      });
      addNotification('🛻 ¡Camioneta guardada en tu inventario! Llévala a cualquier dimensión.', '#ff55ee');
    };

    engine.onTruckPlaced = () => {
      addNotification('🛻 ¡Camioneta colocada en el terreno! Puedes subirte o guardarla con doble clic.', '#55ff55');
    };

    engine.onElytraCollected = () => {
      const elytraItem = INVENTORY_CATALOG.find((it) => it.id === 'elytra');
      if (elytraItem) {
        setHotbar((prev) => {
          const next = [...prev];
          const emptyIdx = next.findIndex((slot) => !slot || slot.id === 'air');
          const targetSlot = emptyIdx !== -1 ? emptyIdx : selectedSlot;
          next[targetSlot] = elytraItem;
          return next;
        });
      }
      addNotification('🪽 ¡Has obtenido las Élitros (Elytras)! Pulsa Espacio en el aire para planear.', '#d870ff');
    };

    engine.onOpenCommandBlockUI = (target) => {
      document.exitPointerLock?.();
      setCommandBlockTarget(target);
    };

    engine.onOpenStructureBlockUI = (target) => {
      document.exitPointerLock?.();
      setStructureBlockTarget(target);
    };

    // Update active held item
    engine.updateHeldItem(DEFAULT_HOTBAR[0]);

    // Check URL parameters for direct room joining
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      setTimeout(() => {
        addNotification(`🔗 Conectando automáticamente a la sala: ${roomParam}...`, '#55ffff');
        engine.multiplayer.joinRoom(roomParam.toUpperCase()).then((ok) => {
          if (ok) {
            addNotification(`¡Conectado exitosamente al mundo multijugador ${roomParam}!`, '#55ff55');
          }
        });
      }, 500);
    }

    // Resize handler
    const handleResize = () => {
      engine.resize();
    };
    window.addEventListener('resize', handleResize);

    // Continuous physics update loop
    let lastFrameTime = performance.now();
    let animId: number;

    const gameLoop = () => {
      animId = requestAnimationFrame(gameLoop);
      const now = performance.now();
      const dt = Math.min((now - lastFrameTime) / 1000, 0.1);
      lastFrameTime = now;

      if (engine) {
        engine.updatePhysicsAndTrucks(dt, keysRef.current);
        engine.handleBreaking(dt, isMouseDownRef.current);
      }
    };
    animId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      engine.dispose();
    };
  }, [addNotification, localPlayerName, localSkin]);

  // Sync active hotbar item with engine
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.updateHeldItem(hotbar[selectedSlot] || null);
    }
  }, [selectedSlot, hotbar]);

  // Pointer Lock handling
  const handleLockPointer = useCallback(() => {
    if (canvasContainerRef.current) {
      canvasContainerRef.current.requestPointerLock();
    }
  }, []);

  useEffect(() => {
    const handlePointerLockChange = () => {
      const locked = document.pointerLockElement === canvasContainerRef.current;
      setIsLocked(locked);
    };

    document.addEventListener('pointerlockchange', handlePointerLockChange);
    return () => {
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
    };
  }, []);

  // Mouse Move when Pointer Locked
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isLocked || !engineRef.current) return;

      const sens = engineRef.current.sensitivity;
      engineRef.current.yaw -= e.movementX * sens;
      engineRef.current.pitch -= e.movementY * sens;

      // Clamp pitch (-89deg to 89deg)
      const maxPitch = Math.PI / 2 - 0.05;
      engineRef.current.pitch = Math.max(-maxPitch, Math.min(maxPitch, engineRef.current.pitch));
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isLocked]);

  // Mouse clicks for breaking & placing
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (!isLocked || !engineRef.current) return;

      if (e.button === 0) {
        // Double-click check to convert targeted truck into inventory item
        const now = performance.now();
        if (now - lastLeftClickRef.current < 450) {
          const collected = engineRef.current.handleTruckDoubleClick();
          if (collected) {
            isMouseDownRef.current = false;
            lastLeftClickRef.current = 0;
            return;
          }
        }
        lastLeftClickRef.current = now;

        // Try attacking mob or boss first
        const hitEntity = engineRef.current.attackEntity();
        if (hitEntity) {
          isMouseDownRef.current = false;
          return;
        }

        // Left click: start breaking
        isMouseDownRef.current = true;
      } else if (e.button === 2) {
        // Right click: place block or use item / drive truck
        e.preventDefault();
        engineRef.current.useItem();
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) {
        isMouseDownRef.current = false;
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      if (isLocked) e.preventDefault();
    };

    // Mouse wheel to change hotbar slot
    const handleWheel = (e: WheelEvent) => {
      if (!isLocked) return;
      if (e.deltaY > 0) {
        setSelectedSlot((prev) => (prev + 1) % 9);
      } else {
        setSelectedSlot((prev) => (prev - 1 + 9) % 9);
      }
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('wheel', handleWheel);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [isLocked]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when typing in modals, console or text fields
      const targetTag = (e.target as HTMLElement)?.tagName;
      if (
        isConsoleOpen ||
        isMultiplayerOpen ||
        !!commandBlockTarget ||
        !!structureBlockTarget ||
        targetTag === 'INPUT' ||
        targetTag === 'TEXTAREA'
      ) {
        return;
      }

      const code = e.code;

      if (code === 'KeyW') keysRef.current.forward = 1;
      if (code === 'KeyS') keysRef.current.forward = -1;
      if (code === 'KeyA') keysRef.current.strafe = -1;
      if (code === 'KeyD') keysRef.current.strafe = 1;

      if (code === 'Space') {
        keysRef.current.jump = true;

        // Double tap space to toggle flight in creative or trigger elytra
        // Guard against OS key-repeat events so holding Space NEVER rapid-toggles flight
        if (!e.repeat) {
          const now = performance.now();
          const timeSinceLastTap = now - lastSpaceTapRef.current;
          const timeSinceLastToggle = now - lastFlightToggleRef.current;

          // Double tap space: between 60ms and 360ms apart, with at least 250ms debounce
          if (timeSinceLastTap >= 60 && timeSinceLastTap <= 360 && timeSinceLastToggle > 250) {
            if (engineRef.current) {
              const phys = engineRef.current.physics.state;
              if (phys.gamemode === 'creative' || phys.gamemode === 'spectator') {
                const nextFlying = !phys.isFlying;
                phys.isFlying = nextFlying;
                if (nextFlying) {
                  // Cancel any downward fall and give an initial hover lift
                  phys.vel.y = Math.max(2.5, phys.vel.y);
                  phys.onGround = false;
                  addNotification('🪽 Vuelo activado (Mantén Espacio para subir, Shift para bajar)', '#55ffff');
                } else {
                  addNotification('🪽 Vuelo desactivado', '#aaaaaa');
                }
                sounds.playCheatSuccess();
                lastFlightToggleRef.current = now;
              } else {
                // Survival mode: toggle elytra gliding
                const hasElytra = hotbar.some((it) => it?.itemType === 'elytra') || engineRef.current.activeItem?.itemType === 'elytra';
                if (hasElytra || !phys.onGround) {
                  engineRef.current.physics.toggleGliding();
                  sounds.playElytraGlide();
                  lastFlightToggleRef.current = now;
                }
              }
            }
            // Reset tap timestamp so subsequent presses to ascend/jump do not trigger another toggle
            lastSpaceTapRef.current = 0;
            return;
          }

          // First tap recorded
          lastSpaceTapRef.current = now;
        }
      }

      // Truck Color Change (KeyC)
      if (code === 'KeyC' && engineRef.current) {
        const newCol = engineRef.current.cycleTruckColor();
        if (newCol) {
          addNotification(`🎨 Color de la Camioneta cambiado a: ${newCol}`, '#55ffff');
          return;
        }
      }

      if (code === 'ShiftLeft' || code === 'ShiftRight') keysRef.current.sneak = true;
      if (code === 'ControlLeft' || code === 'KeyR') keysRef.current.sprint = true;

      // Slot keys 1-9
      if (e.key >= '1' && e.key <= '9') {
        setSelectedSlot(parseInt(e.key, 10) - 1);
      }

      // Vehicle drive toggle (KeyV)
      if (code === 'KeyV' && engineRef.current) {
        engineRef.current.toggleDriveTruck();
        return;
      }

      // Inventory toggle (E key) or exit/enter truck
      if (code === 'KeyE') {
        if (engineRef.current?.trucks.drivingTruck) {
          engineRef.current.trucks.exitDriving();
          return;
        }
        if (engineRef.current?.isNearTruck()) {
          engineRef.current.toggleDriveTruck();
          return;
        }
        if (isInventoryOpen) {
          setIsInventoryOpen(false);
          handleLockPointer();
        } else if (!isCheatsOpen && !isSettingsOpen && !isMultiplayerOpen && !commandBlockTarget && !structureBlockTarget) {
          document.exitPointerLock?.();
          setIsInventoryOpen(true);
        }
      }

      // Multiplayer toggle (M key)
      if (code === 'KeyM' && !isInventoryOpen && !isCheatsOpen && !isSettingsOpen && !commandBlockTarget && !structureBlockTarget) {
        if (isMultiplayerOpen) {
          setIsMultiplayerOpen(false);
          handleLockPointer();
        } else {
          document.exitPointerLock?.();
          setIsMultiplayerOpen(true);
        }
      }

      // Command Console toggle (T or / key)
      if ((code === 'KeyT' || e.key === '/') && !isInventoryOpen && !isCheatsOpen && !isSettingsOpen && !isMultiplayerOpen && !commandBlockTarget && !structureBlockTarget) {
        e.preventDefault();
        document.exitPointerLock?.();
        setIsConsoleOpen(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const code = e.code;
      if (code === 'KeyW' && keysRef.current.forward === 1) keysRef.current.forward = 0;
      if (code === 'KeyS' && keysRef.current.forward === -1) keysRef.current.forward = 0;
      if (code === 'KeyA' && keysRef.current.strafe === -1) keysRef.current.strafe = 0;
      if (code === 'KeyD' && keysRef.current.strafe === 1) keysRef.current.strafe = 0;
      if (code === 'Space') keysRef.current.jump = false;
      if (code === 'ShiftLeft' || code === 'ShiftRight') keysRef.current.sneak = false;
      if (code === 'ControlLeft' || code === 'KeyR') keysRef.current.sprint = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isConsoleOpen, isInventoryOpen, isCheatsOpen, isSettingsOpen, isMultiplayerOpen, commandBlockTarget, structureBlockTarget, handleLockPointer]);

  // Command Execution Handler
  const handleExecuteCommand = (cmdText: string): { success: boolean; message: string } => {
    if (!engineRef.current) return { success: false, message: 'Motor 3D no inicializado.' };

    // Log player message
    setChatMessages((prev) => [
      ...prev,
      { id: Math.random().toString(), sender: 'player', text: cmdText, timestamp: Date.now() },
    ]);

    const trimmed = cmdText.trim();
    const lower = trimmed.toLowerCase();

    // If starts with / or // or contains command patterns, execute as cheat command
    if (
      trimmed.startsWith('/') ||
      lower.startsWith('portal=') ||
      lower.includes('portal_type') ||
      lower.startsWith('structuregenerate') ||
      lower.startsWith('structure_generate') ||
      lower.startsWith('tpbiome') ||
      lower.startsWith('tp_biome')
    ) {
      const res = engineRef.current.executeCommand(trimmed);
      setChatMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: res.success ? 'cheat' : 'system',
          text: res.message,
          color: res.success ? '#55ff55' : '#ff5555',
          timestamp: Date.now(),
        },
      ]);
      return res;
    } else {
      // Broadcast chat over multiplayer network
      engineRef.current.multiplayer.broadcastChat(cmdText);
      return { success: true, message: cmdText };
    }
  };

  // Save command block data
  const handleSaveCommandBlock = useCallback((x: number, y: number, z: number, cmd: string) => {
    if (engineRef.current) {
      engineRef.current.setCommandBlockData(x, y, z, cmd);
      addNotification(`💾 Bloque de Trucos configurado en [${x}, ${y}, ${z}]`, '#55ffff');
    }
  }, [addNotification]);

  // Generate structure from structure block modal
  const handleGenerateStructure = useCallback((structId: string, x: number, y: number, z: number) => {
    if (!engineRef.current) return { success: false, message: 'Motor 3D no inicializado.' };
    const res = engineRef.current.generateStructureAt(structId, x, y, z);
    if (res.success) {
      addNotification(res.message, '#55ff55');
    } else {
      addNotification(res.message, '#ff5555');
    }
    return res;
  }, [addNotification]);

  // Hotbar update from Inventory
  const handleUpdateHotbarItem = (slotIdx: number, item: InventoryItem) => {
    const updated = [...hotbar];
    updated[slotIdx] = item;
    setHotbar(updated);
  };

  const handleClearHotbar = () => {
    setHotbar(new Array(9).fill(null as any));
  };

  // Player Info Update
  const handleUpdatePlayerInfo = (name: string, skin: PlayerSkin) => {
    setLocalPlayerName(name);
    setLocalSkin(skin);
    localStorage.setItem(PLAYER_NAME_KEY, name);
    localStorage.setItem(PLAYER_SKIN_KEY, JSON.stringify(skin));
    if (engineRef.current) {
      engineRef.current.multiplayer.setLocalPlayer(name, skin);
    }
  };

  // Multiplayer Actions
  const handleHostRoom = async (customCode?: string): Promise<string> => {
    if (!engineRef.current) return '';
    return await engineRef.current.multiplayer.hostRoom(customCode);
  };

  const handleJoinRoom = async (roomCode: string): Promise<boolean> => {
    if (!engineRef.current) return false;
    return await engineRef.current.multiplayer.joinRoom(roomCode);
  };

  const handleDisconnectMultiplayer = () => {
    if (!engineRef.current) return;
    engineRef.current.multiplayer.disconnect();
  };

  // World Save / Export / Import / Create
  const handleSaveWorld = () => {
    if (!engineRef.current) return;
    const json = engineRef.current.world.serialize();
    localStorage.setItem(STORAGE_KEY, json);
    sounds.playCheatSuccess();
    addNotification('¡Mundo guardado exitosamente en el navegador!', '#55ff55');
  };

  const handleExportWorld = () => {
    if (!engineRef.current) return;
    const json = engineRef.current.world.serialize();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `minecrazyworld_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    sounds.playCheatSuccess();
    addNotification('¡Archivo de mundo descargado (.json)!', '#55ffff');
  };

  const handleImportWorld = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content && engineRef.current) {
        const ok = engineRef.current.world.deserialize(content);
        if (ok) {
          engineRef.current.rebuildAllChunks();
          sounds.playCheatSuccess();
          addNotification('¡Mundo importado correctamente!', '#55ff55');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleCreateNewWorld = (type: WorldType, seed: number) => {
    if (!engineRef.current) return;
    engineRef.current.world = new (engineRef.current.world.constructor as any)(seed, type);
    engineRef.current.physics.world = engineRef.current.world;
    engineRef.current.entities.world = engineRef.current.world;
    engineRef.current.entities.clearAll();
    engineRef.current.physics.respawn();
    engineRef.current.rebuildAllChunks();
    sounds.playCheatSuccess();
    addNotification(`¡Nuevo mundo (${type.toUpperCase()}, Semilla: ${seed}) creado!`, '#55ffff');
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-black font-mono select-none">
      {/* 3D WebGL Canvas Container */}
      <div
        ref={canvasContainerRef}
        onClick={() => {
          if (!isInventoryOpen && !isCheatsOpen && !isSettingsOpen && !isConsoleOpen && !isMultiplayerOpen) {
            handleLockPointer();
          }
        }}
        className={`w-full h-full cursor-crosshair transition-all duration-700 ${
          currentDimension === 'parallel' ? 'invert hue-rotate-180 contrast-125' : ''
        }`}
      />

      {/* Main Minecraft HUD */}
      <HUD
        stats={stats}
        hotbar={hotbar}
        selectedSlot={selectedSlot}
        onSelectSlot={(idx) => setSelectedSlot(idx)}
        onOpenInventory={() => {
          document.exitPointerLock?.();
          setIsInventoryOpen(true);
        }}
        onOpenCheats={() => {
          document.exitPointerLock?.();
          setIsCheatsOpen(true);
        }}
        onOpenConsole={() => {
          document.exitPointerLock?.();
          setIsConsoleOpen(true);
        }}
        onOpenSettings={() => {
          document.exitPointerLock?.();
          setIsSettingsOpen(true);
        }}
        onOpenMultiplayer={() => {
          document.exitPointerLock?.();
          setIsMultiplayerOpen(true);
        }}
        onToggleFly={() => {
          if (engineRef.current) {
            engineRef.current.physics.state.isFlying = !engineRef.current.physics.state.isFlying;
            sounds.playCheatSuccess();
          }
        }}
        isLocked={isLocked}
        onLockPointer={handleLockPointer}
        isMultiplayerConnected={isMultiplayerConnected}
        multiplayerPlayerCount={connectedPlayers.length + 1}
        roomCode={currentRoomCode}
      />

      {/* Sleeping Overlay Transition */}
      {isSleeping && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md transition-opacity duration-700 pointer-events-none text-white select-none animate-in fade-in font-mono">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-5xl animate-bounce">🛏️</span>
            <span className="text-3xl font-bold text-amber-300 animate-pulse">Zzz...</span>
          </div>
          <h2 className="text-2xl font-bold tracking-wide text-zinc-100 mb-2">Durmiendo en la cama</h2>
          <p className="text-sm text-zinc-400 font-medium text-center px-4">Estableciendo punto de regeneración y saltando la noche...</p>
          <div className="mt-6 flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span className="text-xs uppercase tracking-widest text-amber-300 font-bold">Amaneciendo</span>
          </div>
        </div>
      )}

      {/* Portal Dimension Warping Overlay */}
      {isWarping && (
        <div
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-lg transition-all duration-500 pointer-events-none text-white select-none animate-in fade-in font-mono ${
            currentDimension === 'chocolate'
              ? 'bg-amber-950/85 text-amber-200'
              : currentDimension === 'nether'
              ? 'bg-red-950/85 text-red-200'
              : currentDimension === 'the_end'
              ? 'bg-purple-950/85 text-purple-200'
              : 'bg-indigo-950/85 text-indigo-200'
          }`}
        >
          <div className="relative mb-6">
            <div
              className={`w-28 h-28 rounded-full border-4 border-dashed animate-spin flex items-center justify-center ${
                currentDimension === 'chocolate'
                  ? 'border-amber-400 bg-amber-800/40'
                  : currentDimension === 'nether'
                  ? 'border-red-500 bg-red-800/40'
                  : currentDimension === 'the_end'
                  ? 'border-purple-400 bg-purple-800/40'
                  : 'border-cyan-400 bg-cyan-800/40'
              }`}
            >
              <span className="text-5xl animate-pulse">
                {currentDimension === 'chocolate' ? '🍫' : currentDimension === 'nether' ? '🔥' : currentDimension === 'the_end' ? '🌌' : '🌍'}
              </span>
            </div>
          </div>
          <h2 className="text-2xl font-bold tracking-wider mb-2 drop-shadow-md">
            {currentDimension === 'chocolate'
              ? 'Viajando a la Dimensión de Chocolate'
              : currentDimension === 'nether'
              ? 'Entrando al Nether (Inframundo)'
              : currentDimension === 'the_end'
              ? 'Atravesando el Vacío (The End)'
              : 'Regresando al Mundo Normal'}
          </h2>
          <p className="text-sm opacity-80 font-medium text-center px-6">
            Generando terreno dimensional y renderizando bloques...
          </p>
        </div>
      )}

      {/* Mobile Touch Controls Overlay */}
      {isTouchDevice && (
        <TouchControls
          onDirectionChange={(dir) => {
            keysRef.current.forward = dir.forward;
            keysRef.current.strafe = dir.strafe;
          }}
          onJumpPress={(pressed) => {
            keysRef.current.jump = pressed;
          }}
          onSneakPress={(pressed) => {
            keysRef.current.sneak = pressed;
          }}
          onBreakPress={(pressed) => {
            if (pressed) {
              const hitEntity = engineRef.current?.attackEntity();
              if (hitEntity) {
                isMouseDownRef.current = false;
                return;
              }
            }
            isMouseDownRef.current = pressed;
          }}
          onPlaceClick={() => {
            engineRef.current?.useItem();
          }}
          onToggleFly={() => {
            if (engineRef.current) {
              engineRef.current.physics.state.isFlying = !engineRef.current.physics.state.isFlying;
              sounds.playCheatSuccess();
            }
          }}
          onOpenInventory={() => setIsInventoryOpen(true)}
          onOpenCheats={() => setIsCheatsOpen(true)}
          isFlying={stats.isFlying}
        />
      )}

      {/* Modals */}
      <MultiplayerModal
        isOpen={isMultiplayerOpen}
        onClose={() => {
          setIsMultiplayerOpen(false);
          handleLockPointer();
        }}
        isConnected={isMultiplayerConnected}
        isHost={isHost}
        currentRoomCode={currentRoomCode}
        connectedPlayers={connectedPlayers}
        localPlayerName={localPlayerName}
        localSkin={localSkin}
        onHostRoom={handleHostRoom}
        onJoinRoom={handleJoinRoom}
        onDisconnect={handleDisconnectMultiplayer}
        onUpdatePlayerInfo={handleUpdatePlayerInfo}
        onNotification={addNotification}
      />

      <CreativeInventory
        isOpen={isInventoryOpen}
        onClose={() => {
          setIsInventoryOpen(false);
          handleLockPointer();
        }}
        hotbar={hotbar}
        selectedSlot={selectedSlot}
        onUpdateHotbarItem={handleUpdateHotbarItem}
        onClearHotbar={handleClearHotbar}
      />

      <CheatsModal
        isOpen={isCheatsOpen}
        onClose={() => {
          setIsCheatsOpen(false);
          handleLockPointer();
        }}
        stats={stats}
        onExecuteCommand={handleExecuteCommand}
      />

      <CommandConsole
        isOpen={isConsoleOpen}
        onClose={() => {
          setIsConsoleOpen(false);
          handleLockPointer();
        }}
        messages={chatMessages}
        onSendMessage={handleExecuteCommand}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => {
          setIsSettingsOpen(false);
          handleLockPointer();
        }}
        renderDistance={renderDistance}
        onChangeRenderDistance={(v) => {
          setRenderDistance(v);
          if (engineRef.current) {
            engineRef.current.renderDistance = v;
            engineRef.current.rebuildAllChunks();
          }
        }}
        fov={fov}
        onChangeFov={(v) => {
          setFov(v);
          if (engineRef.current) {
            engineRef.current.camera.fov = v;
            engineRef.current.camera.updateProjectionMatrix();
          }
        }}
        sensitivity={sensitivity}
        onChangeSensitivity={(v) => {
          setSensitivity(v);
          if (engineRef.current) {
            engineRef.current.sensitivity = v;
          }
        }}
        timeSpeed={timeSpeed}
        onChangeTimeSpeed={(v) => {
          setTimeSpeed(v);
          if (engineRef.current) {
            engineRef.current.timeSpeed = v;
          }
        }}
        onSaveWorld={handleSaveWorld}
        onExportWorld={handleExportWorld}
        onImportWorld={handleImportWorld}
        onCreateNewWorld={handleCreateNewWorld}
      />

      <CommandBlockModal
        isOpen={!!commandBlockTarget}
        onClose={() => {
          setCommandBlockTarget(null);
          handleLockPointer();
        }}
        targetBlock={commandBlockTarget}
        onExecuteCommand={handleExecuteCommand}
        onSaveCommand={handleSaveCommandBlock}
      />

      <StructureBlockModal
        isOpen={!!structureBlockTarget}
        onClose={() => {
          setStructureBlockTarget(null);
          handleLockPointer();
        }}
        targetBlock={structureBlockTarget}
        onGenerateStructure={handleGenerateStructure}
      />
    </main>
  );
}
