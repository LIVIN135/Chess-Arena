package com.chessarena.config;

import com.chessarena.entity.Tournament;
import com.chessarena.entity.TournamentParticipant;
import com.chessarena.entity.TournamentMatch;
import com.chessarena.entity.TournamentStatus;
import com.chessarena.entity.TournamentType;
import com.chessarena.entity.TournamentMatchResult;
import com.chessarena.entity.TournamentMatchStatus;
import com.chessarena.entity.User;
import com.chessarena.repository.TournamentMatchRepository;
import com.chessarena.repository.TournamentParticipantRepository;
import com.chessarena.repository.TournamentRepository;
import com.chessarena.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Component
@Order(3)
public class TournamentDataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(TournamentDataSeeder.class);

    private final TournamentRepository tournamentRepository;
    private final TournamentParticipantRepository participantRepository;
    private final TournamentMatchRepository matchRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public TournamentDataSeeder(TournamentRepository tournamentRepository,
                                TournamentParticipantRepository participantRepository,
                                TournamentMatchRepository matchRepository,
                                UserRepository userRepository,
                                PasswordEncoder passwordEncoder) {
        this.tournamentRepository = tournamentRepository;
        this.participantRepository = participantRepository;
        this.matchRepository = matchRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (tournamentRepository.count() > 0) {
            log.info("Tournaments already present in database (count: {}), skipping tournament seeding.",
                    tournamentRepository.count());
            return;
        }

        log.info("Seeding tournaments and championship participants into PostgreSQL...");

        try {
            // Seed a roster of chess masters
            List<User> players = getOrCreateMasterPlayers();

            // 1. IN_PROGRESS Tournament (Spring Blitz Championship)
            seedInProgressTournament(players);

            // 2. REGISTRATION_OPEN Tournament (Weekend Arena Rapid 10m)
            seedRegistrationOpenTournament(players);

            // 3. COMPLETED Tournament (Masters Swiss Classic)
            seedCompletedTournament(players);

            log.info("Successfully seeded 3 realistic chess tournaments with active brackets and live standings.");
        } catch (Exception e) {
            log.error("Error during tournament data seeding: {}", e.getMessage(), e);
        }
    }

    private List<User> getOrCreateMasterPlayers() {
        String[][] playerDefs = {
                {"Magnus_C", "magnus@chessarena.io", "2850", "Grandmaster and former World Champion"},
                {"Hikaru_N", "hikaru@chessarena.io", "2815", "Speed chess specialist & streaming superstar"},
                {"Gukesh_D", "gukesh@chessarena.io", "2785", "World Championship Challenger & tactical master"},
                {"Fabiano_C", "fabi@chessarena.io", "2805", "Classical calculator and elite grandmaster"},
                {"Alireza_F", "alireza@chessarena.io", "2790", "Dynamic attacking prodigy"},
                {"Ding_Liren", "ding@chessarena.io", "2775", "Reigning World Chess Champion"},
                {"Wesley_So", "wesley@chessarena.io", "2760", "Solid positional maestro & Fischer Random champion"},
                {"Anish_Giri", "anish@chessarena.io", "2755", "Opening theorist and elite competitor"}
        };

        List<User> users = new ArrayList<>();
        for (String[] def : playerDefs) {
            String username = def[0];
            String email = def[1];
            int rating = Integer.parseInt(def[2]);
            String bio = def[3];

            User user = userRepository.findByUsername(username)
                    .or(() -> userRepository.findByEmail(email))
                    .orElseGet(() -> {
                        User u = new User();
                        u.setUsername(username);
                        u.setEmail(email);
                        u.setPasswordHash(passwordEncoder.encode("Password123!"));
                        u.setRating(rating);
                        u.setBio(bio);
                        u.setGamesPlayed(42);
                        u.setGamesWon(28);
                        u.setGamesLost(6);
                        u.setGamesDrawn(8);
                        u.setPuzzleRating(rating + 50);
                        return userRepository.save(u);
                    });
            users.add(user);
        }
        return users;
    }

    private void seedInProgressTournament(List<User> players) {
        Tournament t = new Tournament();
        t.setName("🏆 Spring Blitz Championship 2026");
        t.setDescription("Official 3-round Swiss Blitz championship featuring top-rated masters. Fast-paced 3+2 time control with live boards.");
        t.setType(TournamentType.SWISS);
        t.setStatus(TournamentStatus.IN_PROGRESS);
        t.setTimeControl("3|2");
        t.setMaxParticipants(16);
        t.setCurrentParticipantsCount(8);
        t.setRoundsTotal(3);
        t.setCurrentRound(2);
        t.setStartTime(LocalDateTime.now().minusHours(1));
        t.setCreatedBy(players.get(0));
        t.setCreatedAt(LocalDateTime.now().minusDays(1));
        Tournament savedT = tournamentRepository.save(t);

        // Participants
        List<TournamentParticipant> parts = new ArrayList<>();
        double[] r1Scores = {1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 0.0, 0.0};
        int[] r1Wins = {1, 1, 1, 1, 0, 0, 0, 0};
        int[] r1Losses = {0, 0, 0, 0, 1, 1, 1, 1};

        for (int i = 0; i < 8; i++) {
            TournamentParticipant p = new TournamentParticipant(savedT, players.get(i));
            p.setScore(r1Scores[i]);
            p.setWins(r1Wins[i]);
            p.setLosses(r1Losses[i]);
            p.setDraws(0);
            p.setTieBreak(0.5);
            p.setRank(i + 1);
            p.setActive(true);
            parts.add(participantRepository.save(p));
        }

        // Round 1 completed matches
        createCompletedMatch(savedT, 1, 1, players.get(0), players.get(7), TournamentMatchResult.WHITE_WINS);
        createCompletedMatch(savedT, 1, 2, players.get(1), players.get(6), TournamentMatchResult.WHITE_WINS);
        createCompletedMatch(savedT, 1, 3, players.get(2), players.get(5), TournamentMatchResult.WHITE_WINS);
        createCompletedMatch(savedT, 1, 4, players.get(3), players.get(4), TournamentMatchResult.WHITE_WINS);

        // Round 2 scheduled matches (Winners vs Winners, 0-pointers vs 0-pointers)
        createScheduledMatch(savedT, 2, 1, players.get(0), players.get(1));
        createScheduledMatch(savedT, 2, 2, players.get(2), players.get(3));
        createScheduledMatch(savedT, 2, 3, players.get(4), players.get(5));
        createScheduledMatch(savedT, 2, 4, players.get(6), players.get(7));
    }

    private void seedRegistrationOpenTournament(List<User> players) {
        Tournament t = new Tournament();
        t.setName("⚡ Weekend Arena Rapid 10m");
        t.setDescription("Open Rapid arena tournament for players of all levels! 10 minute no-increment clock. Join now before capacity is filled.");
        t.setType(TournamentType.ARENA);
        t.setStatus(TournamentStatus.REGISTRATION_OPEN);
        t.setTimeControl("10m");
        t.setMaxParticipants(16);
        t.setCurrentParticipantsCount(6);
        t.setRoundsTotal(5);
        t.setCurrentRound(0);
        t.setStartTime(LocalDateTime.now().plusHours(2));
        t.setCreatedBy(players.get(1));
        t.setCreatedAt(LocalDateTime.now().minusHours(4));
        Tournament savedT = tournamentRepository.save(t);

        for (int i = 0; i < 6; i++) {
            TournamentParticipant p = new TournamentParticipant(savedT, players.get(i));
            p.setScore(0.0);
            p.setWins(0);
            p.setLosses(0);
            p.setDraws(0);
            p.setTieBreak(0.0);
            p.setRank(i + 1);
            p.setActive(true);
            participantRepository.save(p);
        }
    }

    private void seedCompletedTournament(List<User> players) {
        Tournament t = new Tournament();
        t.setName("🛡️ Masters Swiss Classic 5+3");
        t.setDescription("Completed 3-round blitz invitational tournament with official Sonneborn-Berger and Buchholz tiebreak calculations.");
        t.setType(TournamentType.SWISS);
        t.setStatus(TournamentStatus.COMPLETED);
        t.setTimeControl("5m");
        t.setMaxParticipants(8);
        t.setCurrentParticipantsCount(8);
        t.setRoundsTotal(3);
        t.setCurrentRound(3);
        t.setStartTime(LocalDateTime.now().minusDays(2));
        t.setEndTime(LocalDateTime.now().minusDays(2).plusHours(2));
        t.setCreatedBy(players.get(2));
        t.setCreatedAt(LocalDateTime.now().minusDays(3));
        Tournament savedT = tournamentRepository.save(t);

        // Final scores for 8 participants
        double[] finalScores = {3.0, 2.5, 2.0, 1.5, 1.5, 1.0, 0.5, 0.0};
        int[] wins = {3, 2, 2, 1, 1, 1, 0, 0};
        int[] draws = {0, 1, 0, 1, 1, 0, 1, 0};
        int[] losses = {0, 0, 1, 1, 1, 2, 2, 3};
        double[] tiebreaks = {5.5, 4.0, 3.5, 3.0, 2.5, 2.0, 1.5, 0.5};

        for (int i = 0; i < 8; i++) {
            TournamentParticipant p = new TournamentParticipant(savedT, players.get(i));
            p.setScore(finalScores[i]);
            p.setWins(wins[i]);
            p.setDraws(draws[i]);
            p.setLosses(losses[i]);
            p.setTieBreak(tiebreaks[i]);
            p.setRank(i + 1);
            p.setActive(true);
            participantRepository.save(p);
        }

        // Round 1
        createCompletedMatch(savedT, 1, 1, players.get(0), players.get(7), TournamentMatchResult.WHITE_WINS);
        createCompletedMatch(savedT, 1, 2, players.get(1), players.get(6), TournamentMatchResult.WHITE_WINS);
        createCompletedMatch(savedT, 1, 3, players.get(2), players.get(5), TournamentMatchResult.WHITE_WINS);
        createCompletedMatch(savedT, 1, 4, players.get(3), players.get(4), TournamentMatchResult.DRAW);

        // Round 2
        createCompletedMatch(savedT, 2, 1, players.get(0), players.get(2), TournamentMatchResult.WHITE_WINS);
        createCompletedMatch(savedT, 2, 2, players.get(1), players.get(3), TournamentMatchResult.WHITE_WINS);
        createCompletedMatch(savedT, 2, 3, players.get(4), players.get(6), TournamentMatchResult.WHITE_WINS);
        createCompletedMatch(savedT, 2, 4, players.get(5), players.get(7), TournamentMatchResult.WHITE_WINS);

        // Round 3
        createCompletedMatch(savedT, 3, 1, players.get(0), players.get(1), TournamentMatchResult.WHITE_WINS);
        createCompletedMatch(savedT, 3, 2, players.get(2), players.get(4), TournamentMatchResult.WHITE_WINS);
        createCompletedMatch(savedT, 3, 3, players.get(3), players.get(5), TournamentMatchResult.WHITE_WINS);
        createCompletedMatch(savedT, 3, 4, players.get(6), players.get(7), TournamentMatchResult.DRAW);
    }

    private void createCompletedMatch(Tournament t, int round, int board, User white, User black, TournamentMatchResult result) {
        TournamentMatch m = new TournamentMatch();
        m.setTournament(t);
        m.setRoundNumber(round);
        m.setBoardNumber(board);
        m.setWhitePlayer(white);
        m.setBlackPlayer(black);
        m.setResult(result);
        m.setStatus(TournamentMatchStatus.COMPLETED);
        m.setGameSessionId(UUID.randomUUID().toString());
        m.setScheduledAt(LocalDateTime.now().minusHours(2));
        m.setCompletedAt(LocalDateTime.now().minusHours(1));
        matchRepository.save(m);
    }

    private void createScheduledMatch(Tournament t, int round, int board, User white, User black) {
        TournamentMatch m = new TournamentMatch();
        m.setTournament(t);
        m.setRoundNumber(round);
        m.setBoardNumber(board);
        m.setWhitePlayer(white);
        m.setBlackPlayer(black);
        m.setResult(TournamentMatchResult.PENDING);
        m.setStatus(TournamentMatchStatus.SCHEDULED);
        m.setGameSessionId(UUID.randomUUID().toString());
        m.setScheduledAt(LocalDateTime.now());
        matchRepository.save(m);
    }
}
