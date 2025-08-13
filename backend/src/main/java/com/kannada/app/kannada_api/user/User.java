package com.kannada.app.kannada_api.user;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "users")
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true,nullable = false)
    private String username;

    @Column(unique = true,nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column
    private String passwordResetToken;

    @Column(columnDefinition = "TIMESTAMP")
    private LocalDateTime passwordResetTokenExpiry;

    // Constructor for creating a user from a DTO
    public User(UserRegistrationDto dto) {
        this.username = dto.username();
        this.email = dto.email();
    }

}
