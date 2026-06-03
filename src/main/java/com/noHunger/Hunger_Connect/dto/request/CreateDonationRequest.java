package com.noHunger.Hunger_Connect.dto.request;

import com.noHunger.Hunger_Connect.enums.VegType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class CreateDonationRequest {

    @NotEmpty
    private List<String> foodTypes;

    @NotNull
    private VegType vegNonVeg;

    @NotBlank
    private String quantity;

    @NotBlank
    private String addressLine1;

    private String addressLine2;

    @NotBlank
    private String city;

    @NotBlank
    private String state;

    @NotBlank
    private String pincode;

    @NotNull
    private LocalDate pickupDate;

    @NotBlank
    private String pickupTime;

    private String message;
}
