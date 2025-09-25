package com.example.Sweet_Shop.service;

import com.example.Sweet_Shop.exception.UserAlreadyExistsException;
import com.example.Sweet_Shop.model.User;
import com.example.Sweet_Shop.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    @Autowired
    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
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

    public String login(String username, String password) {
        // This will authenticate the user. If credentials are bad, it throws an exception.
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password)
        );

        // If authentication is successful, generate and return a token
        return jwtUtil.generateToken(username);
    }
}

