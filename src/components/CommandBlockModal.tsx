import React, { useState, useEffect } from 'react';
import { X, Play, Save, Terminal, Sparkles, Check, AlertCircle } from 'lucide-react';
import { sounds } from '../game/audio';

export interface CommandBlockTarget {
  x: number;
  y: number;
  z: number;
  command?: string;
}

interface CommandBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetBlock: CommandBlockTarget | null;
  onExecuteCommand: (cmd: string) => { success: boolean; message: string };
  onSaveCommand: (x: number, y: number, z: number, cmd: string) => void;
}

export const CommandBlockModal: React.FC<CommandBlockModalProps> = ({
  isOpen,
  onClose,
  targetBlock,
  onExecuteCommand,
  onSaveCommand,
}) => {
  const [command, setCommand] = useState('');
  const [lastResult, setLastResult] = useState<{ success: boolean; text: string } | null>(null);
  const [mode, setMode] = useState<'impulse' | 'repeat' | 'chain'>('impulse');

  useEffect(() => {
    if (targetBlock) {
      setCommand(targetBlock.command || '');
      setLastResult(null);
    }
  }, [targetBlock]);

  if (!isOpen || !targetBlock) return null;

  const handleRun = () => {
    if (!command.trim()) return;
    const res = onExecuteCommand(command.trim());
    setLastResult({ success: res.success, text: res.message });
  };

  const handleSave = () => {
    onSaveCommand(targetBlock.x, targetBlock.y, targetBlock.z, command.trim());
    sounds.playCheatSuccess();
    setLastResult({
      success: true,
      text: `💾 Comando guardado exitosamente en el Bloque de Trucos [${targetBlock.x}, ${targetBlock.y}, ${targetBlock.z}].`,
    });
  };

  const quickCheats = [
    { label: '☀️ Hacer de Día', cmd: '/time set day' },
    { label: '🌙 Hacer de Noche', cmd: '/time set night' },
    { label: '⛈️ Tormenta', cmd: '/weather thunder' },
    { label: '🌤️ Despejar Clima', cmd: '/weather clear' },
    { label: '🎨 Modo Creativo', cmd: '/gamemode creative' },
    { label: '⚔️ Supervivencia', cmd: '/gamemode survival' },
    { label: '🕊️ Modo Espectador', cmd: '/gamemode spectator' },
    { label: '🪽 Activar Élitros', cmd: '/elytra' },
    { label: '💖 Curación Completa', cmd: '/heal' },
    { label: '🏡 Generar Casa Madera', cmd: '/structureGenerate=structureType=casa_madera' },
    { label: '🏜️ Generar Templo', cmd: '/structureGenerate=structureType=templo_desierto' },
    { label: '🛻 Generar Garaje Dulce', cmd: '/structureGenerate=structureType=garaje_dulce' },
    { label: '🍫 Bioma Valle Chocolate', cmd: '/tpBiome=dimensionType=chocolate' },
    { label: '🌌 Bioma El Fin (The End)', cmd: '/tpBiome=dimensionType=the_end' },
    { label: '🔥 Bioma Nether', cmd: '/tpBiome=dimensionType=nether' },
    { label: '🪞 Bioma Mundo Paralelo', cmd: '/tpBiome=dimensionType=parallel' },
    { label: '🏜️ Bioma Desierto', cmd: '/tpBiome=dimensionType=desert' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 font-mono select-none">
      <div className="relative w-full max-w-2xl bg-zinc-900 border-2 border-amber-500/60 rounded-xl shadow-2xl overflow-hidden text-zinc-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-amber-950/80 via-zinc-900 to-zinc-900 border-b border-amber-500/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-600/30 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-inner">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-amber-300 flex items-center gap-2">
                Bloque de Trucos (Comandos)
                <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-400/30">
                  [{targetBlock.x}, {targetBlock.y}, {targetBlock.z}]
                </span>
              </h2>
              <p className="text-xs text-zinc-400">Programa o dispara trucos de consola, generación y teletransporte</p>
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
          {/* Mode Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Tipo de Bloque:</span>
            <div className="flex bg-zinc-800 p-0.5 rounded-lg border border-zinc-700">
              <button
                type="button"
                onClick={() => setMode('impulse')}
                className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                  mode === 'impulse' ? 'bg-amber-600 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                ⚡ Impulso
              </button>
              <button
                type="button"
                onClick={() => setMode('repeat')}
                className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                  mode === 'repeat' ? 'bg-purple-600 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                🔄 Repetición
              </button>
              <button
                type="button"
                onClick={() => setMode('chain')}
                className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                  mode === 'chain' ? 'bg-emerald-600 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                🔗 Cadena
              </button>
            </div>
          </div>

          {/* Command Input */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5 font-bold">
              Línea de Comando de la Consola:
            </label>
            <div className="relative">
              <input
                type="text"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleRun();
                  }
                }}
                placeholder="Ejemplo: /structureGenerate=structureType=casa_madera o /tpBiome=dimensionType=chocolate"
                className="w-full px-4 py-3 bg-zinc-950 border border-zinc-700 rounded-lg text-emerald-400 font-mono text-sm placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              />
            </div>
          </div>

          {/* Quick Cheat Presets */}
          <div>
            <span className="block text-xs uppercase tracking-wider text-zinc-400 mb-2 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Atajos de Trucos Rápidos (1 Clic):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-44 overflow-y-auto pr-1">
              {quickCheats.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setCommand(q.cmd);
                    sounds.playClick();
                  }}
                  className="px-2.5 py-1.5 text-left bg-zinc-800/80 hover:bg-zinc-700 hover:border-amber-400/50 border border-zinc-700/60 rounded text-xs text-zinc-300 hover:text-white transition-all truncate"
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>

          {/* Execution Output Banner */}
          {lastResult && (
            <div
              className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
                lastResult.success
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                  : 'bg-red-950/40 border-red-500/50 text-red-300'
              }`}
            >
              {lastResult.success ? (
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              )}
              <div className="whitespace-pre-wrap leading-relaxed">{lastResult.text}</div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-5 py-3 bg-zinc-950 border-t border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-colors"
          >
            Cerrar
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white text-xs font-bold transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              Guardar en Bloque
            </button>
            <button
              type="button"
              onClick={handleRun}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-600/30 transition-all active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              Ejecutar Comando
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
