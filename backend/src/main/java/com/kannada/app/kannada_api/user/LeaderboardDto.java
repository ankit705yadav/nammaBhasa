package com.kannada.app.kannada_api.user;

// This record will hold the data for a single entry in the leaderboard.
public record LeaderboardDto(String username, int highScore) {

    // A convenient static method to convert a UserScore entity into a LeaderboardDto
    public static LeaderboardDto from(UserScore userScore) {
        return new LeaderboardDto(userScore.getUser().getUsername(), userScore.getHighScore());
    }
}
