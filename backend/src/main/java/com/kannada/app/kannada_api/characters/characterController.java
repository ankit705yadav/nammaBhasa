package com.kannada.app.kannada_api.characters;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/characters")
@CrossOrigin(origins = "*")
public class characterController {

    @Autowired
    private CharacterService characterService;

    @GetMapping
    public List<Character> getCharacters(@RequestParam(required = false) String type){

        return characterService.getCharacters(type);
    }
}
