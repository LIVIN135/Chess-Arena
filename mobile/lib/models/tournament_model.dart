class TournamentModel {
  final int id;
  final String title;
  final String description;
  final String timeControl;
  final String status;
  final int currentRound;
  final int totalRounds;
  final int maxParticipants;
  final int participantCount;
  final bool isUserRegistered;
  final List<TournamentStanding> standings;

  TournamentModel({
    required this.id,
    required this.title,
    required this.description,
    required this.timeControl,
    required this.status,
    required this.currentRound,
    required this.totalRounds,
    required this.maxParticipants,
    required this.participantCount,
    this.isUserRegistered = false,
    this.standings = const [],
  });

  factory TournamentModel.fromJson(Map<String, dynamic> json) {
    var rawStandings = json['standings'] as List? ?? [];
    List<TournamentStanding> parsedStandings =
        rawStandings.map((s) => TournamentStanding.fromJson(s as Map<String, dynamic>)).toList();

    return TournamentModel(
      id: json['id'] as int? ?? 0,
      title: json['title'] as String? ?? 'Arena Championship',
      description: json['description'] as String? ?? '',
      timeControl: json['timeControl'] as String? ?? '10+0',
      status: json['status'] as String? ?? 'UPCOMING',
      currentRound: json['currentRound'] as int? ?? 1,
      totalRounds: json['totalRounds'] as int? ?? 5,
      maxParticipants: json['maxParticipants'] as int? ?? 16,
      participantCount: json['participantCount'] as int? ?? 0,
      isUserRegistered: json['isUserRegistered'] as bool? ?? false,
      standings: parsedStandings,
    );
  }
}

class TournamentStanding {
  final int rank;
  final String username;
  final double score;
  final int gamesPlayed;
  final int wins;
  final int draws;
  final int losses;

  TournamentStanding({
    required this.rank,
    required this.username,
    required this.score,
    required this.gamesPlayed,
    required this.wins,
    required this.draws,
    required this.losses,
  });

  factory TournamentStanding.fromJson(Map<String, dynamic> json) {
    return TournamentStanding(
      rank: json['rank'] as int? ?? 1,
      username: json['username'] as String? ?? 'Player',
      score: (json['score'] as num?)?.toDouble() ?? 0.0,
      gamesPlayed: json['gamesPlayed'] as int? ?? 0,
      wins: json['wins'] as int? ?? 0,
      draws: json['draws'] as int? ?? 0,
      losses: json['losses'] as int? ?? 0,
    );
  }
}
