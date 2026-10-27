import React, { useState, useMemo } from 'react';
import { Chessboard } from 'react-chessboard';
import { useChessStore } from '../../store/useChessStore';

export const ChessBoardView = () => {
  const {
    fen,
    turn,
    orientation,
    makeMove,
    isPromotionMove,
    setPendingPromotion,
    getLegalMoves,
    lastMove,
    isCheck,
    gameInstance,
    isGameOver,
    viewingIndex,
  } = useChessStore();

  const [selectedSquare, setSelectedSquare] = useState(null);

  // Compute King square for inCheck red highlight
  const kingSquareInCheck = useMemo(() => {
    if (!isCheck) return null;
    const board = gameInstance.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p && p.type === 'k' && p.color === turn) {
          const file = String.fromCharCode('a'.charCodeAt(0) + c);
          const rank = 8 - r;
          return `${file}${rank}`;
        }
      }
    }
    return null;
  }, [isCheck, gameInstance, turn]);

  // Compute legal move targets from selected square
  const legalMoveTargets = useMemo(() => {
    if (!selectedSquare) return [];
    return getLegalMoves(selectedSquare);
  }, [selectedSquare, getLegalMoves]);

  // Build custom square styles
  const customSquareStyles = useMemo(() => {
    const styles = {};

    // 1. Last move highlight
    if (lastMove) {
      styles[lastMove.from] = {
        backgroundColor: 'rgba(255, 255, 0, 0.22)',
      };
      styles[lastMove.to] = {
        backgroundColor: 'rgba(255, 255, 0, 0.28)',
      };
    }

    // 2. Selected square highlight
    if (selectedSquare) {
      styles[selectedSquare] = {
        backgroundColor: 'rgba(105, 146, 62, 0.55)',
      };

      // 3. Legal move dots & capture rings
      legalMoveTargets.forEach((targetSq) => {
        const pieceOnTarget = gameInstance.get(targetSq);
        if (pieceOnTarget) {
          // Capture target: red/amber ring
          styles[targetSq] = {
            background:
              'radial-gradient(circle, transparent 60%, rgba(220, 38, 38, 0.5) 60%)',
            borderRadius: '50%',
          };
        } else {
          // Empty square target: clean small dot in center
          styles[targetSq] = {
            background:
              'radial-gradient(circle, rgba(105, 146, 62, 0.8) 22%, transparent 23%)',
            borderRadius: '50%',
          };
        }
      });
    }

    // 4. King in check highlight
    if (kingSquareInCheck) {
      styles[kingSquareInCheck] = {
        background:
          'radial-gradient(ellipse at center, rgba(239, 68, 68, 0.85) 0%, rgba(220, 38, 38, 0.5) 50%, transparent 85%)',
      };
    }

    return styles;
  }, [lastMove, selectedSquare, legalMoveTargets, gameInstance, kingSquareInCheck]);

  // Handle piece drop (drag and drop)
  const handlePieceDrop = (sourceSquare, targetSquare, piece) => {
    if (!targetSquare || isGameOver || viewingIndex !== null) return false;

    // Check if move is promotion
    if (isPromotionMove(sourceSquare, targetSquare)) {
      setPendingPromotion({ from: sourceSquare, to: targetSquare });
      setSelectedSquare(null);
      return false; // will be resolved by PromotionDialog
    }

    const success = makeMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q',
    });

    setSelectedSquare(null);
    return success;
  };

  // Handle square click (click to move)
  const handleSquareClick = (square) => {
    if (isGameOver || viewingIndex !== null) return;

    // If clicking the already selected square, cancel selection
    if (selectedSquare === square) {
      setSelectedSquare(null);
      return;
    }

    // If already clicked a square and now clicking a legal target square
    if (selectedSquare && legalMoveTargets.includes(square)) {
      if (isPromotionMove(selectedSquare, square)) {
        setPendingPromotion({ from: selectedSquare, to: square });
        setSelectedSquare(null);
        return;
      }

      makeMove({
        from: selectedSquare,
        to: square,
        promotion: 'q',
      });
      setSelectedSquare(null);
      return;
    }

    // Clicking a piece belonging to the active player
    const piece = gameInstance.get(square);
    if (piece && piece.color === turn) {
      setSelectedSquare(square);
    } else {
      setSelectedSquare(null);
    }
  };

  const chessboardOptions = useMemo(
    () => ({
      position: fen,
      boardOrientation: orientation,
      squareStyles: customSquareStyles,
      darkSquareStyle: { backgroundColor: '#526e38' },
      lightSquareStyle: { backgroundColor: '#ebecd0' },
      animationDurationInMs: 180,
      allowDragging: !isGameOver && viewingIndex === null,
      canDragPiece: ({ piece }) => {
        if (isGameOver || viewingIndex !== null) return false;
        return piece?.pieceType?.[0] === turn;
      },
      onPieceDrop: ({ piece, sourceSquare, targetSquare }) => {
        return handlePieceDrop(sourceSquare, targetSquare, piece);
      },
      onSquareClick: ({ square }) => {
        handleSquareClick(square);
      },
    }),
    [
      fen,
      orientation,
      customSquareStyles,
      isGameOver,
      viewingIndex,
      turn,
      selectedSquare,
      legalMoveTargets,
      gameInstance,
    ]
  );

  return (
    <div className="relative mx-auto w-full max-w-[540px] aspect-square rounded-2xl overflow-hidden shadow-2xl border-4 border-[#1f2430] bg-[#151921]">
      <Chessboard options={chessboardOptions} />
    </div>
  );
};

