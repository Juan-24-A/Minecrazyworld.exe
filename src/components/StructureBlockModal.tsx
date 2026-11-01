import React, { useState } from 'react';
import { X, Box, Check, Copy, Hammer, Sparkles, Layers } from 'lucide-react';
import { STRUCTURE_CATALOG, StructureInfo } from '../game/structures';
import { sounds } from '../game/audio';

export interface StructureBlockTarget {
  x: number;
  y: number;
  z: number;
}

interface StructureBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetBlock: StructureBlockTarget | null;
  onGenerateStructure: (structId: string, x: number, y: number, z: number) => { success: boolean; message: string };
}

export const StructureBlockModal: React.FC<StructureBlockModalProps> = ({
  isOpen,
  onClose,
  targetBlock,
  onGenerateStructure,
}) => {
  const [selectedStruct, setSelectedStruct] = useState<StructureInfo>(STRUCTURE_CATALOG[0]);
  const [offsetX, setOffsetX] = useState(1);
  const [offsetY, setOffsetY] = useState(0);
  const [offsetZ, setOffsetZ] = useState(1);
  const [copied, setCopied] = useState(false);
  const [lastMessage, setLastMessage] = useState<{ success: boolean; text: string } | null>(null);

  if (!isOpen || !targetBlock) return null;

  const spawnX = targetBlock.x + offsetX;
  const spawnY = targetBlock.y + offsetY;
  const spawnZ = targetBlock.z + offsetZ;

  const commandText = `/structureGenerate=structureType=${selectedStruct.id}`;

  const handleGenerate = () => {
    sounds.playPlace();
    const res = onGenerateStructure(selectedStruct.id, spawnX, spawnY, spawnZ);
    setLastMessage({ success: res.success, text: res.message });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(commandText);
    setCopied(true);
    sounds.playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 font-mono select-none">
      <div className="relative w-full max-w-3xl bg-zinc-900 border-2 border-cyan-500/60 rounded-xl shadow-2xl overflow-hidden text-zinc-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-cyan-950/80 via-zinc-900 to-zinc-900 border-b border-cyan-500/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-600/30 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-inner">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-cyan-300 flex items-center gap-2">
                Bloque de Estructuras
                <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-400/30">
                  [{targetBlock.x}, {targetBlock.y}, {targetBlock.z}]
                </span>
              </h2>
              <p className="text-xs text-zinc-400">Selecciona, previsualiza y genera estructuras arquitectónicas en el mundo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
          {/* Structure Selector Grid */}
          <div>
            <span className="block text-xs uppercase tracking-wider text-zinc-400 mb-2 font-bold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              Catálogo de Estructuras Disponibles:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {STRUCTURE_CATALOG.map((struct) => {
                const isSelected = selectedStruct.id === struct.id;
                return (
                  <div
                    key={struct.id}
                    onClick={() => {
                      setSelectedStruct(struct);
                      sounds.playClick();
                    }}
                    className={`p-3 rounded-lg border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-cyan-950/60 border-cyan-400 shadow-md shadow-cyan-900/40 ring-1 ring-cyan-400/50'
                        : 'bg-zinc-800/70 border-zinc-700/70 hover:bg-zinc-800 hover:border-zinc-500'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-2xl">{struct.icon}</span>
                        <div>
                          <h4 className="text-xs font-bold text-white truncate">{struct.name}</h4>
                          <span className="text-[10px] text-zinc-400">
                            {struct.dimensions.x}x{struct.dimensions.y}x{struct.dimensions.z} bloques
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-zinc-400 line-clamp-2 leading-tight">{struct.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Placement Offsets & Preview */}
          <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs uppercase tracking-wider text-cyan-400 font-bold">Punto de Generación:</span>
                <div className="text-sm font-mono text-zinc-200 mt-0.5">
                  X: <span className="text-cyan-300 font-bold">{spawnX}</span> | Y:{' '}
                  <span className="text-cyan-300 font-bold">{spawnY}</span> | Z:{' '}
                  <span className="text-cyan-300 font-bold">{spawnZ}</span>
                </div>
              </div>

              {/* Offset Inputs */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400">Desplazamiento:</span>
                <div className="flex items-center gap-1.5">
                  <label className="text-[11px] text-zinc-400">dX:</label>
                  <input
                    type="number"
                    value={offsetX}
                    onChange={(e) => setOffsetX(parseInt(e.target.value, 10) || 0)}
                    className="w-12 px-1.5 py-1 bg-zinc-900 border border-zinc-700 rounded text-xs text-center text-white"
                  />
                  <label className="text-[11px] text-zinc-400">dY:</label>
                  <input
                    type="number"
                    value={offsetY}
                    onChange={(e) => setOffsetY(parseInt(e.target.value, 10) || 0)}
                    className="w-12 px-1.5 py-1 bg-zinc-900 border border-zinc-700 rounded text-xs text-center text-white"
                  />
                  <label className="text-[11px] text-zinc-400">dZ:</label>
                  <input
                    type="number"
                    value={offsetZ}
                    onChange={(e) => setOffsetZ(parseInt(e.target.value, 10) || 0)}
                    className="w-12 px-1.5 py-1 bg-zinc-900 border border-zinc-700 rounded text-xs text-center text-white"
                  />
                </div>
              </div>
            </div>

            {/* Equivalent Command Line */}
            <div className="flex items-center justify-between gap-2 px-3 py-2 bg-zinc-900 rounded border border-zinc-800">
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="text-xs text-zinc-500 font-bold shrink-0">Comando:</span>
                <span className="text-xs text-emerald-400 font-mono truncate select-all">{commandText}</span>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold shrink-0 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? '¡Copiado!' : 'Copiar'}
              </button>
            </div>
          </div>

          {/* Feedback banner */}
          {lastMessage && (
            <div
              className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
                lastMessage.success
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                  : 'bg-red-950/40 border-red-500/50 text-red-300'
              }`}
            >
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{lastMessage.text}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 bg-zinc-950 border-t border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-colors"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/30 transition-all active:scale-95"
          >
            <Hammer className="w-4 h-4" />
            Generar Estructura Ahora
          </button>
        </div>
      </div>
    </div>
  );
};
