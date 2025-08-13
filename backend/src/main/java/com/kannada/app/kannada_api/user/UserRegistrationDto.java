package com.kannada.app.kannada_api.user;

// A record is a modern, concise way to create a simple data carrier class.
public record UserRegistrationDto(String username, String password, String email) {}
