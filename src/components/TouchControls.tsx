import React from 'react';
import { 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight, 
  Feather, 
  Box, 
  Hammer, 
  Sparkles,
  Package
} from 'lucide-react';

interface TouchControlsProps {
  onDirectionChange: (dir: { forward: number; strafe: number }) => void;
  onJumpPress: (pressed: boolean) => void;
  onSneakPress: (pressed: boolean) => void;
  onBreakPress: (pressed: boolean) => void;
  onPlaceClick: () => void;
  onToggleFly: () => void;
  onOpenInventory: () => void;
  onOpenCheats: () => void;
  isFlying: boolean;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onDirectionChange,
  onJumpPress,
  onSneakPress,
  onBreakPress,
  onPlaceClick,
  onToggleFly,
  onOpenInventory,
  onOpenCheats,
  isFlying,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-4 select-none touch-none font-mono">
      {/* Top Touch Shortcuts */}
      <div className="flex justify-end gap-2 pointer-events-auto">
        <button
          onClick={onOpenCheats}
          className="p-2.5 bg-[#FFFF55] active:bg-[#ffff77] text-black font-bold border-2 border-[#000] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1.5 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-black" />
          <span className="text-xs">TRUCOS</span>
        </button>

        <button
          onClick={onOpenInventory}
          className="p-2.5 bg-[#555] active:bg-[#777] text-white border-2 border-[#000] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
        >
          <Package className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Controls: Left D-Pad + Right Action Buttons */}
      <div className="flex justify-between items-end pb-12">
        {/* Virtual D-Pad (Left) */}
        <div className="pointer-events-auto relative w-36 h-36 bg-[#313233]/90 border-4 border-[#000] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-1.5 grid grid-cols-3 grid-rows-3 gap-1">
          <div />
          <button
            onTouchStart={() => onDirectionChange({ forward: 1, strafe: 0 })}
            onTouchEnd={() => onDirectionChange({ forward: 0, strafe: 0 })}
            onMouseDown={() => onDirectionChange({ forward: 1, strafe: 0 })}
            onMouseUp={() => onDirectionChange({ forward: 0, strafe: 0 })}
            className="bg-[#555] active:bg-[#FFFF55] active:text-black border border-[#222] flex items-center justify-center text-white cursor-pointer"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
          <div />

          <button
            onTouchStart={() => onDirectionChange({ forward: 0, strafe: -1 })}
            onTouchEnd={() => onDirectionChange({ forward: 0, strafe: 0 })}
            onMouseDown={() => onDirectionChange({ forward: 0, strafe: -1 })}
            onMouseUp={() => onDirectionChange({ forward: 0, strafe: 0 })}
            className="bg-[#555] active:bg-[#FFFF55] active:text-black border border-[#222] flex items-center justify-center text-white cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            onClick={onToggleFly}
            className={`border border-[#222] flex items-center justify-center cursor-pointer ${
              isFlying ? 'bg-[#55FFFF] text-black font-bold' : 'bg-[#222] text-[#AAA]'
            }`}
          >
            <Feather className="w-4 h-4" />
          </button>
          <button
            onTouchStart={() => onDirectionChange({ forward: 0, strafe: 1 })}
            onTouchEnd={() => onDirectionChange({ forward: 0, strafe: 0 })}
            onMouseDown={() => onDirectionChange({ forward: 0, strafe: 1 })}
            onMouseUp={() => onDirectionChange({ forward: 0, strafe: 0 })}
            className="bg-[#555] active:bg-[#FFFF55] active:text-black border border-[#222] flex items-center justify-center text-white cursor-pointer"
          >
            <ArrowRight className="w-5 h-5" />
          </button>

          <div />
          <button
            onTouchStart={() => onDirectionChange({ forward: -1, strafe: 0 })}
            onTouchEnd={() => onDirectionChange({ forward: 0, strafe: 0 })}
            onMouseDown={() => onDirectionChange({ forward: -1, strafe: 0 })}
            onMouseUp={() => onDirectionChange({ forward: 0, strafe: 0 })}
            className="bg-[#555] active:bg-[#FFFF55] active:text-black border border-[#222] flex items-center justify-center text-white cursor-pointer"
          >
            <ArrowDown className="w-5 h-5" />
          </button>
          <div />
        </div>

        {/* Right Action Buttons */}
        <div className="pointer-events-auto flex flex-col gap-2 items-center">
          <div className="flex gap-2">
            {/* Break Block Button */}
            <button
              onTouchStart={() => onBreakPress(true)}
              onTouchEnd={() => onBreakPress(false)}
              onMouseDown={() => onBreakPress(true)}
              onMouseUp={() => onBreakPress(false)}
              className="w-14 h-14 bg-[#FF5555] active:bg-[#ff7777] border-2 border-[#000] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center text-black font-bold cursor-pointer"
            >
              <Hammer className="w-5 h-5" />
              <span className="text-[9px] tracking-tight">ROMPER</span>
            </button>

            {/* Place Block Button */}
            <button
              onClick={onPlaceClick}
              className="w-14 h-14 bg-[#55FF55] active:bg-[#77ff77] border-2 border-[#000] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center text-black font-bold cursor-pointer"
            >
              <Box className="w-5 h-5" />
              <span className="text-[9px] tracking-tight">PONER</span>
            </button>
          </div>

          <div className="flex gap-2">
            {/* Sneak Button */}
            <button
              onTouchStart={() => onSneakPress(true)}
              onTouchEnd={() => onSneakPress(false)}
              onMouseDown={() => onSneakPress(true)}
              onMouseUp={() => onSneakPress(false)}
              className="w-12 h-11 bg-[#555] active:bg-[#777] border-2 border-[#000] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center text-white text-[11px] font-bold cursor-pointer"
            >
              BAJAR
            </button>

            {/* Jump Button */}
            <button
              onTouchStart={() => onJumpPress(true)}
              onTouchEnd={() => onJumpPress(false)}
              onMouseDown={() => onJumpPress(true)}
              onMouseUp={() => onJumpPress(false)}
              className="w-16 h-11 bg-[#FFFF55] active:bg-[#ffff77] text-black border-2 border-[#000] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center font-bold text-xs cursor-pointer"
            >
              SALTAR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
