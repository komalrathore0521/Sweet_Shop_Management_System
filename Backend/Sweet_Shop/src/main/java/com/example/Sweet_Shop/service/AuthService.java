package com.example.Sweet_Shop.service;

import com.example.Sweet_Shop.exception.UserAlreadyExistsException;
import com.example.Sweet_Shop.model.User;
import com.example.Sweet_Shop.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User registerUser(User user) {
        // Step 1: Check if a user with the given username or email already exists.
        userRepository.findByUsernameOrEmail(user.getUsername(), user.getEmail())
                .ifPresent(existingUser -> {
                    // Step 2: If a user is found, throw the custom exception.
                    throw new UserAlreadyExistsException("User with username or email already exists");
                });

        // Step 3: If no user exists, hash the password.
        String encodedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(encodedPassword);

        // Step 4: Save the new user with the hashed password.
        return userRepository.save(user);
    }
}

