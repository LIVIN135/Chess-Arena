import React from 'react';
import { useChessStore } from '../../store/useChessStore';

export const GameStatusBanner = () => {
  const {
    isGameOver,
    isCheckmate,
    isDraw,
    isCheck,
    winner,
    terminationReason,
    turn,
    viewingIndex,
  } = useChessStore();

  if (viewingIndex !== null) {
    return (
      <div className="rounded-xl border border-sky-800/80 bg-sky-950/40 px-4 py-2.5 text-center text-xs text-sky-300 flex items-center justify-between">
        <span>🔍 Reviewing past position</span>
        <span className="font-semibold text-[11px] text-sky-400">
          Navigate to latest to continue playing
        </span>
      </div>
    );
  }

  if (isGameOver) {
    return (
      <div className="rounded-xl border border-amber-800/80 bg-gradient-to-r from-amber-950/40 via-[#1c212c] to-amber-950/40 p-4 text-center space-y-1 shadow-lg">
        <div className="text-base font-bold text-amber-300">
          {winner === 'Draw'
            ? 'Game Drawn'
            : `${winner} Wins!`}
        </div>
        <p className="text-xs text-gray-300">
          {terminationReason || (isCheckmate ? 'by Checkmate' : isDraw ? 'by Draw Rule' : 'Game Finished')}
        </p>
      </div>
    );
  }

  if (isCheck) {
    return (
      <div className="rounded-xl border border-rose-800/80 bg-rose-950/40 px-4 py-2 text-center text-xs font-semibold text-rose-300 animate-pulse">
        ⚠️ Check! {turn === 'w' ? 'White' : 'Black'} King is under attack!
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#262c3b] bg-[#151921] px-4 py-2 flex items-center justify-between text-xs text-gray-300">
      <div className="flex items-center gap-2">
        <span
          className={`h-2.5 w-2.5 rounded-full ${
            turn === 'w' ? 'bg-white border border-gray-400' : 'bg-gray-800 border border-gray-600'
          }`}
        />
        <span>
          <strong className="text-white">{turn === 'w' ? 'White' : 'Black'}</strong> to move
        </span>
      </div>
      <span className="text-[11px] text-gray-500">Local Player vs Player</span>
    </div>
  );
};
