package com.enterprise.user.domain.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "User registration request")
public class RegisterRequest {

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be 3-50 characters")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "Username can only contain letters, digits, and underscores")
    @Schema(description = "Username", example = "john_doe")
    private String username;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 100, message = "Password must be at least 8 characters")
    @Schema(description = "Password (min 8 chars)", example = "P@ssw0rd123")
    private String password;

    @NotBlank(message = "Nickname is required")
    @Size(max = 50, message = "Nickname must be at most 50 characters")
    @Schema(description = "Display name", example = "John Doe")
    private String nickname;

    @Email(message = "Invalid email format")
    @Schema(description = "Email address", example = "john@example.com")
    private String email;
}
