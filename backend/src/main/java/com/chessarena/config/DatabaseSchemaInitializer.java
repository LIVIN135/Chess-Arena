package com.chessarena.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@Order(1)
public class DatabaseSchemaInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseSchemaInitializer.class);
    private final JdbcTemplate jdbcTemplate;

    public DatabaseSchemaInitializer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        log.info("Checking and synchronizing PostgreSQL database schema columns...");
        try {
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS bio VARCHAR(250) DEFAULT 'Chess enthusiast playing on Chess Arena'");
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS rating INT DEFAULT 1200");
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS games_played INT DEFAULT 0");
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS games_won INT DEFAULT 0");
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS games_lost INT DEFAULT 0");
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS games_drawn INT DEFAULT 0");
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS puzzle_rating INT DEFAULT 1200");
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS puzzles_solved INT DEFAULT 0");
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS puzzles_attempted INT DEFAULT 0");
            jdbcTemplate.execute("UPDATE users SET rating = 1200 WHERE rating IS NULL");
            jdbcTemplate.execute("UPDATE users SET games_played = 0 WHERE games_played IS NULL");
            jdbcTemplate.execute("UPDATE users SET games_won = 0 WHERE games_won IS NULL");
            jdbcTemplate.execute("UPDATE users SET games_lost = 0 WHERE games_lost IS NULL");
            jdbcTemplate.execute("UPDATE users SET games_drawn = 0 WHERE games_drawn IS NULL");
            jdbcTemplate.execute("UPDATE users SET puzzle_rating = 1200 WHERE puzzle_rating IS NULL");
            jdbcTemplate.execute("UPDATE users SET puzzles_solved = 0 WHERE puzzles_solved IS NULL");
            jdbcTemplate.execute("UPDATE users SET puzzles_attempted = 0 WHERE puzzles_attempted IS NULL");
            jdbcTemplate.execute("UPDATE users SET bio = 'Chess enthusiast playing on Chess Arena' WHERE bio IS NULL");
            log.info("PostgreSQL database schema columns successfully verified and updated.");
        } catch (Exception e) {
            log.error("Error executing database schema migration: {}", e.getMessage(), e);
        }
    }
}
