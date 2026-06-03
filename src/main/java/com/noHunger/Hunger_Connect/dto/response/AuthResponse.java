package com.noHunger.Hunger_Connect.dto.response;

import com.noHunger.Hunger_Connect.enums.UserRole;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private UUID userId;
    private String email;
    private String name;
    private UserRole role;
}
