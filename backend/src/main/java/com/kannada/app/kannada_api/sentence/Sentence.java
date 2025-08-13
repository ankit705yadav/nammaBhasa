package com.kannada.app.kannada_api.sentence;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "sentences")
public class Sentence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String kannadaSentence;

    @Column(nullable = false)
    private String transliteration;

    @Column(nullable = false)
    private String englishTranslation;

    @Column(nullable = false)
    private int level;

}