package com.example.Sweet_Shop.controller;

import com.example.Sweet_Shop.model.User;
import com.example.Sweet_Shop.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthenticationController {

    private final AuthService authService;

    @Autowired
    public AuthenticationController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<Void> registerUser(@RequestBody User user) {
        authService.registerUser(user);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody User loginRequest) {
        String token = authService.login(loginRequest.getUsername(), loginRequest.getPassword());
        // Return the token in a JSON object like {"token": "your_jwt_here"}
        // The test expects this specific structure.
        return ResponseEntity.ok(Map.of("token", token));
    }
}

