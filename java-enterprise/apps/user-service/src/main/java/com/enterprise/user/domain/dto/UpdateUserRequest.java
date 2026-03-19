package com.enterprise.user.domain.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Update user profile request")
public class UpdateUserRequest {

    @Size(max = 50, message = "Nickname must be at most 50 characters")
    @Schema(description = "Display name")
    private String nickname;

    @Email(message = "Invalid email format")
    @Schema(description = "Email address")
    private String email;

    @Schema(description = "Phone number")
    private String phone;

    @Schema(description = "Avatar URL")
    private String avatar;
}
