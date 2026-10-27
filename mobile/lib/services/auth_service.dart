import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user_model.dart';
import 'api_service.dart';

class AuthService {
  final ApiService _api = ApiService();

  static const String _tokenKey = 'chess_arena_token';
  static const String _userKey = 'chess_arena_user';

  Future<UserModel> login(String username, String password) async {
    final res = await _api.post('/auth/login', {
      'username': username,
      'password': password,
    });

    final token = res['token'] as String;
    _api.setToken(token);

    final user = UserModel.fromJson(res['user'] as Map<String, dynamic>, token: token);
    await saveSession(user, token);
    return user;
  }

  Future<UserModel> register(String username, String email, String password) async {
    final res = await _api.post('/auth/register', {
      'username': username,
      'email': email,
      'password': password,
    });

    final token = res['token'] as String;
    _api.setToken(token);

    final user = UserModel.fromJson(res['user'] as Map<String, dynamic>, token: token);
    await saveSession(user, token);
    return user;
  }

  Future<void> saveSession(UserModel user, String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
    await prefs.setString(_userKey, jsonEncode(user.toJson()));
  }

  Future<UserModel?> loadSavedSession() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString(_tokenKey);
    final userJson = prefs.getString(_userKey);

    if (token != null && userJson != null) {
      _api.setToken(token);
      final map = jsonDecode(userJson) as Map<String, dynamic>;
      return UserModel.fromJson(map, token: token);
    }
    return null;
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
    await prefs.remove(_userKey);
    _api.setToken(null);
  }
}
