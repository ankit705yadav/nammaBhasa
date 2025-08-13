package com.kannada.app.kannada_api.sentence;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service // Marks this class as a Spring service component
public class SentenceServiceImpl implements SentenceService {

    @Autowired // Injects the repository
    private SentenceRepository sentenceRepository;

    @Override
    public List<Sentence> getSentences(Integer level) {

        if (level != null) {
            return sentenceRepository.findByLevel(level);
        } else {
            return sentenceRepository.findAll();
        }
    }
}
