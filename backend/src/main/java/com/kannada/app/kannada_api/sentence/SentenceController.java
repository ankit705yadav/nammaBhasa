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

    // The controller now depends on the service, not the repository
    @Autowired
    private SentenceService sentenceService;

    @GetMapping
    public List<Sentence> getSentences(@RequestParam(required = false) Integer level) {
        // The controller simply calls the service and returns the result.
        // All the if/else logic is gone!
        return sentenceService.getSentences(level);
    }
}
