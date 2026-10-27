package com.chessarena.repository;

import com.chessarena.entity.Game;
import com.chessarena.entity.User;
import com.chessarena.entity.GameStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface GameRepository extends JpaRepository<Game, UUID> {

    @Query("SELECT g FROM Game g LEFT JOIN FETCH g.moves WHERE g.id = :id")
    Optional<Game> findByIdWithMoves(@Param("id") UUID id);

    List<Game> findByWhitePlayerOrBlackPlayerOrderByStartTimeDesc(User whitePlayer, User blackPlayer);

    List<Game> findByWhitePlayerOrBlackPlayerOrderByStartTimeDesc(User whitePlayer, User blackPlayer, Pageable pageable);

    List<Game> findByOrderByStartTimeDesc(Pageable pageable);

    long countByStatus(GameStatus status);
}
