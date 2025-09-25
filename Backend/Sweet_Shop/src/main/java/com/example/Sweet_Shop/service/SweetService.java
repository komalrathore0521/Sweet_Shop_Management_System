package com.example.Sweet_Shop.service;


import com.example.Sweet_Shop.model.Sweet;
import com.example.Sweet_Shop.repository.SweetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

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
    public List<Sweet> searchSweets(String category) {
        // For now, we only handle the category parameter to pass the test.
        if (category != null) {
            return sweetRepository.findByCategory(category);
        }
        // Return an empty list if no search criteria are provided
        return Collections.emptyList();
    }
}

