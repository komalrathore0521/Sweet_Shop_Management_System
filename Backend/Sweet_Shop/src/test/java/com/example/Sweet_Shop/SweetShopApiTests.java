package com.example.Sweet_Shop;

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

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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

    @BeforeEach
    void setUp() throws Exception {
        // This setup block creates a user named "testuser" before each test
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
        // This test correctly uses the token for "testuser" from @BeforeEach
        String sweetJson = "{\"name\":\"Rasgulla\", \"category\":\"Bengali\", \"price\":2.50, \"quantity\":100}";

        mockMvc.perform(post("/api/sweets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(sweetJson)
                        .header("Authorization", "Bearer " + this.authToken))
                .andExpect(status().isCreated()); // <-- FIX: It should expect 201 Created
    }
}

