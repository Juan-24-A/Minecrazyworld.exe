import React, { useState } from 'react';
import { Settings, X, Volume2, VolumeX, Eye, Sliders, Keyboard, Download, Upload, Plus, Save, Compass } from 'lucide-react';
import { WorldType } from '../types';
import { sounds } from '../game/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  renderDistance: number;
  onChangeRenderDistance: (val: number) => void;
  fov: number;
  onChangeFov: (val: number) => void;
  sensitivity: number;
  onChangeSensitivity: (val: number) => void;
  timeSpeed: number;
  onChangeTimeSpeed: (val: number) => void;
  onSaveWorld: () => void;
  onExportWorld: () => void;
  onImportWorld: (file: File) => void;
  onCreateNewWorld: (type: WorldType, seed: number) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  renderDistance,
  onChangeRenderDistance,
  fov,
  onChangeFov,
  sensitivity,
  onChangeSensitivity,
  timeSpeed,
  onChangeTimeSpeed,
  onSaveWorld,
  onExportWorld,
  onImportWorld,
  onCreateNewWorld,
}) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'world' | 'controls'>('settings');
  const [soundEnabled, setSoundEnabled] = useState(sounds.enabled);
  const [soundVol, setSoundVol] = useState(sounds.volume);

  // New world creation state
  const [newWorldType, setNewWorldType] = useState<WorldType>('default');
  const [newWorldSeed, setNewWorldSeed] = useState<string>(() => Math.floor(Math.random() * 999999).toString());

  if (!isOpen) return null;

  const handleToggleSound = () => {
    sounds.enabled = !soundEnabled;
    setSoundEnabled(sounds.enabled);
  };

  const handleVolumeChange = (v: number) => {
    sounds.volume = v;
    setSoundVol(v);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImportWorld(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 font-mono select-none">
      <div className="bg-[#313233] text-white border-4 border-[#000] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-2xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#1e1e1e] p-3.5 px-5 flex justify-between items-center border-b-4 border-[#000]">
          <div className="flex items-center gap-2 font-bold text-sm text-[#FFFF55]">
            <Settings className="w-4 h-4 text-[#FFFF55]" />
            <span>AJUSTES Y GESTIÓN DEL MUNDO</span>
          </div>
          <button 
            onClick={onClose} 
            className="bg-[#FF5555] hover:bg-[#ff7777] text-black font-bold p-1 border-2 border-[#000] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b-4 border-[#000] bg-[#242526] px-4 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 text-xs font-bold border-2 transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-[#FFFF55] border-[#000] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                : 'bg-[#555] hover:bg-[#777] border-[#000] text-white'
            }`}
          >
            Gráficos y Audio
          </button>
          <button
            onClick={() => setActiveTab('world')}
            className={`px-3 py-1.5 text-xs font-bold border-2 transition-all cursor-pointer ${
              activeTab === 'world'
                ? 'bg-[#FFFF55] border-[#000] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                : 'bg-[#555] hover:bg-[#777] border-[#000] text-white'
            }`}
          >
            Guardar y Crear Mundos
          </button>
          <button
            onClick={() => setActiveTab('controls')}
            className={`px-3 py-1.5 text-xs font-bold border-2 transition-all cursor-pointer ${
              activeTab === 'controls'
                ? 'bg-[#FFFF55] border-[#000] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                : 'bg-[#555] hover:bg-[#777] border-[#000] text-white'
            }`}
          >
            Guía de Controles
          </button>
        </div>

        {/* Tab content */}
        <div className="p-5 overflow-y-auto space-y-4 bg-[#242526] text-xs">
          {activeTab === 'settings' && (
            <div className="space-y-3.5">
              {/* Render Distance */}
              <div className="bg-[#1e1e1e] p-3.5 border-2 border-[#555] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-1.5">
                <div className="flex justify-between font-bold text-white">
                  <span>Distancia de Renderizado (Chunks)</span>
                  <span className="text-[#FFFF55] font-mono">{renderDistance * 2 + 1}x{renderDistance * 2 + 1} ({renderDistance} chunks)</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="5"
                  step="1"
                  value={renderDistance}
                  onChange={(e) => onChangeRenderDistance(parseInt(e.target.value, 10))}
                  className="w-full accent-[#FFFF55] cursor-pointer"
                />
              </div>

              {/* FOV */}
              <div className="bg-[#1e1e1e] p-3.5 border-2 border-[#555] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-1.5">
                <div className="flex justify-between font-bold text-white">
                  <span>Campo de Visión (FOV)</span>
                  <span className="text-[#FFFF55] font-mono">{fov}°</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="110"
                  step="5"
                  value={fov}
                  onChange={(e) => onChangeFov(parseInt(e.target.value, 10))}
                  className="w-full accent-[#FFFF55] cursor-pointer"
                />
              </div>

              {/* Mouse Sensitivity */}
              <div className="bg-[#1e1e1e] p-3.5 border-2 border-[#555] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-1.5">
                <div className="flex justify-between font-bold text-white">
                  <span>Sensibilidad del Ratón</span>
                  <span className="text-[#FFFF55] font-mono">{Math.round(sensitivity * 10000)}%</span>
                </div>
                <input
                  type="range"
                  min="0.001"
                  max="0.005"
                  step="0.0005"
                  value={sensitivity}
                  onChange={(e) => onChangeSensitivity(parseFloat(e.target.value))}
                  className="w-full accent-[#FFFF55] cursor-pointer"
                />
              </div>

              {/* Day/Night speed */}
              <div className="bg-[#1e1e1e] p-3.5 border-2 border-[#555] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-1.5">
                <div className="flex justify-between font-bold text-white">
                  <span>Velocidad del Ciclo Día/Noche</span>
                  <span className="text-[#FFFF55] font-mono">{timeSpeed === 0 ? 'Pausado' : `${timeSpeed}x`}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="8"
                  step="0.5"
                  value={timeSpeed}
                  onChange={(e) => onChangeTimeSpeed(parseFloat(e.target.value))}
                  className="w-full accent-[#FFFF55] cursor-pointer"
                />
              </div>

              {/* Audio Settings */}
              <div className="bg-[#1e1e1e] p-3.5 border-2 border-[#555] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 font-bold text-white">
                    {soundEnabled ? <Volume2 className="w-4 h-4 text-[#55FF55]" /> : <VolumeX className="w-4 h-4 text-[#FF5555]" />}
                    <span>Efectos de Sonido (Pasos, Bloques, TNT)</span>
                  </div>
                  <button
                    onClick={handleToggleSound}
                    className={`px-3 py-1 border-2 border-[#000] font-bold cursor-pointer transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                      soundEnabled ? 'bg-[#55FF55] text-black' : 'bg-[#FF5555] text-black'
                    }`}
                  >
                    {soundEnabled ? 'ACTIVADO' : 'SILENCIADO'}
                  </button>
                </div>

                {soundEnabled && (
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[#AAA] text-[11px]">
                      <span>Volumen Principal</span>
                      <span className="font-mono text-[#FFFF55] font-bold">{Math.round(soundVol * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.05"
                      value={soundVol}
                      onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                      className="w-full accent-[#55FF55] cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'world' && (
            <div className="space-y-4">
              {/* Save & Export Actions */}
              <div className="bg-[#1e1e1e] p-3.5 border-2 border-[#555] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] space-y-3">
                <h4 className="font-bold text-[#FFFF55] flex items-center gap-1.5 uppercase">
                  <Save className="w-4 h-4" /> Guardar y Exportar Tu Mundo
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    onClick={onSaveWorld}
                    className="p-2.5 bg-[#55FF55] hover:bg-[#77ff77] text-black font-bold border-2 border-[#000] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Save className="w-4 h-4" />
                    <span>Guardar en Navegador</span>
                  </button>

                  <button
                    onClick={onExportWorld}
                    className="p-2.5 bg-[#55FFFF] hover:bg-[#77ffff] text-black font-bold border-2 border-[#000] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Descargar Archivo (.json)</span>
                  </button>
                </div>

                {/* Import world file */}
                <div className="pt-2 border-t border-[#444] flex items-center justify-between">
                  <span className="text-[#AAA] text-[11px]">Cargar archivo de mundo guardado:</span>
                  <label className="p-2 bg-[#555] hover:bg-[#777] text-white border-2 border-[#000] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold flex items-center gap-1 cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Importar Mundo (.json)</span>
                    <input type="file" accept=".json" onChange={handleFileInput} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Create New Custom World */}
              <div className="bg-[#1e1e1e] p-3.5 border-2 border-[#555] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] space-y-3">
                <h4 className="font-bold text-[#FFFF55] flex items-center gap-1.5 uppercase">
                  <Plus className="w-4 h-4" /> Crear Nuevo Mundo Procedural
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'default', name: '🌍 Colinas y Árboles' },
                    { id: 'flat', name: '🟩 Superplano (Flat)' },
                    { id: 'mountains', name: '🏔️ Montañas Épicas' },
                    { id: 'islands', name: '🏝️ Islas Flotantes' },
                    { id: 'desert', name: '🏜️ Desierto y Dunas' },
                  ].map((w) => (
                    <button
                      key={w.id}
                      onClick={() => setNewWorldType(w.id as WorldType)}
                      className={`p-2 border-2 text-left font-bold transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                        newWorldType === w.id
                          ? 'bg-[#313233] border-[#FFFF55] text-[#FFFF55]'
                          : 'bg-[#313233] border-[#555] text-white hover:border-[#888]'
                      }`}
                    >
                      {w.name}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 items-center">
                  <div className="flex-1">
                    <label className="text-[11px] text-[#AAA] font-bold block mb-1">Semilla del Mundo (Seed):</label>
                    <input
                      type="number"
                      value={newWorldSeed}
                      onChange={(e) => setNewWorldSeed(e.target.value)}
                      className="w-full bg-[#1e1e1e] border-2 border-[#555] px-3 py-1.5 font-mono text-[#FFFF55] focus:outline-none focus:border-[#FFFF55]"
                    />
                  </div>
                  <button
                    onClick={() => setNewWorldSeed(Math.floor(Math.random() * 999999).toString())}
                    className="mt-5 p-2 bg-[#555] hover:bg-[#777] border-2 border-[#000] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-white text-xs font-bold cursor-pointer"
                  >
                    Aleatorio
                  </button>
                </div>

                <button
                  onClick={() => {
                    const seedNum = parseInt(newWorldSeed, 10) || 12345;
                    onCreateNewWorld(newWorldType, seedNum);
                    onClose();
                  }}
                  className="w-full p-3 bg-[#FFFF55] hover:bg-[#ffff77] text-black font-black border-2 border-[#000] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-pointer transition-all tracking-wider text-sm"
                >
                  🚀 GENERAR NUEVO MUNDO
                </button>
              </div>
            </div>
          )}

          {activeTab === 'controls' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-[#1e1e1e] p-3 border-2 border-[#555] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <span className="font-bold text-[#FFFF55] block mb-2 uppercase">Movimiento</span>
                  <div className="space-y-1.5 text-zinc-300 font-mono text-[11px]">
                    <div><span className="bg-[#313233] text-[#FFFF55] px-1.5 py-0.5 border border-[#555] mr-1">WASD</span> Caminar</div>
                    <div><span className="bg-[#313233] text-[#FFFF55] px-1.5 py-0.5 border border-[#555] mr-1">Espacio</span> Saltar / Vuelo arriba</div>
                    <div><span className="bg-[#313233] text-[#FFFF55] px-1.5 py-0.5 border border-[#555] mr-1">Shift</span> Agacharse / Vuelo abajo</div>
                    <div><span className="bg-[#313233] text-[#FFFF55] px-1.5 py-0.5 border border-[#555] mr-1">Doble Espacio</span> Volar</div>
                  </div>
                </div>

                <div className="bg-[#1e1e1e] p-3 border-2 border-[#555] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <span className="font-bold text-[#FFFF55] block mb-2 uppercase">Acciones de Bloques</span>
                  <div className="space-y-1.5 text-zinc-300 font-mono text-[11px]">
                    <div><span className="bg-[#313233] text-[#FFFF55] px-1.5 py-0.5 border border-[#555] mr-1">Clic Izq</span> Romper / Atacar</div>
                    <div><span className="bg-[#313233] text-[#FFFF55] px-1.5 py-0.5 border border-[#555] mr-1">Clic Der</span> Colocar bloque</div>
                    <div><span className="bg-[#313233] text-[#FFFF55] px-1.5 py-0.5 border border-[#555] mr-1">1 - 9 / Rueda</span> Cambiar ranura</div>
                  </div>
                </div>

                <div className="bg-[#1e1e1e] p-3 border-2 border-[#555] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <span className="font-bold text-[#FFFF55] block mb-2 uppercase">Menús y Trucos</span>
                  <div className="space-y-1.5 text-zinc-300 font-mono text-[11px]">
                    <div><span className="bg-[#313233] text-[#55FFFF] px-1.5 py-0.5 border border-[#555] mr-1">[E]</span> Inventario Creativo</div>
                    <div><span className="bg-[#313233] text-[#55FFFF] px-1.5 py-0.5 border border-[#555] mr-1">[T / /]</span> Consola Trucos</div>
                    <div><span className="bg-[#313233] text-[#55FFFF] px-1.5 py-0.5 border border-[#555] mr-1">[Esc]</span> Liberar Ratón</div>
                  </div>
                </div>

                <div className="bg-[#1e1e1e] p-3 border-2 border-[#555] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <span className="font-bold text-[#FFFF55] block mb-2 uppercase">Comandos Populares</span>
                  <div className="space-y-1 text-[#55FF55] font-mono text-[11px]">
                    <div>/gamemode creative</div>
                    <div>/fly (vuelo libre)</div>
                    <div>/time set day</div>
                    <div>/tnt 6 (lluvia tnt)</div>
                    <div>/summon pig 3</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#1e1e1e] border-t-4 border-[#000] flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#FFFF55] hover:bg-[#ffff77] text-black font-bold px-5 py-1.5 border-2 border-[#000] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
