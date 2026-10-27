import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { useChessStore, TIME_CONTROLS } from '../../store/useChessStore';

export const GameControls = () => {
  const {
    flipBoard,
    resetGame,
    resign,
    offerDraw,
    isGameOver,
    fen,
    getPGN,
    orientation,
    timeControl,
  } = useChessStore();

  const [copiedType, setCopiedType] = useState(null);
  const [showTcSelect, setShowTcSelect] = useState(false);

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="rounded-xl border border-[#262c3b] bg-[#151921] p-4 space-y-3">
      {/* Time Control selector / New game */}
      <div className="flex items-center justify-between gap-2">
        <div className="relative">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowTcSelect(!showTcSelect)}
            className="text-xs"
          >
            ⏱️ {timeControl.name}
          </Button>

          {showTcSelect && (
            <div className="absolute left-0 bottom-full mb-1 z-30 w-44 rounded-xl border border-[#262c3b] bg-[#1c212c] p-1.5 shadow-xl space-y-1">
              <span className="text-[10px] font-bold text-gray-400 px-2 py-1 block uppercase">
                Select Time Control
              </span>
              {TIME_CONTROLS.map((tc) => (
                <button
                  key={tc.id}
                  onClick={() => {
                    resetGame(tc);
                    setShowTcSelect(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    tc.id === timeControl.id
                      ? 'bg-[#69923e] text-white'
                      : 'text-gray-300 hover:bg-[#262c3b]'
                  }`}
                >
                  {tc.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => resetGame()}
          className="text-xs"
        >
          New Game
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={flipBoard}
          className="text-xs"
          title="Flip board perspective"
        >
          🔄 Flip ({orientation === 'white' ? 'White' : 'Black'})
        </Button>
      </div>

      {/* Game termination actions */}
      {!isGameOver && (
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#262c3b]">
          <Button
            variant="outline"
            size="sm"
            onClick={offerDraw}
            className="text-xs"
          >
            🤝 Offer Draw
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => resign(orientation)}
            className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/20"
          >
            🏳️ Resign
          </Button>
        </div>
      )}

      {/* FEN / PGN Export */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#262c3b]">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleCopy(fen, 'fen')}
          className="text-[11px] text-gray-400"
        >
          {copiedType === 'fen' ? '✓ FEN Copied' : 'Copy FEN'}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleCopy(getPGN() || '1. ...', 'pgn')}
          className="text-[11px] text-gray-400"
        >
          {copiedType === 'pgn' ? '✓ PGN Copied' : 'Copy PGN'}
        </Button>
      </div>
    </div>
  );
};
