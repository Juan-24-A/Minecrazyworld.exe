import React from 'react';
import { 
  Sparkles, 
  X, 
  Feather, 
  ShieldCheck, 
  Ghost, 
  Sun, 
  Moon, 
  Sunrise, 
  CloudRain, 
  Zap, 
  Bomb, 
  Flame, 
  Heart, 
  Gauge, 
  ArrowUpCircle, 
  Compass, 
  Trash2,
  Sword,
  Paintbrush
} from 'lucide-react';
import { PlayerStats, WeatherType, GameMode } from '../types';
import { sounds } from '../game/audio';

interface CheatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: PlayerStats;
  onExecuteCommand: (cmd: string) => void;
}

export const CheatsModal: React.FC<CheatsModalProps> = ({
  isOpen,
  onClose,
  stats,
  onExecuteCommand,
}) => {
  if (!isOpen) return null;

  const runCheat = (cmd: string) => {
    onExecuteCommand(cmd);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 font-mono select-none">
      <div className="bg-[#313233] text-white border-4 border-[#000] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-3xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#1e1e1e] text-[#FFFF55] p-3.5 px-5 flex justify-between items-center border-b-4 border-[#000]">
          <div className="flex items-center gap-2 font-bold text-sm tracking-wide">
            <Sparkles className="w-5 h-5 text-[#FFFF55]" />
            <span>PANEL DE TRUCOS Y PODERES (CHEATS)</span>
          </div>
          <button
            onClick={onClose}
            className="bg-[#FF5555] hover:bg-[#ff7777] text-black font-bold p-1 border-2 border-[#000] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
            title="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 overflow-y-auto space-y-5 bg-[#242526]">
          {/* Dimensiones y Portales */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#FFAA00] flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-[#FFAA00]" /> Dimensiones & Portales Mágicos
              </h4>
              <span className="text-[10px] text-gray-400 font-mono">Consola: T o /</span>
            </div>

            {/* Nuevo Truco Especial: //portal=portal_type=(tipo) */}
            <div className="mb-3 p-2.5 bg-[#181a24] border border-[#00FFFF]/40 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs">
              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <span className="font-bold text-[#FFFF55]">
                  ⚡ Nuevo Truco: <code className="bg-black/70 px-1.5 py-0.5 text-[#00FFFF] rounded font-bold">//portal=portal_type=(tipo)</code>
                </span>
                <span className="text-[10px] text-gray-300">Invocar portal instantáneo frente a ti:</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <button
                  onClick={() => runCheat('//portal=portal_type=(end)')}
                  className="px-2 py-1 bg-[#2d123d] hover:bg-[#4a1c66] text-[#FF55FF] border border-[#FF55FF] font-bold text-[10px] cursor-pointer transition-colors"
                  title="Invocar portal horizontal al End"
                >
                  🌌 //portal=portal_type=(end)
                </button>
                <button
                  onClick={() => runCheat('//portal=portal_type=(chocolate)')}
                  className="px-2 py-1 bg-[#3d2712] hover:bg-[#663e1c] text-[#FFAA00] border border-[#FFAA00] font-bold text-[10px] cursor-pointer transition-colors"
                  title="Invocar portal de chocolate"
                >
                  🍫 //portal=portal_type=(chocolate)
                </button>
                <button
                  onClick={() => runCheat('//portal=portal_type=(nether)')}
                  className="px-2 py-1 bg-[#3d1212] hover:bg-[#661c1c] text-[#FF5555] border border-[#FF5555] font-bold text-[10px] cursor-pointer transition-colors"
                  title="Invocar portal del Nether"
                >
                  🔥 //portal=portal_type=(nether)
                </button>
                <button
                  onClick={() => runCheat('//portal=portal_type=(parallel)')}
                  className="px-2 py-1 bg-[#123d3d] hover:bg-[#1c6666] text-[#00FFFF] border border-[#00FFFF] font-bold text-[10px] cursor-pointer transition-colors"
                  title="Invocar portal al Overworld Paralelo"
                >
                  🪞 //portal=portal_type=(parallel)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {/* Parallel Dimension */}
              <div className="p-3 bg-[#1e1e1e] border-2 border-[#00FFFF] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between gap-2">
                <div>
                  <div className="flex items-center justify-between font-bold text-xs text-[#00FFFF]">
                    <span>🪞 OVERWORLD PARALELO</span>
                    {stats.dimension === 'parallel' && (
                      <span className="text-[10px] bg-[#00FFFF] text-black font-bold px-1.5 animate-pulse">AQUÍ (INVERTIDO)</span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#CCC] mt-1">
                    Mundo inverso: ¡Colores opuestos y controles invertidos! W mueve hacia atrás y S hacia adelante.
                  </p>
                </div>
                <div className="flex gap-1.5 mt-1">
                  <button
                    onClick={() => runCheat('/dimension parallel')}
                    className="flex-1 py-1.5 bg-[#00FFFF] hover:bg-[#88ffff] text-black font-bold text-[11px] border border-[#000] cursor-pointer"
                  >
                    Viajar
                  </button>
                  <button
                    onClick={() => runCheat('/portal parallel')}
                    className="flex-1 py-1.5 bg-[#333] hover:bg-[#555] text-[#00FFFF] font-bold text-[11px] border border-[#00FFFF] cursor-pointer"
                    title="Construir portal de espejo frente a ti"
                  >
                    Crear Portal
                  </button>
                </div>
              </div>

              {/* Chocolate Dimension */}
              <div className="p-3 bg-[#1e1e1e] border-2 border-[#FFAA00] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between gap-2">
                <div>
                  <div className="flex items-center justify-between font-bold text-xs text-[#FFAA00]">
                    <span>🍫 DIMENSIÓN CHOCOLATE</span>
                    {stats.dimension === 'chocolate' && (
                      <span className="text-[10px] bg-[#FFAA00] text-black font-bold px-1.5">AQUÍ</span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#CCC] mt-1">
                    Mundo de chocolate líquido, galletas, nubes de algodón y caramelos.
                  </p>
                </div>
                <div className="flex gap-1.5 mt-1">
                  <button
                    onClick={() => runCheat('/dimension chocolate')}
                    className="flex-1 py-1.5 bg-[#FFAA00] hover:bg-[#ffbb33] text-black font-bold text-[11px] border border-[#000] cursor-pointer"
                  >
                    Viajar
                  </button>
                  <button
                    onClick={() => runCheat('/portal chocolate')}
                    className="flex-1 py-1.5 bg-[#333] hover:bg-[#555] text-[#FFAA00] font-bold text-[11px] border border-[#FFAA00] cursor-pointer"
                    title="Construir portal de chocolate frente a ti"
                  >
                    Crear Portal
                  </button>
                </div>
              </div>

              {/* Nether */}
              <div className="p-3 bg-[#1e1e1e] border-2 border-[#FF5555] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between gap-2">
                <div>
                  <div className="flex items-center justify-between font-bold text-xs text-[#FF5555]">
                    <span>🔥 EL NETHER</span>
                    {stats.dimension === 'nether' && (
                      <span className="text-[10px] bg-[#FF5555] text-black font-bold px-1.5">AQUÍ</span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#CCC] mt-1">
                    Inframundo de netherrack ardiente, lava, cuarzo y arena de almas.
                  </p>
                </div>
                <div className="flex gap-1.5 mt-1">
                  <button
                    onClick={() => runCheat('/dimension nether')}
                    className="flex-1 py-1.5 bg-[#FF5555] hover:bg-[#ff7777] text-black font-bold text-[11px] border border-[#000] cursor-pointer"
                  >
                    Viajar
                  </button>
                  <button
                    onClick={() => runCheat('/portal nether')}
                    className="flex-1 py-1.5 bg-[#333] hover:bg-[#555] text-[#FF5555] font-bold text-[11px] border border-[#FF5555] cursor-pointer"
                    title="Construir portal de obsidiana frente a ti"
                  >
                    Crear Portal
                  </button>
                </div>
              </div>

              {/* The End */}
              <div className="p-3 bg-[#1e1e1e] border-2 border-[#FF55FF] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between gap-2">
                <div>
                  <div className="flex items-center justify-between font-bold text-xs text-[#FF55FF]">
                    <span>🌌 THE END</span>
                    {stats.dimension === 'the_end' && (
                      <span className="text-[10px] bg-[#FF55FF] text-black font-bold px-1.5">AQUÍ</span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#CCC] mt-1">
                    Islas flotantes de piedra del fin y purpur en el vacío cósmico.
                  </p>
                </div>
                <div className="flex gap-1.5 mt-1">
                  <button
                    onClick={() => runCheat('/dimension the_end')}
                    className="flex-1 py-1.5 bg-[#FF55FF] hover:bg-[#ff77ff] text-black font-bold text-[11px] border border-[#000] cursor-pointer"
                  >
                    Viajar
                  </button>
                  <button
                    onClick={() => runCheat('/portal end')}
                    className="flex-1 py-1.5 bg-[#333] hover:bg-[#555] text-[#FF55FF] font-bold text-[11px] border border-[#FF55FF] cursor-pointer"
                  >
                    Crear Portal
                  </button>
                </div>
              </div>

              {/* Overworld */}
              <div className="p-3 bg-[#1e1e1e] border-2 border-[#55FF55] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between gap-2 sm:col-span-2 lg:col-span-2">
                <div>
                  <div className="flex items-center justify-between font-bold text-xs text-[#55FF55]">
                    <span>🌍 OVERWORLD</span>
                    {stats.dimension === 'overworld' && (
                      <span className="text-[10px] bg-[#55FF55] text-black font-bold px-1.5">AQUÍ</span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#CCC] mt-1">
                    Mundo normal con praderas, bosques, montañas y ciclo de día y noche.
                  </p>
                </div>
                <div className="flex gap-1.5 mt-1">
                  <button
                    onClick={() => runCheat('/dimension overworld')}
                    className="w-full py-1.5 bg-[#55FF55] hover:bg-[#88ff88] text-black font-bold text-[11px] border border-[#000] cursor-pointer"
                  >
                    Regresar al Mundo Normal
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 1. Modos de Juego */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#FFFF55] mb-2 flex items-center gap-1.5">
              <Paintbrush className="w-4 h-4" /> Modos de Juego
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                onClick={() => runCheat('/gamemode creative')}
                className={`p-3 border-2 text-left flex flex-col gap-1 transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                  stats.gamemode === 'creative'
                    ? 'bg-[#1e1e1e] border-[#FFFF55] text-[#FFFF55]'
                    : 'bg-[#1e1e1e] border-[#555] hover:border-[#888] text-white'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-xs">
                  <span>🎨 MODO CREATIVO</span>
                  {stats.gamemode === 'creative' && <span className="text-[10px] bg-[#FFFF55] text-black font-bold px-1.5">ACTIVO</span>}
                </div>
                <span className="text-[11px] text-[#AAA]">Bloques ilimitados, vuelo y minado instantáneo.</span>
              </button>

              <button
                onClick={() => runCheat('/gamemode survival')}
                className={`p-3 border-2 text-left flex flex-col gap-1 transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                  stats.gamemode === 'survival'
                    ? 'bg-[#1e1e1e] border-[#FF5555] text-[#FF5555]'
                    : 'bg-[#1e1e1e] border-[#555] hover:border-[#888] text-white'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-xs">
                  <span>⚔️ SUPERVIVENCIA</span>
                  {stats.gamemode === 'survival' && <span className="text-[10px] bg-[#FF5555] text-black font-bold px-1.5">ACTIVO</span>}
                </div>
                <span className="text-[11px] text-[#AAA]">Vida, hambre, gravedad y daño por caídas.</span>
              </button>

              <button
                onClick={() => runCheat('/gamemode spectator')}
                className={`p-3 border-2 text-left flex flex-col gap-1 transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                  stats.gamemode === 'spectator'
                    ? 'bg-[#1e1e1e] border-[#FF55FF] text-[#FF55FF]'
                    : 'bg-[#1e1e1e] border-[#555] hover:border-[#888] text-white'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-xs">
                  <span>👻 ESPECTADOR</span>
                  {stats.gamemode === 'spectator' && <span className="text-[10px] bg-[#FF55FF] text-black font-bold px-1.5">ACTIVO</span>}
                </div>
                <span className="text-[11px] text-[#AAA]">Vuelo libre invisible y atravesar paredes.</span>
              </button>
            </div>
          </div>

          {/* 2. Superpoderes & Habilidades */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#FFFF55] mb-2 flex items-center gap-1.5">
              <Zap className="w-4 h-4" /> Superpoderes del Jugador & Vehículos
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <button
                onClick={() => runCheat('/fly')}
                className={`p-2.5 border-2 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                  stats.isFlying
                    ? 'bg-[#55FFFF] text-black border-[#000]'
                    : 'bg-[#555] hover:bg-[#777] text-white border-[#000]'
                }`}
              >
                <Feather className="w-4 h-4" />
                <span>VUELO: {stats.isFlying ? 'ON' : 'OFF'}</span>
              </button>

              <button
                onClick={() => runCheat('/elytra')}
                className={`p-2.5 border-2 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                  stats.isGliding
                    ? 'bg-[#c084fc] text-black border-[#000]'
                    : 'bg-[#555] hover:bg-[#777] text-white border-[#000]'
                }`}
              >
                <span>🪽 ÉLITROS: {stats.isGliding ? 'ACTIVOS' : 'OFF'}</span>
              </button>

              <button
                onClick={() => runCheat('/god')}
                className={`p-2.5 border-2 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                  stats.isGodmode
                    ? 'bg-[#FFFF55] text-black border-[#000]'
                    : 'bg-[#555] hover:bg-[#777] text-white border-[#000]'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>MODO DIOS: {stats.isGodmode ? 'ON' : 'OFF'}</span>
              </button>

              <button
                onClick={() => runCheat('/noclip')}
                className={`p-2.5 border-2 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                  stats.isNoclip
                    ? 'bg-[#FF55FF] text-black border-[#000]'
                    : 'bg-[#555] hover:bg-[#777] text-white border-[#000]'
                }`}
              >
                <Ghost className="w-4 h-4" />
                <span>NOCLIP: {stats.isNoclip ? 'ON' : 'OFF'}</span>
              </button>

              <button
                onClick={() => runCheat('/truck color')}
                className="p-2.5 border-2 border-[#000] bg-[#e11d48] hover:bg-[#f43f5e] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
              >
                <span>🛻 COLOR CAMIONETA [C]</span>
              </button>

              <button
                onClick={() => runCheat('/heal')}
                className="p-2.5 border-2 border-[#000] bg-[#55FF55] hover:bg-[#77ff77] text-black font-bold text-xs flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
              >
                <Heart className="w-4 h-4 text-black" />
                <span>CURAR VIDA 100%</span>
              </button>
            </div>
          </div>

          {/* 3. Control del Tiempo y Clima */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Hora del Día */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#FFFF55] mb-2 flex items-center gap-1.5">
                <Sun className="w-4 h-4" /> Hora del Día
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => runCheat('/time set day')}
                  className="p-2 bg-[#555] hover:bg-[#777] border-2 border-[#000] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs font-bold text-white flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sun className="w-4 h-4 text-[#FFFF55]" />
                  <span>Día (Mañana)</span>
                </button>

                <button
                  onClick={() => runCheat('/time set noon')}
                  className="p-2 bg-[#555] hover:bg-[#777] border-2 border-[#000] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs font-bold text-white flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sunrise className="w-4 h-4 text-[#FFAA00]" />
                  <span>Mediodía</span>
                </button>

                <button
                  onClick={() => runCheat('/time set 12000')}
                  className="p-2 bg-[#555] hover:bg-[#777] border-2 border-[#000] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs font-bold text-white flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sunrise className="w-4 h-4 text-[#FFAA00]" />
                  <span>Atardecer</span>
                </button>

                <button
                  onClick={() => runCheat('/time set night')}
                  className="p-2 bg-[#555] hover:bg-[#777] border-2 border-[#000] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs font-bold text-white flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Moon className="w-4 h-4 text-[#55FFFF]" />
                  <span>Noche</span>
                </button>
              </div>

              {/* Botones de Dormir y Respawn */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                <button
                  onClick={() => runCheat('/sleep')}
                  className="p-2 bg-[#1e1e1e] hover:bg-[#333] border-2 border-[#FFAA00] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs font-bold text-[#FFAA00] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>💤 Dormir (Saltar Noche)</span>
                </button>
                <button
                  onClick={() => runCheat('/setspawn')}
                  className="p-2 bg-[#1e1e1e] hover:bg-[#333] border-2 border-[#55FF55] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs font-bold text-[#55FF55] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>🛏️ Fijar Spawn Aquí</span>
                </button>
                <button
                  onClick={() => runCheat('/spawn')}
                  className="p-2 bg-[#1e1e1e] hover:bg-[#333] border-2 border-[#55FFFF] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs font-bold text-[#55FFFF] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>🏠 Ir a Spawn / Cama</span>
                </button>
              </div>
            </div>

            {/* Clima */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#FFFF55] mb-2 flex items-center gap-1.5">
                <CloudRain className="w-4 h-4" /> Clima y Atmósfera
              </h4>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => runCheat('/weather clear')}
                  className="p-2 bg-[#555] hover:bg-[#777] border-2 border-[#000] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs font-bold text-white flex flex-col items-center gap-1 cursor-pointer"
                >
                  <Sun className="w-4 h-4 text-[#FFFF55]" />
                  <span>Despejado</span>
                </button>

                <button
                  onClick={() => runCheat('/weather rain')}
                  className="p-2 bg-[#555] hover:bg-[#777] border-2 border-[#000] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs font-bold text-white flex flex-col items-center gap-1 cursor-pointer"
                >
                  <CloudRain className="w-4 h-4 text-[#55FFFF]" />
                  <span>Lluvia</span>
                </button>

                <button
                  onClick={() => runCheat('/weather thunder')}
                  className="p-2 bg-[#555] hover:bg-[#777] border-2 border-[#000] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs font-bold text-white flex flex-col items-center gap-1 cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-[#FFFF55]" />
                  <span>Tormenta</span>
                </button>
              </div>
            </div>
          </div>

          {/* 4. Multiplicadores de Velocidad y Salto */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#FFFF55] mb-2 flex items-center gap-1.5">
              <Gauge className="w-4 h-4" /> Velocidad & Super Salto
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => runCheat('/speed 1')}
                className="p-2 bg-[#555] hover:bg-[#777] border-2 border-[#000] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs font-bold text-white cursor-pointer"
              >
                Velocidad 1x
              </button>
              <button
                onClick={() => runCheat('/speed 2.5')}
                className="p-2 bg-[#1e1e1e] hover:bg-[#333] border-2 border-[#FFFF55] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs font-bold text-[#FFFF55] cursor-pointer"
              >
                ⚡ Velocidad 2.5x
              </button>
              <button
                onClick={() => runCheat('/speed 5')}
                className="p-2 bg-[#1e1e1e] hover:bg-[#333] border-2 border-[#FFAA00] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs font-bold text-[#FFAA00] cursor-pointer"
              >
                🚀 Flash 5x
              </button>
              <button
                onClick={() => runCheat('/jump 2.5')}
                className="p-2 bg-[#1e1e1e] hover:bg-[#333] border-2 border-[#55FFFF] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs font-bold text-[#55FFFF] flex items-center justify-center gap-1 cursor-pointer"
              >
                <ArrowUpCircle className="w-4 h-4" />
                <span>Super Salto 2.5x</span>
              </button>
            </div>
          </div>

          {/* 5. Generación de Estructuras y Teletransporte a Biomas */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#55FFFF] mb-2 flex items-center gap-1.5">
              <span>🏗️</span> Generación de Estructuras y Teletransporte a Biomas
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              <button
                onClick={() => runCheat('/structureGenerate=structureType=casa_madera')}
                className="p-2 bg-[#1e1e1e] hover:bg-[#333] border-2 border-[#FFAA00] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-left text-xs text-[#FFAA00] font-bold cursor-pointer"
              >
                <div>🏡 Casa de Madera</div>
                <div className="text-[10px] text-[#AAA] font-normal font-mono">/structureGenerate=...</div>
              </button>
              <button
                onClick={() => runCheat('/structureGenerate=structureType=templo_desierto')}
                className="p-2 bg-[#1e1e1e] hover:bg-[#333] border-2 border-[#FFAA00] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-left text-xs text-[#FFAA00] font-bold cursor-pointer"
              >
                <div>🏜️ Templo Desierto</div>
                <div className="text-[10px] text-[#AAA] font-normal font-mono">/structureGenerate=...</div>
              </button>
              <button
                onClick={() => runCheat('/structureGenerate=structureType=garaje_dulce')}
                className="p-2 bg-[#1e1e1e] hover:bg-[#333] border-2 border-[#FF55FF] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-left text-xs text-[#FF55FF] font-bold cursor-pointer"
              >
                <div>🛻 Garaje Dulce</div>
                <div className="text-[10px] text-[#AAA] font-normal font-mono">/structureGenerate=...</div>
              </button>
              <button
                onClick={() => runCheat('/structureGenerate=structureType=torre_vigia')}
                className="p-2 bg-[#1e1e1e] hover:bg-[#333] border-2 border-[#FFAA00] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-left text-xs text-[#FFAA00] font-bold cursor-pointer"
              >
                <div>🏰 Torre Vigía</div>
                <div className="text-[10px] text-[#AAA] font-normal font-mono">/structureGenerate=...</div>
              </button>
              <button
                onClick={() => runCheat('/structureGenerate=structureType=fuente_agua')}
                className="p-2 bg-[#1e1e1e] hover:bg-[#333] border-2 border-[#55FFFF] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-left text-xs text-[#55FFFF] font-bold cursor-pointer"
              >
                <div>⛲ Fuente Monumental</div>
                <div className="text-[10px] text-[#AAA] font-normal font-mono">/structureGenerate=...</div>
              </button>
              <button
                onClick={() => runCheat('/structureGenerate=structureType=cabaña_dulce')}
                className="p-2 bg-[#1e1e1e] hover:bg-[#333] border-2 border-[#FF55FF] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-left text-xs text-[#FF55FF] font-bold cursor-pointer"
              >
                <div>🍬 Cabaña Dulce</div>
                <div className="text-[10px] text-[#AAA] font-normal font-mono">/structureGenerate=...</div>
              </button>
              <button
                onClick={() => runCheat('/tpBiome=dimensionType=chocolate')}
                className="p-2 bg-[#1e1e1e] hover:bg-[#333] border-2 border-[#FF55FF] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-left text-xs text-[#FF55FF] font-bold cursor-pointer"
              >
                <div>🍫 Bioma Chocolate</div>
                <div className="text-[10px] text-[#AAA] font-normal font-mono">/tpBiome=...</div>
              </button>
              <button
                onClick={() => runCheat('/tpBiome=dimensionType=the_end')}
                className="p-2 bg-[#1e1e1e] hover:bg-[#333] border-2 border-[#FF55FF] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-left text-xs text-[#FF55FF] font-bold cursor-pointer"
              >
                <div>🌌 Bioma The End</div>
                <div className="text-[10px] text-[#AAA] font-normal font-mono">/tpBiome=...</div>
              </button>
              <button
                onClick={() => runCheat('/tpBiome=dimensionType=desert')}
                className="p-2 bg-[#1e1e1e] hover:bg-[#333] border-2 border-[#FFFF55] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-left text-xs text-[#FFFF55] font-bold cursor-pointer"
              >
                <div>🏜️ Bioma Desierto</div>
                <div className="text-[10px] text-[#AAA] font-normal font-mono">/tpBiome=...</div>
              </button>
              <button
                onClick={() => runCheat('/tpBiome=dimensionType=mountains')}
                className="p-2 bg-[#1e1e1e] hover:bg-[#333] border-2 border-[#55FF55] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-left text-xs text-[#55FF55] font-bold cursor-pointer"
              >
                <div>⛰️ Bioma Montañas</div>
                <div className="text-[10px] text-[#AAA] font-normal font-mono">/tpBiome=...</div>
              </button>
            </div>
          </div>

          {/* 6. Invocación de Mobs y TNT */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#FFFF55] mb-2 flex items-center gap-1.5">
              <Bomb className="w-4 h-4" /> Explosiones y Criaturas (Mobs)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                onClick={() => runCheat('/tnt 6')}
                className="p-2.5 bg-[#FF5555] hover:bg-[#ff7777] border-2 border-[#000] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs font-bold text-black flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Bomb className="w-4 h-4 text-black" />
                <span>Lluvia de TNT (x6)</span>
              </button>

              <button
                onClick={() => runCheat('/explode 8')}
                className="p-2.5 bg-[#FFAA00] hover:bg-[#ffbb22] border-2 border-[#000] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs font-bold text-black flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Flame className="w-4 h-4 text-black" />
                <span>Bomba Atómica</span>
              </button>

              <button
                onClick={() => runCheat('/summon pig 3')}
                className="p-2.5 bg-[#555] hover:bg-[#777] border-2 border-[#000] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs font-bold text-white flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>🐷 Cerdos (x3)</span>
              </button>

              <button
                onClick={() => runCheat('/summon sheep 3')}
                className="p-2.5 bg-[#555] hover:bg-[#777] border-2 border-[#000] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs font-bold text-white flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>🐑 Ovejas (x3)</span>
              </button>

              <button
                onClick={() => runCheat('/summon cow 2')}
                className="p-2.5 bg-[#555] hover:bg-[#777] border-2 border-[#000] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs font-bold text-white flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>🐄 Vacas (x2)</span>
              </button>

              <button
                onClick={() => runCheat('/summon zombie 3')}
                className="p-2.5 bg-[#1e1e1e] hover:bg-[#333] border-2 border-[#55FF55] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs font-bold text-[#55FF55] flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>🧟 Zombies (x3)</span>
              </button>

              <button
                onClick={() => runCheat('/summon creeper 2')}
                className="p-2.5 bg-[#1e1e1e] hover:bg-[#333] border-2 border-[#55FF55] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs font-bold text-[#55FF55] flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>🧨 Creepers (x2)</span>
              </button>

              <button
                onClick={() => runCheat('/clear')}
                className="p-2.5 bg-[#555] hover:bg-[#FF5555] hover:text-black border-2 border-[#000] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs font-bold text-white flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Limpiar Entidades</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#1e1e1e] border-t-4 border-[#000] flex justify-between items-center text-xs text-[#AAA]">
          <span>Escribe comandos con <strong className="text-[#FFFF55]">T</strong> o <strong className="text-[#FFFF55]">/</strong> en el chat.</span>
          <button
            onClick={onClose}
            className="bg-[#FFFF55] hover:bg-[#ffff77] text-black font-bold px-4 py-1.5 border-2 border-[#000] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer transition-all"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
