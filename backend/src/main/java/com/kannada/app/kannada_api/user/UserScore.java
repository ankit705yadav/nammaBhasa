package com.kannada.app.kannada_api.user;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "user_scores")
public class UserScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY,cascade = CascadeType.ALL) // Many scores can belong to one user || CascadeType.ALL to automatically delete scores when a user is deleted
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // e.g., "CHARACTER_QUIZ", "WORD_LVL_1_QUIZ", "SENTENCE_LVL_1_QUIZ"
    @Column(nullable = false)
    private String quizType;

    @Column(nullable = false)
    private int highScore;
}