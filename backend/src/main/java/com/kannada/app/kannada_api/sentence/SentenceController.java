package com.kannada.app.kannada_api.sentence;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/sentences")
@CrossOrigin(origins = "*")
public class SentenceController {

    @Autowired
    private SentenceService sentenceService;

    @GetMapping
    public List<Sentence> getSentences(@RequestParam(required = false) Integer level) {

        return sentenceService.getSentences(level);
    }
}
