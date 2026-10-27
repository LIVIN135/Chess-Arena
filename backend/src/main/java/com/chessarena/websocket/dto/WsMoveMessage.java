package com.chessarena.websocket.dto;

public class WsMoveMessage {
    private String from;
    private String to;
    private String promotion;
    private String san;
    private Long clockRemainingMs;

    public WsMoveMessage() {
    }

    public WsMoveMessage(String from, String to, String promotion, String san, Long clockRemainingMs) {
        this.from = from;
        this.to = to;
        this.promotion = promotion;
        this.san = san;
        this.clockRemainingMs = clockRemainingMs;
    }

    public String getFrom() {
        return from;
    }

    public void setFrom(String from) {
        this.from = from;
    }

    public String getTo() {
        return to;
    }

    public void setTo(String to) {
        this.to = to;
    }

    public String getPromotion() {
        return promotion;
    }

    public void setPromotion(String promotion) {
        this.promotion = promotion;
    }

    public String getSan() {
        return san;
    }

    public void setSan(String san) {
        this.san = san;
    }

    public Long getClockRemainingMs() {
        return clockRemainingMs;
    }

    public void setClockRemainingMs(Long clockRemainingMs) {
        this.clockRemainingMs = clockRemainingMs;
    }
}
