package com.example.Sweet_Shop;

import jakarta.transaction.Transactional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc // Sets up a mock environment to test the controller without a real server
@Transactional
public class AuthenticationControllerTests {

    @Autowired
    private MockMvc mockMvc; // An object that lets us perform fake HTTP requests

    @Test
    public void whenRegisterNewUser_thenReturns201Created() throws Exception {
        // This is the user data (as a JSON string) that we'll send in our fake request body
        String newUserJson = "{\"username\":\"testuser\", \"password\":\"password123\", \"email\":\"test@example.com\"}";

        // We will perform a POST request to the registration endpoint
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON) // Set the content type header
                        .content(newUserJson)) // Set the request body
                // And we assert that the expected HTTP status is 201 (Created)
                .andExpect(status().isCreated());
    }
    @Test
    public void whenRegisterDuplicateUser_thenReturns409Conflict() throws Exception {
        // This is the user data we'll use for both registrations
        String newUserJson = "{\"username\":\"duplicateuser\", \"password\":\"password123\", \"email\":\"duplicate@example.com\"}";

        // First registration: This should succeed with a 201 Created.
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(newUserJson))
                .andExpect(status().isCreated());

        // Second registration attempt with the same data
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(newUserJson))
                // This time, we expect the server to respond with a 409 Conflict status
                .andExpect(status().isConflict());
    }
    @Test
    void whenLoginWithValidCredentials_thenReturns200OkAndJwt() throws Exception {

        String userJson = "{\"username\":\"loginuser\", \"password\":\"password123\", \"email\":\"login@example.com\"}";
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(userJson))
                .andExpect(status().isCreated());

        // This is the data for the login attempt.
        String loginJson = "{\"username\":\"loginuser\", \"password\":\"password123\"}";

        // --- Act & Assert ---
        // Perform a POST request to the login endpoint.
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson))
                // We expect the server to respond with a 200 OK status.
                .andExpect(status().isOk())
                // We expect the response body to contain a property named "token".
                .andExpect(jsonPath("$.token").exists());
    }
}
