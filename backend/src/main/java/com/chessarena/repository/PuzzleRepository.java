package com.chessarena.repository;

import com.chessarena.entity.Puzzle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PuzzleRepository extends JpaRepository<Puzzle, UUID> {

    Optional<Puzzle> findByPuzzleCode(String puzzleCode);

    List<Puzzle> findByRatingBetween(int minRating, int maxRating);

    List<Puzzle> findByThemesContainingIgnoreCase(String theme);

    List<Puzzle> findByRatingBetweenAndThemesContainingIgnoreCase(int minRating, int maxRating, String theme);
}
