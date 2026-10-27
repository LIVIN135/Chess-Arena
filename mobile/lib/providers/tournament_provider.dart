import 'package:flutter/foundation.dart';
import '../models/tournament_model.dart';
import '../services/tournament_service.dart';

class TournamentProvider with ChangeNotifier {
  final TournamentService _service = TournamentService();

  List<TournamentModel> tournaments = [];
  TournamentModel? selectedTournament;
  bool isLoading = false;
  String? errorMessage;

  Future<void> fetchTournaments() async {
    isLoading = true;
    errorMessage = null;
    notifyListeners();

    try {
      tournaments = await _service.getTournaments();
      isLoading = false;
      notifyListeners();
    } catch (e) {
      errorMessage = e.toString().replaceAll('Exception: ', '');
      isLoading = false;
      notifyListeners();
    }
  }

  Future<void> selectTournament(int id) async {
    isLoading = true;
    errorMessage = null;
    notifyListeners();

    try {
      selectedTournament = await _service.getTournamentDetails(id);
      isLoading = false;
      notifyListeners();
    } catch (e) {
      errorMessage = e.toString().replaceAll('Exception: ', '');
      isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> registerForTournament(int id) async {
    try {
      await _service.register(id);
      await fetchTournaments();
      if (selectedTournament != null && selectedTournament!.id == id) {
        await selectTournament(id);
      }
      return true;
    } catch (e) {
      errorMessage = e.toString().replaceAll('Exception: ', '');
      notifyListeners();
      return false;
    }
  }
}
