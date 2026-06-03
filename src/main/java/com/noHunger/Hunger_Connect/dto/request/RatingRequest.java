package com.noHunger.Hunger_Connect.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.UUID;

@Data
public class RatingRequest {

    @NotNull
    private UUID donationId;

    @NotNull
    private UUID ratedForId;

    @NotNull
    @Min(1) @Max(5)
    private Short rating;

    private String comment;
}
