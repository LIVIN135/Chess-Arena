package com.chessarena.dto.response;

import java.util.UUID;

public class PuzzleAttemptResponse {
    private UUID attemptId;
    private UUID puzzleId;
    private boolean isSolved;
    private int ratingChange;
    private int userRatingBefore;
    private int newUserRating;
    private int totalSolved;
    private int totalAttempted;
    private String message;

    public PuzzleAttemptResponse() {
    }

    public PuzzleAttemptResponse(UUID attemptId, UUID puzzleId, boolean isSolved, int ratingChange,
                                 int userRatingBefore, int newUserRating, int totalSolved, int totalAttempted, String message) {
        this.attemptId = attemptId;
        this.puzzleId = puzzleId;
        this.isSolved = isSolved;
        this.ratingChange = ratingChange;
        this.userRatingBefore = userRatingBefore;
        this.newUserRating = newUserRating;
        this.totalSolved = totalSolved;
        this.totalAttempted = totalAttempted;
        this.message = message;
    }

    public UUID getAttemptId() {
        return attemptId;
    }

    public void setAttemptId(UUID attemptId) {
        this.attemptId = attemptId;
    }

    public UUID getPuzzleId() {
        return puzzleId;
    }

    public void setPuzzleId(UUID puzzleId) {
        this.puzzleId = puzzleId;
    }

    public boolean isSolved() {
        return isSolved;
    }

    public void setSolved(boolean solved) {
        isSolved = solved;
    }

    public int getRatingChange() {
        return ratingChange;
    }

    public void setRatingChange(int ratingChange) {
        this.ratingChange = ratingChange;
    }

    public int getUserRatingBefore() {
        return userRatingBefore;
    }

    public void setUserRatingBefore(int userRatingBefore) {
        this.userRatingBefore = userRatingBefore;
    }

    public int getNewUserRating() {
        return newUserRating;
    }

    public void setNewUserRating(int newUserRating) {
        this.newUserRating = newUserRating;
    }

    public int getTotalSolved() {
        return totalSolved;
    }

    public void setTotalSolved(int totalSolved) {
        this.totalSolved = totalSolved;
    }

    public int getTotalAttempted() {
        return totalAttempted;
    }

    public void setTotalAttempted(int totalAttempted) {
        this.totalAttempted = totalAttempted;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
