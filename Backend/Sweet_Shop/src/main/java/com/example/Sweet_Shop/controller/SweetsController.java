package com.example.Sweet_Shop.controller;


import com.example.Sweet_Shop.model.Sweet;
import com.example.Sweet_Shop.service.SweetService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/sweets")
public class SweetsController {

    private final SweetService sweetService;

    @Autowired
    public SweetsController(SweetService sweetService) {
        this.sweetService = sweetService;
    }

    @PostMapping
    public ResponseEntity<Sweet> addSweet(@Valid @RequestBody Sweet sweet) { // <-- Add @Valid annotation here
        Sweet newSweet = sweetService.addSweet(sweet);
        return new ResponseEntity<>(newSweet, HttpStatus.CREATED);
    }
}

