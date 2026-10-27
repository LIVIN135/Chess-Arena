import 'dart:convert';
import 'package:stomp_dart_client/stomp_dart_client.dart';
import '../config/app_config.dart';

class WebSocketService {
  StompClient? _stompClient;
  bool _isConnected = false;

  bool get isConnected => _isConnected;

  void connect({
    required Function() onConnected,
    Function(dynamic)? onError,
  }) {
    _stompClient = StompClient(
      config: StompConfig(
        url: AppConfig.wsUrl,
        onConnect: (frame) {
          _isConnected = true;
          onConnected();
        },
        onWebSocketError: (error) {
          _isConnected = false;
          if (onError != null) onError(error);
        },
        onDisconnect: (frame) {
          _isConnected = false;
        },
      ),
    );

    _stompClient?.activate();
  }

  void subscribeToGame(String gameId, Function(Map<String, dynamic>) onMessage) {
    if (_stompClient == null || !_isConnected) return;

    _stompClient?.subscribe(
      destination: '/topic/game/$gameId',
      callback: (frame) {
        if (frame.body != null) {
          final data = jsonDecode(frame.body!) as Map<String, dynamic>;
          onMessage(data);
        }
      },
    );
  }

  void sendMove(String gameId, String from, String to, {String? promotion}) {
    if (_stompClient == null || !_isConnected) return;

    _stompClient?.send(
      destination: '/app/game/$gameId/move',
      body: jsonEncode({
        'from': from,
        'to': to,
        'promotion': promotion,
      }),
    );
  }

  void disconnect() {
    _stompClient?.deactivate();
    _isConnected = false;
  }
}
