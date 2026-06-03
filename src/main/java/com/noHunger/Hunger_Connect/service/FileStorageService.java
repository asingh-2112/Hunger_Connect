package com.noHunger.Hunger_Connect.service;

import com.noHunger.Hunger_Connect.dto.response.FileUploadResponse;
import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {
    FileUploadResponse uploadFile(MultipartFile file, String folder);
    void deleteFile(String key);
}
