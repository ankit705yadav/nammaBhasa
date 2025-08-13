package com.kannada.app.kannada_api.user;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.kannada.app.kannada_api.config.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody UserRegistrationDto registrationDto) {
        try {
            User newUser = userService.registerUser(registrationDto);
            // Don't return the password hash in the response
            return ResponseEntity.status(HttpStatus.CREATED).body("User registered successfully: " + newUser.getUsername());
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@RequestBody LoginRequestDto request) {
        // Authenticate the user
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password())
        );

        // If authentication is successful, generate a token
        if (authentication.isAuthenticated()) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(request.username());
            String token = jwtService.generateToken(userDetails);
            return ResponseEntity.ok(new LoginResponseDto(token));
        } else {
            // This part is rarely reached as authenticate() throws an exception on failure
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody PasswordResetRequestDto request) {
        try {
            String token = userService.generatePasswordResetToken(request.email());
            String responseMessage = "Password reset token generated. In a real app, this would be emailed.";
            // For development, we include the token in the response for easy testing.
            return ResponseEntity.ok().body(Map.of("message", responseMessage, "token", token));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody PasswordResetDto request) {
        try {
            userService.resetPassword(request.token(), request.newPassword());
            return ResponseEntity.ok("Password has been reset successfully.");
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/me")
    public ResponseEntity<?> deleteCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated.");
        }

        try {
            String username = authentication.getName(); // Gets the username of the logged-in user
            userService.deleteUser(username);
            return ResponseEntity.ok("User account deleted successfully.");
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}