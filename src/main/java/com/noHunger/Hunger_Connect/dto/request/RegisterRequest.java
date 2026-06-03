package com.noHunger.Hunger_Connect.dto.request;

import com.noHunger.Hunger_Connect.enums.DonorType;
import com.noHunger.Hunger_Connect.enums.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank
    @Email
    private String email;

    @NotBlank
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    @NotBlank
    private String name;

    @NotNull
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
}
