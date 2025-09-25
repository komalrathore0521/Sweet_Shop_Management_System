package com.example.Sweet_Shop;

import com.example.Sweet_Shop.model.Sweet;
import com.example.Sweet_Shop.model.User;
import com.example.Sweet_Shop.repository.SweetRepository;
import com.example.Sweet_Shop.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*; // Import all
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
    @Autowired
    private SweetRepository sweetRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    private String userAuthToken;
    private String adminAuthToken;

    @BeforeEach
    void setUp() throws Exception {
        // Create a regular user and get their token
        userRepository.save(new User("testuser", passwordEncoder.encode("password123"), "user@example.com", "ROLE_USER"));
        this.userAuthToken = loginAndGetToken("testuser", "password123");

        // Create an admin user and get their token
        userRepository.save(new User("admin", passwordEncoder.encode("adminpass"), "admin@example.com", "ROLE_ADMIN"));
        this.adminAuthToken = loginAndGetToken("admin", "adminpass");
    }

    private String loginAndGetToken(String username, String password) throws Exception {
        String loginJson = "{\"username\":\"" + username + "\", \"password\":\"" + password + "\"}";
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson))
                .andExpect(status().isOk())
                .andReturn();
        String responseBody = result.getResponse().getContentAsString();
        Map<String, String> responseMap = objectMapper.readValue(responseBody, Map.class);
        return responseMap.get("token");
    }

    // --- EXISTING AUTHENTICATION TESTS (UNCHANGED) ---
    @Test
    void whenRegisterNewUser_thenReturns201Created() throws Exception {
        String newUserJson = "{\"username\":\"newuser\", \"password\":\"password123\", \"email\":\"new@example.com\"}";
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(newUserJson))
                .andExpect(status().isCreated());
    }

    @Test
    void whenRegisterDuplicateUser_thenReturns409Conflict() throws Exception {
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
        String loginJson = "{\"username\":\"testuser\", \"password\":\"password123\"}";
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists());
    }

    // --- EXISTING SWEETS TESTS (UNCHANGED) ---
    @Test
    void whenAddSweetAsAuthenticatedUser_thenReturns201Created() throws Exception {
        String sweetJson = "{\"name\":\"Gulab Jamun\", \"category\":\"North Indian\", \"price\":3.00, \"quantity\":120}";
        mockMvc.perform(post("/api/sweets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(sweetJson)
                        .header("Authorization", "Bearer " + userAuthToken))
                .andExpect(status().isCreated());
    }

    @Test
    void whenAddSweetWithInvalidData_thenReturns400BadRequest() throws Exception {
        String invalidSweetJson = "{\"name\":\"\", \"category\":\"Invalid\", \"price\":1.0, \"quantity\":10}";
        mockMvc.perform(post("/api/sweets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidSweetJson)
                        .header("Authorization", "Bearer " + userAuthToken))
                .andExpect(status().isBadRequest());
    }

    @Test
    void whenGetAllSweets_thenReturns200OkAndListOfSweets() throws Exception {
        sweetRepository.save(new Sweet("Rasgulla", "Bengali", 2.50, 100));
        sweetRepository.save(new Sweet("Jalebi", "North Indian", 4.00, 80));
        mockMvc.perform(get("/api/sweets")
                        .header("Authorization", "Bearer " + userAuthToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)));
    }

    @Test
    void whenSearchSweetsByCategory_thenReturnsMatchingSweets() throws Exception {
        sweetRepository.save(new Sweet("Rasgulla", "Bengali", 2.50, 100));
        sweetRepository.save(new Sweet("Kaju Katli", "North Indian", 7.50, 50));
        sweetRepository.save(new Sweet("Sandesh", "Bengali", 3.00, 50));
        mockMvc.perform(get("/api/sweets/search?category=Bengali")
                        .header("Authorization", "Bearer " + userAuthToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)));
    }

    @Test
    void whenSearchSweetsByName_thenReturnsMatchingSweets() throws Exception {
        sweetRepository.save(new Sweet("Rasgulla", "Bengali", 2.50, 100));
        mockMvc.perform(get("/api/sweets/search?name=Ras")
                        .header("Authorization", "Bearer " + userAuthToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name", is("Rasgulla")));
    }

    @Test
    void whenSearchSweetsByPriceRange_thenReturnsMatchingSweets() throws Exception {
        sweetRepository.save(new Sweet("Rasgulla", "Bengali", 2.50, 100));
        sweetRepository.save(new Sweet("Jalebi", "North Indian", 4.00, 80));
        sweetRepository.save(new Sweet("Kaju Katli", "North Indian", 7.50, 50));
        mockMvc.perform(get("/api/sweets/search?minPrice=3.0&maxPrice=5.0")
                        .header("Authorization", "Bearer " + userAuthToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name", is("Jalebi")));
    }

    @Test
    void whenUpdateSweet_thenReturns200OkAndUpdatedSweet() throws Exception {
        Sweet originalSweet = sweetRepository.save(new Sweet("Old Rasgulla", "Bengali", 1.0, 50));
        Long sweetId = originalSweet.getId();
        String updatedSweetJson = "{\"name\":\"New Rasgulla\", \"category\":\"Bengali Classic\", \"price\":1.50, \"quantity\":75}";
        mockMvc.perform(put("/api/sweets/" + sweetId)
                        .header("Authorization", "Bearer " + userAuthToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updatedSweetJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("New Rasgulla")))
                .andExpect(jsonPath("$.price", is(1.50)));
    }

    // --- NEW FAILING TESTS FOR DELETE ---
    @Test
    void whenDeleteSweetAsUser_thenReturns403Forbidden() throws Exception {
        Sweet sweet = sweetRepository.save(new Sweet("ToDelete", "Category", 1.0, 1));
        Long sweetId = sweet.getId();
        mockMvc.perform(delete("/api/sweets/" + sweetId)
                        .header("Authorization", "Bearer " + userAuthToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void whenDeleteSweetAsAdmin_thenReturns204NoContent() throws Exception {
        Sweet sweet = sweetRepository.save(new Sweet("ToDelete", "Category", 1.0, 1));
        Long sweetId = sweet.getId();
        mockMvc.perform(delete("/api/sweets/" + sweetId)
                        .header("Authorization", "Bearer " + adminAuthToken))
                .andExpect(status().isNoContent());
    }
    //Inventory API test
    // --- NEW FAILING TESTS FOR PURCHASE ---
    @Test
    void whenPurchaseInStockSweet_thenReturns200OkAndDecrementedQuantity() throws Exception {
        // Arrange: Create a sweet with quantity 10
        Sweet sweet = sweetRepository.save(new Sweet("Kaju Katli", "North Indian", 7.50, 10));
        Long sweetId = sweet.getId();

        // Act & Assert
        mockMvc.perform(post("/api/sweets/" + sweetId + "/purchase")
                        .header("Authorization", "Bearer " + this.userAuthToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.quantity", is(9))); // Expect quantity to be 9
    }

    @Test
    void whenPurchaseOutOfStockSweet_thenReturns400BadRequest() throws Exception {
        // Arrange: Create a sweet with quantity 0
        Sweet sweet = sweetRepository.save(new Sweet("Jalebi", "North Indian", 4.00, 0));
        Long sweetId = sweet.getId();

        // Act & Assert
        mockMvc.perform(post("/api/sweets/" + sweetId + "/purchase")
                        .header("Authorization", "Bearer " + this.userAuthToken))
                .andExpect(status().isBadRequest());
    }
    // --- NEW FAILING TESTS FOR RESTOCK ---
    @Test
    void whenRestockSweetAsUser_thenReturns403Forbidden() throws Exception {
        // Arrange: Create a sweet to restock
        Sweet sweet = sweetRepository.save(new Sweet("Kaju Katli", "North Indian", 7.50, 10));
        Long sweetId = sweet.getId();

        String restockJson = "{\"quantity\": 50}";

        // Act & Assert
        mockMvc.perform(post("/api/sweets/" + sweetId + "/restock")
                        .header("Authorization", "Bearer " + this.userAuthToken) // Use REGULAR user token
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(restockJson))
                .andExpect(status().isForbidden());
    }

    @Test
    void whenRestockSweetAsAdmin_thenReturns200OkAndIncrementedQuantity() throws Exception {
        // Arrange: Create a sweet with quantity 10
        Sweet sweet = sweetRepository.save(new Sweet("Kaju Katli", "North Indian", 7.50, 10));
        Long sweetId = sweet.getId();

        String restockJson = "{\"quantity\": 50}"; // We are adding 50 more

        // Act & Assert
        mockMvc.perform(post("/api/sweets/" + sweetId + "/restock")
                        .header("Authorization", "Bearer " + this.adminAuthToken) // Use ADMIN token
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(restockJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.quantity", is(60))); // Expect total quantity to be 10 + 50 = 60
    }
}

