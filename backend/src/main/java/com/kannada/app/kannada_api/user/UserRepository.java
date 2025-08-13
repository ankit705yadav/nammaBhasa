package com.kannada.app.kannada_api.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Finds a user by their username. Used to check if a user already exists.
    Optional<User> findByUsername(String username);
}
