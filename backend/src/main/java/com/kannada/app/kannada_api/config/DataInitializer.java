package com.kannada.app.kannada_api.config;

import com.kannada.app.kannada_api.characters.Character;
import com.kannada.app.kannada_api.characters.CharactersRepository;
import com.kannada.app.kannada_api.word.Word;
import com.kannada.app.kannada_api.word.WordRepository;
import com.kannada.app.kannada_api.sentence.Sentence;
import com.kannada.app.kannada_api.sentence.SentenceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Profile("dev") // This component will only be active when the "dev" profile is running
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private CharactersRepository charactersRepository;

    @Autowired
    private WordRepository wordRepository;

    @Autowired
    private SentenceRepository sentenceRepository;

    @Override
    public void run(String... args) throws Exception {
        loadCharacterData();
        loadWordData();
        loadSentenceData();
    }

    private void loadCharacterData() {
        // Only load data if the table is empty to avoid duplicates on every restart
        if (charactersRepository.count() == 0) {
            System.out.println("🌱 Seeding character data...");
            Character c1 = new Character();
            c1.setKannadaChar("ಅ");
            c1.setTransliteration("a");
            c1.setType("vowel");

            Character c2 = new Character();
            c2.setKannadaChar("ಆ");
            c2.setTransliteration("aa");
            c2.setType("vowel");

            Character c3 = new Character();
            c3.setKannadaChar("ಕ");
            c3.setTransliteration("ka");
            c3.setType("consonant");

            charactersRepository.saveAll(List.of(c1, c2, c3));
            System.out.println("✅ Character data seeded.");
        }
    }

    private void loadWordData() {
        if (wordRepository.count() == 0) {
            System.out.println("🌱 Seeding word data...");
            Word w1 = new Word();
            w1.setKannadaWord("ಮನೆ");
            w1.setTransliteration("mane");
            w1.setEnglishTranslation("House");
            w1.setLevel(1);

            Word w2 = new Word();
            w2.setKannadaWord("ನೀರು");
            w2.setTransliteration("neeru");
            w2.setEnglishTranslation("Water");
            w2.setLevel(2);

            wordRepository.saveAll(List.of(w1, w2));
            System.out.println("✅ Word data seeded.");
        }
    }

    private void loadSentenceData() {
        if (sentenceRepository.count() == 0) {
            System.out.println("🌱 Seeding sentence data...");
            Sentence s1 = new Sentence();
            s1.setKannadaSentence("ಇದು ಒಂದು ಪುಸ್ತಕ.");
            s1.setTransliteration("Idu ondu pustaka.");
            s1.setEnglishTranslation("This is a book.");
            s1.setLevel(1);

            Sentence s2 = new Sentence();
            s2.setKannadaSentence("ಅವಳು ಶಾಲೆಗೆ ಹೋಗುತ್ತಾಳೆ.");
            s2.setTransliteration("Avalu shaalege hoguttale.");
            s2.setEnglishTranslation("She goes to school.");
            s2.setLevel(2);

            sentenceRepository.saveAll(List.of(s1, s2));
            System.out.println("✅ Sentence data seeded.");
        }
    }
}