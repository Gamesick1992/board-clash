import React from 'react';
import { Circle } from 'lucide-react';
import { Piece } from '../types';

type GameBoardProps = {
  pieces: Piece[];
  selectedPiece: number | null;
  currentTurn: 'red' | 'blue';
  onSquareClick: (index: number) => void;
  winner?: string | null;
};

export function GameBoard({ 
  pieces, 
  selectedPiece, 
  currentTurn,
  onSquareClick,
  winner 
}: GameBoardProps) {
  return (
    <div className="grid grid-cols-8 gap-1 bg-gradient-to-br from-gray-900 to-gray-800 p-3 rounded-lg shadow-[0_0_30px_rgba(59,130,246,0.3)] border border-blue-500/30">
      {Array.from({ length: 64 }, (_, i) => {
        const piece = pieces.find(p => p.position === i);
        const isSelected = selectedPiece === i;
        const canInteract = !winner;
        
        return (
          <button
            key={i}
            onClick={() => canInteract && onSquareClick(i)}
            disabled={!canInteract}
            className={`
              w-14 h-14 rounded-sm flex items-center justify-center relative
              ${(Math.floor(i / 8) + i % 8) % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700'}
              ${isSelected ? 'ring-2 ring-blue-400' : ''}
              ${canInteract ? 'hover:bg-opacity-80' : 'cursor-not-allowed'}
              transition-all duration-300
              ${isSelected ? 'scale-105' : ''}
              overflow-hidden
            `}
          >
            {/* Hover effect */}
            <div className="absolute inset-0 bg-blue-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
            
            {piece && (
              <div className={`
                transform transition-all duration-300
                ${isSelected ? 'scale-110' : ''}
              `}>
                <Circle 
                  size={32} 
                  fill={piece.type === 'red' ? '#ef4444' : '#3b82f6'}
                  className={`
                    ${piece.type === 'red' ? 'text-red-500' : 'text-blue-500'}
                    ${isSelected ? 'animate-pulse' : ''}
                    filter drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]
                  `}
                />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}