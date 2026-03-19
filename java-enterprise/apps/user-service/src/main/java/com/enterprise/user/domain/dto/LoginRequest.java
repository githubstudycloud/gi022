package com.enterprise.user.domain.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
@Schema(description = "Login request")
public class LoginRequest {

    @NotBlank(message = "Username is required")
    @Schema(description = "Username", example = "admin")
    private String username;

    @NotBlank(message = "Password is required")
    @Schema(description = "Password", example = "P@ssw0rd")
    private String password;
}
