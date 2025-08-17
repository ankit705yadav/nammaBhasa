package com.kannada.app.kannada_api.user;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class UserScoreService {

    @Autowired
    private UserScoreRepository userScoreRepository;

    @Autowired
    private UserRepository userRepository;

    public List<UserScore> getScoresForUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalStateException("User not found: " + username));
        return userScoreRepository.findByUser(user);
    }

    public UserScore updateHighScore(String username, String quizType, int newScore) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalStateException("User not found: " + username));

        // Find the existing score record for this user and quiz
        Optional<UserScore> existingScoreOpt = userScoreRepository.findByUserAndQuizType(user, quizType);

        if (existingScoreOpt.isPresent()) {
            // If a record exists, update it only if the new score is higher
            UserScore existingScore = existingScoreOpt.get();
            if (newScore > existingScore.getHighScore()) {
                existingScore.setHighScore(newScore);
                return userScoreRepository.save(existingScore);
            }
            return existingScore; // Return the existing score if it's not beaten
        } else {
            // If no record exists, create a new one
            UserScore newHighScore = new UserScore();
            newHighScore.setUser(user);
            newHighScore.setQuizType(quizType);
            newHighScore.setHighScore(newScore);
            return userScoreRepository.save(newHighScore);
        }
    }
}