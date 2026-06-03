package com.noHunger.Hunger_Connect.service;

import com.noHunger.Hunger_Connect.dto.request.UpdateProfileRequest;
import com.noHunger.Hunger_Connect.dto.response.PageResponse;
import com.noHunger.Hunger_Connect.dto.response.UserResponse;
import com.noHunger.Hunger_Connect.entity.User;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface UserService {
    UserResponse getProfile(UUID id);
    UserResponse updateProfile(UUID id, UpdateProfileRequest request);
    UserResponse getCurrentUser(User user);
    PageResponse<UserResponse> getAllUsers(Pageable pageable);
    void setUserActive(UUID id, boolean active);
}
