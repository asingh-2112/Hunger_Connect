package com.noHunger.Hunger_Connect.service.impl;

import com.noHunger.Hunger_Connect.dto.request.UpdateProfileRequest;
import com.noHunger.Hunger_Connect.dto.response.PageResponse;
import com.noHunger.Hunger_Connect.dto.response.UserResponse;
import com.noHunger.Hunger_Connect.entity.User;
import com.noHunger.Hunger_Connect.exception.ApiException;
import com.noHunger.Hunger_Connect.repository.RatingRepository;
import com.noHunger.Hunger_Connect.repository.UserRepository;
import com.noHunger.Hunger_Connect.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService, UserDetailsService {

    private final UserRepository userRepository;
    private final RatingRepository ratingRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    @Override
    public UserResponse getProfile(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("User"));
        return toResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateProfile(UUID id, UpdateProfileRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("User"));

        if (request.getName() != null) user.setName(request.getName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getOrganizationName() != null) user.setOrganizationName(request.getOrganizationName());
        if (request.getOrganizationType() != null) user.setOrganizationType(request.getOrganizationType());
        if (request.getAddressLine1() != null) user.setAddressLine1(request.getAddressLine1());
        if (request.getAddressLine2() != null) user.setAddressLine2(request.getAddressLine2());
        if (request.getCity() != null) user.setCity(request.getCity());
        if (request.getState() != null) user.setState(request.getState());
        if (request.getPincode() != null) user.setPincode(request.getPincode());
        if (request.getProfileImageUrl() != null) user.setProfileImageUrl(request.getProfileImageUrl());

        return toResponse(userRepository.save(user));
    }

    @Override
    public UserResponse getCurrentUser(User user) {
        return toResponse(user);
    }

    @Override
    public PageResponse<UserResponse> getAllUsers(Pageable pageable) {
        Page<User> page = userRepository.findByActiveTrue(pageable);
        return PageResponse.<UserResponse>builder()
                .content(page.getContent().stream().map(this::toResponse).toList())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }

    @Override
    @Transactional
    public void setUserActive(UUID id, boolean active) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("User"));
        user.setActive(active);
        userRepository.save(user);
    }

    private UserResponse toResponse(User user) {
        Double avgRating = ratingRepository.findAverageRatingByUser(user.getId()).orElse(null);
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole())
                .donorType(user.getDonorType())
                .organizationName(user.getOrganizationName())
                .organizationType(user.getOrganizationType())
                .phone(user.getPhone())
                .addressLine1(user.getAddressLine1())
                .addressLine2(user.getAddressLine2())
                .city(user.getCity())
                .state(user.getState())
                .pincode(user.getPincode())
                .profileImageUrl(user.getProfileImageUrl())
                .active(user.isActive())
                .createdAt(user.getCreatedAt())
                .averageRating(avgRating)
                .build();
    }
}
