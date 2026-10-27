import React from 'react';
import { useChessStore } from '../../store/useChessStore';

export const PromotionDialog = () => {
  const { pendingPromotion, makeMove, cancelPromotion, turn } = useChessStore();

  if (!pendingPromotion) return null;

  const isWhite = turn === 'w';
  const pieces = [
    { type: 'q', label: 'Queen', icon: isWhite ? '♕' : '♛' },
    { type: 'r', label: 'Rook', icon: isWhite ? '♖' : '♜' },
    { type: 'b', label: 'Bishop', icon: isWhite ? '♗' : '♝' },
    { type: 'n', label: 'Knight', icon: isWhite ? '♘' : '♞' },
  ];

  const handleSelect = (pieceType) => {
    makeMove({
      from: pendingPromotion.from,
      to: pendingPromotion.to,
      promotion: pieceType,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-xs rounded-2xl border border-[#262c3b] bg-[#151921] p-6 shadow-2xl space-y-4 text-center">
        <h3 className="text-base font-bold text-white tracking-tight">
          Pawn Promotion
        </h3>
        <p className="text-xs text-gray-400">
          Choose a piece to replace your pawn:
        </p>

        <div className="grid grid-cols-4 gap-2 pt-2">
          {pieces.map((piece) => (
            <button
              key={piece.type}
              onClick={() => handleSelect(piece.type)}
              className="flex flex-col items-center justify-center rounded-xl border border-[#262c3b] bg-[#1c212c] p-3 text-3xl hover:border-[#7fa650] hover:bg-[#7fa650]/20 hover:scale-105 active:scale-95 transition-all text-white"
              title={piece.label}
            >
              <span>{piece.icon}</span>
              <span className="text-[10px] text-gray-400 mt-1 font-medium">{piece.label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={cancelPromotion}
          className="text-xs text-gray-400 hover:text-white pt-2 hover:underline"
        >
          Cancel Move
        </button>
      </div>
    </div>
  );
};
