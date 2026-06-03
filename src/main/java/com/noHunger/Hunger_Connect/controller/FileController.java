package com.noHunger.Hunger_Connect.controller;

import com.noHunger.Hunger_Connect.dto.response.FileUploadResponse;
import com.noHunger.Hunger_Connect.service.FileStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@Tag(name = "Files", description = "File upload to S3/MinIO")
public class FileController {

    private final FileStorageService fileStorageService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload an image file, returns public URL")
    public ResponseEntity<FileUploadResponse> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", defaultValue = "uploads") String folder) {
        return ResponseEntity.ok(fileStorageService.uploadFile(file, folder));
    }
}
