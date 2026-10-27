package com.chessarena.dto.request;

public class CreateGameRequest {
    private String whitePlayerName;
    private String blackPlayerName;
    private String white;
    private String black;
    private String gameType;
    private String timeControl;
    private String result;
    private String termination;
    private String pgn;
    private String finalFen;

    public CreateGameRequest() {
    }

    public CreateGameRequest(String whitePlayerName, String blackPlayerName, String gameType, String timeControl) {
        this.whitePlayerName = whitePlayerName;
        this.blackPlayerName = blackPlayerName;
        this.gameType = gameType;
        this.timeControl = timeControl;
    }

    public String getWhitePlayerName() {
        return white != null ? white : whitePlayerName;
    }

    public void setWhitePlayerName(String whitePlayerName) {
        this.whitePlayerName = whitePlayerName;
    }

    public String getBlackPlayerName() {
        return black != null ? black : blackPlayerName;
    }

    public void setBlackPlayerName(String blackPlayerName) {
        this.blackPlayerName = blackPlayerName;
    }

    public String getWhite() {
        return white != null ? white : whitePlayerName;
    }

    public void setWhite(String white) {
        this.white = white;
    }

    public String getBlack() {
        return black != null ? black : blackPlayerName;
    }

    public void setBlack(String black) {
        this.black = black;
    }

    public String getGameType() {
        return gameType;
    }

    public void setGameType(String gameType) {
        this.gameType = gameType;
    }

    public String getTimeControl() {
        return timeControl;
    }

    public void setTimeControl(String timeControl) {
        this.timeControl = timeControl;
    }

    public String getResult() {
        return result;
    }

    public void setResult(String result) {
        this.result = result;
    }

    public String getTermination() {
        return termination;
    }

    public void setTermination(String termination) {
        this.termination = termination;
    }

    public String getPgn() {
        return pgn;
    }

    public void setPgn(String pgn) {
        this.pgn = pgn;
    }

    public String getFinalFen() {
        return finalFen;
    }

    public void setFinalFen(String finalFen) {
        this.finalFen = finalFen;
    }
}
