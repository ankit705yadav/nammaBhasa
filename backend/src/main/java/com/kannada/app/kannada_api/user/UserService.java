package com.kannada.app.kannada_api.user;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

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

    public String generatePasswordResetToken(String email) {
        User user = userRepository.findByEmail(email) // You'll need to create this method in UserRepository
                .orElseThrow(() -> new IllegalStateException("User with email " + email + " not found."));

        String token = UUID.randomUUID().toString();
        user.setPasswordResetToken(token);
        user.setPasswordResetTokenExpiry(LocalDateTime.now().plusMinutes(30)); // Token is valid for 30 minutes
        userRepository.save(user);

        // In a real application, you would email this token to the user.
        // For development, we'll return it directly.
        return token;
    }

    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByPasswordResetToken(token) // And this method too
                .orElseThrow(() -> new IllegalStateException("Invalid or expired password reset token."));

        // Check if the token has expired
        if (user.getPasswordResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new IllegalStateException("Invalid or expired password reset token.");
        }

        // Set the new password (hashed) and clear the reset token fields
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordResetToken(null);
        user.setPasswordResetTokenExpiry(null);
        userRepository.save(user);
    }
}
