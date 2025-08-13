package com.kannada.app.kannada_api.word;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service // Marks this class as a Spring service component
public class WordServiceImpl implements WordService {

    @Autowired // Injects the repository
    private WordRepository wordRepository;

    @Override
    public List<Word> getWords(Integer level) {
        if(level != null){
            return wordRepository.findByLevel(level);
        } else {
            return wordRepository.findAll();
        }
    }


}
