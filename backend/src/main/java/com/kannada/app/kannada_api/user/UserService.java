package com.kannada.app.kannada_api.user;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User registerUser(UserRegistrationDto registrationDto) {
        // Check if username already exists
        if (userRepository.findByUsername(registrationDto.username()).isPresent()) {
            throw new IllegalStateException("Username already exists");
        }

        // Create a new user object
        User user = new User(registrationDto);

        // ⚠️ Hash the password before saving!
        user.setPassword(passwordEncoder.encode(registrationDto.password()));

        return userRepository.save(user);
    }
}
