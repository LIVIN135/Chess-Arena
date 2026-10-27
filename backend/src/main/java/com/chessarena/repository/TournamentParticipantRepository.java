package com.chessarena.repository;

import com.chessarena.entity.Tournament;
import com.chessarena.entity.TournamentParticipant;
import com.chessarena.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TournamentParticipantRepository extends JpaRepository<TournamentParticipant, Long> {

    List<TournamentParticipant> findByTournamentOrderByScoreDescTieBreakDescWinsDesc(Tournament tournament);

    Optional<TournamentParticipant> findByTournamentAndUser(Tournament tournament, User user);

    boolean existsByTournamentAndUser(Tournament tournament, User user);

    long countByTournament(Tournament tournament);

    List<TournamentParticipant> findByUserOrderByJoinedAtDesc(User user);
}
