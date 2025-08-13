package com.kannada.app.kannada_api.characters;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service // Marks this class as a Spring service component
public class CharacterServiceImpl implements CharacterService {

    @Autowired // Injects the repository
    private CharactersRepository charactersRepository;

    @Override
    public List<Character> getCharacters(String type) {

        if(type != null && !type.isBlank()){
            return charactersRepository.findByType(type);
        }else {
            return charactersRepository.findAll();
        }
    }
}
