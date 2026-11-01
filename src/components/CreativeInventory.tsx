import React, { useState } from 'react';
import { INVENTORY_CATALOG } from '../game/items';
import { InventoryItem } from '../types';
import { Search, X, Layers, Sparkles, Box, Hammer, Shield, Palette, Trash2, Candy, Crown } from 'lucide-react';
import { sounds } from '../game/audio';
import { ItemRenderer } from './ItemRenderer';

interface CreativeInventoryProps {
  isOpen: boolean;
  onClose: () => void;
  hotbar: InventoryItem[];
  selectedSlot: number;
  onUpdateHotbarItem: (slotIndex: number, item: InventoryItem) => void;
  onClearHotbar: () => void;
}

type TabType = 'all' | 'admin' | 'sweets' | 'building' | 'natural' | 'decor' | 'minerals' | 'wool' | 'tools' | 'items';

export const CreativeInventory: React.FC<CreativeInventoryProps> = ({
  isOpen,
  onClose,
  hotbar,
  selectedSlot,
  onUpdateHotbarItem,
  onClearHotbar,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredItem, setHoveredItem] = useState<InventoryItem | null>(null);

  if (!isOpen) return null;

  const filteredItems = INVENTORY_CATALOG.filter((item) => {
    const matchesTab =
      activeTab === 'all' ||
      item.category === activeTab ||
      (activeTab === 'sweets' &&
        (item.category === 'sweets' ||
          item.id === 'chocolate_bar' ||
          item.id === 'bucket_chocolate' ||
          item.id === 'camioneta_item')) ||
      (activeTab === 'tools' && (item.id === 'bucket_chocolate' || item.id === 'camioneta_item')) ||
      (activeTab === 'admin' && item.category === 'admin');

    const matchesSearch =
      searchQuery.trim() === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleItemClick = (item: InventoryItem) => {
    sounds.playClick();
    onUpdateHotbarItem(selectedSlot, item);
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'Todos', icon: <Box className="w-3.5 h-3.5" /> },
    { id: 'admin', label: 'Admin', icon: <Crown className="w-3.5 h-3.5 text-amber-300" /> },
    { id: 'sweets', label: 'Dulce', icon: <Candy className="w-3.5 h-3.5 text-pink-400" /> },
    { id: 'building', label: 'Construcción', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'natural', label: 'Naturaleza', icon: <Box className="w-3.5 h-3.5 text-emerald-400" /> },
    { id: 'minerals', label: 'Minerales', icon: <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> },
    { id: 'decor', label: 'Decoración', icon: <Hammer className="w-3.5 h-3.5 text-amber-400" /> },
    { id: 'wool', label: 'Lanas y Colores', icon: <Palette className="w-3.5 h-3.5 text-pink-400" /> },
    { id: 'tools', label: 'Herramientas', icon: <Shield className="w-3.5 h-3.5 text-blue-400" /> },
    { id: 'items', label: 'Objetos', icon: <Sparkles className="w-3.5 h-3.5 text-yellow-400" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 font-mono select-none">
      <div className="bg-[#313233] text-white border-4 border-[#000] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-2xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-[#1e1e1e] text-[#FFFF55] p-3.5 px-4 flex justify-between items-center border-b-4 border-[#000]">
          <div className="flex items-center gap-2 font-bold text-sm tracking-wide">
            <Box className="w-5 h-5 text-[#FFFF55]" />
            <span>INVENTARIO CREATIVO ILIMITADO</span>
          </div>
          <button
            onClick={onClose}
            className="bg-[#FF5555] hover:bg-[#ff7777] text-black font-bold p-1 border-2 border-[#000] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
            title="Cerrar (E o Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Tabs */}
        <div className="p-3 bg-[#242526] border-b-4 border-[#000] flex flex-col gap-2.5">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-[#888]" />
            <input
              type="text"
              placeholder="Buscar bloques o herramientas (ej. Diamante, TNT, Madera)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1e1e1e] border-2 border-[#555] px-3 py-1.5 pl-8 text-xs text-white font-mono font-semibold placeholder:text-[#777] focus:outline-none focus:border-[#FFFF55]"
              autoFocus
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-2.5 py-1 text-xs font-bold flex items-center gap-1.5 border-2 transition-all cursor-pointer ${
                  activeTab === t.id
                    ? 'bg-[#FFFF55] border-[#000] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                    : 'bg-[#555] hover:bg-[#777] border-[#000] text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                }`}
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Items Grid */}
        <div className="p-4 overflow-y-auto max-h-72 grid grid-cols-6 sm:grid-cols-8 md:grid-cols-9 gap-2 bg-[#1e1e1e] border-b-4 border-[#000]">
          {filteredItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              onMouseEnter={() => setHoveredItem(item)}
              onMouseLeave={() => setHoveredItem(null)}
              className="group relative w-12 h-12 bg-[#313233] border-2 border-[#555] hover:border-[#FFFF55] hover:bg-[#444] flex items-center justify-center p-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              <ItemRenderer item={item} size={36} />
            </button>
          ))}
          {filteredItems.length === 0 && (
            <div className="col-span-full py-8 text-center text-xs text-[#AAA] font-bold">
              No se encontraron bloques u objetos con esa búsqueda.
            </div>
          )}
        </div>

        {/* Item Tooltip / Detail Bar */}
        <div className="bg-[#1e1e1e] text-white p-2.5 px-4 min-h-[44px] flex items-center justify-between border-b-4 border-[#000]">
          {hoveredItem ? (
            <div className="flex flex-col">
              <span className="font-bold text-xs text-[#FFFF55]">{hoveredItem.name}</span>
              <span className="text-[11px] text-[#AAA]">{hoveredItem.description}</span>
            </div>
          ) : (
            <span className="text-[11px] text-[#888] italic">
              Haz clic en cualquier bloque u objeto para equiparlo en la ranura activa de la barra rápida.
            </span>
          )}
        </div>

        {/* Bottom Hotbar Configuration */}
        <div className="p-3 bg-[#313233] flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs font-bold text-white">
            <span>Barra Rápida de Acceso (Ranura actual seleccionada: <span className="text-[#FFFF55]">#{selectedSlot + 1}</span>)</span>
            <button
              onClick={() => {
                sounds.playClick();
                onClearHotbar();
              }}
              className="text-[11px] bg-[#FF5555] hover:bg-[#ff7777] text-black font-bold px-2.5 py-1 border-2 border-[#000] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1 cursor-pointer transition-all"
            >
              <Trash2 className="w-3 h-3" />
              <span>Vaciar Barra</span>
            </button>
          </div>

          <div className="flex justify-center gap-1.5 bg-[#1e1e1e] p-2 border-2 border-[#555]">
            {hotbar.map((item, idx) => {
              const isSelected = idx === selectedSlot;
              return (
                <div
                  key={idx}
                  className={`w-10 h-10 flex items-center justify-center relative transition-all ${
                    isSelected
                      ? 'border-4 border-[#FFF] bg-[#8B8B8B] shadow-inner scale-105'
                      : 'border-2 border-[#555] bg-[#313233]'
                  }`}
                >
                  <span className="absolute top-0.5 left-0.5 text-[8px] font-bold text-[#FFFF55] drop-shadow-[1px_1px_0px_#000]">
                    {idx + 1}
                  </span>
                  {item && (
                    <ItemRenderer item={item} size={28} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
