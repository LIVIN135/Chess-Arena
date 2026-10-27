package com.chessarena.websocket.dto;

import java.util.Arrays;
import java.util.Optional;

public enum TimeControl {
    ONE_MINUTE("1m", 60_000L),
    THREE_MINUTES("3m", 180_000L),
    FIVE_MINUTES("5m", 300_000L),
    TEN_MINUTES("10m", 600_000L);

    private final String code;
    private final long durationMs;

    TimeControl(String code, long durationMs) {
        this.code = code;
        this.durationMs = durationMs;
    }

    public String getCode() {
        return code;
    }

    public long getDurationMs() {
        return durationMs;
    }

    public static Optional<TimeControl> fromCode(String code) {
        if (code == null) return Optional.empty();
        return Arrays.stream(values())
                .filter(tc -> tc.code.equalsIgnoreCase(code.trim()))
                .findFirst();
    }

    public static boolean isValid(String code) {
        return fromCode(code).isPresent();
    }
}
