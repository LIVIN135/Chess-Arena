package com.chessarena.repository;

import com.chessarena.entity.GameAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface GameAnalysisRepository extends JpaRepository<GameAnalysis, UUID> {
    Optional<GameAnalysis> findByGameId(UUID gameId);
    boolean existsByGameId(UUID gameId);
}
