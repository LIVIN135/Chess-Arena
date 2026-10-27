package com.chessarena.repository;

import com.chessarena.entity.Puzzle;
import com.chessarena.entity.PuzzleAttempt;
import com.chessarena.entity.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PuzzleAttemptRepository extends JpaRepository<PuzzleAttempt, UUID> {

    List<PuzzleAttempt> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);

    List<PuzzleAttempt> findByUserOrderByCreatedAtDesc(User user);

    long countByUserAndIsSolvedTrue(User user);

    long countByUser(User user);

    boolean existsByUserAndPuzzleAndIsSolvedTrue(User user, Puzzle puzzle);
}
