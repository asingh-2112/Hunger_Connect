package com.noHunger.Hunger_Connect.controller;

import com.noHunger.Hunger_Connect.dto.request.UpdateProfileRequest;
import com.noHunger.Hunger_Connect.dto.response.PageResponse;
import com.noHunger.Hunger_Connect.dto.response.UserResponse;
import com.noHunger.Hunger_Connect.entity.User;
import com.noHunger.Hunger_Connect.service.impl.UserServiceImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User profile management")
public class UserController {

    private final UserServiceImpl userService;

    @GetMapping("/me")
    @Operation(summary = "Get current user profile")
    public ResponseEntity<UserResponse> getMe(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(userService.getCurrentUser(user));
    }

    @PutMapping("/me")
    @Operation(summary = "Update current user profile")
    public ResponseEntity<UserResponse> updateMe(
            @AuthenticationPrincipal User user,
            @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(user.getId(), request));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user profile by ID")
    public ResponseEntity<UserResponse> getUser(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.getProfile(id));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List all users (admin only)")
    public ResponseEntity<PageResponse<UserResponse>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(userService.getAllUsers(
                PageRequest.of(page, size, Sort.by("createdAt").descending())
        ));
    }

    @PatchMapping("/{id}/active")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Activate/deactivate user (admin only)")
    public ResponseEntity<Void> setActive(@PathVariable UUID id, @RequestParam boolean active) {
        userService.setUserActive(id, active);
        return ResponseEntity.noContent().build();
    }
}
