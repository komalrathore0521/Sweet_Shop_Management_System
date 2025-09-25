package com.example.Sweet_Shop.controller;


import com.example.Sweet_Shop.model.Sweet;
import com.example.Sweet_Shop.service.SweetService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    @GetMapping
    public ResponseEntity<List<Sweet>> getAllSweets() {
        List<Sweet> sweets = sweetService.getAllSweets();
        return ResponseEntity.ok(sweets);
    }
    @GetMapping("/search")
    public ResponseEntity<List<Sweet>> searchSweets(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice) {
        // We will update the service to handle these new parameters next
        List<Sweet> sweets = sweetService.searchSweets(name, category, minPrice, maxPrice);
        return ResponseEntity.ok(sweets);
    }
    @PutMapping("/{id}")
    public ResponseEntity<Sweet> updateSweet(@PathVariable Long id, @Valid @RequestBody Sweet sweetDetails) {
        return sweetService.updateSweet(id, sweetDetails)
                .map(ResponseEntity::ok) // If sweet is found and updated, return 200 OK with the sweet
                .orElse(ResponseEntity.notFound().build()); // If sweet is not found, return 404 Not Found
    }
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')") // This enforces the "Admin only" rule
    public ResponseEntity<Void> deleteSweet(@PathVariable Long id) {
        boolean isDeleted = sweetService.deleteSweet(id);
        if (isDeleted) {
            return ResponseEntity.noContent().build(); // Return 204 No Content on success
        } else {
            return ResponseEntity.notFound().build(); // Return 404 if sweet was not found
        }
    }

    // --- NEW PURCHASE ENDPOINT ---
    @PostMapping("/{id}/purchase")
    public ResponseEntity<Sweet> purchaseSweet(@PathVariable Long id) {
        Sweet updatedSweet = sweetService.purchaseSweet(id);
        return ResponseEntity.ok(updatedSweet);
    }
}

