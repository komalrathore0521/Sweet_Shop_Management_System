package com.example.Sweet_Shop.service;


import com.example.Sweet_Shop.exception.InvalidPurchaseException;
import com.example.Sweet_Shop.model.Sweet;
import com.example.Sweet_Shop.repository.SweetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
public class SweetService {

    private final SweetRepository sweetRepository;

    @Autowired
    public SweetService(SweetRepository sweetRepository) {
        this.sweetRepository = sweetRepository;
    }

    public Sweet addSweet(Sweet sweet) {
        // For now, we just save the sweet directly.
        // We will add validation in the refactor phase.
        return sweetRepository.save(sweet);
    }
    public List<Sweet> getAllSweets() {
        return sweetRepository.findAll();
    }
    public Optional<Sweet> updateSweet(Long id, Sweet sweetDetails) {
        return sweetRepository.findById(id)
                .map(existingSweet -> {
                    existingSweet.setName(sweetDetails.getName());
                    existingSweet.setCategory(sweetDetails.getCategory());
                    existingSweet.setPrice(sweetDetails.getPrice());
                    existingSweet.setQuantity(sweetDetails.getQuantity());
                    return sweetRepository.save(existingSweet);
                });
    }
    // --- NEW DELETE METHOD ---
    public boolean deleteSweet(Long id) {
        if (sweetRepository.existsById(id)) {
            sweetRepository.deleteById(id);
            return true; // Return true if deletion was successful
        }
        return false; // Return false if the sweet did not exist
    }
    // --- NEW PURCHASE METHOD ---
    public Sweet purchaseSweet(Long id) {
        // Find the sweet or throw an exception if it doesn't exist
        Sweet sweet = sweetRepository.findById(id)
                .orElseThrow(() -> new InvalidPurchaseException("Sweet not found with id: " + id));

        // Check if the sweet is in stock
        if (sweet.getQuantity() <= 0) {
            throw new InvalidPurchaseException("Sweet is out of stock.");
        }

        // Decrement quantity and save
        sweet.setQuantity(sweet.getQuantity() - 1);
        return sweetRepository.save(sweet);
    }
    public List<Sweet> searchSweets(String name, String category, Double minPrice, Double maxPrice) {
        // Use a Specification to build a dynamic query based on the provided criteria
        Specification<Sweet> spec = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (name != null && !name.isEmpty()) {
                // Add a condition for a case-insensitive "contains" search on the name
                predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), "%" + name.toLowerCase() + "%"));
            }
            if (category != null && !category.isEmpty()) {
                // Add a condition for an exact match on the category
                predicates.add(criteriaBuilder.equal(root.get("category"), category));
            }
            if (minPrice != null) {
                // Add a condition for the price being greater than or equal to minPrice
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("price"), minPrice));
            }
            if (maxPrice != null) {
                // Add a condition for the price being less than or equal to maxPrice
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("price"), maxPrice));
            }

            // Combine all the individual conditions with an "AND"
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };

        // Execute the dynamic query
        return sweetRepository.findAll(spec);
    }
}

