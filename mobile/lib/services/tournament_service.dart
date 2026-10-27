import '../models/tournament_model.dart';
import 'api_service.dart';

class TournamentService {
  final ApiService _api = ApiService();

  Future<List<TournamentModel>> getTournaments() async {
    final res = await _api.get('/tournaments');
    final list = (res is Map && res['data'] != null ? res['data'] : res) as List;
    return list.map((item) => TournamentModel.fromJson(item as Map<String, dynamic>)).toList();
  }

  Future<TournamentModel> getTournamentDetails(int id) async {
    final res = await _api.get('/tournaments/$id');
    final data = res is Map && res['data'] != null ? res['data'] : res;
    return TournamentModel.fromJson(data as Map<String, dynamic>);
  }

  Future<Map<String, dynamic>> register(int id) async {
    final res = await _api.post('/tournaments/$id/register', {});
    return res as Map<String, dynamic>;
  }
}
