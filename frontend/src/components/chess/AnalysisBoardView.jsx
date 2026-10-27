import React, { useMemo } from 'react';
import { Chessboard } from 'react-chessboard';
import { useAnalysisStore } from '../../store/useAnalysisStore';

export const AnalysisBoardView = () => {
  const { getCurrentFen, getCurrentMove, orientation } = useAnalysisStore();

  const currentFen = getCurrentFen();
  const currentMove = getCurrentMove();

  const customSquareStyles = useMemo(() => {
    const styles = {};

    if (currentMove) {
      // 1. Played move highlight
      styles[currentMove.from] = {
        backgroundColor: 'rgba(255, 255, 0, 0.25)',
      };
      styles[currentMove.to] = {
        backgroundColor: 'rgba(255, 255, 0, 0.35)',
      };

      // 2. Best move recommendation target if different from played
      if (currentMove.bestMoveTo && currentMove.bestMoveTo !== currentMove.to) {
        styles[currentMove.bestMoveTo] = {
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.7) 35%, transparent 36%)',
          borderRadius: '50%',
        };
      }
    }

    return styles;
  }, [currentMove]);

  return (
    <div className="relative mx-auto w-full max-w-[500px] aspect-square rounded-2xl overflow-hidden shadow-2xl border-4 border-[#1f2430] bg-[#151921]">
      <Chessboard
        options={{
          position: currentFen,
          boardOrientation: orientation,
          squareStyles: customSquareStyles,
          darkSquareStyle: { backgroundColor: '#526e38' },
          lightSquareStyle: { backgroundColor: '#ebecd0' },
          animationDurationInMs: 150,
          allowDragging: false,
        }}
      />
    </div>
  );
};
