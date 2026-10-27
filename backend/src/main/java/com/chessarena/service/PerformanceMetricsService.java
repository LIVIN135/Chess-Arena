package com.chessarena.service;

import com.chessarena.dto.response.PerformanceMetricsResponse;
import com.chessarena.entity.GameStatus;
import com.chessarena.repository.GameRepository;
import com.chessarena.repository.PuzzleRepository;
import com.chessarena.repository.TournamentRepository;
import com.chessarena.repository.UserRepository;
import com.zaxxer.hikari.HikariDataSource;
import com.zaxxer.hikari.HikariPoolMXBean;
import io.micrometer.core.instrument.MeterRegistry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.lang.management.ManagementFactory;
import java.lang.management.OperatingSystemMXBean;
import java.lang.management.RuntimeMXBean;
import java.lang.management.ThreadMXBean;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class PerformanceMetricsService {

    private static final Logger log = LoggerFactory.getLogger(PerformanceMetricsService.class);

    private final DataSource dataSource;
    private final JdbcTemplate jdbcTemplate;
    private final GameRepository gameRepository;
    private final PuzzleRepository puzzleRepository;
    private final TournamentRepository tournamentRepository;
    private final UserRepository userRepository;
    private final CacheManager cacheManager;
    private final MeterRegistry meterRegistry;

    public PerformanceMetricsService(DataSource dataSource,
                                     JdbcTemplate jdbcTemplate,
                                     GameRepository gameRepository,
                                     PuzzleRepository puzzleRepository,
                                     TournamentRepository tournamentRepository,
                                     UserRepository userRepository,
                                     CacheManager cacheManager,
                                     MeterRegistry meterRegistry) {
        this.dataSource = dataSource;
        this.jdbcTemplate = jdbcTemplate;
        this.gameRepository = gameRepository;
        this.puzzleRepository = puzzleRepository;
        this.tournamentRepository = tournamentRepository;
        this.userRepository = userRepository;
        this.cacheManager = cacheManager;
        this.meterRegistry = meterRegistry;
    }

    @org.springframework.cache.annotation.Cacheable("metrics")
    public PerformanceMetricsResponse collectPerformanceMetrics() {
        PerformanceMetricsResponse metrics = new PerformanceMetricsResponse();
        metrics.setTimestamp(LocalDateTime.now());

        // 1. JVM Memory
        Runtime runtime = Runtime.getRuntime();
        long totalMemory = runtime.totalMemory();
        long freeMemory = runtime.freeMemory();
        long maxMemory = runtime.maxMemory();
        long usedMemory = totalMemory - freeMemory;

        long heapUsedMb = usedMemory / (1024 * 1024);
        long heapMaxMb = maxMemory / (1024 * 1024);
        long heapCommittedMb = totalMemory / (1024 * 1024);
        double usagePercent = Math.round(((double) usedMemory / (double) maxMemory) * 1000.0) / 10.0;

        metrics.setHeapUsedMb(heapUsedMb);
        metrics.setHeapMaxMb(heapMaxMb);
        metrics.setHeapCommittedMb(heapCommittedMb);
        metrics.setHeapUsagePercent(usagePercent);
        metrics.setNonHeapUsedMb(ManagementFactory.getMemoryMXBean().getNonHeapMemoryUsage().getUsed() / (1024 * 1024));

        // 2. CPU & Threads
        OperatingSystemMXBean osBean = ManagementFactory.getOperatingSystemMXBean();
        metrics.setAvailableProcessors(osBean.getAvailableProcessors());
        metrics.setSystemCpuLoad(Math.max(0.0, Math.round(osBean.getSystemLoadAverage() * 10.0) / 10.0));

        ThreadMXBean threadBean = ManagementFactory.getThreadMXBean();
        metrics.setActiveThreadCount(threadBean.getThreadCount());
        metrics.setPeakThreadCount(threadBean.getPeakThreadCount());

        RuntimeMXBean runtimeMXBean = ManagementFactory.getRuntimeMXBean();
        metrics.setUptimeSeconds(runtimeMXBean.getUptime() / 1000);

        // 3. Database Connection Pool & Ping Latency
        if (dataSource instanceof HikariDataSource hikari) {
            HikariPoolMXBean poolBean = hikari.getHikariPoolMXBean();
            if (poolBean != null) {
                metrics.setDbActiveConnections(poolBean.getActiveConnections());
                metrics.setDbIdleConnections(poolBean.getIdleConnections());
                metrics.setDbTotalConnections(poolBean.getTotalConnections());
            }
            metrics.setDbMaxConnections(hikari.getMaximumPoolSize());
        }

        long startNano = System.nanoTime();
        try {
            jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            long elapsedNanos = System.nanoTime() - startNano;
            metrics.setDbQueryLatencyMs(Math.round((elapsedNanos / 1_000_000.0) * 100.0) / 100.0);
        } catch (Exception e) {
            log.warn("Database latency check failed: {}", e.getMessage());
            metrics.setDbQueryLatencyMs(-1.0);
            metrics.setStatus("DEGRADED");
        }

        // 4. Application Counters
        try {
            metrics.setTotalGames(gameRepository.count());
            metrics.setActiveGames(gameRepository.countByStatus(GameStatus.IN_PROGRESS));
            metrics.setTotalPuzzles(puzzleRepository.count());
            metrics.setTotalTournaments(tournamentRepository.count());
            metrics.setTotalUsers(userRepository.count());
        } catch (Exception e) {
            log.warn("Failed to collect application counters: {}", e.getMessage());
        }

        // 5. Caches
        Map<String, Integer> cacheSizes = new HashMap<>();
        for (String name : cacheManager.getCacheNames()) {
            Cache cache = cacheManager.getCache(name);
            cacheSizes.put(name, cache != null ? 1 : 0);
        }
        metrics.setCacheSizes(cacheSizes);

        // Increment Micrometer counter
        meterRegistry.counter("chess_arena.monitoring.collections.total").increment();

        return metrics;
    }

    public void clearAllCaches() {
        for (String name : cacheManager.getCacheNames()) {
            Cache cache = cacheManager.getCache(name);
            if (cache != null) {
                cache.clear();
            }
        }
        log.info("Cleared all application memory caches.");
    }
}
