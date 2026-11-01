import React from 'react';
import { InventoryItem, BlockType } from '../types';

interface ItemRendererProps {
  item: InventoryItem;
  size?: number;
  className?: string;
}

export const ItemRenderer: React.FC<ItemRendererProps> = ({ item, size = 36, className = '' }) => {
  const isBlock = item.isBlock && item.blockType !== undefined;
  const blockType = item.blockType ?? BlockType.AIR;
  const itemType = item.itemType;

  // Geometry calculations for an isometric 3D voxel cube:
  // S is the viewport box size
  const S = size;
  const cx = S * 0.5;
  const topY = S * 0.1;
  const midY = S * 0.32;
  const innerMidY = S * 0.54;
  const leftX = S * 0.12;
  const rightX = S * 0.88;
  const botY = S * 0.9;
  const sideBotY = botY - (innerMidY - midY);

  const topPolygon = `${cx},${topY} ${rightX},${midY} ${cx},${innerMidY} ${leftX},${midY}`;
  const leftPolygon = `${leftX},${midY} ${cx},${innerMidY} ${cx},${botY} ${leftX},${sideBotY}`;
  const rightPolygon = `${cx},${innerMidY} ${rightX},${midY} ${rightX},${sideBotY} ${cx},${botY}`;

  // Helper to render special non-block items with SVG
  if (!isBlock) {
    return (
      <div
        className={`relative inline-flex items-center justify-center select-none overflow-hidden ${className}`}
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 40 40"
          width={size}
          height={size}
          className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.45)]"
        >
          {itemType === 'elytra' && (
            <g>
              {/* Central Harness */}
              <circle cx="20" cy="12" r="3.5" fill="#334155" stroke="#1e293b" strokeWidth="1" />
              <path d="M18,15 L22,15 L21,24 L19,24 Z" fill="#475569" />
              {/* Left Wing */}
              <path
                d="M18,14 Q8,18 5,28 Q10,34 19,22 Z"
                fill="url(#elytraWingL)"
                stroke="#1e293b"
                strokeWidth="1.2"
              />
              {/* Right Wing */}
              <path
                d="M22,14 Q32,18 35,28 Q30,34 21,22 Z"
                fill="url(#elytraWingR)"
                stroke="#1e293b"
                strokeWidth="1.2"
              />
              {/* Aerodynamic wing ribs */}
              <path d="M18,14 Q10,22 10,27" fill="none" stroke="#64748b" strokeWidth="0.8" />
              <path d="M22,14 Q30,22 30,27" fill="none" stroke="#64748b" strokeWidth="0.8" />
              <defs>
                <linearGradient id="elytraWingL" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#64748b" />
                  <stop offset="60%" stopColor="#334155" />
                  <stop offset="100%" stopColor="#1e293b" />
                </linearGradient>
                <linearGradient id="elytraWingR" x1="1" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#94a3b8" />
                  <stop offset="60%" stopColor="#475569" />
                  <stop offset="100%" stopColor="#1e293b" />
                </linearGradient>
              </defs>
            </g>
          )}

          {itemType === 'firework_rocket' && (
            <g transform="rotate(25 20 20)">
              {/* Spark Starburst Sparks */}
              <circle cx="20" cy="5" r="1.8" fill="#facc15" />
              <circle cx="16" cy="7" r="1.2" fill="#ef4444" />
              <circle cx="24" cy="7" r="1.2" fill="#3b82f6" />
              <path d="M20,6 L20,9" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
              {/* Rocket Nose Cone */}
              <polygon points="20,9 15,16 25,16" fill="#dc2626" stroke="#991b1b" strokeWidth="1" />
              {/* Rocket Body */}
              <rect x="15" y="16" width="10" height="15" fill="#f8fafc" stroke="#334155" strokeWidth="1" />
              {/* Red Stripes on Body */}
              <rect x="15" y="19" width="10" height="3" fill="#dc2626" />
              <rect x="15" y="25" width="10" height="3" fill="#dc2626" />
              {/* Tail fins */}
              <polygon points="15,28 11,32 15,31" fill="#475569" />
              <polygon points="25,28 29,32 25,31" fill="#475569" />
              {/* Fuse cord */}
              <path d="M20,31 Q22,35 19,38" fill="none" stroke="#d97706" strokeWidth="1.5" />
            </g>
          )}

          {itemType === 'camioneta_item' && (
            <g>
              {/* Mini Pickup Truck Silhouette */}
              {/* Cabin & Hood */}
              <path
                d="M6,22 L11,15 L24,15 L28,20 L35,20 L36,26 L6,26 Z"
                fill="#e11d48"
                stroke="#9f1239"
                strokeWidth="1.2"
              />
              {/* Windows */}
              <polygon points="12,16 22,16 22,21 9,21" fill="#7dd3fc" opacity="0.85" />
              <polygon points="24,17 27,20 23,20" fill="#bae6fd" opacity="0.85" />
              {/* Bed Cargo Wall */}
              <rect x="6" y="19" width="4" height="4" fill="#be123c" />
              {/* Chrome Bumpers */}
              <rect x="4" y="24" width="3" height="3" rx="0.5" fill="#e2e8f0" />
              <rect x="35" y="24" width="3" height="3" rx="0.5" fill="#e2e8f0" />
              {/* Headlight */}
              <rect x="35" y="20" width="2" height="3" fill="#fef08a" />
              {/* Wheels */}
              <circle cx="12" cy="27" r="4.5" fill="#18181b" stroke="#3f3f46" strokeWidth="1" />
              <circle cx="12" cy="27" r="2.2" fill="#e2e8f0" />
              <circle cx="29" cy="27" r="4.5" fill="#18181b" stroke="#3f3f46" strokeWidth="1" />
              <circle cx="29" cy="27" r="2.2" fill="#e2e8f0" />
            </g>
          )}

          {itemType === 'sword_diamond' && (
            <g transform="rotate(-45 20 20)">
              {/* Diamond Blade */}
              <polygon points="20,4 23,8 22,23 20,25 18,23 17,8" fill="#5eead4" stroke="#0d9488" strokeWidth="1" />
              <line x1="20" y1="5" x2="20" y2="23" stroke="#ccfbf1" strokeWidth="1" />
              {/* Crossguard */}
              <rect x="13" y="24" width="14" height="3" rx="1" fill="#94a3b8" stroke="#475569" strokeWidth="0.8" />
              {/* Grip */}
              <rect x="18" y="27" width="4" height="7" fill="#78350f" />
              {/* Pommel */}
              <circle cx="20" cy="35.5" r="2" fill="#0d9488" />
            </g>
          )}

          {itemType === 'pickaxe_diamond' && (
            <g transform="rotate(-45 20 20)">
              {/* Pickaxe Head */}
              <path
                d="M6,10 Q20,3 34,10 Q28,14 20,8 Q12,14 6,10 Z"
                fill="#5eead4"
                stroke="#0f766e"
                strokeWidth="1.2"
              />
              <path d="M17,8 L23,8 L22,34 L18,34 Z" fill="#92400e" stroke="#78350f" strokeWidth="0.8" />
            </g>
          )}

          {itemType === 'axe_diamond' && (
            <g transform="rotate(-45 20 20)">
              <path d="M18,6 L22,6 L22,34 L18,34 Z" fill="#92400e" stroke="#78350f" strokeWidth="0.8" />
              <path d="M22,8 Q32,10 32,18 Q26,22 22,17 Z" fill="#5eead4" stroke="#0f766e" strokeWidth="1" />
            </g>
          )}

          {itemType === 'shovel_diamond' && (
            <g transform="rotate(-45 20 20)">
              <rect x="18" y="16" width="4" height="18" fill="#92400e" stroke="#78350f" strokeWidth="0.8" />
              <path d="M16,6 L24,6 L25,16 L15,16 Z" fill="#5eead4" stroke="#0f766e" strokeWidth="1" />
            </g>
          )}

          {itemType === 'bow' && (
            <g transform="rotate(45 20 20)">
              {/* Bow curve */}
              <path d="M8,8 Q30,20 8,32" fill="none" stroke="#92400e" strokeWidth="2.5" strokeLinecap="round" />
              {/* Bow string */}
              <line x1="8" y1="8" x2="8" y2="32" stroke="#e2e8f0" strokeWidth="1" />
              {/* Arrow */}
              <line x1="6" y1="20" x2="26" y2="20" stroke="#cbd5e1" strokeWidth="1.5" />
              <polygon points="26,20 22,17 22,23" fill="#64748b" />
            </g>
          )}

          {itemType === 'flint_and_steel' && (
            <g>
              <path d="M12,28 Q10,14 20,12 Q28,14 28,24" fill="none" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
              <circle cx="16" cy="26" r="4.5" fill="#475569" stroke="#1e293b" strokeWidth="1" />
              <polygon points="24,14 27,9 29,14" fill="#f59e0b" />
            </g>
          )}

          {itemType === 'bucket_chocolate' && (
            <g>
              <polygon points="10,14 30,14 26,32 14,32" fill="#94a3b8" stroke="#475569" strokeWidth="1" />
              <ellipse cx="20" cy="14" rx="10" ry="3" fill="#6d3918" />
              <ellipse cx="20" cy="15" rx="7" ry="1.8" fill="#451a03" />
            </g>
          )}

          {itemType === 'chocolate_bar' && (
            <g transform="rotate(15 20 20)">
              <rect x="10" y="8" width="20" height="24" rx="2" fill="#522510" stroke="#3b1604" strokeWidth="1" />
              {/* Chocolate chunks */}
              <rect x="12" y="10" width="7" height="9" rx="1" fill="#783818" />
              <rect x="21" y="10" width="7" height="9" rx="1" fill="#783818" />
              <rect x="12" y="21" width="7" height="9" rx="1" fill="#783818" />
              <rect x="21" y="21" width="7" height="9" rx="1" fill="#783818" />
              {/* Foil wrapper */}
              <polygon points="10,24 30,22 30,32 10,32" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.8" />
            </g>
          )}

          {itemType === 'ender_pearl' && (
            <g>
              <circle cx="20" cy="20" r="11" fill="url(#enderGrad)" stroke="#0f766e" strokeWidth="1.2" />
              <circle cx="20" cy="20" r="4.5" fill="#2dd4bf" opacity="0.9" />
              <circle cx="17" cy="16" r="1.8" fill="#f0fdfa" opacity="0.8" />
              <defs>
                <radialGradient id="enderGrad">
                  <stop offset="0%" stopColor="#14b8a6" />
                  <stop offset="65%" stopColor="#0f766e" />
                  <stop offset="100%" stopColor="#115e59" />
                </radialGradient>
              </defs>
            </g>
          )}

          {itemType === 'golden_apple' && (
            <g>
              {/* Leaf & Stem */}
              <path d="M20,10 Q20,6 23,5" fill="none" stroke="#78350f" strokeWidth="1.5" />
              <path d="M22,7 Q27,5 26,9 Z" fill="#22c55e" />
              {/* Apple body */}
              <circle cx="16" cy="22" r="9" fill="url(#goldApple)" />
              <circle cx="24" cy="22" r="9" fill="url(#goldApple)" />
              <circle cx="15" cy="17" r="2" fill="#fef08a" />
              <defs>
                <linearGradient id="goldApple" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="40%" stopColor="#facc15" />
                  <stop offset="100%" stopColor="#ca8a04" />
                </linearGradient>
              </defs>
            </g>
          )}

          {itemType === 'cooked_beef' && (
            <g transform="rotate(-15 20 20)">
              <path
                d="M10,22 Q10,12 22,12 Q32,14 30,26 Q24,30 16,28 Q10,27 10,22 Z"
                fill="#854d0e"
                stroke="#451a03"
                strokeWidth="1.2"
              />
              <line x1="16" y1="16" x2="26" y2="18" stroke="#451a03" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="14" y1="21" x2="25" y2="23" stroke="#451a03" strokeWidth="1.2" strokeLinecap="round" />
            </g>
          )}

          {itemType === 'diamond_gem' && (
            <g>
              <polygon points="20,8 30,16 20,32 10,16" fill="#2dd4bf" stroke="#0f766e" strokeWidth="1.2" />
              <polygon points="20,8 25,16 20,32" fill="#99f6e4" />
              <polygon points="15,16 25,16 20,8" fill="#ccfbf1" />
            </g>
          )}

          {itemType === 'compass' && (
            <g>
              <circle cx="20" cy="20" r="13" fill="#facc15" stroke="#78350f" strokeWidth="1.5" />
              <circle cx="20" cy="20" r="10" fill="#1e293b" />
              <polygon points="20,11 22,20 18,20" fill="#ef4444" />
              <polygon points="20,29 22,20 18,20" fill="#cbd5e1" />
              <circle cx="20" cy="20" r="2" fill="#f8fafc" />
            </g>
          )}

          {itemType === 'mirror_shard' && (
            <g>
              <polygon points="12,8 28,14 22,34 8,24" fill="#67e8f9" stroke="#0891b2" strokeWidth="1.2" />
              <polygon points="15,12 24,16 19,29" fill="#cffafe" opacity="0.75" />
            </g>
          )}

          {itemType === 'admin_sword' && (
            <g>
              <defs>
                <linearGradient id="adminBladeGrad" x1="0" y1="1" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="50%" stopColor="#dc2626" />
                  <stop offset="100%" stopColor="#ffedd5" />
                </linearGradient>
              </defs>
              <polygon points="12,28 14,26 10,22 8,24" fill="#92400e" stroke="#451a03" strokeWidth="1" />
              <polygon points="14,26 18,22 16,20 12,24" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
              <polygon points="16,20 33,3 36,6 20,23" fill="url(#adminBladeGrad)" stroke="#7f1d1d" strokeWidth="1.2" />
              <polygon points="19,17 31,5 34,8 22,20" fill="#fff" opacity="0.6" />
              <circle cx="34" cy="5" r="2" fill="#fbbf24" />
              <circle cx="20" cy="20" r="1.5" fill="#f87171" />
            </g>
          )}

          {itemType === 'admin_teleport_wand' && (
            <g>
              <circle cx="20" cy="20" r="14" fill="#581c87" stroke="#c084fc" strokeWidth="1.5" />
              <circle cx="20" cy="20" r="11" fill="#2e1065" />
              <polygon points="20,8 24,19 19,19 23,32 16,21 21,21" fill="#facc15" stroke="#ca8a04" strokeWidth="0.8" />
              <circle cx="20" cy="20" r="2" fill="#ffffff" />
            </g>
          )}

          {itemType === 'admin_wand' && (
            <g>
              <rect x="10" y="24" width="4" height="14" rx="2" transform="rotate(-45 12 31)" fill="#475569" stroke="#1e293b" strokeWidth="1" />
              <circle cx="26" cy="14" r="6" fill="#06b6d4" stroke="#0891b2" strokeWidth="1" />
              <polygon points="26,7 28,12 33,14 28,16 26,21 24,16 19,14 24,12" fill="#cffafe" />
              <circle cx="26" cy="14" r="2" fill="#ffffff" />
            </g>
          )}

          {itemType === 'admin_kill_wand' && (
            <g>
              <rect x="10" y="24" width="4" height="14" rx="2" transform="rotate(-45 12 31)" fill="#881337" stroke="#4c0519" strokeWidth="1" />
              <circle cx="26" cy="14" r="7" fill="#be123c" stroke="#881337" strokeWidth="1.2" />
              <path d="M22,12 Q22,9 26,9 Q30,9 30,12 L30,15 L28,17 L24,17 L22,15 Z" fill="#ffffff" />
              <circle cx="24" cy="12" r="1" fill="#881337" />
              <circle cx="28" cy="12" r="1" fill="#881337" />
              <rect x="25" y="15" width="2" height="2" fill="#881337" />
            </g>
          )}

          {itemType === 'admin_nuke_wand' && (
            <g>
              <rect x="10" y="24" width="4" height="14" rx="2" transform="rotate(-45 12 31)" fill="#ca8a04" stroke="#854d0e" strokeWidth="1" />
              <circle cx="26" cy="14" r="7.5" fill="#f97316" stroke="#c2410c" strokeWidth="1.2" />
              <circle cx="26" cy="14" r="2" fill="#ffffff" />
              <path d="M26,10 L28,7 L24,7 Z" fill="#ffffff" />
              <path d="M29,16 L33,18 L31,14 Z" fill="#ffffff" />
              <path d="M23,16 L19,18 L21,14 Z" fill="#ffffff" />
            </g>
          )}

          {itemType === 'admin_totem' && (
            <g>
              <path d="M12,18 Q4,12 8,24 Q13,24 16,21 Z" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />
              <path d="M28,18 Q36,12 32,24 Q27,24 24,21 Z" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />
              <rect x="14" y="10" width="12" height="12" rx="2" fill="#fbbf24" stroke="#d97706" strokeWidth="1.2" />
              <rect x="16" y="13" width="2.5" height="2" fill="#10b981" />
              <rect x="21.5" y="13" width="2.5" height="2" fill="#10b981" />
              <rect x="19" y="15" width="2" height="3" fill="#b45309" />
              <rect x="17" y="19" width="6" height="1.5" fill="#78350f" />
              <rect x="16" y="22" width="8" height="12" rx="1" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />
            </g>
          )}

          {itemType === 'admin_weather_wand' && (
            <g>
              <rect x="10" y="24" width="4" height="14" rx="2" transform="rotate(-45 12 31)" fill="#0284c7" stroke="#0369a1" strokeWidth="1" />
              <circle cx="26" cy="14" r="7.5" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.2" />
              <circle cx="24" cy="12" r="3" fill="#facc15" />
              <ellipse cx="27" cy="16" rx="4" ry="2.5" fill="#ffffff" />
              <ellipse cx="29" cy="15" rx="2.5" ry="2" fill="#ffffff" />
            </g>
          )}
        </svg>
      </div>
    );
  }

  // ----------------------------------------------------
  // BLOCK ISOMETRIC 3D RENDERING
  // ----------------------------------------------------
  const getBlockColors = (type: BlockType) => {
    switch (type) {
      case BlockType.GRASS:
        return { top: '#6da339', left: '#704c2e', right: '#533720', isGrass: true };
      case BlockType.DIRT:
        return { top: '#865b35', left: '#6f4929', right: '#52341b' };
      case BlockType.STONE:
        return { top: '#9ca3af', left: '#6b7280', right: '#4b5563', isStone: true };
      case BlockType.COBBLESTONE:
        return { top: '#94a3b8', left: '#64748b', right: '#475569', isCobble: true };
      case BlockType.BEDROCK:
        return { top: '#475569', left: '#334155', right: '#1e293b', isMottled: true };
      case BlockType.WOOD_LOG:
        return { top: '#b48a58', left: '#784d28', right: '#543317', isLog: true };
      case BlockType.WOOD_PLANKS:
        return { top: '#bf925b', left: '#9a703d', right: '#725026', isPlanks: true };
      case BlockType.LEAVES:
        return { top: '#4ade80', left: '#22c55e', right: '#15803d', isLeaves: true };
      case BlockType.GLASS:
        return { top: '#bae6fd', left: '#7dd3fc', right: '#38bdf8', isGlass: true, opacity: 0.7 };
      case BlockType.SAND:
        return { top: '#fde047', left: '#eab308', right: '#ca8a04' };
      case BlockType.SANDSTONE:
        return { top: '#fef08a', left: '#facc15', right: '#d97706', isSandstone: true };
      case BlockType.WATER:
      case BlockType.PARALLEL_WATER:
        return { top: '#60a5fa', left: '#3b82f6', right: '#1d4ed8', opacity: 0.8 };
      case BlockType.LAVA:
        return { top: '#fb923c', left: '#f97316', right: '#c2410c', isLava: true };
      case BlockType.BRICKS:
        return { top: '#b91c1c', left: '#991b1b', right: '#7f1d1d', isBricks: true };
      case BlockType.BOOKSHELF:
        return { top: '#bf925b', left: '#9a703d', right: '#725026', isBookshelf: true };
      case BlockType.TNT:
        return { top: '#dc2626', left: '#b91c1c', right: '#991b1b', isTNT: true };
      case BlockType.OBSIDIAN:
        return { top: '#2e1065', left: '#1e1b4b', right: '#0f172a', isObsidian: true };
      case BlockType.DIAMOND_BLOCK:
        return { top: '#99f6e4', left: '#2dd4bf', right: '#0f766e', isGem: true };
      case BlockType.GOLD_BLOCK:
        return { top: '#fef08a', left: '#facc15', right: '#ca8a04', isGem: true };
      case BlockType.EMERALD_BLOCK:
        return { top: '#86efac', left: '#22c55e', right: '#15803d', isGem: true };
      case BlockType.IRON_BLOCK:
        return { top: '#f1f5f9', left: '#cbd5e1', right: '#94a3b8', isGem: true };
      case BlockType.REDSTONE_BLOCK:
        return { top: '#f87171', left: '#ef4444', right: '#b91c1c', isGem: true };
      case BlockType.GLOWSTONE:
        return { top: '#fef08a', left: '#facc15', right: '#b45309', isGlow: true };
      case BlockType.COAL_ORE:
        return { top: '#9ca3af', left: '#6b7280', right: '#4b5563', oreColor: '#18181b' };
      case BlockType.IRON_ORE:
        return { top: '#9ca3af', left: '#6b7280', right: '#4b5563', oreColor: '#d4b39b' };
      case BlockType.GOLD_ORE:
        return { top: '#9ca3af', left: '#6b7280', right: '#4b5563', oreColor: '#facc15' };
      case BlockType.DIAMOND_ORE:
        return { top: '#9ca3af', left: '#6b7280', right: '#4b5563', oreColor: '#2dd4bf' };
      case BlockType.QUARTZ_ORE:
        return { top: '#7f1d1d', left: '#5f1212', right: '#450a0a', oreColor: '#f8fafc' };
      case BlockType.SUGAR_ORE:
        return { top: '#c084fc', left: '#a855f7', right: '#7e22ce', oreColor: '#f0fdfa' };
      case BlockType.NETHERRACK:
        return { top: '#881337', left: '#701a31', right: '#4c0519' };
      case BlockType.END_STONE:
        return { top: '#fef9c3', left: '#fef08a', right: '#eab308' };
      case BlockType.PUMPKIN:
        return { top: '#ea580c', left: '#c2410c', right: '#9a3412', isPumpkin: true };
      case BlockType.CRAFTING_TABLE:
        return { top: '#bf925b', left: '#9a703d', right: '#725026', isCraftingTable: true };
      case BlockType.FURNACE:
        return { top: '#9ca3af', left: '#6b7280', right: '#4b5563', isFurnace: true };
      case BlockType.CHOCOLATE_BLOCK:
        return { top: '#854d0e', left: '#713f12', right: '#451a03', isChocBlock: true };
      case BlockType.DARK_CHOCOLATE:
        return { top: '#451a03', left: '#3b1604', right: '#1c0b02', isChocBlock: true };
      case BlockType.WHITE_CHOCOLATE:
        return { top: '#fef3c7', left: '#fde68a', right: '#fcd34d', isChocBlock: true };
      case BlockType.LIQUID_CHOCOLATE:
        return { top: '#713f12', left: '#451a03', right: '#291002' };
      case BlockType.COOKIE_BLOCK:
        return { top: '#eab308', left: '#ca8a04', right: '#a16207', isCookie: true };
      case BlockType.WAFFLE_BLOCK:
        return { top: '#f59e0b', left: '#d97706', right: '#b45309', isWaffle: true };
      case BlockType.COTTON_CANDY_PINK:
        return { top: '#f472b6', left: '#ec4899', right: '#be185d' };
      case BlockType.COTTON_CANDY_BLUE:
        return { top: '#60a5fa', left: '#3b82f6', right: '#1d4ed8' };
      case BlockType.CANDY_CANE_BLOCK:
        return { top: '#f87171', left: '#ef4444', right: '#b91c1c', isCandyCane: true };
      case BlockType.PURPUR_BLOCK:
        return { top: '#c084fc', left: '#a855f7', right: '#7e22ce' };
      case BlockType.SOUL_SAND:
        return { top: '#574133', left: '#443226', right: '#2f2118' };
      case BlockType.NETHER_BRICKS:
        return { top: '#4c0519', left: '#3b0714', right: '#27030c', isBricks: true };
      case BlockType.PORTAL_CHOCOLATE:
      case BlockType.PORTAL_NETHER:
      case BlockType.PORTAL_END:
      case BlockType.PORTAL_PARALLEL:
        return { top: '#d946ef', left: '#a21caf', right: '#701a75', isPortal: true };
      case BlockType.PARALLEL_MIRROR_BLOCK:
        return { top: '#67e8f9', left: '#06b6d4', right: '#0e7490', isMirror: true };
      case BlockType.PARALLEL_GRASS:
        return { top: '#f43f5e', left: '#06b6d4', right: '#0891b2', isGrass: true };
      case BlockType.PARALLEL_DIRT:
        return { top: '#06b6d4', left: '#0891b2', right: '#0e7490' };
      case BlockType.PARALLEL_STONE:
        return { top: '#c084fc', left: '#9333ea', right: '#6b21a8' };
      case BlockType.PARALLEL_WOOD:
        return { top: '#38bdf8', left: '#0284c7', right: '#0369a1', isLog: true };
      case BlockType.PARALLEL_LEAVES:
        return { top: '#f472b6', left: '#ec4899', right: '#be185d' };
      case BlockType.PARALLEL_SAND:
        return { top: '#3730a3', left: '#312e81', right: '#1e1b4b' };
      // Beds
      case BlockType.BED_RED:
        return { top: '#ef4444', left: '#b91c1c', right: '#7f1d1d', isBed: true, bedColor: '#ef4444' };
      case BlockType.BED_BLUE:
        return { top: '#3b82f6', left: '#1d4ed8', right: '#1e3a8a', isBed: true, bedColor: '#3b82f6' };
      case BlockType.BED_WHITE:
        return { top: '#f8fafc', left: '#e2e8f0', right: '#cbd5e1', isBed: true, bedColor: '#f8fafc' };
      case BlockType.BED_GREEN:
        return { top: '#22c55e', left: '#15803d', right: '#14532d', isBed: true, bedColor: '#22c55e' };
      // Wools
      case BlockType.WOOL_WHITE:
        return { top: '#f8fafc', left: '#e2e8f0', right: '#cbd5e1', isWool: true };
      case BlockType.WOOL_RED:
        return { top: '#ef4444', left: '#dc2626', right: '#991b1b', isWool: true };
      case BlockType.WOOL_BLUE:
        return { top: '#3b82f6', left: '#2563eb', right: '#1d4ed8', isWool: true };
      case BlockType.WOOL_GREEN:
        return { top: '#22c55e', left: '#16a34a', right: '#15803d', isWool: true };
      case BlockType.WOOL_YELLOW:
        return { top: '#facc15', left: '#eab308', right: '#ca8a04', isWool: true };
      case BlockType.WOOL_BLACK:
        return { top: '#27272a', left: '#18181b', right: '#09090b', isWool: true };
      case BlockType.WOOL_PINK:
        return { top: '#f472b6', left: '#ec4899', right: '#db2777', isWool: true };
      case BlockType.WOOL_PURPLE:
        return { top: '#a855f7', left: '#9333ea', right: '#7e22ce', isWool: true };
      case BlockType.WOOL_ORANGE:
        return { top: '#fb923c', left: '#f97316', right: '#ea580c', isWool: true };
      case BlockType.WOOL_CYAN:
        return { top: '#22d3ee', left: '#06b6d4', right: '#0891b2', isWool: true };
      case BlockType.COMMAND_BLOCK:
        return { top: '#f59e0b', left: '#d97706', right: '#b45309', isCommandBlock: true };
      case BlockType.STRUCTURE_BLOCK:
        return { top: '#334155', left: '#1e293b', right: '#0f172a', isStructureBlock: true };
      case BlockType.BARRIER:
        return { top: '#fee2e2', left: '#fca5a5', right: '#ef4444', isBarrier: true, opacity: 0.9 };
      default:
        return { top: item.iconColor || '#9ca3af', left: '#6b7280', right: '#4b5563' };
    }
  };

  const style = getBlockColors(blockType);

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox={`0 0 ${S} ${S}`}
        width={size}
        height={size}
        className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
      >
        {/* TOP FACE */}
        <polygon
          points={topPolygon}
          fill={style.top}
          opacity={style.opacity ?? 1}
          stroke="rgba(0,0,0,0.15)"
          strokeWidth="0.5"
        />

        {/* LEFT FACE */}
        <polygon
          points={leftPolygon}
          fill={style.left}
          opacity={style.opacity ?? 1}
          stroke="rgba(0,0,0,0.2)"
          strokeWidth="0.5"
        />

        {/* RIGHT FACE */}
        <polygon
          points={rightPolygon}
          fill={style.right}
          opacity={style.opacity ?? 1}
          stroke="rgba(0,0,0,0.25)"
          strokeWidth="0.5"
        />

        {/* DETAILS ON FACES */}
        {/* Grass Block top rim */}
        {style.isGrass && (
          <g>
            <polygon
              points={`${leftX},${midY} ${cx},${innerMidY} ${cx},${innerMidY + S * 0.08} ${leftX},${midY + S * 0.08}`}
              fill={style.top}
            />
            <polygon
              points={`${cx},${innerMidY} ${rightX},${midY} ${rightX},${midY + S * 0.08} ${cx},${innerMidY + S * 0.08}`}
              fill={style.top}
            />
          </g>
        )}

        {/* Wood Log annular rings */}
        {style.isLog && (
          <ellipse cx={cx} cy={(topY + innerMidY) / 2} rx={S * 0.18} ry={S * 0.09} fill="#8b5a2b" />
        )}

        {/* Glass reflection shines */}
        {style.isGlass && (
          <g stroke="#ffffff" strokeWidth="1" opacity="0.8">
            <line x1={cx - 3} y1={topY + 3} x2={rightX - 4} y2={midY - 1} />
            <line x1={leftX + 4} y1={midY + 3} x2={cx - 3} y2={innerMidY - 1} />
          </g>
        )}

        {/* TNT label */}
        {style.isTNT && (
          <g>
            <polygon
              points={`${leftX},${midY + S * 0.1} ${cx},${innerMidY + S * 0.1} ${cx},${innerMidY + S * 0.24} ${leftX},${midY + S * 0.24}`}
              fill="#ffffff"
            />
            <polygon
              points={`${cx},${innerMidY + S * 0.1} ${rightX},${midY + S * 0.1} ${rightX},${midY + S * 0.24} ${cx},${innerMidY + S * 0.24}`}
              fill="#f1f5f9"
            />
            <text
              x={cx}
              y={innerMidY + S * 0.2}
              textAnchor="middle"
              fontSize={Math.max(6, S * 0.16)}
              fontWeight="900"
              fill="#000000"
            >
              TNT
            </text>
          </g>
        )}

        {/* Bookshelf mini books */}
        {style.isBookshelf && (
          <g>
            <rect x={leftX + 2} y={midY + 2} width="3" height={S * 0.2} fill="#ef4444" />
            <rect x={leftX + 6} y={midY + 3} width="3" height={S * 0.19} fill="#3b82f6" />
            <rect x={leftX + 10} y={midY + 2} width="3" height={S * 0.2} fill="#22c55e" />
          </g>
        )}

        {/* Furnace fire opening */}
        {style.isFurnace && (
          <g>
            <polygon
              points={`${cx - S * 0.12},${innerMidY + S * 0.12} ${cx},${innerMidY + S * 0.18} ${cx},${innerMidY + S * 0.3} ${cx - S * 0.12},${innerMidY + S * 0.24}`}
              fill="#18181b"
            />
            <polygon
              points={`${cx - S * 0.08},${innerMidY + S * 0.18} ${cx - S * 0.02},${innerMidY + S * 0.22} ${cx - S * 0.02},${innerMidY + S * 0.27} ${cx - S * 0.08},${innerMidY + S * 0.23}`}
              fill="#f97316"
            />
          </g>
        )}

        {/* Bed pillow */}
        {style.isBed && (
          <polygon
            points={`${cx - S * 0.1},${topY + S * 0.04} ${cx + S * 0.1},${topY + S * 0.04} ${cx + S * 0.06},${topY + S * 0.16} ${cx - S * 0.14},${topY + S * 0.16}`}
            fill="#ffffff"
            stroke="#cbd5e1"
            strokeWidth="0.5"
          />
        )}

        {/* Ore embedded sparkles */}
        {style.oreColor && (
          <g fill={style.oreColor}>
            <polygon points={`${cx - 2},${topY + S * 0.12} ${cx + 1},${topY + S * 0.1} ${cx},${topY + S * 0.16}`} />
            <polygon points={`${leftX + S * 0.12},${midY + S * 0.1} ${leftX + S * 0.16},${midY + S * 0.08} ${leftX + S * 0.14},${midY + S * 0.15}`} />
            <polygon points={`${rightX - S * 0.14},${midY + S * 0.12} ${rightX - S * 0.1},${midY + S * 0.1} ${rightX - S * 0.12},${midY + S * 0.16}`} />
          </g>
        )}

        {/* Gem bevel border */}
        {style.isGem && (
          <polygon
            points={`${cx},${topY + S * 0.06} ${rightX - S * 0.08},${midY} ${cx},${innerMidY - S * 0.06} ${leftX + S * 0.08},${midY}`}
            fill="none"
            stroke="#ffffff"
            strokeWidth="0.8"
            opacity="0.65"
          />
        )}

        {/* Command block central core icon */}
        {style.isCommandBlock && (
          <g>
            <ellipse cx={cx} cy={(topY + innerMidY) / 2} rx={S * 0.14} ry={S * 0.08} fill="#38bdf8" stroke="#0284c7" strokeWidth="0.8" />
            <ellipse cx={cx} cy={(topY + innerMidY) / 2} rx={S * 0.06} ry={S * 0.03} fill="#ffffff" />
            <circle cx={leftX + S * 0.22} cy={midY + S * 0.18} r={S * 0.07} fill="#0284c7" />
            <circle cx={leftX + S * 0.22} cy={midY + S * 0.18} r={S * 0.03} fill="#38bdf8" />
          </g>
        )}

        {/* Structure block cubic wireframe icon */}
        {style.isStructureBlock && (
          <g stroke="#06b6d4" strokeWidth="1" fill="none">
            <rect x={leftX + S * 0.12} y={midY + S * 0.08} width={S * 0.2} height={S * 0.2} rx="1" />
            <circle cx={cx} cy={(topY + innerMidY) / 2} r={S * 0.06} fill="#06b6d4" />
          </g>
        )}

        {/* Barrier block prohibited icon */}
        {style.isBarrier && (
          <g>
            <circle cx={cx} cy={(topY + innerMidY) / 2} r={S * 0.16} fill="none" stroke="#dc2626" strokeWidth="2" />
            <line
              x1={cx - S * 0.11}
              y1={(topY + innerMidY) / 2 - S * 0.11}
              x2={cx + S * 0.11}
              y2={(topY + innerMidY) / 2 + S * 0.11}
              stroke="#dc2626"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>
        )}
      </svg>
    </div>
  );
};
