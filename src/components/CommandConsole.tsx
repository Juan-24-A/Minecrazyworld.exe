import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { Terminal, Send, X, CornerDownLeft } from 'lucide-react';
import { sounds } from '../game/audio';

interface CommandConsoleProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
}

const COMMAND_SUGGESTIONS = [
  { cmd: '/gamemode creative', desc: 'Cambiar a modo creativo' },
  { cmd: '/gamemode survival', desc: 'Cambiar a modo supervivencia' },
  { cmd: '/gamemode spectator', desc: 'Cambiar a modo espectador' },
  { cmd: '/fly', desc: 'Alternar vuelo' },
  { cmd: '/god', desc: 'Modo Dios (invulnerable)' },
  { cmd: '/noclip', desc: 'Atravesar paredes' },
  { cmd: '/time set day', desc: 'Poner el día soleado' },
  { cmd: '/time set night', desc: 'Poner la noche' },
  { cmd: '/weather clear', desc: 'Clima despejado' },
  { cmd: '/weather rain', desc: 'Hacer llover' },
  { cmd: '/weather thunder', desc: 'Tormenta eléctrica' },
  { cmd: '/speed 3', desc: 'Velocidad x3' },
  { cmd: '/jump 2', desc: 'Super salto x2' },
  { cmd: '/tnt 5', desc: 'Lluvia de 5 dinamitas' },
  { cmd: '/explode 6', desc: 'Detonar explosión radio 6' },
  { cmd: '/summon pig', desc: 'Invocar cerdito' },
  { cmd: '/summon zombie', desc: 'Invocar zombie' },
  { cmd: '/summon creeper', desc: 'Invocar creeper' },
  { cmd: '/tp spawn', desc: 'Teletransporte a spawn' },
  { cmd: '/fill ~ ~ ~ ~5 ~5 ~5 diamond_block', desc: 'Rellenar área con bloques' },
  { cmd: '/heal', desc: 'Restaurar salud al 100%' },
  { cmd: '/clear', desc: 'Limpiar entidades' },
  { cmd: '/help', desc: 'Ver todos los comandos' },
];

export const CommandConsole: React.FC<CommandConsoleProps> = ({
  isOpen,
  onClose,
  messages,
  onSendMessage,
}) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    sounds.playClick();
    onSendMessage(input.trim());
    setHistory((prev) => [...prev, input.trim()]);
    setHistoryIndex(-1);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const nextIdx = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(nextIdx);
        setInput(history[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const nextIdx = historyIndex + 1;
        if (nextIdx >= history.length) {
          setHistoryIndex(-1);
          setInput('');
        } else {
          setHistoryIndex(nextIdx);
          setInput(history[nextIdx]);
        }
      }
    }
  };

  const matchedSuggestions = input.startsWith('/')
    ? COMMAND_SUGGESTIONS.filter((s) => s.cmd.toLowerCase().startsWith(input.toLowerCase()))
    : [];

  return (
    <div className="fixed bottom-20 left-4 z-50 w-full max-w-lg bg-[#313233]/95 text-white border-4 border-[#000] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col font-mono select-none">
      {/* Console Header */}
      <div className="bg-[#1e1e1e] px-3.5 py-2 border-b-4 border-[#000] flex justify-between items-center text-xs text-[#FFFF55]">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#FFFF55]" />
          <span className="font-bold tracking-wider uppercase">CONSOLA Y CHAT DE COMANDOS</span>
        </div>
        <button 
          onClick={onClose} 
          className="bg-[#FF5555] hover:bg-[#ff7777] text-black font-bold p-0.5 border border-[#000] shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Messages Output Area */}
      <div className="p-3 h-48 overflow-y-auto font-mono text-xs space-y-1.5 bg-[#1e1e1e] border-b-2 border-[#000]">
        {messages.map((m) => (
          <div key={m.id} className="leading-relaxed drop-shadow-[1px_1px_0px_#000]" style={{ color: m.color || '#ffffff' }}>
            {m.sender === 'system' && <span className="text-[#FFFF55] font-bold mr-1.5">[Server]</span>}
            {m.sender === 'cheat' && <span className="text-[#55FF55] font-bold mr-1.5">[Cheat]</span>}
            {m.sender === 'player' && <span className="text-[#55FFFF] font-bold mr-1.5">&lt;Player&gt;</span>}
            <span className="whitespace-pre-wrap">{m.text}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Autocomplete Suggestions */}
      {matchedSuggestions.length > 0 && input.length > 1 && (
        <div className="bg-[#242526] border-t-2 border-[#555] p-1.5 max-h-24 overflow-y-auto text-xs font-mono">
          <div className="text-[10px] text-[#FFFF55] font-bold px-2 py-0.5 uppercase tracking-wider">SUGERENCIAS:</div>
          {matchedSuggestions.slice(0, 4).map((s) => (
            <button
              key={s.cmd}
              onClick={() => {
                setInput(s.cmd);
                inputRef.current?.focus();
              }}
              className="w-full text-left px-2 py-1 bg-[#1e1e1e] hover:bg-[#333] border border-[#444] rounded-none flex justify-between text-white hover:text-[#FFFF55] cursor-pointer mb-1 shadow-sm"
            >
              <span className="font-bold text-[#55FFFF]">{s.cmd}</span>
              <span className="text-[#AAA] text-[11px]">{s.desc}</span>
            </button>
          ))}
        </div>
      )}

      {/* Command Input Bar */}
      <form onSubmit={handleSubmit} className="p-2.5 bg-[#313233] border-t-4 border-[#000] flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe un comando (/gamemode, /time, /fly, /tp...) o mensaje..."
          className="flex-1 bg-[#1e1e1e] border-2 border-[#555] px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-[#FFFF55] placeholder:text-[#777]"
        />
        <button
          type="submit"
          className="bg-[#FFFF55] hover:bg-[#ffff77] text-black font-bold px-3.5 py-1.5 border-2 border-[#000] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs flex items-center gap-1 cursor-pointer transition-all"
        >
          <CornerDownLeft className="w-3.5 h-3.5" />
          <span>Enviar</span>
        </button>
      </form>
    </div>
  );
};
