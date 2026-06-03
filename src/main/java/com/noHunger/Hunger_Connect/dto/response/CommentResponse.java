package com.noHunger.Hunger_Connect.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
public class CommentResponse {
    private UUID id;
    private UUID userId;
    private String userName;
    private String userProfileImageUrl;
    private String text;
    private OffsetDateTime createdAt;
}
