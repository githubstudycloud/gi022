package com.enterprise.user.controller;

import com.enterprise.common.core.result.Result;
import com.enterprise.user.domain.dto.LoginRequest;
import com.enterprise.user.domain.dto.RegisterRequest;
import com.enterprise.user.domain.vo.LoginVO;
import com.enterprise.user.domain.vo.UserVO;
import com.enterprise.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Auth", description = "Authentication APIs")
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @Operation(summary = "Login", description = "Authenticate with username/password, returns JWT tokens")
    @PostMapping("/login")
    public Result<LoginVO> login(@Valid @RequestBody LoginRequest request) {
        return Result.ok(userService.login(request));
    }

    @Operation(summary = "Register", description = "Create a new user account")
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public Result<UserVO> register(@Valid @RequestBody RegisterRequest request) {
        return Result.ok(userService.register(request), "User registered successfully");
    }
}
