import '../models/puzzle_model.dart';
import 'api_service.dart';

class PuzzleService {
  final ApiService _api = ApiService();

  Future<PuzzleModel> getDailyPuzzle() async {
    final res = await _api.get('/puzzles/daily');
    final data = res is Map && res['data'] != null ? res['data'] : res;
    return PuzzleModel.fromJson(data as Map<String, dynamic>);
  }

  Future<PuzzleModel> getRandomPuzzle({int minRating = 800, int maxRating = 2400}) async {
    final res = await _api.get('/puzzles/random?minRating=$minRating&maxRating=$maxRating');
    final data = res is Map && res['data'] != null ? res['data'] : res;
    return PuzzleModel.fromJson(data as Map<String, dynamic>);
  }

  Future<Map<String, dynamic>> submitAttempt(
      int puzzleId, bool isSuccess, int timeTakenSeconds) async {
    final res = await _api.post('/puzzles/$puzzleId/attempt', {
      'success': isSuccess,
      'timeTakenSeconds': timeTakenSeconds,
    });
    return res as Map<String, dynamic>;
  }
}
