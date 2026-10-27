import React, { useState, useMemo } from 'react';
import { Chessboard } from 'react-chessboard';
import { useAiStore } from '../../store/useAiStore';

export const AiChessBoardView = () => {
  const {
    fen,
    turn,
    assignedPlayerColor,
    status,
    isThinking,
    makeMove,
    makePlayerMove,
    isPromotionMove,
    setPendingPromotion,
    getLegalMoves,
    lastMove,
    isCheck,
    gameInstance,
  } = useAiStore();

  const [selectedSquare, setSelectedSquare] = useState(null);

  // Safe wrapper for making player move via whichever action name is available
  const executeMove = (args) => {
    if (typeof makePlayerMove === 'function') {
      return makePlayerMove(args);
    }
    if (typeof makeMove === 'function') {
      return makeMove(args);
    }
    return false;
  };

  // Compute King square for inCheck red highlight
  const kingSquareInCheck = useMemo(() => {
    if (!isCheck || !gameInstance) return null;
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
    if (!selectedSquare || !getLegalMoves) return [];
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
        const pieceOnTarget = gameInstance ? gameInstance.get(targetSq) : null;
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

  const isMyTurn = status === 'PLAYING' && !isThinking && turn === (assignedPlayerColor === 'white' ? 'w' : 'b');

  // Handle piece drop (drag and drop)
  const handlePieceDrop = (sourceSquare, targetSquare, piece) => {
    if (!targetSquare || targetSquare === sourceSquare || !isMyTurn) return false;

    // Check if move is promotion
    if (isPromotionMove && isPromotionMove(sourceSquare, targetSquare)) {
      setPendingPromotion({ from: sourceSquare, to: targetSquare });
      setSelectedSquare(null);
      return false;
    }

    const success = executeMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q',
    });

    setSelectedSquare(null);
    return !!success;
  };

  // Handle square click (click to move)
  const handleSquareClick = (square) => {
    if (!isMyTurn || !square) return;

    if (selectedSquare === square) {
      setSelectedSquare(null);
      return;
    }

    if (selectedSquare && legalMoveTargets.includes(square)) {
      if (isPromotionMove && isPromotionMove(selectedSquare, square)) {
        setPendingPromotion({ from: selectedSquare, to: square });
        setSelectedSquare(null);
        return;
      }

      executeMove({
        from: selectedSquare,
        to: square,
        promotion: 'q',
      });
      setSelectedSquare(null);
      return;
    }

    const piece = gameInstance?.get ? gameInstance.get(square) : null;
    const expectedColor = assignedPlayerColor === 'white' ? 'w' : 'b';
    if (piece && piece.color === expectedColor) {
      setSelectedSquare(square);
    } else {
      setSelectedSquare(null);
    }
  };

  const chessboardOptions = useMemo(
    () => ({
      position: fen,
      boardOrientation: assignedPlayerColor || 'white',
      squareStyles: customSquareStyles,
      darkSquareStyle: { backgroundColor: '#526e38' },
      lightSquareStyle: { backgroundColor: '#ebecd0' },
      animationDurationInMs: 180,
      allowDragging: isMyTurn,
      canDragPiece: ({ piece, square }) => {
        if (!isMyTurn) return false;
        const expectedColor = assignedPlayerColor === 'white' ? 'w' : 'b';
        if (square && gameInstance?.get) {
          const sqPiece = gameInstance.get(square);
          if (sqPiece) return sqPiece.color === expectedColor;
        }
        const pType = typeof piece === 'string' ? piece : piece?.pieceType;
        if (typeof pType === 'string' && pType.length > 0) {
          return pType[0].toLowerCase() === expectedColor;
        }
        return true;
      },
      onPieceDrop: (...args) => {
        if (args.length >= 2 && typeof args[0] === 'string') {
          return handlePieceDrop(args[0], args[1], args[2]);
        }
        const { sourceSquare, targetSquare, piece } = args[0] || {};
        return handlePieceDrop(sourceSquare, targetSquare, piece);
      },
      onSquareClick: (args) => {
        const square = typeof args === 'string' ? args : args?.square;
        if (square) handleSquareClick(square);
      },
    }),
    [
      fen,
      assignedPlayerColor,
      customSquareStyles,
      isMyTurn,
      selectedSquare,
      legalMoveTargets,
      gameInstance,
      makeMove,
      makePlayerMove,
    ]
  );

  return (
    <div className="relative mx-auto w-full max-w-[520px] aspect-square rounded-2xl overflow-hidden shadow-2xl border-4 border-[#1f2430] bg-[#151921]">
      <Chessboard options={chessboardOptions} />
    </div>
  );
};

export default AiChessBoardView;
