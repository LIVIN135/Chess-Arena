package com.chessarena.repository;

import com.chessarena.entity.Tournament;
import com.chessarena.entity.TournamentMatch;
import com.chessarena.entity.TournamentMatchStatus;
import com.chessarena.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TournamentMatchRepository extends JpaRepository<TournamentMatch, Long> {

    List<TournamentMatch> findByTournamentOrderByRoundNumberAscBoardNumberAsc(Tournament tournament);

    List<TournamentMatch> findByTournamentAndRoundNumberOrderByBoardNumberAsc(Tournament tournament, Integer roundNumber);

    List<TournamentMatch> findByTournamentAndStatus(Tournament tournament, TournamentMatchStatus status);

    List<TournamentMatch> findByTournamentAndWhitePlayerOrTournamentAndBlackPlayer(Tournament t1, User white, Tournament t2, User black);
}
