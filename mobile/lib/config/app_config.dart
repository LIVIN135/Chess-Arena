import 'dart:io' show Platform;
import 'package:flutter/foundation.dart';

class AppConfig {
  static const String appName = 'Chess Arena';
  static const String appVersion = '1.0.0';

  // Base URL configuration:
  // - Android Emulator: 10.0.2.2 connects to host machine localhost:8080
  // - iOS Simulator / Desktop / Web: localhost:8080
  // - Production / Custom: Configurable host
  static String get baseUrl {
    if (kIsWeb) {
      return 'http://localhost:8080/api';
    }
    try {
      if (Platform.isAndroid) {
        return 'http://10.0.2.2:8080/api';
      }
    } catch (_) {}
    return 'http://localhost:8080/api';
  }

  static String get wsUrl {
    if (kIsWeb) {
      return 'ws://localhost:8080/ws';
    }
    try {
      if (Platform.isAndroid) {
        return 'ws://10.0.2.2:8080/ws';
      }
    } catch (_) {}
    return 'ws://localhost:8080/ws';
  }

  static const Duration requestTimeout = Duration(seconds: 10);
}
