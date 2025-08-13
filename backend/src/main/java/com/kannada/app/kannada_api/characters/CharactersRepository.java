package com.kannada.app.kannada_api.characters;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CharactersRepository extends JpaRepository<Character,Long> {

    List<Character> findByType(String type);
}
