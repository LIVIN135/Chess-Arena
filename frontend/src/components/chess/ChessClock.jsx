import React from 'react';
import { useChessStore } from '../../store/useChessStore';
import { useClockDisplay } from '../../hooks/useClockDisplay';

export const ChessClock = ({ color, playerName = null }) => {
  const {
    turn,
    isClockRunning,
    whiteTimeMs,
    blackTimeMs,
    isGameOver,
    timeControl,
    tickClock,
  } = useChessStore();

  const isWhite = color === 'white';
  const isTurn = (isWhite && turn === 'w') || (!isWhite && turn === 'b');
  const timeMs = isWhite ? whiteTimeMs : blackTimeMs;
  const isRunning = isClockRunning && !isGameOver && timeControl.initialMs !== null;

  const displayRef = useClockDisplay({
    timeMs,
    isTurn,
    isRunning,
    onTimeout: () => tickClock(),
  });

  const isLowTime = timeMs !== null && timeMs < 30000;
  const isCritical = timeMs !== null && timeMs < 10000;

  return (
    <div
      className={`flex items-center justify-between rounded-xl px-4 py-2.5 transition-all duration-200 border ${
        isTurn && !isGameOver
          ? 'bg-[#1c212c] border-[#7fa650] shadow-md ring-1 ring-[#7fa650]/30'
          : 'bg-[#151921] border-[#262c3b] opacity-85'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`h-7 w-7 rounded-lg flex items-center justify-center text-sm font-bold shadow-inner ${
            isWhite ? 'bg-white text-gray-900 border border-gray-300' : 'bg-[#0b0e14] text-white border border-[#262c3b]'
          }`}
        >
          {isWhite ? '♔' : '♚'}
        </div>
        <div>
          <span className="text-xs font-semibold text-gray-200 block leading-tight">
            {playerName || (isWhite ? 'White' : 'Black')}
          </span>
          <span className="text-[10px] text-gray-400">
            {isTurn && !isGameOver ? 'Thinking...' : 'Waiting'}
          </span>
        </div>
      </div>

      <div
        className={`font-mono text-xl sm:text-2xl font-bold tracking-tight px-3 py-1 rounded-lg border ${
          isCritical
            ? 'bg-rose-950/60 text-rose-400 border-rose-800/80 animate-pulse'
            : isLowTime
            ? 'bg-amber-950/60 text-amber-400 border-amber-800/80'
            : isTurn && !isGameOver
            ? 'bg-[#0b0e14] text-white border-[#7fa650]'
            : 'bg-[#0b0e14] text-gray-300 border-[#262c3b]'
        }`}
      >
        <span ref={displayRef}>--:--</span>
      </div>
    </div>
  );
};

export default ChessClock;
