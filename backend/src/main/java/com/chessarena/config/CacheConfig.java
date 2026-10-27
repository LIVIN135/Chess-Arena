package com.chessarena.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCache;
import org.springframework.cache.support.SimpleCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;
import java.util.Arrays;

@Configuration
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        SimpleCacheManager manager = new SimpleCacheManager();
        manager.setCaches(Arrays.asList(
                new CaffeineCache("metrics",
                        Caffeine.newBuilder().expireAfterWrite(Duration.ofSeconds(5)).maximumSize(10).build()),
                new CaffeineCache("dailyPuzzle",
                        Caffeine.newBuilder().expireAfterWrite(Duration.ofHours(1)).maximumSize(20).build()),
                new CaffeineCache("leaderboard",
                        Caffeine.newBuilder().expireAfterWrite(Duration.ofSeconds(60)).maximumSize(50).build()),
                new CaffeineCache("tournamentsList",
                        Caffeine.newBuilder().expireAfterWrite(Duration.ofSeconds(30)).maximumSize(50).build())
        ));
        return manager;
    }
}
