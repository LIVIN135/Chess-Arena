# Chess Arena - Flutter Mobile Client

Cross-platform mobile application for Android, iOS, and Web providing real-time online chess, AI play, tactical puzzles, and tournaments.

---

## 📱 Features

- **Interactive Chessboard**:
  - Full move validation and destination highlights.
  - Coordinate system indicators.
  - Check / Checkmate visual feedback.
  - Perspective flipping.
- **Offline & Pass & Play**:
  - 2-player local chess match on a single device.
  - Dual countdown game clocks.
  - Material advantage counter and captured pieces trays.
- **Built-in Minimax AI Engine**:
  - 3 Difficulty settings (Beginner, Intermediate, Master).
  - Alpha-Beta pruning with position evaluation.
  - Zero server dependency required for offline play.
- **Live Online Multiplayer**:
  - Real-time STOMP WebSocket communication with the Spring Boot backend (`/ws`).
  - Move synchronization and auto-pair matchmaking.
- **Tactical Chess Puzzles**:
  - Daily puzzles fetched from `/puzzles/daily`.
  - Rating progression and move validation.
- **Swiss & Elimination Tournaments**:
  - Live tournament brackets and standings.
  - Registration and participant count tracking.
- **Authentication**:
  - JWT token storage via `SharedPreferences`.
  - User statistics and rating tracking.

---

## 🏗️ Architecture

```
mobile/
├── pubspec.yaml            # Project dependencies & assets
├── android/                # Android manifest & native build configs
└── lib/
    ├── main.dart           # App entrypoint with MultiProvider setup
    ├── config/
    │   ├── app_config.dart # API & WebSocket base URL resolver
    │   └── theme.dart      # Dark glassmorphic design system
    ├── engine/
    │   └── chess_engine.dart # Pure Dart chess rules engine & Minimax AI
    ├── models/
    │   ├── chess_models.dart
    │   ├── user_model.dart
    │   ├── puzzle_model.dart
    │   └── tournament_model.dart
    ├── services/
    │   ├── api_service.dart
    │   ├── auth_service.dart
    │   ├── websocket_service.dart
    │   ├── puzzle_service.dart
    │   └── tournament_service.dart
    ├── providers/
    │   ├── auth_provider.dart
    │   ├── game_provider.dart
    │   ├── puzzle_provider.dart
    │   └── tournament_provider.dart
    ├── widgets/
    │   ├── chess_board_widget.dart
    │   ├── game_clock_widget.dart
    │   └── captured_pieces_widget.dart
    └── screens/
        ├── splash_screen.dart
        ├── login_screen.dart
        ├── register_screen.dart
        ├── home_screen.dart
        ├── local_game_screen.dart
        ├── ai_game_screen.dart
        ├── online_game_screen.dart
        ├── puzzle_screen.dart
        ├── tournaments_screen.dart
        └── main_navigation_screen.dart
```

---

## 🚀 Running the Mobile App

### Prerequisites
- Flutter SDK (3.19.0+)
- Android Studio / Xcode / Chrome

### 1. Install Dependencies
```bash
cd mobile
flutter pub get
```

### 2. Run on Device / Emulator
```bash
# Run on Android emulator (connects to 10.0.2.2:8080)
flutter run

# Run in Chrome browser
flutter run -d chrome
```

### 3. Build Production APK
```bash
flutter build apk --release
```
