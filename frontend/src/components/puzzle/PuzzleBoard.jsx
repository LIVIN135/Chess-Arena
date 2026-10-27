import React, { useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { usePuzzleStore } from '../../store/usePuzzleStore';

export const PuzzleBoard = () => {
  const {
    boardFen,
    currentPuzzle,
    status,
    hintSquare,
    makeMove,
  } = usePuzzleStore();

  const [selectedSquare, setSelectedSquare] = useState(null);

  if (!currentPuzzle) {
    return (
      <div className="flex h-[450px] w-[450px] items-center justify-center rounded-2xl border border-[#232b3d] bg-[#141926]">
        <div className="text-center text-gray-400">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent mb-2" />
          <p className="text-xs">Loading puzzle board...</p>
        </div>
      </div>
    );
  }

  const orientation = currentPuzzle.playerColor === 'black' ? 'black' : 'white';

  const handlePieceDrop = (sourceSquare, targetSquare, piece) => {
    if (!targetSquare || status === 'solved' || status === 'failed') return false;

    // Check promotion piece
    const isPawn = piece?.pieceType?.[1]?.toLowerCase() === 'p';
    const isPromoRank = (piece?.pieceType?.[0] === 'w' && targetSquare[1] === '8') || (piece?.pieceType?.[0] === 'b' && targetSquare[1] === '1');
    const promotion = isPawn && isPromoRank ? 'q' : undefined;

    return makeMove(sourceSquare, targetSquare, promotion);
  };

  const handleSquareClick = (square) => {
    if (status === 'solved' || status === 'failed') return;

    if (!selectedSquare) {
      setSelectedSquare(square);
      return;
    }

    if (selectedSquare === square) {
      setSelectedSquare(null);
      return;
    }

    makeMove(selectedSquare, square, 'q');
    setSelectedSquare(null);
  };

  // Custom square styles for hints and selections
  const customSquareStyles = {};
  if (hintSquare) {
    customSquareStyles[hintSquare] = {
      backgroundColor: 'rgba(245, 158, 11, 0.5)',
      boxShadow: 'inset 0 0 10px rgba(245, 158, 11, 0.9)',
    };
  }
  if (selectedSquare) {
    customSquareStyles[selectedSquare] = {
      backgroundColor: 'rgba(99, 102, 241, 0.5)',
    };
  }

  const isInteractive = status !== 'solved' && status !== 'failed';

  return (
    <div className="relative mx-auto w-full max-w-[480px] sm:max-w-[520px] rounded-2xl border border-[#263045] bg-[#0d111a] p-3 shadow-2xl">
      <Chessboard
        options={{
          position: boardFen,
          boardOrientation: orientation,
          squareStyles: customSquareStyles,
          darkSquareStyle: { backgroundColor: '#779952' },
          lightSquareStyle: { backgroundColor: '#edeed1' },
          animationDurationInMs: 250,
          allowDragging: isInteractive,
          onPieceDrop: ({ piece, sourceSquare, targetSquare }) => {
            return handlePieceDrop(sourceSquare, targetSquare, piece);
          },
          onSquareClick: ({ square }) => {
            handleSquareClick(square);
          },
        }}
      />
    </div>
  );
};
