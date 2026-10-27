import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/app_config.dart';

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  String? _authToken;

  void setToken(String? token) {
    _authToken = token;
  }

  Map<String, String> get _headers {
    final headers = <String, String>{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (_authToken != null) {
      headers['Authorization'] = 'Bearer $_authToken';
    }
    return headers;
  }

  Future<dynamic> get(String endpoint) async {
    final url = Uri.parse('${AppConfig.baseUrl}$endpoint');
    final response = await http
        .get(url, headers: _headers)
        .timeout(AppConfig.requestTimeout);
    return _processResponse(response);
  }

  Future<dynamic> post(String endpoint, Map<String, dynamic> body) async {
    final url = Uri.parse('${AppConfig.baseUrl}$endpoint');
    final response = await http
        .post(url, headers: _headers, body: jsonEncode(body))
        .timeout(AppConfig.requestTimeout);
    return _processResponse(response);
  }

  dynamic _processResponse(http.Response response) {
    final body = jsonDecode(utf8.decode(response.bodyBytes));
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return body;
    } else {
      final msg = body is Map && body['message'] != null
          ? body['message']
          : 'Request failed with status ${response.statusCode}';
      throw Exception(msg);
    }
  }
}
