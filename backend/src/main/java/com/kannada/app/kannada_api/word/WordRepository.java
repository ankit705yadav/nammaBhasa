package com.kannada.app.kannada_api.word;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface WordRepository extends JpaRepository<Word,Long> {

    List<Word> findByLevel(int level);
}
