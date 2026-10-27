package com.chessarena.repository;

import com.chessarena.entity.Tournament;
import com.chessarena.entity.TournamentStatus;
import com.chessarena.entity.TournamentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TournamentRepository extends JpaRepository<Tournament, Long> {

    List<Tournament> findAllByOrderByCreatedAtDesc();

    List<Tournament> findByStatusOrderByCreatedAtDesc(TournamentStatus status);

    List<Tournament> findByTypeOrderByCreatedAtDesc(TournamentType type);

    List<Tournament> findByStatusAndTypeOrderByCreatedAtDesc(TournamentStatus status, TournamentType type);
}
