package com.noHunger.Hunger_Connect.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateBlogRequest {

    @NotBlank
    private String caption;

    private String imageUrl;
}
