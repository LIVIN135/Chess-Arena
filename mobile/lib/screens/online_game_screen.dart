import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../config/theme.dart';
import '../engine/chess_engine.dart';
import '../models/chess_models.dart';
import '../providers/auth_provider.dart';
import '../services/websocket_service.dart';
import '../widgets/captured_pieces_widget.dart';
import '../widgets/chess_board_widget.dart';
import '../widgets/game_clock_widget.dart';
import 'login_screen.dart';

class OnlineGameScreen extends StatefulWidget {
  const OnlineGameScreen({super.key});

  @override
  State<OnlineGameScreen> createState() => _OnlineGameScreenState();
}

class _OnlineGameScreenState extends State<OnlineGameScreen> {
  final WebSocketService _wsService = WebSocketService();
  final TextEditingController _gameIdController = TextEditingController();

  ChessEngine _engine = ChessEngine();
  bool _isInGame = false;
  String _activeGameId = '';
  String _opponentName = 'Opponent';
  PieceColor _myColor = PieceColor.white;
  int? _selectedIndex;
  List<int> _validDestinations = [];

  @override
  void initState() {
    super.initState();
    _wsService.connect(
      onConnected: () {
        if (mounted) setState(() {});
      },
      onError: (err) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Multiplayer server connection: $err')),
          );
        }
      },
    );
  }

  @override
  void dispose() {
    _wsService.disconnect();
    _gameIdController.dispose();
    super.dispose();
  }

  void _joinGame(String gameId) {
    if (gameId.isEmpty) return;

    setState(() {
      _activeGameId = gameId;
      _isInGame = true;
      _engine = ChessEngine();
    });

    _wsService.subscribeToGame(gameId, (data) {
      if (data.containsKey('from') && data.containsKey('to')) {
        setState(() {
          _engine.makeMove(data['from'] as String, data['to'] as String);
        });
      }
    });
  }

  void _onSquareTapped(int index) {
    if (!_isInGame || _engine.isGameOver) return;
    if (_engine.activeColor != _myColor) return;

    final piece = _engine.pieceAt(index);

    if (_selectedIndex != null) {
      if (_validDestinations.contains(index)) {
        final fromSq = ChessEngine.indexToSquare(_selectedIndex!);
        final toSq = ChessEngine.indexToSquare(index);

        final success = _engine.makeMove(fromSq, toSq);
        if (success) {
          _wsService.sendMove(_activeGameId, fromSq, toSq);
          setState(() {
            _selectedIndex = null;
            _validDestinations = [];
          });
          return;
        }
      }

      if (piece != null && piece.color == _myColor) {
        setState(() {
          _selectedIndex = index;
          _validDestinations = _engine.getLegalDestinations(index);
        });
        return;
      }

      setState(() {
        _selectedIndex = null;
        _validDestinations = [];
      });
      return;
    }

    if (piece != null && piece.color == _myColor) {
      setState(() {
        _selectedIndex = index;
        _validDestinations = _engine.getLegalDestinations(index);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);

    if (!auth.isAuthenticated) {
      return Scaffold(
        backgroundColor: AppTheme.background,
        appBar: AppBar(title: const Text('Online Multiplayer')),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(32.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text('⚔️', style: TextStyle(fontSize: 48)),
                const SizedBox(height: 16),
                const Text(
                  'Authentication Required',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Sign in to compete in rated online multiplayer matches.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.white54, fontSize: 13),
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(builder: (_) => const LoginScreen()),
                    );
                  },
                  child: const Text('Sign In Now'),
                ),
              ],
            ),
          ),
        ),
      );
    }

    if (!_isInGame) {
      return Scaffold(
        backgroundColor: AppTheme.background,
        appBar: AppBar(
          title: const Text('Multiplayer Lobby'),
          actions: [
            Padding(
              padding: const EdgeInsets.only(right: 16.0),
              child: Center(
                child: Container(
                  width: 10,
                  height: 10,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: _wsService.isConnected ? AppTheme.primaryGreen : AppTheme.accentAmber,
                  ),
                ),
              ),
            ),
          ],
        ),
        body: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: AppTheme.surfaceElevated,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppTheme.border),
                ),
                child: Column(
                  children: [
                    const Text('🌐', style: TextStyle(fontSize: 36)),
                    const SizedBox(height: 12),
                    const Text(
                      'Live WebSocket Matchmaking',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      _wsService.isConnected ? 'Connected to Arena Gateway' : 'Connecting to STOMP Broker...',
                      style: TextStyle(
                        fontSize: 12,
                        color: _wsService.isConnected ? AppTheme.primaryGreen : AppTheme.accentAmber,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),

              const Text('JOIN MATCH BY ID', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white54)),
              const SizedBox(height: 10),

              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _gameIdController,
                      decoration: const InputDecoration(
                        hintText: 'Enter Game UUID or Room #',
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  ElevatedButton(
                    onPressed: () => _joinGame(_gameIdController.text.trim()),
                    child: const Text('Join'),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              ElevatedButton.icon(
                onPressed: () {
                  final room = 'arena-${DateTime.now().millisecondsSinceEpoch % 10000}';
                  _joinGame(room);
                },
                icon: const Icon(Icons.bolt),
                label: const Text('Quick Match (Auto-Pair)'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryGreen,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
              ),
            ],
          ),
        ),
      );
    }

    final isMyTurn = _engine.activeColor == _myColor;

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: Text('Match #$_activeGameId'),
        actions: [
          IconButton(
            icon: const Icon(Icons.exit_to_app),
            tooltip: 'Leave Match',
            onPressed: () => setState(() => _isInGame = false),
          ),
        ],
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              GameClockWidget(
                playerName: _opponentName,
                playerSubtitle: !isMyTurn ? 'Turn to Move' : 'Waiting',
                timeSeconds: 600,
                isActive: !isMyTurn,
              ),

              CapturedPiecesWidget(
                capturedPieces: _engine.capturedWhitePieces,
                advantage: -_engine.materialAdvantage,
              ),

              Center(
                child: ChessBoardWidget(
                  engine: _engine,
                  selectedIndex: _selectedIndex,
                  validDestinations: _validDestinations,
                  onSquareTap: _onSquareTapped,
                ),
              ),

              CapturedPiecesWidget(
                capturedPieces: _engine.capturedBlackPieces,
                advantage: _engine.materialAdvantage,
              ),

              GameClockWidget(
                playerName: auth.user?.username ?? 'You',
                playerSubtitle: isMyTurn ? 'Your Turn' : 'Waiting for opponent',
                timeSeconds: 600,
                isActive: isMyTurn,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
