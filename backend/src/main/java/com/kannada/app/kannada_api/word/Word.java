package com.kannada.app.kannada_api.word;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "word")
public class Word {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String kannadaWord;

    @Column(nullable = false)
    private String transliteration;

    @Column(nullable = false)
    private String englishTranslation;

    @Column(nullable = false)
    private int level;


}
