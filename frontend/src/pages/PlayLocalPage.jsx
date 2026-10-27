import React from 'react';
import { ChessBoardView } from '../components/chess/ChessBoardView';
import { ChessClock } from '../components/chess/ChessClock';
import { MoveHistory } from '../components/chess/MoveHistory';
import { GameControls } from '../components/chess/GameControls';
import { GameStatusBanner } from '../components/chess/GameStatusBanner';
import { PromotionDialog } from '../components/chess/PromotionDialog';
import { useChessStore } from '../store/useChessStore';
import { useAuthStore } from '../store/useAuthStore';

export const PlayLocalPage = () => {
  const { orientation } = useChessStore();
  const { user } = useAuthStore();

  const isWhiteBottom = orientation === 'white';
  const topColor = isWhiteBottom ? 'black' : 'white';
  const bottomColor = isWhiteBottom ? 'white' : 'black';

  const bottomPlayerName = user ? `${user.username} (${bottomColor === 'white' ? 'White' : 'Black'})` : (bottomColor === 'white' ? 'White Player' : 'Black Player');
  const topPlayerName = topColor === 'white' ? 'White Player' : 'Black Player';

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#262c3b] pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>♟️</span> Local Chess Arena
          </h1>
          <p className="text-xs text-gray-400">
            Pass &amp; Play on the same screen with legal move validation and digital clocks
          </p>
        </div>
      </div>

      {/* Main Grid: Board & Side Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Board Column (7 cols on desktop) */}
        <div className="lg:col-span-7 xl:col-span-7 space-y-3">
          {/* Top Clock */}
          <ChessClock color={topColor} playerName={topPlayerName} />

          {/* Chessboard View */}
          <div className="relative">
            <ChessBoardView />
            <PromotionDialog />
          </div>

          {/* Bottom Clock */}
          <ChessClock color={bottomColor} playerName={bottomPlayerName} />
        </div>

        {/* Side Panel Column (5 cols on desktop) */}
        <div className="lg:col-span-5 xl:col-span-5 space-y-4">
          {/* Status Alert Banner */}
          <GameStatusBanner />

          {/* Controls Panel */}
          <GameControls />

          {/* Interactive Move Notation Table */}
          <div className="h-72 sm:h-80">
            <MoveHistory />
          </div>
        </div>
      </div>
    </div>
  );
};
