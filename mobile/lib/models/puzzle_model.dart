class PuzzleModel {
  final int id;
  final String title;
  final String description;
  final String fen;
  final List<String> moves;
  final int rating;
  final String theme;
  final String playerToMove; // "white" or "black"

  PuzzleModel({
    required this.id,
    required this.title,
    required this.description,
    required this.fen,
    required this.moves,
    required this.rating,
    required this.theme,
    required this.playerToMove,
  });

  factory PuzzleModel.fromJson(Map<String, dynamic> json) {
    List<String> parsedMoves = [];
    if (json['moves'] is List) {
      parsedMoves = (json['moves'] as List).map((e) => e.toString()).toList();
    } else if (json['moves'] is String) {
      parsedMoves = (json['moves'] as String).split(' ').where((s) => s.isNotEmpty).toList();
    }

    final fenStr = json['fen'] as String? ?? 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    final parts = fenStr.split(' ');
    final turn = (parts.length > 1 && parts[1] == 'b') ? 'black' : 'white';

    return PuzzleModel(
      id: json['id'] as int? ?? 0,
      title: json['title'] as String? ?? 'Tactical Puzzle',
      description: json['description'] as String? ?? 'Find the winning combination',
      fen: fenStr,
      moves: parsedMoves,
      rating: json['rating'] as int? ?? 1400,
      theme: json['theme'] as String? ?? 'Tactic',
      playerToMove: turn,
    );
  }
}
