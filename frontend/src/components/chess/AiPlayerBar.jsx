import React from 'react';
import { useAiStore } from '../../store/useAiStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useClockDisplay } from '../../hooks/useClockDisplay';
import { Bot, User, Loader2 } from 'lucide-react';

export const AiPlayerBar = ({ isBot = false }) => {
  const {
    selectedBot,
    assignedPlayerColor,
    turn,
    isThinking,
    status,
    timeControl,
    whiteTimeMs,
    blackTimeMs,
    tickClock,
  } = useAiStore();
  const { user } = useAuthStore();

  const isPlayerWhite = assignedPlayerColor === 'white';
  const isBotWhite = !isPlayerWhite;
  const isThisWhite = isBot ? isBotWhite : isPlayerWhite;
  const isTurn = (isThisWhite && turn === 'w') || (!isThisWhite && turn === 'b');
  const isPlaying = status === 'PLAYING';
  const hasClock = timeControl?.initialMs != null;
  const timeMs = isThisWhite ? whiteTimeMs : blackTimeMs;

  const displayRef = useClockDisplay({
    timeMs,
    isTurn,
    isRunning: isPlaying && hasClock,
    onTimeout: () => tickClock(),
  });

  const displayName = isBot ? selectedBot?.name : (user?.username || 'You');

  return (
    <div
      className={`flex items-center justify-between rounded-xl px-4 py-2.5 transition-all duration-200 border ${
        isTurn && isPlaying
          ? 'bg-[#1c212c] border-[#7fa650] shadow-md ring-1 ring-[#7fa650]/30'
          : 'bg-[#151921] border-[#262c3b] opacity-90'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`h-9 w-9 rounded-xl flex items-center justify-center text-lg font-bold shadow ${
            isBot
              ? 'bg-gradient-to-br from-indigo-600 to-purple-700 text-white'
              : 'bg-[#69923e] text-white'
          }`}
        >
          {isBot ? (selectedBot?.avatar || '🤖') : <User className="h-5 w-5" />}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white">
              {displayName}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#0b0e14] border border-[#262c3b] text-gray-400 font-mono">
              {isBot ? `${selectedBot?.rating} ELO` : isThisWhite ? 'White' : 'Black'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 mt-0.5">
            {isBot && isThinking ? (
              <span className="text-[11px] text-indigo-400 font-medium flex items-center gap-1 animate-pulse">
                <Loader2 className="h-3 w-3 animate-spin" />
                Thinking...
              </span>
            ) : (
              <span className="text-[11px] text-gray-400">
                {isTurn && isPlaying ? 'Active turn' : 'Waiting'}
              </span>
            )}
          </div>
        </div>
      </div>

      {hasClock && (
        <div
          className={`font-mono text-xl font-bold px-3 py-1 rounded-lg border ${
            isTurn && isPlaying
              ? 'bg-[#0b0e14] text-white border-[#7fa650]'
              : 'bg-[#0b0e14] text-gray-300 border-[#262c3b]'
          }`}
        >
          <span ref={displayRef}>--:--</span>
        </div>
      )}
    </div>
  );
};

export default AiPlayerBar;
