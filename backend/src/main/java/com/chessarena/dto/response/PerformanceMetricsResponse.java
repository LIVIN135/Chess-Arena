package com.chessarena.dto.response;

import java.time.LocalDateTime;
import java.util.Map;

public class PerformanceMetricsResponse {

    private LocalDateTime timestamp = LocalDateTime.now();
    private String status = "HEALTHY";
    private long uptimeSeconds;

    // JVM Memory (MB)
    private long heapUsedMb;
    private long heapMaxMb;
    private long heapCommittedMb;
    private double heapUsagePercent;
    private long nonHeapUsedMb;

    // CPU & Threads
    private int availableProcessors;
    private double systemCpuLoad;
    private double processCpuLoad;
    private int activeThreadCount;
    private int peakThreadCount;

    // Database Connection Pool (HikariCP)
    private int dbActiveConnections;
    private int dbIdleConnections;
    private int dbTotalConnections;
    private int dbMaxConnections;
    private double dbQueryLatencyMs;

    // Application Counters
    private long totalGames;
    private long activeGames;
    private long totalPuzzles;
    private long totalTournaments;
    private long totalUsers;

    // Active Caches
    private Map<String, Integer> cacheSizes;

    public PerformanceMetricsResponse() {}

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public long getUptimeSeconds() {
        return uptimeSeconds;
    }

    public void setUptimeSeconds(long uptimeSeconds) {
        this.uptimeSeconds = uptimeSeconds;
    }

    public long getHeapUsedMb() {
        return heapUsedMb;
    }

    public void setHeapUsedMb(long heapUsedMb) {
        this.heapUsedMb = heapUsedMb;
    }

    public long getHeapMaxMb() {
        return heapMaxMb;
    }

    public void setHeapMaxMb(long heapMaxMb) {
        this.heapMaxMb = heapMaxMb;
    }

    public long getHeapCommittedMb() {
        return heapCommittedMb;
    }

    public void setHeapCommittedMb(long heapCommittedMb) {
        this.heapCommittedMb = heapCommittedMb;
    }

    public double getHeapUsagePercent() {
        return heapUsagePercent;
    }

    public void setHeapUsagePercent(double heapUsagePercent) {
        this.heapUsagePercent = heapUsagePercent;
    }

    public long getNonHeapUsedMb() {
        return nonHeapUsedMb;
    }

    public void setNonHeapUsedMb(long nonHeapUsedMb) {
        this.nonHeapUsedMb = nonHeapUsedMb;
    }

    public int getAvailableProcessors() {
        return availableProcessors;
    }

    public void setAvailableProcessors(int availableProcessors) {
        this.availableProcessors = availableProcessors;
    }

    public double getSystemCpuLoad() {
        return systemCpuLoad;
    }

    public void setSystemCpuLoad(double systemCpuLoad) {
        this.systemCpuLoad = systemCpuLoad;
    }

    public double getProcessCpuLoad() {
        return processCpuLoad;
    }

    public void setProcessCpuLoad(double processCpuLoad) {
        this.processCpuLoad = processCpuLoad;
    }

    public int getActiveThreadCount() {
        return activeThreadCount;
    }

    public void setActiveThreadCount(int activeThreadCount) {
        this.activeThreadCount = activeThreadCount;
    }

    public int getPeakThreadCount() {
        return peakThreadCount;
    }

    public void setPeakThreadCount(int peakThreadCount) {
        this.peakThreadCount = peakThreadCount;
    }

    public int getDbActiveConnections() {
        return dbActiveConnections;
    }

    public void setDbActiveConnections(int dbActiveConnections) {
        this.dbActiveConnections = dbActiveConnections;
    }

    public int getDbIdleConnections() {
        return dbIdleConnections;
    }

    public void setDbIdleConnections(int dbIdleConnections) {
        this.dbIdleConnections = dbIdleConnections;
    }

    public int getDbTotalConnections() {
        return dbTotalConnections;
    }

    public void setDbTotalConnections(int dbTotalConnections) {
        this.dbTotalConnections = dbTotalConnections;
    }

    public int getDbMaxConnections() {
        return dbMaxConnections;
    }

    public void setDbMaxConnections(int dbMaxConnections) {
        this.dbMaxConnections = dbMaxConnections;
    }

    public double getDbQueryLatencyMs() {
        return dbQueryLatencyMs;
    }

    public void setDbQueryLatencyMs(double dbQueryLatencyMs) {
        this.dbQueryLatencyMs = dbQueryLatencyMs;
    }

    public long getTotalGames() {
        return totalGames;
    }

    public void setTotalGames(long totalGames) {
        this.totalGames = totalGames;
    }

    public long getActiveGames() {
        return activeGames;
    }

    public void setActiveGames(long activeGames) {
        this.activeGames = activeGames;
    }

    public long getTotalPuzzles() {
        return totalPuzzles;
    }

    public void setTotalPuzzles(long totalPuzzles) {
        this.totalPuzzles = totalPuzzles;
    }

    public long getTotalTournaments() {
        return totalTournaments;
    }

    public void setTotalTournaments(long totalTournaments) {
        this.totalTournaments = totalTournaments;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public Map<String, Integer> getCacheSizes() {
        return cacheSizes;
    }

    public void setCacheSizes(Map<String, Integer> cacheSizes) {
        this.cacheSizes = cacheSizes;
    }
}
