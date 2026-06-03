package com.noHunger.Hunger_Connect.dto.request;

import lombok.Data;

@Data
public class UpdateProfileRequest {

    private String name;
    private String phone;
    private String organizationName;
    private String organizationType;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String pincode;
    private String profileImageUrl;
}
