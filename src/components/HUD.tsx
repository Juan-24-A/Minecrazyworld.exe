import React, { useState, useEffect } from 'react';
import { InventoryItem, PlayerStats } from '../types';
import { ItemRenderer } from './ItemRenderer';
import { 
  Sparkles, 
  Terminal, 
  Package, 
  Settings, 
  Feather, 
  Compass, 
  Sun, 
  Moon, 
  CloudRain, 
  Zap,
  Eye,
  ShieldCheck,
  Ghost,
  Users,
  Globe
} from 'lucide-react';

interface HUDProps {
  stats: PlayerStats;
  hotbar: InventoryItem[];
  selectedSlot: number;
  onSelectSlot: (idx: number) => void;
  onOpenInventory: () => void;
  onOpenCheats: () => void;
  onOpenConsole: () => void;
  onOpenSettings: () => void;
  onOpenMultiplayer: () => void;
  onToggleFly: () => void;
  isLocked: boolean;
  onLockPointer: () => void;
  isMultiplayerConnected?: boolean;
  multiplayerPlayerCount?: number;
  roomCode?: string;
}

export const HUD: React.FC<HUDProps> = ({
  stats,
  hotbar,
  selectedSlot,
  onSelectSlot,
  onOpenInventory,
  onOpenCheats,
  onOpenConsole,
  onOpenSettings,
  onOpenMultiplayer,
  onToggleFly,
  isLocked,
  onLockPointer,
  isMultiplayerConnected = false,
  multiplayerPlayerCount = 1,
  roomCode = '',
}) => {
  const [activeItemName, setActiveItemName] = useState<string>('');
  const [nameTimer, setNameTimer] = useState<number | null>(null);

  const currentItem = hotbar[selectedSlot];

  useEffect(() => {
    if (currentItem) {
      setActiveItemName(currentItem.name);
      if (nameTimer) clearTimeout(nameTimer);
      const timer = window.setTimeout(() => {
        setActiveItemName('');
      }, 2000);
      setNameTimer(timer);
    }
  }, [selectedSlot, currentItem?.id]);

  const formatTime = (ticks: number) => {
    const hours = Math.floor((ticks / 1000 + 6) % 24);
    const minutes = Math.floor(((ticks % 1000) / 1000) * 60);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours % 12 === 0 ? 12 : hours % 12;
    return `${displayHour}:${minutes < 10 ? '0' : ''}${minutes} ${ampm}`;
  };

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-10 flex flex-col justify-between p-4 sm:p-6 font-mono text-white">
      {/* Top Header Bar */}
      <div className="flex justify-between items-start w-full">
        {/* Left Side: Minecrazyworld Creative & Status Box */}
        <div className="bg-[#313233]/90 border-4 border-[#000] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-5 w-72 sm:w-80 pointer-events-auto">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-lg sm:text-xl font-black text-[#FFFF55] drop-shadow-[1px_1px_0px_#000] tracking-wider uppercase">
              Minecrazyworld
            </h1>
            <span className="text-[10px] bg-[#1e1e1e] text-[#55FFFF] border border-[#555] px-1.5 py-0.5 font-bold uppercase">
              {stats.gamemode}
            </span>
          </div>

          <div className="space-y-1.5 text-xs mb-3">
            <div className="flex justify-between items-center bg-[#1e1e1e] p-1.5 border-2 border-[#555]">
              <span className="font-bold text-zinc-200">VUELO (F)</span>
              <span className={stats.isFlying ? 'text-[#55FF55] font-bold' : 'text-[#FF5555] font-bold'}>
                [{stats.isFlying ? 'ACTIVADO' : 'DESACTIVADO'}]
              </span>
            </div>

            <div className="flex justify-between items-center bg-[#1e1e1e] p-1.5 border-2 border-[#555]">
              <span className="font-bold text-zinc-200">MODO DIOS</span>
              <span className={stats.isGodmode ? 'text-[#55FF55] font-bold' : 'text-[#FF5555] font-bold'}>
                [{stats.isGodmode ? 'ACTIVADO' : 'DESACTIVADO'}]
              </span>
            </div>

            <div className="flex justify-between items-center bg-[#1e1e1e] p-1.5 border-2 border-[#555]">
              <span className="font-bold text-zinc-200">MULTIJUGADOR</span>
              <span className={isMultiplayerConnected ? 'text-[#55FF55] font-bold' : 'text-[#55FFFF] font-bold'}>
                [{isMultiplayerConnected ? `${multiplayerPlayerCount} P` : 'SOLO'}]
              </span>
            </div>
          </div>

          {/* Quick Action Navigation Bar inside header */}
          <div className="pt-2 border-t-2 border-[#555]">
            <div className="grid grid-cols-2 gap-1.5">
              <button
                id="btn-multiplayer-modal"
                onClick={onOpenMultiplayer}
                className="bg-[#55FFFF] hover:bg-[#88ffff] text-black font-bold p-1.5 text-xs border-2 border-[#000] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <Users className="w-3.5 h-3.5" />
                <span>ONLINE (M)</span>
              </button>

              <button
                id="btn-cheats-modal"
                onClick={onOpenCheats}
                className="bg-[#FFFF55] hover:bg-[#ffff77] text-black font-bold p-1.5 text-xs border-2 border-[#000] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>TRUCOS (T)</span>
              </button>

              <button
                id="btn-inventory"
                onClick={onOpenInventory}
                className="bg-[#555] hover:bg-[#777] p-1.5 text-xs border-2 border-[#000] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-white font-bold cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-1"
              >
                <Package className="w-3.5 h-3.5" />
                <span>BLOQUES (E)</span>
              </button>

              <button
                id="btn-quick-fly"
                onClick={onToggleFly}
                className={`p-1.5 text-xs border-2 border-[#000] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-1 ${
                  stats.isFlying ? 'bg-[#55FF55] text-black' : 'bg-[#555] hover:bg-[#777] text-white'
                }`}
              >
                <Feather className="w-3.5 h-3.5" />
                <span>VOLAR (F)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Center: Boss Bar (Ender Dragon) */}
        {stats.boss && stats.boss.active && stats.boss.health > 0 && (
          <div className="flex-1 max-w-md mx-4 pointer-events-auto bg-[#1e0a2e]/95 border-4 border-[#000] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-2.5 sm:p-3 animate-fade-in">
            <div className="flex items-center justify-between w-full mb-1.5 px-1">
              <span className="text-xs sm:text-sm font-black text-[#d870ff] drop-shadow-[2px_2px_0px_#000] tracking-wider uppercase flex items-center gap-1.5">
                <span className="text-base">🐲</span> {stats.boss.name}
              </span>
              <span className="text-[11px] sm:text-xs font-bold text-white drop-shadow-[1px_1px_0px_#000]">
                {Math.ceil(stats.boss.health)} / {stats.boss.maxHealth} HP
              </span>
            </div>
            <div className="w-full h-4 sm:h-5 bg-[#0d0214] border-2 border-[#552277] relative overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-[#9333ea] via-[#c084fc] to-[#f472b6] transition-all duration-150"
                style={{ width: `${Math.max(0, Math.min(100, (stats.boss.health / stats.boss.maxHealth) * 100))}%` }}
              />
              <div className="absolute inset-0 flex justify-between pointer-events-none px-2">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="w-[1px] h-full bg-black/50" />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Right Side: Debug Info, Coords & Online Status */}
        <div className="text-right pointer-events-auto bg-[#313233]/80 border-4 border-[#000] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-3 px-4 space-y-1">
          <div className="flex items-center justify-end gap-2">
            {isMultiplayerConnected && (
              <span className="text-xs px-2 py-0.5 bg-[#183a2b] text-[#55FF55] border border-[#55FF55] font-bold animate-pulse">
                SALA: {roomCode}
              </span>
            )}
            <div className="text-xl sm:text-2xl font-black drop-shadow-[2px_2px_0px_#000] text-[#55FF55]">
              {stats.fps || 60} FPS
            </div>
          </div>
          <div className="text-xs sm:text-sm text-white drop-shadow-[1px_1px_0px_#000] font-bold">
            X: {stats.position.x}, Y: {stats.position.y}, Z: {stats.position.z}
          </div>
          <div className="text-xs sm:text-sm text-[#AAA] drop-shadow-[1px_1px_0px_#000]">
            Dimensión: <span className={`font-bold ${
              stats.dimension === 'chocolate' ? 'text-[#ffaa44]' :
              stats.dimension === 'nether' ? 'text-[#ff5555]' :
              stats.dimension === 'the_end' ? 'text-[#d870ff]' :
              stats.dimension === 'parallel' ? 'text-[#00ffff]' :
              'text-[#55ff55]'
            }`}>
              {stats.dimension === 'chocolate' ? '🍫 CHOCOLATE' :
               stats.dimension === 'nether' ? '🔥 NETHER' :
               stats.dimension === 'the_end' ? '🌌 THE END' :
               stats.dimension === 'parallel' ? '🪞 OVERWORLD PARALELO' :
               '🌍 OVERWORLD'}
            </span>
          </div>
          {stats.dimension === 'parallel' && (
            <div className="text-[10px] sm:text-xs text-[#00ffff] font-black drop-shadow-[1px_1px_0px_#000] animate-pulse">
              🪞 W = ATRÁS | S = ADELANTE
            </div>
          )}
          <div className="text-xs sm:text-sm text-[#AAA] drop-shadow-[1px_1px_0px_#000]">
            Bioma: <span className="text-[#55FFFF] font-bold">{stats.biome}</span>
          </div>
          <div className="text-xs sm:text-sm text-[#AAA] drop-shadow-[1px_1px_0px_#000]">
            Hora: <span className="text-[#FFFF55] font-bold">{formatTime(stats.timeOfDay || 6000)}</span>
          </div>
        </div>
      </div>

      {/* Center Screen Crosshair & Locked Overlay */}
      <div className="flex flex-col items-center justify-center pointer-events-none">
        {!isLocked && (
          <div
            onClick={onLockPointer}
            className="pointer-events-auto bg-[#313233]/95 border-4 border-[#000] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-white p-5 cursor-pointer transition-all max-w-sm text-center mb-6"
          >
            <h3 className="text-lg font-bold text-[#FFFF55] mb-2 tracking-wide uppercase drop-shadow-[1px_1px_0px_#000]">
              ▶ HAZ CLIC PARA JUGAR
            </h3>
            <p className="text-xs text-zinc-300 leading-relaxed mb-3">
              Mueve con <span className="text-[#FFFF55] font-bold">WASD</span>, mira y mina con el <span className="text-[#FFFF55] font-bold">Ratón</span>.
            </p>
            <div className="grid grid-cols-2 gap-1.5 text-left text-[11px] bg-[#1e1e1e] p-2 border-2 border-[#555]">
              <div><span className="text-[#55FFFF] font-bold">[E]</span> Inventario</div>
              <div><span className="text-[#55FFFF] font-bold">[T / /]</span> Trucos</div>
              <div><span className="text-[#55FFFF] font-bold">[Doble Espacio]</span> Volar</div>
              <div><span className="text-[#55FFFF] font-bold">[1-9]</span> Barra rápida</div>
            </div>
          </div>
        )}

        {/* Precision Crosshair with Aperture Frame */}
        <div className="w-4 h-4 border-2 border-white opacity-70 relative">
          <div className="absolute top-1/2 left-[-5px] right-[-5px] h-[2px] bg-white -translate-y-1/2" />
          <div className="absolute left-1/2 top-[-5px] bottom-[-5px] w-[2px] bg-white -translate-x-1/2" />
        </div>
      </div>

      {/* Bottom Section: Hearts/Hunger + Item Label + Hotbar */}
      <div className="flex flex-col items-center gap-2 pointer-events-auto">
        {/* Vehicle Controls Banner */}
        {stats.isDrivingTruck && (
          <div className="bg-[#1e1e1e]/95 border-2 border-[#55FFFF] px-4 py-2 text-center shadow-[2px_2px_0px_#000] pointer-events-auto">
            <div className="text-[#55FFFF] font-black text-sm drop-shadow-[1px_1px_0px_#000] flex items-center justify-center gap-2">
              <span>🛻 CONDUCIENDO CAMIONETA DULCE</span>
              {stats.truckColor && (
                <span className="text-[11px] bg-black/60 px-2 py-0.5 rounded border border-[#55FFFF]">
                  Color: {stats.truckColor}
                </span>
              )}
            </div>
            <div className="text-[11px] text-zinc-300 mt-1 flex flex-wrap items-center justify-center gap-2 sm:gap-4">
              <span><b className="text-white">[W / S]</b> Acelerar / Reversa</span>
              <span><b className="text-white">[A / D]</b> Girar</span>
              <span><b className="text-[#55FF55]">[C]</b> Cambiar Color</span>
              <span><b className="text-[#FFFF55]">[Espacio]</b> Turbo Salto</span>
              <span><b className="text-[#FF5555]">[E / V]</b> Bajar</span>
              <span><b className="text-[#FF55EE]">[Doble Clic]</b> Guardar como Ítem</span>
            </div>
          </div>
        )}

        {stats.isGliding && (
          <div className="bg-[#1e1e1e]/95 border-2 border-[#a855f7] px-4 py-2 text-center shadow-[2px_2px_0px_#000] pointer-events-auto animate-pulse">
            <div className="text-[#c084fc] font-black text-sm drop-shadow-[1px_1px_0px_#000]">
              🪽 ¡PLANEANDO CON ÉLITROS ACTIVADOS!
            </div>
            <div className="text-[11px] text-zinc-300 mt-0.5 flex flex-wrap items-center justify-center gap-2 sm:gap-4">
              <span><b className="text-[#FFFF55]">[Mira hacia abajo]</b> Tomar velocidad</span>
              <span><b className="text-[#55FFFF]">[Mira hacia arriba]</b> Ganar altura</span>
              <span><b className="text-[#FF5555]">[Cohete en mano + Clic Derecho]</b> ¡Propulsión pirotécnica!</span>
              <span><b className="text-white">[Shift]</b> Descender / Aterrizar</span>
            </div>
          </div>
        )}

        {!stats.isDrivingTruck && stats.nearTruck && (
          <div className="bg-[#1e1e1e]/90 border-2 border-[#FFAA00] px-3 py-1.5 text-center shadow-[2px_2px_0px_#000]">
            <span className="text-[#FFAA00] font-bold text-xs">🛻 Camioneta cerca: [E o Clic Derecho] Conducir | [C] Cambiar Color | [Doble Clic] Guardar Ítem</span>
          </div>
        )}

        {/* Active item pop-up banner */}
        {activeItemName && (
          <div className="bg-[#313233]/95 text-[#FFFF55] text-xs font-bold px-4 py-1.5 border-2 border-[#000] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] tracking-wider uppercase">
            {activeItemName}
          </div>
        )}

        {/* Survival Status Bars (Vibrant Hearts & Food Drumsticks) */}
        {stats.gamemode === 'survival' && (
          <div className="flex justify-between w-full max-w-sm mb-1 px-2 items-center">
            {/* Health Hearts (Square Vibrant Red Blocks) */}
            <div className="flex gap-1">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 sm:w-5 sm:h-5 border border-black shadow-[1px_1px_0px_#000] ${
                    i * 2 < stats.health ? 'bg-[#FF5555]' : 'bg-[#313233] opacity-40'
                  }`}
                />
              ))}
            </div>

            {/* Hunger Drumsticks (Square Vibrant Gold/Orange Blocks) */}
            <div className="flex gap-1">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 sm:w-5 sm:h-5 border border-black shadow-[1px_1px_0px_#000] rounded-sm ${
                    i * 2 < stats.hunger ? 'bg-[#FFAA00]' : 'bg-[#313233] opacity-40'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* 9-Slot Hotbar Aligned with Vibrant Palette */}
        <div className="bg-[#313233]/85 border-4 border-[#8B8B8B] p-1 flex gap-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] backdrop-blur-sm">
          {hotbar.map((item, idx) => {
            const isSelected = idx === selectedSlot;
            return (
              <button
                key={idx}
                id={`hotbar-slot-${idx}`}
                onClick={() => onSelectSlot(idx)}
                title={`${item?.name || 'Vacío'} (${idx + 1})`}
                className={`relative w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center p-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#8B8B8B] border-4 border-[#FFF] shadow-inner scale-105 z-10'
                    : 'bg-[#1e1e1e] border-4 border-[#313233] opacity-85 hover:opacity-100 hover:border-[#555]'
                }`}
              >
                {/* Hotbar Slot Number */}
                <span className="absolute top-0.5 left-1 text-[9px] font-mono text-[#FFFF55] font-bold drop-shadow-[1px_1px_0px_#000]">
                  {idx + 1}
                </span>

                {/* Item 3D Isometric / Icon Visual */}
                {item ? (
                  <ItemRenderer item={item} size={38} />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

