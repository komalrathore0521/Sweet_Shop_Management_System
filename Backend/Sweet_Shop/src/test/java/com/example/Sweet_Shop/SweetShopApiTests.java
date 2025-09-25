package com.example.Sweet_Shop;

import com.example.Sweet_Shop.model.Sweet;
import com.example.Sweet_Shop.repository.SweetRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class SweetShopApiTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String authToken;


    @Autowired // <-- 1. Inject the repository
    private SweetRepository sweetRepository;



    @BeforeEach
    void setUp() throws Exception {
        // --- The setup block now ONLY handles user registration and login ---
        String userJson = "{\"username\":\"testuser\", \"password\":\"password123\", \"email\":\"test@example.com\"}";
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(userJson))
                .andExpect(status().isCreated());

        String loginJson = "{\"username\":\"testuser\", \"password\":\"password123\"}";
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson))
                .andExpect(status().isOk())
                .andReturn();

        String responseBody = result.getResponse().getContentAsString();
        Map<String, String> responseMap = objectMapper.readValue(responseBody, Map.class);
        this.authToken = responseMap.get("token");
    }

    // --- Authentication Tests ---

    @Test
    void whenRegisterNewUser_thenReturns201Created() throws Exception {
        // --- FIX: Use a UNIQUE username for this specific test ---
        String newUserJson = "{\"username\":\"newuser\", \"password\":\"password123\", \"email\":\"new@example.com\"}";

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(newUserJson))
                .andExpect(status().isCreated());
    }

    @Test
    void whenRegisterDuplicateUser_thenReturns409Conflict() throws Exception {
        // --- FIX: Use another UNIQUE username for this test to avoid conflicts ---
        String duplicateUserJson = "{\"username\":\"duplicateuser\", \"password\":\"password123\", \"email\":\"duplicate@example.com\"}";

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(duplicateUserJson))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(duplicateUserJson))
                .andExpect(status().isConflict());
    }

    @Test
    void whenLoginWithValidCredentials_thenReturns200OkAndJwt() throws Exception {
        // This test correctly uses the "testuser" created in @BeforeEach
        String loginJson = "{\"username\":\"testuser\", \"password\":\"password123\"}";

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists());
    }


    // --- Sweets Endpoint Test ---

    @Test
    void whenAddSweetAsAuthenticatedUser_thenReturns201Created() throws Exception {
        String sweetJson = "{\"name\":\"Gulab Jamun\", \"category\":\"North Indian\", \"price\":3.00, \"quantity\":120}";
        mockMvc.perform(post("/api/sweets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(sweetJson)
                        .header("Authorization", "Bearer " + this.authToken))
                .andExpect(status().isCreated());
    }

    @Test
    void whenGetAllSweets_thenReturns200OkAndListOfSweets() throws Exception {
        // --- FIX: Create data specific to this test ---
        sweetRepository.save(new Sweet("Rasgulla", "Bengali", 2.50, 100));
        sweetRepository.save(new Sweet("Jalebi", "North Indian", 4.00, 80));

        mockMvc.perform(get("/api/sweets")
                        .header("Authorization", "Bearer " + this.authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2))); // We expect exactly 2 sweets
    }

    @Test
    void whenSearchSweetsByCategory_thenReturnsMatchingSweets() throws Exception {
        // --- FIX: Create data specific to this test ---
        sweetRepository.save(new Sweet("Rasgulla", "Bengali", 2.50, 100));
        sweetRepository.save(new Sweet("Kaju Katli", "North Indian", 7.50, 50));
        sweetRepository.save(new Sweet("Sandesh", "Bengali", 3.00, 50));

        mockMvc.perform(get("/api/sweets/search?category=Bengali")
                        .header("Authorization", "Bearer " + this.authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2))); // Expecting only the 2 Bengali sweets
    }

    @Test
    void whenSearchSweetsByName_thenReturnsMatchingSweets() throws Exception {
        // --- FIX: Create data specific to this test ---
        sweetRepository.save(new Sweet("Rasgulla", "Bengali", 2.50, 100));

        mockMvc.perform(get("/api/sweets/search?name=Ras")
                        .header("Authorization", "Bearer " + this.authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name", is("Rasgulla")));
    }

    @Test
    void whenSearchSweetsByPriceRange_thenReturnsMatchingSweets() throws Exception {
        // --- FIX: Create data specific to this test ---
        sweetRepository.save(new Sweet("Rasgulla", "Bengali", 2.50, 100));
        sweetRepository.save(new Sweet("Jalebi", "North Indian", 4.00, 80));
        sweetRepository.save(new Sweet("Kaju Katli", "North Indian", 7.50, 50));

        mockMvc.perform(get("/api/sweets/search?minPrice=3.0&maxPrice=5.0")
                        .header("Authorization", "Bearer " + this.authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name", is("Jalebi")));
    }
    @Test
    void whenUpdateSweet_thenReturns200OkAndUpdatedSweet() throws Exception {
        // --- Arrange: Create a sweet to update ---
        Sweet originalSweet = sweetRepository.save(new Sweet("Old Rasgulla", "Bengali", 1.0, 50));
        Long sweetId = originalSweet.getId();

        String updatedSweetJson = "{\"name\":\"New Rasgulla\", \"category\":\"Bengali Classic\", \"price\":1.50, \"quantity\":75}";

        // --- Act & Assert ---
        mockMvc.perform(put("/api/sweets/" + sweetId) // Use the ID in the URL
                        .header("Authorization", "Bearer " + this.authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updatedSweetJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("New Rasgulla")))
                .andExpect(jsonPath("$.price", is(1.50)));
    }
}

