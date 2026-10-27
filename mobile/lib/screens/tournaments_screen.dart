import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../config/theme.dart';
import '../models/tournament_model.dart';
import '../providers/auth_provider.dart';
import '../providers/tournament_provider.dart';
import 'login_screen.dart';

class TournamentsScreen extends StatefulWidget {
  const TournamentsScreen({super.key});

  @override
  State<TournamentsScreen> createState() => _TournamentsScreenState();
}

class _TournamentsScreenState extends State<TournamentsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<TournamentProvider>(context, listen: false).fetchTournaments();
    });
  }

  void _showTournamentDetails(BuildContext context, TournamentModel t) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppTheme.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return DraggableScrollableSheet(
          initialChildSize: 0.65,
          minChildSize: 0.4,
          maxChildSize: 0.9,
          expand: false,
          builder: (_, scrollController) {
            return Padding(
              padding: const EdgeInsets.all(20.0),
              child: ListView(
                controller: scrollController,
                children: [
                  Center(
                    child: Container(
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                        color: Colors.white24,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          t.title,
                          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppTheme.accentAmber.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          t.status,
                          style: const TextStyle(
                            color: AppTheme.accentAmber,
                            fontWeight: FontWeight.bold,
                            fontSize: 11,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    t.description.isNotEmpty ? t.description : 'Swiss system tournament hosted on Arena servers.',
                    style: const TextStyle(color: Colors.white54, fontSize: 13),
                  ),
                  const SizedBox(height: 16),

                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _buildStatBox('Time Control', t.timeControl),
                      _buildStatBox('Round', '${t.currentRound} / ${t.totalRounds}'),
                      _buildStatBox('Players', '${t.participantCount} / ${t.maxParticipants}'),
                    ],
                  ),
                  const SizedBox(height: 24),

                  const Text(
                    'STANDINGS & LEADERBOARD',
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white54),
                  ),
                  const SizedBox(height: 10),

                  if (t.standings.isEmpty)
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 16.0),
                      child: Text('No standings published yet.', style: TextStyle(color: Colors.white38, fontSize: 12)),
                    )
                  else
                    ...t.standings.map((s) => Container(
                          margin: const EdgeInsets.only(bottom: 8),
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                          decoration: BoxDecoration(
                            color: AppTheme.surfaceElevated,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: AppTheme.border),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(
                                children: [
                                  Text(
                                    '#${s.rank}',
                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                      color: AppTheme.accentAmber,
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Text(s.username, style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
                                ],
                              ),
                              Text('${s.score} pts (${s.wins}W-${s.losses}L-${s.draws}D)',
                                  style: const TextStyle(color: Colors.white70, fontSize: 12)),
                            ],
                          ),
                        )),

                  const SizedBox(height: 20),
                  ElevatedButton(
                    onPressed: () async {
                      final auth = Provider.of<AuthProvider>(context, listen: false);
                      if (!auth.isAuthenticated) {
                        Navigator.of(ctx).pop();
                        Navigator.of(context).push(
                          MaterialPageRoute(builder: (_) => const LoginScreen()),
                        );
                        return;
                      }

                      final provider = Provider.of<TournamentProvider>(context, listen: false);
                      final ok = await provider.registerForTournament(t.id);
                      if (ok && mounted) {
                        Navigator.of(ctx).pop();
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Successfully registered for tournament!')),
                        );
                      }
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.accentAmber,
                      foregroundColor: Colors.black,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                    ),
                    child: Text(
                      t.isUserRegistered ? 'Already Registered' : 'Register for Tournament',
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildStatBox(String label, String value) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      decoration: BoxDecoration(
        color: AppTheme.surfaceElevated,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppTheme.border),
      ),
      child: Column(
        children: [
          Text(label, style: const TextStyle(color: Colors.white38, fontSize: 10)),
          const SizedBox(height: 2),
          Text(value, style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 12)),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final tourneys = Provider.of<TournamentProvider>(context);

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('Arena Tournaments'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            tooltip: 'Refresh Tournaments',
            onPressed: () => tourneys.fetchTournaments(),
          ),
        ],
      ),
      body: tourneys.isLoading
          ? const Center(child: CircularProgressIndicator(color: AppTheme.accentAmber))
          : tourneys.tournaments.isEmpty
              ? const Center(
                  child: Text('No tournaments found', style: TextStyle(color: Colors.white54)),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: tourneys.tournaments.length,
                  itemBuilder: (context, index) {
                    final t = tourneys.tournaments[index];
                    return GestureDetector(
                      onTap: () => _showTournamentDetails(context, t),
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: AppTheme.surfaceElevated,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: AppTheme.border),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Expanded(
                                  child: Text(
                                    t.title,
                                    style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white),
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: t.status == 'IN_PROGRESS'
                                        ? AppTheme.primaryGreen.withOpacity(0.15)
                                        : AppTheme.accentAmber.withOpacity(0.15),
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: Text(
                                    t.status,
                                    style: TextStyle(
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold,
                                      color: t.status == 'IN_PROGRESS'
                                          ? AppTheme.primaryGreen
                                          : AppTheme.accentAmber,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 6),
                            Text(
                              t.description,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(color: Colors.white54, fontSize: 12),
                            ),
                            const SizedBox(height: 12),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text('⏱️ ${t.timeControl}', style: const TextStyle(color: Colors.white70, fontSize: 12)),
                                Text('👥 ${t.participantCount}/${t.maxParticipants} players',
                                    style: const TextStyle(color: Colors.white70, fontSize: 12)),
                                Text('Round ${t.currentRound}/${t.totalRounds}',
                                    style: const TextStyle(color: Colors.white70, fontSize: 12)),
                              ],
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
    );
  }
}
