import React, { useEffect, useRef } from 'react';
import { useAnalysisStore } from '../../store/useAnalysisStore';

const getBadgeStyle = (classification) => {
  switch (classification) {
    case 'BEST':
      return 'bg-emerald-950/60 text-emerald-400 border-emerald-800';
    case 'GOOD':
      return 'bg-green-950/40 text-green-300 border-green-800/60';
    case 'INACCURACY':
      return 'bg-amber-950/60 text-amber-400 border-amber-800';
    case 'MISTAKE':
      return 'bg-orange-950/60 text-orange-400 border-orange-800';
    case 'BLUNDER':
      return 'bg-rose-950/60 text-rose-400 border-rose-800 font-bold animate-pulse';
    default:
      return 'bg-gray-800 text-gray-300 border-gray-700';
  }
};

const getBadgeSymbol = (classification) => {
  switch (classification) {
    case 'BEST': return '★';
    case 'GOOD': return '✓';
    case 'INACCURACY': return '?!';
    case 'MISTAKE': return '?';
    case 'BLUNDER': return '??';
    default: return '';
  }
};

export const AnalysisMoveList = () => {
  const { analysisData, currentMoveIndex, goToMove } = useAnalysisStore();
  const activeRowRef = useRef(null);

  useEffect(() => {
    if (activeRowRef.current) {
      activeRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [currentMoveIndex]);

  if (!analysisData || !analysisData.moves || analysisData.moves.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500 text-xs font-mono">
        No moves loaded for analysis.
      </div>
    );
  }

  const moves = analysisData.moves;
  const numPairs = Math.ceil(moves.length / 2);

  return (
    <div className="h-64 sm:h-72 overflow-y-auto pr-1 space-y-1 font-mono text-xs scrollbar-thin">
      {Array.from({ length: numPairs }).map((_, pairIdx) => {
        const whiteIdx = pairIdx * 2;
        const blackIdx = pairIdx * 2 + 1;
        const whiteMove = moves[whiteIdx];
        const blackMove = blackIdx < moves.length ? moves[blackIdx] : null;

        const isWhiteActive = currentMoveIndex === whiteIdx;
        const isBlackActive = currentMoveIndex === blackIdx;

        return (
          <div
            key={pairIdx}
            ref={isWhiteActive || isBlackActive ? activeRowRef : null}
            className="grid grid-cols-12 py-1 px-2 rounded hover:bg-[#1c212c] transition-colors items-center"
          >
            <span className="col-span-2 text-gray-500 text-[11px]">{pairIdx + 1}.</span>

            {/* White Move */}
            <div className="col-span-5 pr-1">
              {whiteMove && (
                <button
                  onClick={() => goToMove(whiteIdx)}
                  className={`w-full text-left px-2 py-1 rounded flex items-center justify-between transition-all cursor-pointer ${
                    isWhiteActive
                      ? 'bg-indigo-600 text-white font-bold shadow'
                      : 'text-gray-200 hover:bg-[#252c3b]'
                  }`}
                >
                  <span className="font-semibold">{whiteMove.san}</span>
                  <span
                    className={`text-[9px] px-1 py-0.2 rounded border uppercase font-mono ${getBadgeStyle(
                      whiteMove.classification
                    )}`}
                    title={`${whiteMove.classification} (diff: ${whiteMove.evalLoss.toFixed(2)})`}
                  >
                    {getBadgeSymbol(whiteMove.classification)}
                  </span>
                </button>
              )}
            </div>

            {/* Black Move */}
            <div className="col-span-5 pl-1">
              {blackMove && (
                <button
                  onClick={() => goToMove(blackIdx)}
                  className={`w-full text-left px-2 py-1 rounded flex items-center justify-between transition-all cursor-pointer ${
                    isBlackActive
                      ? 'bg-indigo-600 text-white font-bold shadow'
                      : 'text-gray-300 hover:bg-[#252c3b]'
                  }`}
                >
                  <span className="font-semibold">{blackMove.san}</span>
                  <span
                    className={`text-[9px] px-1 py-0.2 rounded border uppercase font-mono ${getBadgeStyle(
                      blackMove.classification
                    )}`}
                    title={`${blackMove.classification} (diff: ${blackMove.evalLoss.toFixed(2)})`}
                  >
                    {getBadgeSymbol(blackMove.classification)}
                  </span>
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
