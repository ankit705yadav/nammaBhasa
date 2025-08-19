package com.kannada.app.kannada_api.user;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/scores")
@CrossOrigin(origins = "*")
public class UserScoreController {

    @Autowired
    private UserScoreService userScoreService;

    // Endpoint for the logged-in user to get all their scores
    @GetMapping("/me")
    public ResponseEntity<List<UserScore>> getCurrentUserScores(Authentication authentication) {
        String username = authentication.getName();
        List<UserScore> scores = userScoreService.getScoresForUser(username);
        return ResponseEntity.ok(scores);
    }

    // Endpoint for the logged-in user to submit a new score
    @PostMapping("/me")
    public ResponseEntity<UserScore> updateCurrentUserHighScore(Authentication authentication, @RequestBody ScoreUpdateRequestDto scoreUpdate) {
        String username = authentication.getName();
        UserScore updatedScore = userScoreService.updateHighScore(username, scoreUpdate.quizType(), scoreUpdate.score());
        return ResponseEntity.ok(updatedScore);
    }

    // Endpoint to get the leaderboard for a specific quiz type.
    @GetMapping("/leaderboard")
    public ResponseEntity<List<LeaderboardDto>> getLeaderboardByQuizType(@RequestParam String quizType) {
        List<LeaderboardDto> leaderboard = userScoreService.getLeaderboard(quizType);
        return ResponseEntity.ok(leaderboard);
    }
}