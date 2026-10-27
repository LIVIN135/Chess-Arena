class UserModel {
  final int id;
  final String username;
  final String email;
  final String role;
  final int rating;
  final int gamesPlayed;
  final int gamesWon;
  final int gamesLost;
  final int gamesDrawn;
  final String? token;

  UserModel({
    required this.id,
    required this.username,
    required this.email,
    required this.role,
    this.rating = 1200,
    this.gamesPlayed = 0,
    this.gamesWon = 0,
    this.gamesLost = 0,
    this.gamesDrawn = 0,
    this.token,
  });

  factory UserModel.fromJson(Map<String, dynamic> json, {String? token}) {
    return UserModel(
      id: json['id'] as int? ?? 0,
      username: json['username'] as String? ?? 'Player',
      email: json['email'] as String? ?? '',
      role: json['role'] as String? ?? 'ROLE_USER',
      rating: json['rating'] as int? ?? 1200,
      gamesPlayed: json['gamesPlayed'] as int? ?? 0,
      gamesWon: json['gamesWon'] as int? ?? 0,
      gamesLost: json['gamesLost'] as int? ?? 0,
      gamesDrawn: json['gamesDrawn'] as int? ?? 0,
      token: token ?? json['token'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'email': email,
      'role': role,
      'rating': rating,
      'gamesPlayed': gamesPlayed,
      'gamesWon': gamesWon,
      'gamesLost': gamesLost,
      'gamesDrawn': gamesDrawn,
      'token': token,
    };
  }

  double get winRate {
    if (gamesPlayed == 0) return 0.0;
    return (gamesWon / gamesPlayed) * 100;
  }
}
