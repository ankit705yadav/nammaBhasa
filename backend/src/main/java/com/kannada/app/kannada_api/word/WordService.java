package com.kannada.app.kannada_api.word;

import java.util.List;

public interface WordService {
    List<Word> getWords(Integer level);
}
