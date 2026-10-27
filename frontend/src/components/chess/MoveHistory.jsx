import React, { useRef, useEffect } from 'react';
import { useChessStore } from '../../store/useChessStore';

export const MoveHistory = () => {
  const { history, viewingIndex, navigateToMove } = useChessStore();
  const scrollRef = useRef(null);

  // Group moves into turns (white move + black move)
  const rows = [];
  for (let i = 0; i < history.length; i += 2) {
    rows.push({
      moveNum: Math.floor(i / 2) + 1,
      white: history[i],
      whiteIndex: i,
      black: history[i + 1] || null,
      blackIndex: i + 1,
    });
  }

  // Auto-scroll to latest move unless reviewing past move
  useEffect(() => {
    if (viewingIndex === null && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history.length, viewingIndex]);

  const currentIndex = viewingIndex === null ? history.length - 1 : viewingIndex;

  return (
    <div className="flex flex-col h-full rounded-xl border border-[#262c3b] bg-[#151921] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#262c3b] px-4 py-3 bg-[#11141b]">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
          Move Notation
        </span>
        <span className="text-[11px] font-mono text-gray-400">
          {history.length} {history.length === 1 ? 'ply' : 'plies'}
        </span>
      </div>

      {/* Move List */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-2 font-mono text-xs divide-y divide-[#1e2432]"
      >
        {rows.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-center text-xs text-gray-500">
            No moves played yet
          </div>
        ) : (
          rows.map((row) => (
            <div
              key={row.moveNum}
              className="grid grid-cols-12 items-center py-1.5 px-2 hover:bg-[#1c212c] rounded-md transition-colors"
            >
              <span className="col-span-2 text-gray-400 font-semibold select-none">
                {row.moveNum}.
              </span>

              {/* White Move */}
              <button
                onClick={() => navigateToMove(row.whiteIndex)}
                className={`col-span-5 text-left px-2 py-0.5 rounded font-medium transition-colors ${
                  currentIndex === row.whiteIndex
                    ? 'bg-[#69923e] text-white font-bold'
                    : 'text-gray-200 hover:bg-[#262c3b]'
                }`}
              >
                {row.white.san}
              </button>

              {/* Black Move */}
              {row.black ? (
                <button
                  onClick={() => navigateToMove(row.blackIndex)}
                  className={`col-span-5 text-left px-2 py-0.5 rounded font-medium transition-colors ${
                    currentIndex === row.blackIndex
                      ? 'bg-[#69923e] text-white font-bold'
                      : 'text-gray-200 hover:bg-[#262c3b]'
                  }`}
                >
                  {row.black.san}
                </button>
              ) : (
                <span className="col-span-5" />
              )}
            </div>
          ))
        )}
      </div>

      {/* Navigation Controls */}
      <div className="border-t border-[#262c3b] bg-[#11141b] px-3 py-2 flex items-center justify-between gap-1">
        <button
          onClick={() => navigateToMove(-1)}
          disabled={history.length === 0 || currentIndex === -1}
          className="p-1.5 rounded hover:bg-[#262c3b] text-gray-300 disabled:opacity-30 disabled:hover:bg-transparent text-xs"
          title="Start (Initial Position)"
        >
          |◀
        </button>
        <button
          onClick={() => navigateToMove(Math.max(-1, currentIndex - 1))}
          disabled={history.length === 0 || currentIndex === -1}
          className="p-1.5 rounded hover:bg-[#262c3b] text-gray-300 disabled:opacity-30 disabled:hover:bg-transparent text-xs"
          title="Previous Move"
        >
          ◀
        </button>
        <button
          onClick={() =>
            navigateToMove(
              currentIndex < history.length - 1 ? currentIndex + 1 : null
            )
          }
          disabled={history.length === 0 || currentIndex >= history.length - 1}
          className="p-1.5 rounded hover:bg-[#262c3b] text-gray-300 disabled:opacity-30 disabled:hover:bg-transparent text-xs"
          title="Next Move"
        >
          ▶
        </button>
        <button
          onClick={() => navigateToMove(null)}
          disabled={history.length === 0 || viewingIndex === null}
          className="p-1.5 rounded hover:bg-[#262c3b] text-gray-300 disabled:opacity-30 disabled:hover:bg-transparent text-xs"
          title="Latest Move"
        >
          ▶|
        </button>
      </div>
    </div>
  );
};
