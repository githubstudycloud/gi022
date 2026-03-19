package com.enterprise.user.controller;

import com.enterprise.user.domain.dto.LoginRequest;
import com.enterprise.user.domain.dto.RegisterRequest;
import com.enterprise.user.domain.vo.LoginVO;
import com.enterprise.user.domain.vo.UserVO;
import com.enterprise.user.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@DisplayName("AuthController Tests")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserService userService;

    @Test
    @DisplayName("POST /api/v1/auth/login - success")
    void login_success() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setUsername("admin");
        request.setPassword("Admin@123456");

        LoginVO loginVO = new LoginVO("access-token", "refresh-token", "Bearer", 3600, new UserVO());
        when(userService.login(any())).thenReturn(loginVO);

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.accessToken").value("access-token"))
                .andExpect(jsonPath("$.data.tokenType").value("Bearer"));
    }

    @Test
    @DisplayName("POST /api/v1/auth/login - validation failure")
    void login_validation_failure() throws Exception {
        LoginRequest request = new LoginRequest();
        // missing username and password

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.code").value(42201));
    }

    @Test
    @DisplayName("POST /api/v1/auth/register - success")
    void register_success() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("john_doe");
        request.setPassword("P@ssw0rd123");
        request.setNickname("John Doe");
        request.setEmail("john@example.com");

        UserVO userVO = new UserVO();
        userVO.setUsername("john_doe");
        when(userService.register(any())).thenReturn(userVO);

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.username").value("john_doe"));
    }
}
