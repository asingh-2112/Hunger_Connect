package com.noHunger.Hunger_Connect.service.impl;

import com.noHunger.Hunger_Connect.config.StorageProperties;
import com.noHunger.Hunger_Connect.dto.response.FileUploadResponse;
import com.noHunger.Hunger_Connect.exception.ApiException;
import com.noHunger.Hunger_Connect.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.IOException;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileStorageServiceImpl implements FileStorageService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/gif"
    );

    private final S3Client s3Client;
    private final StorageProperties storageProperties;

    @Override
    public FileUploadResponse uploadFile(MultipartFile file, String folder) {
        validateFile(file);
        ensureBucketExists();

        String extension = getExtension(file.getOriginalFilename());
        String key = folder + "/" + UUID.randomUUID() + "." + extension;

        try {
            PutObjectRequest request = PutObjectRequest.builder()
                    .bucket(storageProperties.getBucket())
                    .key(key)
                    .contentType(file.getContentType())
                    .contentLength(file.getSize())
                    .build();

            s3Client.putObject(request, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            String url = storageProperties.getEndpoint() + "/" + storageProperties.getBucket() + "/" + key;

            return FileUploadResponse.builder()
                    .url(url)
                    .key(key)
                    .sizeBytes(file.getSize())
                    .contentType(file.getContentType())
                    .build();

        } catch (IOException e) {
            throw new ApiException("Failed to read file: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (S3Exception e) {
            log.error("S3 upload failed: {}", e.getMessage());
            throw new ApiException("File upload failed", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public void deleteFile(String key) {
        try {
            s3Client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(storageProperties.getBucket())
                    .key(key)
                    .build());
        } catch (S3Exception e) {
            log.warn("Failed to delete S3 object {}: {}", key, e.getMessage());
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw ApiException.badRequest("File is empty");
        }
        if (!ALLOWED_CONTENT_TYPES.contains(file.getContentType())) {
            throw ApiException.badRequest("Only image files are allowed (JPEG, PNG, WebP, GIF)");
        }
        long maxBytes = (long) storageProperties.getMaxFileSizeMb() * 1024 * 1024;
        if (file.getSize() > maxBytes) {
            throw ApiException.badRequest("File size exceeds " + storageProperties.getMaxFileSizeMb() + "MB limit");
        }
    }

    private void ensureBucketExists() {
        try {
            s3Client.headBucket(HeadBucketRequest.builder()
                    .bucket(storageProperties.getBucket())
                    .build());
        } catch (NoSuchBucketException e) {
            s3Client.createBucket(CreateBucketRequest.builder()
                    .bucket(storageProperties.getBucket())
                    .build());
            log.info("Created S3 bucket: {}", storageProperties.getBucket());
        }
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "jpg";
        return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
    }
}
