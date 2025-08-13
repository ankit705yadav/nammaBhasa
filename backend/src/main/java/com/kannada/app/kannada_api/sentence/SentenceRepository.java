package com.kannada.app.kannada_api.sentence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SentenceRepository extends JpaRepository<Sentence, Long> {

    List<Sentence> findByLevel(int level);
}