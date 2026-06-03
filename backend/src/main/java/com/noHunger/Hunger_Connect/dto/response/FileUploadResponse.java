package com.noHunger.Hunger_Connect.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FileUploadResponse {
    private String url;
    private String key;
    private long sizeBytes;
    private String contentType;
}
