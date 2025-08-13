package com.kannada.app.kannada_api.word;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/words")
@CrossOrigin(origins = "*")
public class WordController {

    @Autowired
    private WordService wordService;

    @GetMapping
    public List<Word> getWords(@RequestParam(required = false) Integer level){

        return wordService.getWords(level);
    }
}
