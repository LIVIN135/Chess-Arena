import React, { useEffect, useState, useRef, useMemo } from 'react';
import { OnlineChessBoardView } from '../components/chess/OnlineChessBoardView';
import { OnlineChessClock } from '../components/chess/OnlineChessClock';
import { OnlinePromotionDialog } from '../components/chess/OnlinePromotionDialog';
import { EvaluationBar } from '../components/chess/EvaluationBar';
import { useMultiplayerStore } from '../store/useMultiplayerStore';
import { useAuthStore } from '../store/useAuthStore';
import { toast } from '../components/ui/Toast';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { getSoundVolume, setSoundVolume } from '../utils/chessAudio';
import {
  Zap,
  Clock,
  Shield,
  Wifi,
  WifiOff,
  Flag,
  Handshake,
  RotateCcw,
  Swords,
  Copy,
  Volume2,
  VolumeX,
  MessageSquare,
  ListOrdered,
  Info,
  Check,
  Send,
  Sliders,
} from 'lucide-react';

const TIME_CONTROLS = [
  { id: '1m', name: 'Bullet 1+0', desc: '1 minute per player', icon: Zap, speed: 'Super Fast' },
  { id: '3m', name: 'Blitz 3+0', desc: '3 minutes per player', icon: Zap, speed: 'Fast' },
  { id: '5m', name: 'Blitz 5+0', desc: '5 minutes per player', icon: Zap, speed: 'Popular', badge: 'Popular' },
  { id: '10m', name: 'Rapid 10+0', desc: '10 minutes per player', icon: Clock, speed: 'Standard' },
];

const QUICK_CHAT_MESSAGES = [
  'Good luck, have fun! 🤝',
  'Nice move! 👏',
  'Thank you for the game! ♟️',
  'Good game! 👍',
  'Well played! ⭐',
  'Rematch? ⚔️',
];

export const PlayOnlinePage = () => {
  const {
    status,
    selectedTimeControl,
    searchSeconds,
    playerColor,
    opponentName,
    playerName,
    isConnected,
    gameId,
    turn,
    isCheck,
    winner,
    terminationReason,
    history,
    fen,
    drawOfferReceived,
    drawOfferSent,
    initConnection,
    startSearch,
    cancelSearch,
    incrementSearchSeconds,
    resign,
    offerDraw,
    acceptDraw,
    declineDraw,
    leaveGame,
  } = useMultiplayerStore();

  const { user } = useAuthStore();
  const [selectedTc, setSelectedTc] = useState('5m');
  const [showResignModal, setShowResignModal] = useState(false);
  const [activeTab, setActiveTab] = useState('moves'); // 'moves' | 'chat' | 'info'
  const [showEvalBar, setShowEvalBar] = useState(true);
  const [copiedId, setCopiedId] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [volume, setVolume] = useState(getSoundVolume());

  const movesEndRef = useRef(null);
  const chatEndRef = useRef(null);

  // Initialize connection on mount
  useEffect(() => {
    initConnection();
  }, [initConnection]);

  // Tick search timer
  useEffect(() => {
    if (status !== 'SEARCHING') return;
    const interval = setInterval(() => {
      incrementSearchSeconds();
    }, 1000);
    return () => clearInterval(interval);
  }, [status, incrementSearchSeconds]);

  // Auto scroll move list
  useEffect(() => {
    if (activeTab === 'moves' && movesEndRef.current) {
      movesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history, activeTab]);

  // Auto scroll chat list
  useEffect(() => {
    if (activeTab === 'chat' && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeTab]);

  const opponentColor = playerColor === 'white' ? 'black' : 'white';
  const isMyTurn = (playerColor === 'white' && turn === 'w') || (playerColor === 'black' && turn === 'b');

  // Compute captured pieces and material differences
  const { whiteCaptured, blackCaptured, materialDiff } = useMemo(() => {
    const baseCounts = { p: 8, r: 2, n: 2, b: 2, q: 1 };
    const currentWhite = { p: 0, r: 0, n: 0, b: 0, q: 0 };
    const currentBlack = { p: 0, r: 0, n: 0, b: 0, q: 0 };
    const piecePlacement = (fen || '').split(' ')[0] || '';

    for (const ch of piecePlacement) {
      const lower = ch.toLowerCase();
      if (baseCounts[lower] !== undefined) {
        if (ch === ch.toUpperCase()) {
          currentWhite[lower]++;
        } else {
          currentBlack[lower]++;
        }
      }
    }

    const whiteCap = [];
    const blackCap = [];
    let wMat = 0;
    let bMat = 0;
    const values = { p: 1, n: 3, b: 3, r: 5, q: 9 };
    const symbols = { p: '♟', n: '♞', b: '♝', r: '♜', q: '♛' };

    Object.keys(baseCounts).forEach((type) => {
      const wCount = Math.max(0, baseCounts[type] - currentBlack[type]);
      const bCount = Math.max(0, baseCounts[type] - currentWhite[type]);
      for (let i = 0; i < wCount; i++) {
        whiteCap.push(symbols[type]);
        wMat += values[type];
      }
      for (let i = 0; i < bCount; i++) {
        blackCap.push(symbols[type]);
        bMat += values[type];
      }
    });

    return {
      whiteCaptured: whiteCap,
      blackCaptured: blackCap,
      materialDiff: wMat - bMat,
    };
  }, [fen]);

  const handleCopyGameId = () => {
    if (!gameId) return;
    navigator.clipboard.writeText(gameId);
    setCopiedId(true);
    toast.success('Game ID copied to clipboard');
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleSendChat = (text) => {
    const msgText = (text || chatInput).trim();
    if (!msgText) return;
    const newMsg = {
      id: Date.now(),
      sender: playerName || 'You',
      text: msgText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages((prev) => [...prev, newMsg]);
    if (!text) setChatInput('');
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setSoundVolume(val);
  };

  const formatSearchTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-fade-in">
      {/* Top Header & Connection Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#21262D] gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F0F6FC] flex items-center gap-2">
            <Swords className="h-6 w-6 text-[#7FB069]" />
            Online Arena Matchmaking
          </h1>
          <p className="text-xs text-[#8B949E] mt-0.5">
            Real-time STOMP WebSocket multiplayer with server-authoritative move validation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
              isConnected
                ? 'bg-[#7FB069]/10 border-[#7FB069]/30 text-[#7FB069]'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}
          >
            {isConnected ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
            <span>{isConnected ? 'Server Connected' : 'Disconnected'}</span>
          </div>

          <button
            onClick={() => setShowEvalBar(!showEvalBar)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
              showEvalBar
                ? 'bg-[#1F242C] border-[#7FB069]/40 text-[#7FB069]'
                : 'bg-[#161B22] border-[#21262D] text-[#8B949E] hover:text-[#F0F6FC]'
            }`}
            title="Toggle evaluation bar"
          >
            Eval Bar
          </button>
        </div>
      </div>

      {/* IDLE / SEARCHING VIEW */}
      {(status === 'IDLE' || status === 'SEARCHING') && (
        <div className="max-w-2xl mx-auto space-y-6 pt-4">
          <div className="p-6 sm:p-8 rounded-2xl bg-[#161B22] border border-[#21262D] shadow-xl text-center space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[#F0F6FC]">Select Time Control</h2>
              <p className="text-xs text-[#8B949E] mt-1">
                Choose a speed control to pair with a matching opponent.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              {TIME_CONTROLS.map((tc) => {
                const Icon = tc.icon;
                const isSelected = selectedTc === tc.id;
                return (
                  <button
                    key={tc.id}
                    onClick={() => setSelectedTc(tc.id)}
                    disabled={status === 'SEARCHING'}
                    className={`relative p-4 rounded-xl border transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? 'bg-[#7FB069]/10 border-[#7FB069] ring-1 ring-[#7FB069]/30 shadow-md'
                        : 'bg-[#0E1116] border-[#21262D] hover:border-[#30363D]'
                    } ${status === 'SEARCHING' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {tc.badge && (
                      <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#7FB069] text-[#0E1116] uppercase">
                        {tc.badge}
                      </span>
                    )}
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`h-4 w-4 ${isSelected ? 'text-[#7FB069]' : 'text-[#8B949E]'}`} />
                      <span className="font-bold text-sm text-[#F0F6FC]">{tc.name}</span>
                    </div>
                    <p className="text-xs text-[#8B949E]">{tc.desc}</p>
                  </button>
                );
              })}
            </div>

            {status === 'IDLE' ? (
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={() => startSearch(selectedTc)}
                disabled={!isConnected}
              >
                Find Opponent Now
              </Button>
            ) : (
              <div className="space-y-4 pt-2">
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#7FB069] border-t-transparent" />
                  <span className="text-sm font-semibold text-[#F0F6FC]">
                    Searching for opponent ({formatSearchTime(searchSeconds)})
                  </span>
                  <span className="text-xs text-[#8B949E]">
                    Matching in {selectedTimeControl} queue...
                  </span>
                </div>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={cancelSearch}
                  className="w-full"
                >
                  Cancel Matchmaking
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* LIVE GAME VIEW: PLAYING or GAME_OVER */}
      {(status === 'PLAYING' || status === 'GAME_OVER') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Board Column (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            {/* Top Player Card (Opponent) */}
            <div className="rounded-xl border border-[#21262D] bg-[#161B22] p-3 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1F242C] border border-[#21262D] text-base font-bold text-[#8B949E]">
                  {opponentName?.charAt(0).toUpperCase() || 'O'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#F0F6FC]">{opponentName}</span>
                    <Badge variant="neutral" size="sm">
                      {opponentColor === 'white' ? 'White' : 'Black'}
                    </Badge>
                  </div>
                  {/* Captured pieces */}
                  <div className="flex items-center gap-1 text-sm font-mono text-[#8B949E] mt-0.5">
                    <span>
                      {opponentColor === 'white' ? whiteCaptured.join('') : blackCaptured.join('')}
                    </span>
                    {materialDiff !== 0 && (
                      <span className="text-[11px] font-bold text-[#7FB069]">
                        {opponentColor === 'white' && materialDiff > 0 ? `+${materialDiff}` : ''}
                        {opponentColor === 'black' && materialDiff < 0 ? `+${Math.abs(materialDiff)}` : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <OnlineChessClock color={opponentColor} playerName={opponentName} />
            </div>

            {/* Chessboard + Eval Bar Area */}
            <div className="flex items-center justify-center gap-2">
              <EvaluationBar
                visible={showEvalBar}
                score={materialDiff}
                playerColor={playerColor}
              />
              <div className="relative flex-1">
                <OnlineChessBoardView />
                <OnlinePromotionDialog />
              </div>
            </div>

            {/* Bottom Player Card (Local Player) */}
            <div className="rounded-xl border border-[#21262D] bg-[#161B22] p-3 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1F242C] border border-[#21262D] text-base font-bold text-[#7FB069]">
                  {playerName?.charAt(0).toUpperCase() || 'Y'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#F0F6FC]">
                      {playerName} <span className="text-xs text-[#8B949E]">(You)</span>
                    </span>
                    <Badge variant="success" size="sm">
                      {playerColor === 'white' ? 'White' : 'Black'}
                    </Badge>
                  </div>
                  {/* Captured pieces */}
                  <div className="flex items-center gap-1 text-sm font-mono text-[#8B949E] mt-0.5">
                    <span>
                      {playerColor === 'white' ? whiteCaptured.join('') : blackCaptured.join('')}
                    </span>
                    {materialDiff !== 0 && (
                      <span className="text-[11px] font-bold text-[#7FB069]">
                        {playerColor === 'white' && materialDiff > 0 ? `+${materialDiff}` : ''}
                        {playerColor === 'black' && materialDiff < 0 ? `+${Math.abs(materialDiff)}` : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <OnlineChessClock color={playerColor} playerName={playerName} />
            </div>
          </div>

          {/* Side Panel Column (5 cols) */}
          <div className="lg:col-span-5 rounded-2xl border border-[#21262D] bg-[#161B22] overflow-hidden shadow-xl flex flex-col h-[640px]">
            {/* Tab Navigation */}
            <div className="flex border-b border-[#21262D] bg-[#12161E]">
              <button
                onClick={() => setActiveTab('moves')}
                className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border-b-2 ${
                  activeTab === 'moves'
                    ? 'border-[#7FB069] text-[#7FB069] bg-[#161B22]'
                    : 'border-transparent text-[#8B949E] hover:text-[#F0F6FC]'
                }`}
              >
                <ListOrdered className="h-4 w-4" />
                <span>Moves ({history.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border-b-2 ${
                  activeTab === 'chat'
                    ? 'border-[#7FB069] text-[#7FB069] bg-[#161B22]'
                    : 'border-transparent text-[#8B949E] hover:text-[#F0F6FC]'
                }`}
              >
                <MessageSquare className="h-4 w-4" />
                <span>Chat</span>
              </button>

              <button
                onClick={() => setActiveTab('info')}
                className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border-b-2 ${
                  activeTab === 'info'
                    ? 'border-[#7FB069] text-[#7FB069] bg-[#161B22]'
                    : 'border-transparent text-[#8B949E] hover:text-[#F0F6FC]'
                }`}
              >
                <Info className="h-4 w-4" />
                <span>Game Info</span>
              </button>
            </div>

            {/* TAB CONTENT */}
            <div className="flex-1 p-4 overflow-y-auto">
              {/* TAB 1: MOVES */}
              {activeTab === 'moves' && (
                <div className="space-y-3 h-full flex flex-col">
                  <div className="flex-1 overflow-y-auto pr-1 text-xs font-mono space-y-1">
                    {history.length === 0 ? (
                      <p className="text-[#8B949E] text-center py-16">
                        White to move. The game has begun!
                      </p>
                    ) : (
                      Array.from({ length: Math.ceil(history.length / 2) }).map((_, i) => {
                        const whiteMove = history[i * 2];
                        const blackMove = history[i * 2 + 1];
                        return (
                          <div
                            key={i}
                            className={`flex items-center px-2.5 py-1.5 rounded-lg text-xs ${
                              i % 2 === 0 ? 'bg-[#0E1116]/60' : 'bg-transparent'
                            }`}
                          >
                            <span className="w-10 text-[#8B949E] font-bold">{i + 1}.</span>
                            <span className="w-24 font-bold text-[#F0F6FC]">
                              {whiteMove?.san || '-'}
                            </span>
                            <span className="w-24 font-bold text-[#8B949E]">
                              {blackMove?.san || ''}
                            </span>
                          </div>
                        );
                      })
                    )}
                    <div ref={movesEndRef} />
                  </div>

                  {/* Draw Notification Banner */}
                  {drawOfferReceived && status === 'PLAYING' && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-2">
                      <p className="font-semibold flex items-center gap-1.5">
                        <Handshake className="h-4 w-4" />
                        Opponent offered a draw
                      </p>
                      <div className="flex gap-2">
                        <Button variant="primary" size="sm" onClick={acceptDraw}>
                          Accept Draw
                        </Button>
                        <Button variant="secondary" size="sm" onClick={declineDraw}>
                          Decline
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Game Status or Controls */}
                  {status === 'PLAYING' && (
                    <div className="pt-3 border-t border-[#21262D] flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1"
                        onClick={offerDraw}
                        disabled={drawOfferSent}
                        leftIcon={<Handshake className="h-3.5 w-3.5" />}
                      >
                        {drawOfferSent ? 'Offered' : 'Offer Draw'}
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        className="flex-1"
                        onClick={() => setShowResignModal(true)}
                        leftIcon={<Flag className="h-3.5 w-3.5" />}
                      >
                        Resign
                      </Button>
                    </div>
                  )}

                  {status === 'GAME_OVER' && (
                    <div className="p-4 rounded-xl bg-[#1F242C] border border-[#21262D] text-center space-y-3">
                      <h4 className="font-bold text-base text-[#F0F6FC]">
                        {winner === 'DRAW'
                          ? 'Game Drawn'
                          : winner === playerColor
                          ? '🎉 Victory!'
                          : 'Defeat'}
                      </h4>
                      <p className="text-xs text-[#8B949E]">
                        Reason: {terminationReason || 'Game concluded'}
                      </p>
                      <Button
                        variant="primary"
                        size="md"
                        className="w-full"
                        onClick={leaveGame}
                        leftIcon={<RotateCcw className="h-4 w-4" />}
                      >
                        Play Again
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: CHAT */}
              {activeTab === 'chat' && (
                <div className="h-full flex flex-col justify-between space-y-3">
                  <div className="flex-1 overflow-y-auto pr-1 space-y-2">
                    {chatMessages.length === 0 ? (
                      <div className="text-center py-12 text-xs text-[#8B949E]">
                        Send emotes or respectful messages to your opponent.
                      </div>
                    ) : (
                      chatMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`p-2.5 rounded-xl text-xs ${
                            msg.sender === playerName || msg.sender === 'You'
                              ? 'bg-[#7FB069]/15 border border-[#7FB069]/30 text-[#F0F6FC] ml-4'
                              : 'bg-[#0E1116] border border-[#21262D] text-[#F0F6FC] mr-4'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] text-[#8B949E] mb-1">
                            <span className="font-bold">{msg.sender}</span>
                            <span>{msg.time}</span>
                          </div>
                          <p>{msg.text}</p>
                        </div>
                      ))
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Quick Emotes */}
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#21262D]">
                    {QUICK_CHAT_MESSAGES.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendChat(preset)}
                        className="px-2.5 py-1 rounded-lg bg-[#0E1116] hover:bg-[#1F242C] border border-[#21262D] text-[11px] text-[#8B949E] hover:text-[#F0F6FC] transition-colors"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>

                  {/* Input Form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendChat();
                    }}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      placeholder="Type a friendly message..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      className="flex-1 rounded-lg bg-[#0E1116] border border-[#21262D] px-3 py-1.5 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#7FB069]"
                    />
                    <Button variant="primary" size="sm" type="submit">
                      <Send className="h-3.5 w-3.5" />
                    </Button>
                  </form>
                </div>
              )}

              {/* TAB 3: INFO & SETTINGS */}
              {activeTab === 'info' && (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-[#0E1116] border border-[#21262D] space-y-2">
                    <span className="text-[11px] font-semibold text-[#8B949E] uppercase tracking-wider block">
                      Game Identification
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-[#F0F6FC] truncate">
                        {gameId || 'Local / Guest ID'}
                      </span>
                      {gameId && (
                        <button
                          onClick={handleCopyGameId}
                          className="p-1 rounded text-[#8B949E] hover:text-[#F0F6FC]"
                          title="Copy ID"
                        >
                          {copiedId ? (
                            <Check className="h-4 w-4 text-[#7FB069]" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0E1116] border border-[#21262D] space-y-2">
                    <span className="text-[11px] font-semibold text-[#8B949E] uppercase tracking-wider block">
                      Sound Effects Volume
                    </span>
                    <div className="flex items-center gap-3">
                      {volume > 0 ? (
                        <Volume2 className="h-4 w-4 text-[#7FB069]" />
                      ) : (
                        <VolumeX className="h-4 w-4 text-[#8B949E]" />
                      )}
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="flex-1 accent-[#7FB069] h-1.5 bg-[#1F242C] rounded-lg cursor-pointer"
                      />
                      <span className="text-xs font-mono text-[#8B949E] w-8 text-right">
                        {Math.round(volume * 100)}%
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0E1116] border border-[#21262D] space-y-1 text-xs text-[#8B949E]">
                    <span className="font-semibold text-[#F0F6FC] block">Keyboard Shortcuts</span>
                    <p>&bull; Space: Flip board view</p>
                    <p>&bull; Arrow Left / Right: Step moves</p>
                    <p>&bull; Esc: Close dialogs</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Resign Confirmation Modal */}
      <Modal
        isOpen={showResignModal}
        onClose={() => setShowResignModal(false)}
        title="Confirm Resignation"
      >
        <div className="space-y-4 text-center">
          <p className="text-sm text-[#8B949E]">
            Are you sure you want to resign this match? This will concede victory to your opponent.
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              variant="danger"
              size="md"
              onClick={() => {
                setShowResignModal(false);
                resign();
              }}
            >
              Yes, Resign
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => setShowResignModal(false)}
            >
              Keep Playing
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PlayOnlinePage;
