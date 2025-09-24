package com.example.Sweet_Shop.controller;



import com.example.Sweet_Shop.model.User;
import com.example.Sweet_Shop.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthenticationController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<Void> registerUser(@RequestBody User user) {
        // For now, we just save the user. No validation, no password hashing.
        userRepository.save(user);
        // We return a 201 Created status, which is what the test expects.
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}
