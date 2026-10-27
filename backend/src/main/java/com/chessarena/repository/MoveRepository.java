package com.chessarena.repository;

import com.chessarena.entity.Move;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MoveRepository extends JpaRepository<Move, UUID> {
    List<Move> findByGameIdOrderByMoveNumberAsc(UUID gameId);
}
