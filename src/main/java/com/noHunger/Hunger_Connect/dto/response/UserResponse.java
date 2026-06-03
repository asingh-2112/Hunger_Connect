package com.noHunger.Hunger_Connect.dto.response;

import com.noHunger.Hunger_Connect.enums.DonorType;
import com.noHunger.Hunger_Connect.enums.UserRole;
import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
public class UserResponse {
    private UUID id;
    private String email;
    private String name;
    private UserRole role;
    private DonorType donorType;
    private String organizationName;
    private String organizationType;
    private String phone;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String pincode;
    private String profileImageUrl;
    private boolean active;
    private OffsetDateTime createdAt;
    private Double averageRating;
}
