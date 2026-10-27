package com.chessarena.dto.response;

import java.time.Instant;
import java.util.Map;

public class HealthResponse {
    private String status;
    private String service;
    private String version;
    private Instant timestamp;
    private Map<String, Object> details;

    public HealthResponse() {
    }

    public HealthResponse(String status, String service, String version, Instant timestamp, Map<String, Object> details) {
        this.status = status;
        this.service = service;
        this.version = version;
        this.timestamp = timestamp;
        this.details = details;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getService() {
        return service;
    }

    public void setService(String service) {
        this.service = service;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

    public Map<String, Object> getDetails() {
        return details;
    }

    public void setDetails(Map<String, Object> details) {
        this.details = details;
    }
}
