-- Populate the 'characters' table
INSERT INTO characters (kannada_char, transliteration, type) VALUES ('ಅ', 'a', 'vowel');
INSERT INTO characters (kannada_char, transliteration, type) VALUES ('ಆ', 'aa', 'vowel');
INSERT INTO characters (kannada_char, transliteration, type) VALUES ('ಇ', 'i', 'vowel');
INSERT INTO characters (kannada_char, transliteration, type) VALUES ('ಈ', 'ii', 'vowel');
INSERT INTO characters (kannada_char, transliteration, type) VALUES ('ಉ', 'u', 'vowel');
INSERT INTO characters (kannada_char, transliteration, type) VALUES ('ಊ', 'uu', 'vowel');
INSERT INTO characters (kannada_char, transliteration, type) VALUES ('ಕ', 'ka', 'consonant');
INSERT INTO characters (kannada_char, transliteration, type) VALUES ('ಖ', 'kha', 'consonant');
INSERT INTO characters (kannada_char, transliteration, type) VALUES ('ಗ', 'ga', 'consonant');

-- Populate the 'words' table
INSERT INTO words (kannada_word, transliteration, english_translation, level) VALUES ('ಮನೆ', 'mane', 'House', 1);
INSERT INTO words (kannada_word, transliteration, english_translation, level) VALUES ('ನೀರು', 'neeru', 'Water', 2);
INSERT INTO words (kannada_word, transliteration, english_translation, level) VALUES ('ಓದು', 'odu', 'Read', 2);
INSERT INTO words (kannada_word, transliteration, english_translation, level) VALUES ('ಬರೆ', 'bare', 'Write', 1);

-- Populate the 'sentences' table
INSERT INTO sentences (kannada_sentence, transliteration, english_translation, level) VALUES ('ಇದು ಒಂದು ಪುಸ್ತಕ.', 'Idu ondu pustaka.', 'This is a book.', 1);
INSERT INTO sentences (kannada_sentence, transliteration, english_translation, level) VALUES ('ನಾನು ನೀರು ಕುಡಿಯುತ್ತೇನೆ.', 'Naanu neeru kudiyuttene.', 'I drink water.', 1);
INSERT INTO sentences (kannada_sentence, transliteration, english_translation, level) VALUES ('ಅವಳು ಶಾಲೆಗೆ ಹೋಗುತ್ತಾಳೆ.', 'Avalu shaalege hoguttale.', 'She goes to school.', 2);
INSERT INTO sentences (kannada_sentence, transliteration, english_translation, level) VALUES ('ವಿಮಾನ ವೇಗವಾಗಿ ಚಲಿಸುತ್ತದೆ.', 'Vimana vegavagi chalisuttade.', 'The airplane moves fast.', 2);