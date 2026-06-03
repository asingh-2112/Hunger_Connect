package com.noHunger.Hunger_Connect.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
public class BlogResponse {
    private UUID id;
    private UUID authorId;
    private String authorName;
    private String authorProfileImageUrl;
    private String caption;
    private String imageUrl;
    private int likesCount;
    private boolean likedByCurrentUser;
    private OffsetDateTime createdAt;
}
