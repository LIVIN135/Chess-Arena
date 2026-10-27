package com.chessarena.controller;

import com.chessarena.dto.request.CreateTournamentRequest;
import com.chessarena.dto.request.SubmitTournamentMatchResultRequest;
import com.chessarena.dto.response.TournamentDetailsResponse;
import com.chessarena.dto.response.TournamentParticipantResponse;
import com.chessarena.dto.response.TournamentResponse;
import com.chessarena.entity.TournamentStatus;
import com.chessarena.entity.TournamentType;
import com.chessarena.entity.User;
import com.chessarena.repository.UserRepository;
import com.chessarena.service.TournamentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tournaments")
public class TournamentController {

    private final TournamentService tournamentService;

    public TournamentController(TournamentService tournamentService) {
        this.tournamentService = tournamentService;
    }

    @GetMapping
    public ResponseEntity<List<TournamentResponse>> getAllTournaments(
            @RequestParam(required = false) TournamentStatus status,
            @RequestParam(required = false) TournamentType type) {
        return ResponseEntity.ok(tournamentService.getAllTournaments(status, type));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TournamentDetailsResponse> getTournamentDetails(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(tournamentService.getTournamentDetails(id, currentUser));
    }

    @PostMapping
    public ResponseEntity<TournamentResponse> createTournament(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody CreateTournamentRequest request) {
        TournamentResponse created = tournamentService.createTournament(currentUser, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<TournamentParticipantResponse> joinTournament(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(tournamentService.joinTournament(currentUser, id));
    }

    @PostMapping("/{id}/leave")
    public ResponseEntity<Void> leaveTournament(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        tournamentService.leaveTournament(currentUser, id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<TournamentDetailsResponse> startTournament(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(tournamentService.startTournament(currentUser, id));
    }

    @PostMapping("/{id}/matches/{matchId}/result")
    public ResponseEntity<TournamentDetailsResponse> submitMatchResult(
            @PathVariable Long id,
            @PathVariable Long matchId,
            @Valid @RequestBody SubmitTournamentMatchResultRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(tournamentService.submitMatchResult(currentUser, id, matchId, request));
    }

    @PostMapping("/{id}/next-round")
    public ResponseEntity<TournamentDetailsResponse> advanceNextRound(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(tournamentService.advanceNextRound(currentUser, id));
    }

    @PostMapping("/{id}/conclude")
    public ResponseEntity<TournamentDetailsResponse> concludeTournament(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(tournamentService.concludeTournament(currentUser, id));
    }
}
