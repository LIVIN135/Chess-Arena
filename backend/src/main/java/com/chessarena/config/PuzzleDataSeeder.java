package com.chessarena.config;

import com.chessarena.entity.Puzzle;
import com.chessarena.repository.PuzzleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Order(2)
public class PuzzleDataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(PuzzleDataSeeder.class);
    private final PuzzleRepository puzzleRepository;
    private final com.chessarena.repository.PuzzleAttemptRepository attemptRepository;

    public PuzzleDataSeeder(PuzzleRepository puzzleRepository, com.chessarena.repository.PuzzleAttemptRepository attemptRepository) {
        this.puzzleRepository = puzzleRepository;
        this.attemptRepository = attemptRepository;
    }

    @Override
    public void run(String... args) {
        attemptRepository.deleteAll();
        puzzleRepository.deleteAll();
        log.info("Seeding tactical chess puzzles into PostgreSQL...");

        List<Puzzle> initialPuzzles = List.of(
            new Puzzle("PZ-001", "r1bqkbnr/pppp1ppp/2n5/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 3 3", "g8f6 h5f7", 800, "mateIn1,opening", "Black blunders Nf6 against the Scholar setup. Deliver mate!"),
            new Puzzle("PZ-002", "rnbqkbnr/pppp1ppp/8/4p3/8/5P2/PPPPP1PP/RNBQKBNR w KQkq - 0 2", "g2g4 d8h4", 750, "mateIn1,opening", "White opens up the king with g4. Deliver the quickest mate in chess!"),
            new Puzzle("PZ-003", "rn1qkbnr/ppp2p1p/3p2p1/4N3/2B1P1b1/2N5/PPPP1PPP/R1BQK2R b KQkq - 0 5", "g4d1 c4f7 e8e7 c3d5", 1250, "sacrifice,checkmate,opening", "Legals Mate trap! White sacrifices the queen to force a king hunt mate."),
            new Puzzle("PZ-004", "r1b1kbnr/pppp1Npp/8/8/2Bnq3/8/PPPP1P1P/RNBQKR2 w Qkq - 0 7", "c4e2 d4f3", 1300, "smotheredMate,fork,trap", "Smothered mate on f3 with the knight!"),
            new Puzzle("PZ-005", "rnbqkbnr/pppp2pp/8/4p2Q/4P3/8/PPPP1PPP/RNB1KB1R b KQkq - 1 4", "e8e7 h5e5 e7f7 f1c4", 1100, "attack,opening,kingHunt", "Punish 2...f6 with Qh5+ and hunt the king!"),
            new Puzzle("PZ-006", "r1bqkbnr/pp1npppp/2p5/8/3PN3/8/PPP1QPPP/R1B1KBNR b KQkq - 2 5", "g8f6 e4d6", 950, "smotheredMate,mateIn1,pin", "Black carelessly plays Ngf6. Deliver smothered mate on d6!"),
            new Puzzle("PZ-007", "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R b KQkq - 5 4", "f6e4 c3e4 d7d5", 1150, "fork,tactic,opening", "The classic center fork trick! Win back the piece with an ideal center pawn fork."),
            new Puzzle("PZ-008", "r1bqkb1r/ppp2ppp/2n2n2/3Pp1N1/2B5/8/PPPP1PPP/RNBQK2R b KQkq - 0 5", "c6a5 c4b5 c7c6 d5c6 b7c6", 1200, "opening,defense", "Hit the bishop and regain counterplay against the Italian Game."),
            new Puzzle("PZ-009", "rnbqkbnr/ppp2ppp/8/3P4/4p3/5N2/PPPPQPPP/RNB1KB1R b KQkq - 1 4", "d8e7 d2d3 e4d3 c2d3", 1050, "pin,queen,opening", "Pin the e-pawn against the enemy king."),
            new Puzzle("PZ-010", "r1b1k2r/ppppqppp/2n5/4P3/1bP2Bn1/P4N2/1P1NPPPP/R2QKB1R b KQkq - 0 7", "g4e5 a3b4 e5d3", 1400, "smotheredMate,pin,trap", "A stunning smothered mate utilizing the pinned d2 knight!"),
            new Puzzle("PZ-011", "r3kbnr/pp1b1ppp/4p3/3pP3/3q4/2NB4/PP3PPP/R1BQ1RK1 b kq - 1 10", "a7a6 d1e2 g8e7", 1350, "advantage,development", "Prevent White Nb5 threat and solidify the extra pawn."),
            new Puzzle("PZ-012", "rn2kbnr/pp2pppp/2p5/q7/3P2b1/2N2N1P/PPP2PP1/R1BQKB1R b KQkq - 0 6", "g4h5 g2g4 h5g6 f3e5", 1250, "advantage,pieceTrapping", "Trap the bishop and expand kingside control."),
            new Puzzle("PZ-013", "rnb1kb1r/1p3ppp/pq1ppn2/6B1/3NPP2/2N5/PPPQ2PP/R3KB1R b KQkq - 2 8", "b6b2 a1b1 b2a3", 1450, "poisonedPawn,tactics", "Safely navigate the famous Poisoned Pawn variation!"),
            new Puzzle("PZ-014", "r1bqkb1r/pppn1ppp/5n2/3N2B1/3P4/8/PP2PPPP/R2QKBNR b KQkq - 0 6", "f6d5 g5d8 f8b4 d1d2 b4d2", 1350, "discoveredAttack,sacrifice,trap", "The Cambridge Springs trap: win back the queen with interest!"),
            new Puzzle("PZ-015", "r1bqkbnr/2p2ppp/p2p4/1p6/3QP3/1B6/PPP2PPP/RNB1K2R b KQkq - 0 8", "c7c5 d4d5 c8e6 d5c6 e6d7 c6d5 c5c4", 1400, "trappedPiece,noahsArk,opening", "Trap White light-squared bishop with c5 and c4!"),
            new Puzzle("PZ-016", "rnbqkb1r/ppp2ppp/3p4/8/4n3/5N2/PPPPQPPP/RNB1KB1R b KQkq - 1 5", "d8e7 d2d3 e4f6 c1g5", 1000, "pin,queen,opening", "Pin and exert pressure on the unpinned knight."),
            new Puzzle("PZ-017", "rnbqkb1r/1p1p1ppp/p3pn2/4P3/3N4/3B4/PPP2PPP/RNBQK2R b KQkq - 0 6", "d8a5 c2c3 a5e5", 1150, "fork,doubleAttack", "Double attack with Qa5+ picking up the loose e5 pawn!"),
            new Puzzle("PZ-018", "r1bqk1nr/pppp1Bpp/2n5/2b5/4P3/2p2N2/PP3PPP/RNBQK2R b KQkq - 0 6", "e8f7 d1d5 f7e8 d5c5", 1200, "doubleAttack,regainPiece", "King sacrifice followed by Queen fork to regain material!"),
            new Puzzle("PZ-019", "r1bqk1nr/pppp1ppp/2n5/b7/2BpP3/2P2N2/P4PPP/RNBQ1RK1 b kq - 1 7", "g8e7 c3d4 d7d5", 1250, "evansGambit,counterAttack", "Strike back in the center against the Evans Gambit!"),
            new Puzzle("PZ-020", "rnbqkbnr/pppp1p1p/8/8/2B1Pp2/5Q2/PPPP2PP/RNB2RK1 b kq - 0 6", "d8f6 e4e5 f6e5", 1450, "sacrifice,counterPlay", "Safely consume the pawn and hold dynamic defense."),
            new Puzzle("PZ-021", "r1bqkb1r/pppp1ppp/5n2/1B2N3/3nP3/2N5/PPPP1PPP/R1BQK2R b KQkq - 0 5", "d8e7 f2f4 d4b5 c3b5 d7d6", 1300, "tactic,fork,middleGame", "Recover the piece by kicking the knight and bishop."),
            new Puzzle("PZ-022", "rnbqkb1r/ppp2ppp/8/3pP3/4n3/2N2Q2/PPPP2PP/R1B1KBNR b KQkq - 1 5", "f7f5 d2d3 e4c3 b2c3", 1200, "center,development", "Anchor the knight on e4 and ruin White pawn structure."),
            new Puzzle("PZ-023", "rnbqk1nr/ppp2p1p/3b4/6p1/8/5N2/PPPPP1PP/RNBQKB1R w KQkq - 0 5", "h2h3 d6g3", 900, "mateIn1,opening", "White plays h3 neglecting the dark squares. Deliver mate with Bg3#!"),
            new Puzzle("PZ-024", "rnbqk2r/pp2ppbp/3p1np1/1Bp5/3PPP2/2N2N2/PPP3PP/R1BQK2R b KQkq - 1 6", "c8d7 e4e5 f6g4", 1350, "tactics,center", "Block the check and maneuver the knight into a strong outpost."),
            new Puzzle("PZ-025", "r1b1kbnr/pp2pppp/1qn5/2pp4/3P1B2/1QP1P3/PP3PPP/RN2KBNR b KQkq - 2 5", "c5c4 b3b6 a7b6", 1100, "endgame,queenTrade", "Trap the queenside and open the a-file for the rook.")
        );

        puzzleRepository.saveAll(initialPuzzles);
        log.info("Successfully seeded {} tactical puzzles into database.", initialPuzzles.size());
    }
}
