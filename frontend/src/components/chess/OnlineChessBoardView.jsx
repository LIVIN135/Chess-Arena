import React, { useState, useMemo } from 'react';
import { Chessboard } from 'react-chessboard';
import { useMultiplayerStore } from '../../store/useMultiplayerStore';

export const OnlineChessBoardView = () => {
  const {
    fen,
    turn,
    playerColor,
    status,
    makeMove,
    isPromotionMove,
    setPendingPromotion,
    getLegalMoves,
    lastMove,
    isCheck,
    gameInstance,
    canMakeMove,
  } = useMultiplayerStore();

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

  // Compute legal moves for selected piece
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
          styles[targetSq] = {
            background:
              'radial-gradient(circle, transparent 60%, rgba(220, 38, 38, 0.5) 60%)',
            borderRadius: '50%',
          };
        } else {
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
    if (!targetSquare || !canMakeMove()) return false;

    // Check if move is promotion
    if (isPromotionMove(sourceSquare, targetSquare)) {
      setPendingPromotion({ from: sourceSquare, to: targetSquare });
      setSelectedSquare(null);
      return false;
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
    if (!canMakeMove()) return;

    if (selectedSquare === square) {
      setSelectedSquare(null);
      return;
    }

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

    const piece = gameInstance.get(square);
    const expectedColor = playerColor === 'white' ? 'w' : 'b';
    if (piece && piece.color === expectedColor) {
      setSelectedSquare(square);
    } else {
      setSelectedSquare(null);
    }
  };

  const isDraggable = status === 'PLAYING' && canMakeMove();

  const chessboardOptions = useMemo(
    () => ({
      position: fen,
      boardOrientation: playerColor || 'white',
      squareStyles: customSquareStyles,
      darkSquareStyle: { backgroundColor: '#B58863' },
      lightSquareStyle: { backgroundColor: '#F0D9B5' },
      animationDurationInMs: 180,
      allowDragging: isDraggable,
      canDragPiece: ({ piece }) => {
        if (!isDraggable) return false;
        const expectedColor = playerColor === 'white' ? 'w' : 'b';
        return piece?.pieceType?.[0] === expectedColor;
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
      playerColor,
      customSquareStyles,
      isDraggable,
      selectedSquare,
      legalMoveTargets,
      gameInstance,
    ]
  );

  return (
    <div className="relative mx-auto w-full max-w-[min(80vh,80vw)] sm:max-w-[560px] aspect-square rounded-2xl overflow-hidden shadow-2xl border-4 border-[#21262D] bg-[#161B22]">
      <Chessboard options={chessboardOptions} />
    </div>
  );
};
