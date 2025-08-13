package com.kannada.app.kannada_api.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserScoreRepository extends JpaRepository<UserScore, Long> {

    // We can add methods here later, like findByUserAndQuizType
}