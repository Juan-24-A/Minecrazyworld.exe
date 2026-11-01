import React, { useState } from 'react';
import { 
  Users, 
  Globe, 
  PlusCircle, 
  Link as LinkIcon, 
  User, 
  Copy, 
  Check, 
  Radio, 
  X, 
  Sparkles,
  Wifi,
  Shield,
  ArrowRight,
  LogOut,
  Share2
} from 'lucide-react';
import { PlayerSkin, PublicServer, RemotePlayer } from '../types';
import { DEFAULT_SKINS } from '../game/multiplayer';

interface MultiplayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  isConnected: boolean;
  isHost: boolean;
  currentRoomCode: string;
  connectedPlayers: RemotePlayer[];
  localPlayerName: string;
  localSkin: PlayerSkin;
  onHostRoom: (customCode?: string) => Promise<string>;
  onJoinRoom: (roomCode: string) => Promise<boolean>;
  onDisconnect: () => void;
  onUpdatePlayerInfo: (name: string, skin: PlayerSkin) => void;
  onNotification: (msg: string, color?: string) => void;
}

const PUBLIC_SERVERS: PublicServer[] = [
  {
    id: 'srv-1',
    roomCode: 'MCW-CREATIVE',
    name: 'Minecrazyworld Servidor Creativo Principal',
    description: 'Mundo infinito colaborativo libre. Todos los bloques desbloqueados y vuelo activo.',
    hostName: 'Admin_Steve',
    playerCount: 8,
    maxPlayers: 32,
    worldType: 'default',
    tag: 'Creativo Libre',
    region: 'América / Global',
    ping: 18,
  },
  {
    id: 'srv-2',
    roomCode: 'MCW-BUILDERS',
    name: 'Mega Ciudad & Pixel Art Colaborativo',
    description: 'Construye rascacielos, castillos y creaciones de arte voxel junto a otros jugadores.',
    hostName: 'Alex_Master',
    playerCount: 5,
    maxPlayers: 24,
    worldType: 'flat',
    tag: 'Superplano',
    region: 'América Sur',
    ping: 24,
  },
  {
    id: 'srv-3',
    roomCode: 'MCW-ISLANDS',
    name: 'Archipiélago de Islas Flotantes',
    description: 'Construcción creativa sobre el océano y templos flotantes de cuarzo y oro.',
    hostName: 'Diamond_King',
    playerCount: 4,
    maxPlayers: 20,
    worldType: 'islands',
    tag: 'Islas',
    region: 'Europa',
    ping: 42,
  },
  {
    id: 'srv-4',
    roomCode: 'MCW-REDSTONE',
    name: 'Laboratorio de Construcción & TNT',
    description: 'Pruebas de dinamita, mecanismos gigantes y construcciones épicas con trucos.',
    hostName: 'Redstone_Tech',
    playerCount: 6,
    maxPlayers: 16,
    worldType: 'mountains',
    tag: 'Montañas',
    region: 'Global',
    ping: 15,
  },
];

export const MultiplayerModal: React.FC<MultiplayerModalProps> = ({
  isOpen,
  onClose,
  isConnected,
  isHost,
  currentRoomCode,
  connectedPlayers,
  localPlayerName,
  localSkin,
  onHostRoom,
  onJoinRoom,
  onDisconnect,
  onUpdatePlayerInfo,
  onNotification,
}) => {
  const [tab, setTab] = useState<'servers' | 'host' | 'join' | 'profile'>('servers');
  const [playerNameInput, setPlayerNameInput] = useState(localPlayerName);
  const [selectedSkin, setSelectedSkin] = useState<PlayerSkin>(localSkin);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [customHostCode, setCustomHostCode] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  if (!isOpen) return null;

  const handleCopyInviteLink = () => {
    const inviteUrl = `${window.location.origin}${window.location.pathname}?room=${currentRoomCode}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    onNotification(`¡Enlace de invitación copiado! Comparte: ${inviteUrl}`, '#55ff55');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSaveProfile = () => {
    if (!playerNameInput.trim()) return;
    onUpdatePlayerInfo(playerNameInput.trim(), selectedSkin);
    onNotification(`Perfil actualizado: ${playerNameInput.trim()}`, '#55ffff');
  };

  const handleHostAction = async () => {
    setIsConnecting(true);
    try {
      handleSaveProfile();
      const code = await onHostRoom(customHostCode.trim() || undefined);
      onNotification(`¡Sala creada exitosamente con código: ${code}!`, '#55ff55');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleJoinAction = async (codeToJoin?: string) => {
    const code = (codeToJoin || joinCodeInput).trim().toUpperCase();
    if (!code) {
      onNotification('Por favor ingresa un código de sala válido.', '#ff5555');
      return;
    }

    setIsConnecting(true);
    try {
      handleSaveProfile();
      const success = await onJoinRoom(code);
      if (success) {
        onNotification(`¡Conectado a la sala ${code}!`, '#55ff55');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div id="multiplayer-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div id="multiplayer-modal-card" className="w-full max-w-4xl max-h-[90vh] bg-[#313233] text-white rounded-none border-4 border-[#000] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col font-mono overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#242526] px-6 py-4 border-b-4 border-[#000] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#55FFFF] border-2 border-black flex items-center justify-center text-black font-black text-xl shadow-[2px_2px_0px_0px_#000]">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black uppercase text-[#FFFF55] tracking-wide flex items-center gap-2">
                Multijugador Creativo
                <span className="text-xs bg-[#55FF55] text-black px-2 py-0.5 font-bold border border-black">
                  ONLINE P2P
                </span>
              </h2>
              <p className="text-xs text-[#b8b8b8]">
                Construcción colaborativa y exploración en tiempo real en Minecrazyworld
              </p>
            </div>
          </div>

          <button
            id="multiplayer-modal-close-btn"
            onClick={onClose}
            className="p-2 bg-[#FF5555] hover:bg-[#ff7777] border-2 border-black text-black font-bold transition active:translate-y-0.5 shadow-[2px_2px_0px_0px_#000]"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Active Session Bar */}
        {isConnected && (
          <div className="bg-[#1f3a2b] border-b-4 border-[#000] px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-[#55FF55] animate-pulse"></span>
              <span className="font-bold text-[#55FF55]">
                {isHost ? '👑 Eres el Anfitrión del Servidor' : '🟢 Conectado a la Sala'}:
              </span>
              <span className="bg-[#000] px-3 py-1 text-[#FFFF55] font-black border border-[#55FF55] tracking-wider">
                {currentRoomCode}
              </span>
              <span className="text-xs text-white/80">
                ({connectedPlayers.length + 1} jugador(es) en línea)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="multiplayer-copy-invite-btn"
                onClick={handleCopyInviteLink}
                className="flex items-center gap-1.5 px-3 py-1 bg-[#55FFFF] hover:bg-[#88ffff] text-black font-bold border-2 border-black text-xs shadow-[2px_2px_0px_0px_#000] active:translate-y-0.5"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                {copiedLink ? '¡Enlace Copiado!' : 'Invitar Amigos'}
              </button>

              <button
                id="multiplayer-disconnect-btn"
                onClick={() => {
                  onDisconnect();
                  onNotification('Desconectado de la partida multijugador.', '#ffaa00');
                }}
                className="flex items-center gap-1.5 px-3 py-1 bg-[#FF5555] hover:bg-[#ff7777] text-black font-bold border-2 border-black text-xs shadow-[2px_2px_0px_0px_#000] active:translate-y-0.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                Desconectar
              </button>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b-4 border-[#000] bg-[#1e1e1e] overflow-x-auto">
          <button
            id="multiplayer-tab-servers"
            onClick={() => setTab('servers')}
            className={`flex items-center gap-2 px-5 py-3.5 font-black uppercase text-sm border-r-2 border-[#000] transition ${
              tab === 'servers'
                ? 'bg-[#313233] text-[#FFFF55] border-b-4 border-b-[#FFFF55]'
                : 'text-white/70 hover:bg-[#252525] hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4 text-[#55FFFF]" />
            Servidores Públicos
          </button>

          <button
            id="multiplayer-tab-host"
            onClick={() => setTab('host')}
            className={`flex items-center gap-2 px-5 py-3.5 font-black uppercase text-sm border-r-2 border-[#000] transition ${
              tab === 'host'
                ? 'bg-[#313233] text-[#FFFF55] border-b-4 border-b-[#FFFF55]'
                : 'text-white/70 hover:bg-[#252525] hover:text-white'
            }`}
          >
            <PlusCircle className="w-4 h-4 text-[#55FF55]" />
            Crear / Alojar Sala
          </button>

          <button
            id="multiplayer-tab-join"
            onClick={() => setTab('join')}
            className={`flex items-center gap-2 px-5 py-3.5 font-black uppercase text-sm border-r-2 border-[#000] transition ${
              tab === 'join'
                ? 'bg-[#313233] text-[#FFFF55] border-b-4 border-b-[#FFFF55]'
                : 'text-white/70 hover:bg-[#252525] hover:text-white'
            }`}
          >
            <LinkIcon className="w-4 h-4 text-[#FFFF55]" />
            Unirse por Código
          </button>

          <button
            id="multiplayer-tab-profile"
            onClick={() => setTab('profile')}
            className={`flex items-center gap-2 px-5 py-3.5 font-black uppercase text-sm transition ${
              tab === 'profile'
                ? 'bg-[#313233] text-[#FFFF55] border-b-4 border-b-[#FFFF55]'
                : 'text-white/70 hover:bg-[#252525] hover:text-white'
            }`}
          >
            <User className="w-4 h-4 text-[#FF5555]" />
            Mi Skin & Nickname
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
          
          {/* 1. SERVERS LIST */}
          {tab === 'servers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-lg text-[#FFFF55] uppercase">
                    Mundos Creativos Públicos
                  </h3>
                  <p className="text-xs text-[#aaaaaa]">
                    Selecciona un servidor comunitario para unirte instantáneamente y construir en equipo.
                  </p>
                </div>
                <span className="text-xs bg-[#242526] px-3 py-1 border border-black text-[#55FF55] font-bold">
                  {PUBLIC_SERVERS.length} SERVIDORES ACTIVOS
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {PUBLIC_SERVERS.map((server) => (
                  <div
                    key={server.id}
                    className="p-4 bg-[#242526] border-3 border-black hover:border-[#FFFF55] transition flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[4px_4px_0px_0px_#000]"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-base text-white">
                          {server.name}
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-[#1a4030] text-[#55FF55] border border-[#55FF55] font-bold">
                          {server.tag}
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-[#000] text-[#55FFFF] border border-black font-mono">
                          {server.region}
                        </span>
                      </div>
                      <p className="text-xs text-[#b0b0b0]">
                        {server.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-[#888888]">
                        <span>Anfitrión: <strong className="text-white">{server.hostName}</strong></span>
                        <span className="flex items-center gap-1 text-[#55FF55]">
                          <Wifi className="w-3.5 h-3.5" /> {server.ping} ms
                        </span>
                        <span className="text-[#FFFF55]">
                          👥 {server.playerCount}/{server.maxPlayers} Jugadores
                        </span>
                      </div>
                    </div>

                    <button
                      id={`join-server-${server.id}`}
                      disabled={isConnecting}
                      onClick={() => handleJoinAction(server.roomCode)}
                      className="px-5 py-2.5 bg-[#55FF55] hover:bg-[#77ff77] text-black font-black uppercase text-sm border-2 border-black shadow-[3px_3px_0px_0px_#000] active:translate-y-0.5 transition flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                      {isConnecting ? (
                        'Conectando...'
                      ) : (
                        <>
                          Entrar al Servidor <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. HOST ROOM */}
          {tab === 'host' && (
            <div className="space-y-5 max-w-xl mx-auto">
              <div className="text-center space-y-1">
                <h3 className="font-black text-xl text-[#55FF55] uppercase">
                  Alojar un Mundo Multijugador
                </h3>
                <p className="text-xs text-[#aaaaaa]">
                  Conviértete en el anfitrión de tu mundo actual. Tus amigos podrán unirse con tu código o enlace directo.
                </p>
              </div>

              <div className="bg-[#242526] p-5 border-3 border-black space-y-4 shadow-[4px_4px_0px_0px_#000]">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#FFFF55] mb-1.5">
                    Código de Sala Personalizado (Opcional)
                  </label>
                  <input
                    id="host-room-custom-code-input"
                    type="text"
                    placeholder="Ej: MUNDO-AMIGOS o MCW-2026"
                    value={customHostCode}
                    onChange={(e) => setCustomHostCode(e.target.value.toUpperCase())}
                    className="w-full bg-[#111] border-2 border-black p-3 text-[#FFFF55] font-black tracking-widest placeholder:text-neutral-600 focus:outline-none focus:border-[#55FF55]"
                    maxLength={16}
                  />
                  <p className="text-[11px] text-[#888888] mt-1">
                    Si lo dejas en blanco, se generará un código seguro al azar (Ej: MCW-8492).
                  </p>
                </div>

                <div className="p-3 bg-[#182820] border border-[#55FF55] text-xs text-[#55FF55] space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Shield className="w-4 h-4" /> Modo Creativo Colaborativo Activo
                  </div>
                  <p className="text-white/80 text-[11px]">
                    Todos los jugadores tendrán acceso instantáneo a recursos ilimitados, vuelo y podrán construir contigo en tiempo real.
                  </p>
                </div>

                <button
                  id="host-room-create-btn"
                  disabled={isConnecting}
                  onClick={handleHostAction}
                  className="w-full py-3 bg-[#55FF55] hover:bg-[#77ff77] text-black font-black uppercase text-base border-3 border-black shadow-[4px_4px_0px_0px_#000] active:translate-y-0.5 transition flex items-center justify-center gap-2"
                >
                  {isConnecting ? 'Creando Sala...' : '🚀 Iniciar Servidor & Alojar Mundo'}
                </button>
              </div>
            </div>
          )}

          {/* 3. JOIN BY CODE */}
          {tab === 'join' && (
            <div className="space-y-5 max-w-xl mx-auto">
              <div className="text-center space-y-1">
                <h3 className="font-black text-xl text-[#FFFF55] uppercase">
                  Unirse a una Sala por Código
                </h3>
                <p className="text-xs text-[#aaaaaa]">
                  Ingresa el código que te proporcionó el anfitrión para conectarte a su mundo creativo.
                </p>
              </div>

              <div className="bg-[#242526] p-5 border-3 border-black space-y-4 shadow-[4px_4px_0px_0px_#000]">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#FFFF55] mb-1.5">
                    Código de Sala de Invitación
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="join-room-code-input"
                      type="text"
                      placeholder="Ej: MCW-8492"
                      value={joinCodeInput}
                      onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                      className="flex-1 bg-[#111] border-2 border-black p-3 text-[#55FFFF] font-black tracking-widest text-lg placeholder:text-neutral-600 focus:outline-none focus:border-[#FFFF55]"
                      maxLength={20}
                    />
                    <button
                      onClick={async () => {
                        try {
                          const text = await navigator.clipboard.readText();
                          if (text) setJoinCodeInput(text.toUpperCase().trim());
                        } catch {}
                      }}
                      className="px-4 bg-[#2e3033] hover:bg-[#3d4044] border-2 border-black text-xs font-bold text-white shadow-[2px_2px_0px_0px_#000]"
                    >
                      Pegar
                    </button>
                  </div>
                </div>

                <button
                  id="join-room-submit-btn"
                  disabled={isConnecting || !joinCodeInput.trim()}
                  onClick={() => handleJoinAction()}
                  className="w-full py-3 bg-[#55FFFF] hover:bg-[#88ffff] text-black font-black uppercase text-base border-3 border-black shadow-[4px_4px_0px_0px_#000] active:translate-y-0.5 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isConnecting ? 'Conectando...' : '🔗 Unirme a la Sala'}
                </button>
              </div>
            </div>
          )}

          {/* 4. PLAYER PROFILE & SKIN */}
          {tab === 'profile' && (
            <div className="space-y-6">
              <div className="text-center space-y-1">
                <h3 className="font-black text-xl text-[#FF5555] uppercase">
                  Personalización del Jugador
                </h3>
                <p className="text-xs text-[#aaaaaa]">
                  Elige tu apodo y apariencia 3D visible para todos los demás jugadores del mundo.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Nickname and Current Preview */}
                <div className="bg-[#242526] p-5 border-3 border-black space-y-4 shadow-[4px_4px_0px_0px_#000] md:col-span-1">
                  <div>
                    <label className="block text-xs font-bold uppercase text-[#FFFF55] mb-1.5">
                      Nombre / Apodo
                    </label>
                    <input
                      id="player-nickname-input"
                      type="text"
                      value={playerNameInput}
                      onChange={(e) => setPlayerNameInput(e.target.value)}
                      placeholder="Tu nombre"
                      maxLength={16}
                      className="w-full bg-[#111] border-2 border-black p-2.5 text-white font-bold focus:outline-none focus:border-[#FFFF55]"
                    />
                  </div>

                  {/* 2D Blocky Skin Preview */}
                  <div className="p-4 bg-[#111] border-2 border-black flex flex-col items-center justify-center gap-2">
                    <span className="text-[11px] text-[#888] font-bold">VISTA PREVIA DEL PERSONAJE</span>
                    
                    {/* Nametag */}
                    <div className="bg-black/80 px-2 py-0.5 border border-[#FFFF55] text-[#FFFF55] text-xs font-bold">
                      {playerNameInput || 'Steve'}
                    </div>

                    {/* Blocky Character Figure */}
                    <div className="flex flex-col items-center pt-1">
                      {/* Head */}
                      <div 
                        className="w-10 h-10 border-2 border-black relative shadow-sm"
                        style={{ backgroundColor: selectedSkin.headColor }}
                      >
                        <div className="absolute top-2 left-1.5 w-1.5 h-1.5 bg-white flex items-center justify-center">
                          <div className="w-0.5 h-1 bg-blue-700"></div>
                        </div>
                        <div className="absolute top-2 right-1.5 w-1.5 h-1.5 bg-white flex items-center justify-center">
                          <div className="w-0.5 h-1 bg-blue-700"></div>
                        </div>
                      </div>
                      {/* Torso & Arms */}
                      <div className="flex items-center -mt-0.5">
                        <div className="w-3.5 h-12 border-2 border-black" style={{ backgroundColor: selectedSkin.bodyColor }}></div>
                        <div className="w-10 h-12 border-2 border-black relative" style={{ backgroundColor: selectedSkin.bodyColor }}>
                          {selectedSkin.capeColor && (
                            <div className="absolute inset-x-1 bottom-1 top-1 border border-black/40" style={{ backgroundColor: selectedSkin.capeColor }}></div>
                          )}
                        </div>
                        <div className="w-3.5 h-12 border-2 border-black" style={{ backgroundColor: selectedSkin.bodyColor }}></div>
                      </div>
                      {/* Legs */}
                      <div className="flex -mt-0.5">
                        <div className="w-5 h-12 border-2 border-black" style={{ backgroundColor: selectedSkin.legsColor }}></div>
                        <div className="w-5 h-12 border-2 border-black" style={{ backgroundColor: selectedSkin.legsColor }}></div>
                      </div>
                    </div>

                    <span className="text-xs text-[#55FFFF] font-bold mt-1">
                      {selectedSkin.name}
                    </span>
                  </div>

                  <button
                    id="save-player-profile-btn"
                    onClick={handleSaveProfile}
                    className="w-full py-2.5 bg-[#55FF55] hover:bg-[#77ff77] text-black font-black uppercase text-sm border-2 border-black shadow-[3px_3px_0px_0px_#000] active:translate-y-0.5 transition"
                  >
                    Guardar Perfil
                  </button>
                </div>

                {/* Skin Selector Grid */}
                <div className="bg-[#242526] p-5 border-3 border-black space-y-3 shadow-[4px_4px_0px_0px_#000] md:col-span-2">
                  <h4 className="font-bold text-sm text-[#FFFF55] uppercase">
                    Elige tu Aspecto / Skin Voxel
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {DEFAULT_SKINS.map((skin) => (
                      <button
                        key={skin.id}
                        id={`skin-select-${skin.id}`}
                        onClick={() => {
                          setSelectedSkin(skin);
                          onUpdatePlayerInfo(playerNameInput.trim() || 'Steve', skin);
                        }}
                        className={`p-3 border-2 text-left transition flex flex-col items-center gap-2 ${
                          selectedSkin.id === skin.id
                            ? 'bg-[#183a2b] border-[#55FF55] shadow-[2px_2px_0px_0px_#55FF55]'
                            : 'bg-[#1a1a1a] border-black hover:border-[#FFFF55]'
                        }`}
                      >
                        <div className="flex gap-1 items-center">
                          <div className="w-4 h-4 border border-black" style={{ backgroundColor: skin.headColor }} title="Cabeza"></div>
                          <div className="w-4 h-4 border border-black" style={{ backgroundColor: skin.bodyColor }} title="Cuerpo"></div>
                          <div className="w-4 h-4 border border-black" style={{ backgroundColor: skin.legsColor }} title="Piernas"></div>
                          {skin.capeColor && (
                            <div className="w-4 h-4 border border-black" style={{ backgroundColor: skin.capeColor }} title="Capa"></div>
                          )}
                        </div>
                        <span className="text-xs font-bold text-center text-white">
                          {skin.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-[#242526] px-6 py-4 border-t-4 border-[#000] flex items-center justify-between">
          <div className="text-xs text-[#888]">
            Minecrazyworld Multijugador • Totalmente libre y sin límite de bloques
          </div>
          <button
            id="multiplayer-modal-close-bottom-btn"
            onClick={onClose}
            className="px-6 py-2 bg-[#FFFF55] hover:bg-[#ffff88] text-black font-black uppercase text-sm border-2 border-black shadow-[3px_3px_0px_0px_#000] active:translate-y-0.5 transition"
          >
            Volver al Juego
          </button>
        </div>

      </div>
    </div>
  );
};
