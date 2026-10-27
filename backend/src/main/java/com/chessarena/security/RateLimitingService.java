package com.chessarena.security;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimitingService {

    private final Map<String, Bucket> authBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> matchmakingBuckets = new ConcurrentHashMap<>();

    private Bucket createAuthBucket() {
        Bandwidth limit = Bandwidth.builder()
                .capacity(5)
                .refillGreedy(5, Duration.ofMinutes(1))
                .build();
        return Bucket.builder().addLimit(limit).build();
    }

    private Bucket createMatchmakingBucket() {
        Bandwidth limit = Bandwidth.builder()
                .capacity(5)
                .refillGreedy(5, Duration.ofMinutes(1))
                .build();
        return Bucket.builder().addLimit(limit).build();
    }

    public boolean tryConsumeAuth(String ipAddress) {
        if (ipAddress == null || ipAddress.isBlank()) {
            ipAddress = "anonymous";
        }
        Bucket bucket = authBuckets.computeIfAbsent(ipAddress, k -> createAuthBucket());
        return bucket.tryConsume(1);
    }

    public boolean tryConsumeMatchmaking(String playerId) {
        if (playerId == null || playerId.isBlank()) {
            playerId = "anonymous";
        }
        Bucket bucket = matchmakingBuckets.computeIfAbsent(playerId, k -> createMatchmakingBucket());
        return bucket.tryConsume(1);
    }
}
