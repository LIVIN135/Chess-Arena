package com.chessarena.service;

import com.chessarena.dto.request.SubmitPuzzleAttemptRequest;
import com.chessarena.dto.response.PuzzleAttemptResponse;
import com.chessarena.dto.response.PuzzleResponse;
import com.chessarena.dto.response.PuzzleStatsResponse;
import com.chessarena.entity.Puzzle;
import com.chessarena.entity.PuzzleAttempt;
import com.chessarena.entity.User;
import com.chessarena.repository.PuzzleAttemptRepository;
import com.chessarena.repository.PuzzleRepository;
import com.chessarena.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Service
public class PuzzleService {

    private final PuzzleRepository puzzleRepository;
    private final PuzzleAttemptRepository attemptRepository;
    private final UserRepository userRepository;

    public PuzzleService(PuzzleRepository puzzleRepository,
                         PuzzleAttemptRepository attemptRepository,
                         UserRepository userRepository) {
        this.puzzleRepository = puzzleRepository;
        this.attemptRepository = attemptRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public PuzzleResponse getRandomPuzzle(Integer targetRating, String theme) {
        List<Puzzle> candidates;

        if (theme != null && !theme.isBlank() && !theme.equalsIgnoreCase("all")) {
            if (targetRating != null) {
                int min = Math.max(500, targetRating - 250);
                int max = targetRating + 250;
                candidates = puzzleRepository.findByRatingBetweenAndThemesContainingIgnoreCase(min, max, theme);
            } else {
                candidates = puzzleRepository.findByThemesContainingIgnoreCase(theme);
            }
        } else if (targetRating != null) {
            int min = Math.max(500, targetRating - 250);
            int max = targetRating + 250;
            candidates = puzzleRepository.findByRatingBetween(min, max);
        } else {
            candidates = puzzleRepository.findAll();
        }

        if (candidates.isEmpty()) {
            candidates = puzzleRepository.findAll();
        }

        if (candidates.isEmpty()) {
            throw new IllegalStateException("No puzzles available in database");
        }

        int index = ThreadLocalRandom.current().nextInt(candidates.size());
        return toPuzzleResponse(candidates.get(index));
    }

    @org.springframework.cache.annotation.Cacheable("dailyPuzzle")
    @Transactional(readOnly = true)
    public PuzzleResponse getDailyPuzzle() {
        List<Puzzle> all = puzzleRepository.findAll();
        if (all.isEmpty()) {
            throw new IllegalStateException("No puzzles available in database");
        }
        int dayOfYear = LocalDate.now().getDayOfYear();
        int index = dayOfYear % all.size();
        return toPuzzleResponse(all.get(index));
    }

    @Transactional(readOnly = true)
    public PuzzleResponse getPuzzleById(UUID id) {
        Puzzle puzzle = puzzleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Puzzle not found with ID: " + id));
        return toPuzzleResponse(puzzle);
    }

    @Transactional
    public PuzzleAttemptResponse submitAttempt(User user, UUID puzzleId, SubmitPuzzleAttemptRequest request) {
        Puzzle puzzle = puzzleRepository.findById(puzzleId)
                .orElseThrow(() -> new IllegalArgumentException("Puzzle not found with ID: " + puzzleId));

        int userRatingBefore = user != null ? user.getPuzzleRating() : 1200;
        int puzzleRating = puzzle.getRating();

        // Calculate Elo change
        double expectedScore = 1.0 / (1.0 + Math.pow(10.0, (puzzleRating - userRatingBefore) / 400.0));
        double actualScore = request.isSolved() ? 1.0 : 0.0;
        int kFactor = 32;
        int ratingChange = (int) Math.round(kFactor * (actualScore - expectedScore));

        if (request.isSolved() && ratingChange <= 0) {
            ratingChange = 8;
        } else if (!request.isSolved() && ratingChange >= 0) {
            ratingChange = -8;
        }

        int userRatingAfter = Math.max(400, userRatingBefore + ratingChange);
        int totalSolved = 0;
        int totalAttempted = 0;

        PuzzleAttempt attempt = new PuzzleAttempt(
                user,
                puzzle,
                request.isSolved(),
                userRatingBefore,
                userRatingAfter,
                ratingChange,
                request.getTimeTakenSeconds()
        );

        if (user != null) {
            User managedUser = userRepository.findById(user.getId()).orElse(user);
            managedUser.setPuzzleRating(userRatingAfter);
            managedUser.setPuzzlesAttempted(managedUser.getPuzzlesAttempted() + 1);
            if (request.isSolved()) {
                managedUser.setPuzzlesSolved(managedUser.getPuzzlesSolved() + 1);
            }
            User savedUser = userRepository.save(managedUser);
            totalSolved = savedUser.getPuzzlesSolved();
            totalAttempted = savedUser.getPuzzlesAttempted();
            attempt.setUser(savedUser);
        }

        puzzle.setNbPlays(puzzle.getNbPlays() + 1);
        puzzleRepository.save(puzzle);
        PuzzleAttempt savedAttempt = attemptRepository.save(attempt);

        String message = request.isSolved()
                ? "Puzzle solved! +" + ratingChange + " Elo rating points"
                : "Puzzle failed! " + ratingChange + " Elo rating points";

        return new PuzzleAttemptResponse(
                savedAttempt.getId(),
                puzzle.getId(),
                request.isSolved(),
                ratingChange,
                userRatingBefore,
                userRatingAfter,
                totalSolved,
                totalAttempted,
                message
        );
    }

    @Transactional(readOnly = true)
    public PuzzleStatsResponse getUserStats(User user) {
        if (user == null) {
            return new PuzzleStatsResponse(1200, 0, 0);
        }
        User managedUser = userRepository.findById(user.getId()).orElse(user);
        return new PuzzleStatsResponse(
                managedUser.getPuzzleRating(),
                managedUser.getPuzzlesSolved(),
                managedUser.getPuzzlesAttempted()
        );
    }

    @Transactional(readOnly = true)
    public List<String> getAvailableThemes() {
        return List.of(
                "all",
                "mateIn1",
                "fork",
                "pin",
                "smotheredMate",
                "sacrifice",
                "opening",
                "endgame",
                "advantage"
        );
    }

    private PuzzleResponse toPuzzleResponse(Puzzle p) {
        String[] allMoves = p.getMoves().split("\\s+");
        String initialMove = allMoves.length > 0 ? allMoves[0] : "";
        List<String> solutionMoves = new ArrayList<>();
        for (int i = 1; i < allMoves.length; i++) {
            solutionMoves.add(allMoves[i]);
        }

        // Determine player color based on FEN turn
        String[] fenParts = p.getFen().split("\\s+");
        String initialTurn = fenParts.length > 1 ? fenParts[1] : "w";
        // If initialTurn was 'w', White plays initialMove, so player is Black ('black')
        // If initialTurn was 'b', Black plays initialMove, so player is White ('white')
        String playerColor = "w".equalsIgnoreCase(initialTurn) ? "black" : "white";

        List<String> themes = p.getThemes() != null
                ? Arrays.stream(p.getThemes().split(","))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .collect(Collectors.toList())
                : Collections.emptyList();

        return new PuzzleResponse(
                p.getId(),
                p.getPuzzleCode(),
                p.getFen(),
                p.getMoves(),
                initialMove,
                solutionMoves,
                p.getRating(),
                themes,
                p.getDescription(),
                playerColor
        );
    }
}
