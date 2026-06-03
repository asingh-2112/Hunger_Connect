package com.noHunger.Hunger_Connect.dto.response;

import com.noHunger.Hunger_Connect.enums.DonationStatus;
import com.noHunger.Hunger_Connect.enums.VegType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class DonationResponse {
    private UUID id;
    private UUID donorId;
    private String donorName;
    private String donorEmail;
    private List<String> foodTypes;
    private VegType vegNonVeg;
    private String quantity;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String pincode;
    private LocalDate pickupDate;
    private String pickupTime;
    private String message;
    private DonationStatus status;
    private OffsetDateTime createdAt;
    private AcceptanceInfo acceptance;

    @Data
    @Builder
    public static class AcceptanceInfo {
        private UUID ngoId;
        private String ngoName;
        private OffsetDateTime acceptedAt;
    }
}
