package com.chessarena.dto.request;

import jakarta.validation.constraints.Size;

public class UpdateBioRequest {

    @Size(max = 250, message = "Bio must be at most 250 characters")
    private String bio;

    public UpdateBioRequest() {
    }

    public UpdateBioRequest(String bio) {
        this.bio = bio;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }
}
