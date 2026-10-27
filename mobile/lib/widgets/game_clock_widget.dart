import 'package:flutter/material.dart';
import '../config/theme.dart';

class GameClockWidget extends StatelessWidget {
  final int timeSeconds;
  final bool isActive;
  final String playerName;
  final String playerSubtitle;
  final Widget? trailing;

  const GameClockWidget({
    super.key,
    required this.timeSeconds,
    required this.isActive,
    required this.playerName,
    this.playerSubtitle = '',
    this.trailing,
  });

  String _formatTime(int totalSeconds) {
    final mins = totalSeconds ~/ 60;
    final secs = totalSeconds % 60;
    return '${mins.toString().padLeft(2, '0')}:${secs.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    final isLowTime = timeSeconds < 30;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      decoration: BoxDecoration(
        color: isActive ? AppTheme.surfaceElevated : AppTheme.surface,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
          color: isActive ? AppTheme.primaryGreen : AppTheme.border,
          width: isActive ? 1.5 : 1,
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: isActive ? AppTheme.primaryGreen.withOpacity(0.2) : Colors.white10,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Center(
                  child: Text(
                    playerName.isNotEmpty ? playerName[0].toUpperCase() : 'P',
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    playerName,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 13,
                      color: Colors.white,
                    ),
                  ),
                  if (playerSubtitle.isNotEmpty)
                    Text(
                      playerSubtitle,
                      style: const TextStyle(fontSize: 11, color: Colors.white54),
                    ),
                ],
              ),
            ],
          ),
          Row(
            children: [
              if (trailing != null) trailing!,
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: isLowTime
                      ? AppTheme.accentRed.withOpacity(0.2)
                      : (isActive ? AppTheme.primaryGreen.withOpacity(0.15) : Colors.black26),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  _formatTime(timeSeconds),
                  style: TextStyle(
                    fontFamily: 'monospace',
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: isLowTime
                        ? AppTheme.accentRed
                        : (isActive ? Colors.white : Colors.white70),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
