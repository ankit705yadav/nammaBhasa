package com.kannada.app.kannada_api.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserScoreRepository extends JpaRepository<UserScore, Long> {

    // Finds a specific score record for a given user and quiz type.
    Optional<UserScore> findByUserAndQuizType(User user, String quizType);

    // Finds all scores for a given user.
    List<UserScore> findByUser(User user);

    /**
     * Finds the top 10 scores for a given quiz type, ordered by high score descending.
     * Spring Data JPA automatically creates this complex query from the method name.
     */
    List<UserScore> findTop10ByQuizTypeOrderByHighScoreDesc(String quizType);
}