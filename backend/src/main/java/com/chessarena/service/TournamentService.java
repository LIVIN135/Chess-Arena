package com.chessarena.service;

import com.chessarena.dto.request.CreateTournamentRequest;
import com.chessarena.dto.request.SubmitTournamentMatchResultRequest;
import com.chessarena.dto.response.*;
import com.chessarena.entity.*;
import com.chessarena.exception.ResourceNotFoundException;
import com.chessarena.repository.TournamentMatchRepository;
import com.chessarena.repository.TournamentParticipantRepository;
import com.chessarena.repository.TournamentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TournamentService {

    private static final Logger log = LoggerFactory.getLogger(TournamentService.class);

    private final TournamentRepository tournamentRepository;
    private final TournamentParticipantRepository participantRepository;
    private final TournamentMatchRepository matchRepository;

    public TournamentService(TournamentRepository tournamentRepository,
                             TournamentParticipantRepository participantRepository,
                             TournamentMatchRepository matchRepository) {
        this.tournamentRepository = tournamentRepository;
        this.participantRepository = participantRepository;
        this.matchRepository = matchRepository;
    }

    @org.springframework.cache.annotation.Cacheable("tournamentsList")
    @Transactional(readOnly = true)
    public List<TournamentResponse> getAllTournaments(TournamentStatus status, TournamentType type) {
        List<Tournament> tournaments;
        if (status != null && type != null) {
            tournaments = tournamentRepository.findByStatusAndTypeOrderByCreatedAtDesc(status, type);
        } else if (status != null) {
            tournaments = tournamentRepository.findByStatusOrderByCreatedAtDesc(status);
        } else if (type != null) {
            tournaments = tournamentRepository.findByTypeOrderByCreatedAtDesc(type);
        } else {
            tournaments = tournamentRepository.findAllByOrderByCreatedAtDesc();
        }

        return tournaments.stream()
                .map(TournamentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TournamentDetailsResponse getTournamentDetails(Long tournamentId, User currentUser) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament not found with id: " + tournamentId));

        List<TournamentParticipant> participants = participantRepository
                .findByTournamentOrderByScoreDescTieBreakDescWinsDesc(tournament);

        List<TournamentMatch> allMatches = matchRepository
                .findByTournamentOrderByRoundNumberAscBoardNumberAsc(tournament);

        List<TournamentMatch> currentRoundMatches = allMatches.stream()
                .filter(m -> Objects.equals(m.getRoundNumber(), tournament.getCurrentRound()))
                .collect(Collectors.toList());

        boolean isRegistered = false;
        boolean isCreator = false;

        if (currentUser != null) {
            isRegistered = participants.stream()
                    .anyMatch(p -> p.getUser().getId().equals(currentUser.getId()));
            isCreator = tournament.getCreatedBy() != null &&
                    tournament.getCreatedBy().getId().equals(currentUser.getId());
        }

        TournamentDetailsResponse details = new TournamentDetailsResponse();
        details.setTournament(TournamentResponse.fromEntity(tournament));
        details.setParticipants(participants.stream()
                .map(TournamentParticipantResponse::fromEntity)
                .collect(Collectors.toList()));
        details.setCurrentRoundMatches(currentRoundMatches.stream()
                .map(TournamentMatchResponse::fromEntity)
                .collect(Collectors.toList()));
        details.setAllMatches(allMatches.stream()
                .map(TournamentMatchResponse::fromEntity)
                .collect(Collectors.toList()));
        details.setIsUserRegistered(isRegistered);
        details.setIsUserCreator(isCreator);

        return details;
    }

    @org.springframework.cache.annotation.CacheEvict(value = "tournamentsList", allEntries = true)
    @Transactional
    public TournamentResponse createTournament(User currentUser, CreateTournamentRequest request) {
        Tournament tournament = new Tournament();
        tournament.setName(request.getName().trim());
        tournament.setDescription(request.getDescription());
        tournament.setType(request.getType() != null ? request.getType() : TournamentType.SWISS);
        tournament.setStatus(TournamentStatus.REGISTRATION_OPEN);
        tournament.setTimeControl(request.getTimeControl() != null ? request.getTimeControl() : "5m");
        tournament.setMaxParticipants(request.getMaxParticipants() != null ? request.getMaxParticipants() : 16);
        tournament.setRoundsTotal(request.getRoundsTotal() != null ? request.getRoundsTotal() : 3);
        tournament.setCurrentRound(0);
        tournament.setCurrentParticipantsCount(0);
        tournament.setStartTime(LocalDateTime.now().plusHours(1));
        tournament.setCreatedBy(currentUser);
        tournament.setCreatedAt(LocalDateTime.now());

        Tournament saved = tournamentRepository.save(tournament);

        // Auto-join creator if desired
        if (currentUser != null) {
            joinTournamentInternal(currentUser, saved);
        }

        return TournamentResponse.fromEntity(saved);
    }

    @org.springframework.cache.annotation.CacheEvict(value = "tournamentsList", allEntries = true)
    @Transactional
    public TournamentParticipantResponse joinTournament(User currentUser, Long tournamentId) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament not found with id: " + tournamentId));

        if (tournament.getStatus() != TournamentStatus.REGISTRATION_OPEN &&
                tournament.getStatus() != TournamentStatus.UPCOMING) {
            throw new IllegalStateException("Registration is closed for this tournament");
        }

        if (participantRepository.existsByTournamentAndUser(tournament, currentUser)) {
            throw new IllegalStateException("You are already registered for this tournament");
        }

        if (tournament.getCurrentParticipantsCount() >= tournament.getMaxParticipants()) {
            throw new IllegalStateException("Tournament has reached its maximum capacity");
        }

        TournamentParticipant participant = joinTournamentInternal(currentUser, tournament);
        return TournamentParticipantResponse.fromEntity(participant);
    }

    private TournamentParticipant joinTournamentInternal(User user, Tournament tournament) {
        TournamentParticipant participant = new TournamentParticipant(tournament, user);
        participant.setScore(0.0);
        participant.setTieBreak(0.0);
        participant.setWins(0);
        participant.setDraws(0);
        participant.setLosses(0);
        participant.setActive(true);
        participant.setJoinedAt(LocalDateTime.now());

        TournamentParticipant saved = participantRepository.save(participant);

        tournament.setCurrentParticipantsCount(tournament.getCurrentParticipantsCount() + 1);
        tournamentRepository.save(tournament);

        updateStandingsRanks(tournament);
        return saved;
    }

    @org.springframework.cache.annotation.CacheEvict(value = "tournamentsList", allEntries = true)
    @Transactional
    public void leaveTournament(User currentUser, Long tournamentId) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament not found with id: " + tournamentId));

        if (tournament.getStatus() == TournamentStatus.IN_PROGRESS ||
                tournament.getStatus() == TournamentStatus.COMPLETED) {
            throw new IllegalStateException("Cannot leave an active or completed tournament");
        }

        TournamentParticipant participant = participantRepository.findByTournamentAndUser(tournament, currentUser)
                .orElseThrow(() -> new IllegalStateException("User is not registered in this tournament"));

        participantRepository.delete(participant);

        tournament.setCurrentParticipantsCount(Math.max(0, tournament.getCurrentParticipantsCount() - 1));
        tournamentRepository.save(tournament);

        updateStandingsRanks(tournament);
    }

    @org.springframework.cache.annotation.CacheEvict(value = "tournamentsList", allEntries = true)
    @Transactional
    public TournamentDetailsResponse startTournament(User currentUser, Long tournamentId) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament not found with id: " + tournamentId));

        if (tournament.getStatus() == TournamentStatus.IN_PROGRESS ||
                tournament.getStatus() == TournamentStatus.COMPLETED) {
            throw new IllegalStateException("Tournament is already started or completed");
        }

        List<TournamentParticipant> participants = participantRepository
                .findByTournamentOrderByScoreDescTieBreakDescWinsDesc(tournament);

        if (participants.size() < 2) {
            throw new IllegalStateException("At least 2 participants are required to start a tournament");
        }

        tournament.setStatus(TournamentStatus.IN_PROGRESS);
        tournament.setCurrentRound(1);
        tournament.setStartTime(LocalDateTime.now());
        tournamentRepository.save(tournament);

        // Generate round 1 pairings
        generateRoundPairings(tournament, 1, participants);

        return getTournamentDetails(tournamentId, currentUser);
    }

    @Transactional
    public TournamentDetailsResponse submitMatchResult(User currentUser, Long tournamentId, Long matchId,
                                                        SubmitTournamentMatchResultRequest request) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament not found with id: " + tournamentId));

        TournamentMatch match = matchRepository.findById(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found with id: " + matchId));

        if (!match.getTournament().getId().equals(tournamentId)) {
            throw new IllegalArgumentException("Match does not belong to the specified tournament");
        }

        if (match.getStatus() == TournamentMatchStatus.COMPLETED) {
            throw new IllegalStateException("Match result has already been recorded");
        }

        match.setResult(request.getResult());
        match.setStatus(TournamentMatchStatus.COMPLETED);
        match.setCompletedAt(LocalDateTime.now());
        matchRepository.save(match);

        // Update scores for White and Black players
        if (match.getWhitePlayer() != null) {
            participantRepository.findByTournamentAndUser(tournament, match.getWhitePlayer())
                    .ifPresent(p -> {
                        if (request.getResult() == TournamentMatchResult.WHITE_WINS) {
                            p.setScore(p.getScore() + 1.0);
                            p.setWins(p.getWins() + 1);
                        } else if (request.getResult() == TournamentMatchResult.DRAW) {
                            p.setScore(p.getScore() + 0.5);
                            p.setDraws(p.getDraws() + 1);
                        } else if (request.getResult() == TournamentMatchResult.BLACK_WINS) {
                            p.setLosses(p.getLosses() + 1);
                        }
                        participantRepository.save(p);
                    });
        }

        if (match.getBlackPlayer() != null) {
            participantRepository.findByTournamentAndUser(tournament, match.getBlackPlayer())
                    .ifPresent(p -> {
                        if (request.getResult() == TournamentMatchResult.BLACK_WINS) {
                            p.setScore(p.getScore() + 1.0);
                            p.setWins(p.getWins() + 1);
                        } else if (request.getResult() == TournamentMatchResult.DRAW) {
                            p.setScore(p.getScore() + 0.5);
                            p.setDraws(p.getDraws() + 1);
                        } else if (request.getResult() == TournamentMatchResult.WHITE_WINS) {
                            p.setLosses(p.getLosses() + 1);
                        }
                        participantRepository.save(p);
                    });
        }

        // Recalculate tiebreaks and ranks
        updateTiebreaksAndRanks(tournament);

        // Check if all matches in the current round are completed
        List<TournamentMatch> currentMatches = matchRepository
                .findByTournamentAndRoundNumberOrderByBoardNumberAsc(tournament, tournament.getCurrentRound());

        boolean allCompleted = currentMatches.stream()
                .allMatch(m -> m.getStatus() == TournamentMatchStatus.COMPLETED);

        if (allCompleted) {
            if (tournament.getCurrentRound() >= tournament.getRoundsTotal()) {
                tournament.setStatus(TournamentStatus.COMPLETED);
                tournament.setEndTime(LocalDateTime.now());
                tournamentRepository.save(tournament);
                log.info("Tournament {} concluded after round {}", tournament.getName(), tournament.getCurrentRound());
            }
        }

        return getTournamentDetails(tournamentId, currentUser);
    }

    @Transactional
    public TournamentDetailsResponse advanceNextRound(User currentUser, Long tournamentId) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament not found with id: " + tournamentId));

        if (tournament.getStatus() != TournamentStatus.IN_PROGRESS) {
            throw new IllegalStateException("Tournament is not currently in progress");
        }

        if (tournament.getCurrentRound() >= tournament.getRoundsTotal()) {
            tournament.setStatus(TournamentStatus.COMPLETED);
            tournament.setEndTime(LocalDateTime.now());
            tournamentRepository.save(tournament);
            return getTournamentDetails(tournamentId, currentUser);
        }

        int nextRound = tournament.getCurrentRound() + 1;
        tournament.setCurrentRound(nextRound);
        tournamentRepository.save(tournament);

        List<TournamentParticipant> participants = participantRepository
                .findByTournamentOrderByScoreDescTieBreakDescWinsDesc(tournament);

        generateRoundPairings(tournament, nextRound, participants);

        return getTournamentDetails(tournamentId, currentUser);
    }

    @Transactional
    public TournamentDetailsResponse concludeTournament(User currentUser, Long tournamentId) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament not found with id: " + tournamentId));

        tournament.setStatus(TournamentStatus.COMPLETED);
        tournament.setEndTime(LocalDateTime.now());
        tournamentRepository.save(tournament);

        updateTiebreaksAndRanks(tournament);
        return getTournamentDetails(tournamentId, currentUser);
    }

    private void generateRoundPairings(Tournament tournament, int roundNumber, List<TournamentParticipant> participants) {
        List<TournamentParticipant> active = participants.stream()
                .filter(TournamentParticipant::getActive)
                .collect(Collectors.toList());

        if (active.size() < 2) return;

        // Collect previous pairings to avoid duplicate matchups
        List<TournamentMatch> pastMatches = matchRepository.findByTournamentOrderByRoundNumberAscBoardNumberAsc(tournament);
        Set<String> pairedPairs = new HashSet<>();
        for (TournamentMatch m : pastMatches) {
            if (m.getWhitePlayer() != null && m.getBlackPlayer() != null) {
                UUID id1 = m.getWhitePlayer().getId();
                UUID id2 = m.getBlackPlayer().getId();
                String key = id1.compareTo(id2) < 0 ? id1 + "-" + id2 : id2 + "-" + id1;
                pairedPairs.add(key);
            }
        }

        List<TournamentParticipant> unassigned = new ArrayList<>(active);
        int boardNumber = 1;

        while (unassigned.size() >= 2) {
            TournamentParticipant p1 = unassigned.remove(0);
            TournamentParticipant p2 = null;

            // Find best candidate opponent not yet played
            for (int i = 0; i < unassigned.size(); i++) {
                TournamentParticipant candidate = unassigned.get(i);
                UUID id1 = p1.getUser().getId();
                UUID id2 = candidate.getUser().getId();
                String key = id1.compareTo(id2) < 0 ? id1 + "-" + id2 : id2 + "-" + id1;
                if (!pairedPairs.contains(key) || unassigned.size() <= 2) {
                    p2 = candidate;
                    unassigned.remove(i);
                    pairedPairs.add(key);
                    break;
                }
            }

            if (p2 == null) {
                p2 = unassigned.remove(0);
            }

            // Alternating colors
            boolean p1White = (boardNumber % 2 == 1);
            User white = p1White ? p1.getUser() : p2.getUser();
            User black = p1White ? p2.getUser() : p1.getUser();

            TournamentMatch match = new TournamentMatch();
            match.setTournament(tournament);
            match.setRoundNumber(roundNumber);
            match.setBoardNumber(boardNumber++);
            match.setWhitePlayer(white);
            match.setBlackPlayer(black);
            match.setResult(TournamentMatchResult.PENDING);
            match.setStatus(TournamentMatchStatus.SCHEDULED);
            match.setGameSessionId(UUID.randomUUID().toString());
            match.setScheduledAt(LocalDateTime.now());
            matchRepository.save(match);
        }

        // Odd player gets a bye
        if (unassigned.size() == 1) {
            TournamentParticipant byePlayer = unassigned.remove(0);
            TournamentMatch byeMatch = new TournamentMatch();
            byeMatch.setTournament(tournament);
            byeMatch.setRoundNumber(roundNumber);
            byeMatch.setBoardNumber(boardNumber);
            byeMatch.setWhitePlayer(byePlayer.getUser());
            byeMatch.setBlackPlayer(null);
            byeMatch.setResult(TournamentMatchResult.WHITE_WINS);
            byeMatch.setStatus(TournamentMatchStatus.COMPLETED);
            byeMatch.setCompletedAt(LocalDateTime.now());
            matchRepository.save(byeMatch);

            byePlayer.setScore(byePlayer.getScore() + 1.0);
            byePlayer.setWins(byePlayer.getWins() + 1);
            participantRepository.save(byePlayer);
        }
    }

    private void updateTiebreaksAndRanks(Tournament tournament) {
        List<TournamentParticipant> participants = participantRepository
                .findByTournamentOrderByScoreDescTieBreakDescWinsDesc(tournament);

        List<TournamentMatch> allMatches = matchRepository
                .findByTournamentOrderByRoundNumberAscBoardNumberAsc(tournament);

        Map<UUID, Double> scoresByUserId = participants.stream()
                .collect(Collectors.toMap(p -> p.getUser().getId(), TournamentParticipant::getScore));

        // Calculate Buchholz tiebreak: sum of scores of all opponents faced
        for (TournamentParticipant p : participants) {
            UUID userId = p.getUser().getId();
            double buchholz = 0.0;
            for (TournamentMatch m : allMatches) {
                if (m.getStatus() == TournamentMatchStatus.COMPLETED) {
                    if (m.getWhitePlayer() != null && m.getWhitePlayer().getId().equals(userId) && m.getBlackPlayer() != null) {
                        buchholz += scoresByUserId.getOrDefault(m.getBlackPlayer().getId(), 0.0);
                    } else if (m.getBlackPlayer() != null && m.getBlackPlayer().getId().equals(userId) && m.getWhitePlayer() != null) {
                        buchholz += scoresByUserId.getOrDefault(m.getWhitePlayer().getId(), 0.0);
                    }
                }
            }
            p.setTieBreak(Math.round(buchholz * 10.0) / 10.0);
        }

        participantRepository.saveAll(participants);
        updateStandingsRanks(tournament);
    }

    private void updateStandingsRanks(Tournament tournament) {
        List<TournamentParticipant> participants = participantRepository
                .findByTournamentOrderByScoreDescTieBreakDescWinsDesc(tournament);

        int rank = 1;
        for (TournamentParticipant p : participants) {
            p.setRank(rank++);
        }
        participantRepository.saveAll(participants);
    }
}
