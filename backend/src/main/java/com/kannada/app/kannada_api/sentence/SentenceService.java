package com.kannada.app.kannada_api.sentence;

import java.util.List;

public interface SentenceService {
    List<Sentence> getSentences(Integer level);
}