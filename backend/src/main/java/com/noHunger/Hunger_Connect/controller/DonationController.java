package com.noHunger.Hunger_Connect.controller;

import com.noHunger.Hunger_Connect.dto.request.CreateDonationRequest;
import com.noHunger.Hunger_Connect.dto.request.RatingRequest;
import com.noHunger.Hunger_Connect.dto.response.DonationResponse;
import com.noHunger.Hunger_Connect.dto.response.PageResponse;
import com.noHunger.Hunger_Connect.entity.User;
import com.noHunger.Hunger_Connect.service.DonationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/donations")
@RequiredArgsConstructor
@Tag(name = "Donations", description = "Donation management")
public class DonationController {

    private final DonationService donationService;

    @PostMapping
    @Operation(summary = "Create a new donation (provider only)")
    public ResponseEntity<DonationResponse> create(
            @Valid @RequestBody CreateDonationRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED).body(donationService.createDonation(request, user));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get donation by ID")
    public ResponseEntity<DonationResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(donationService.getDonation(id));
    }

    @GetMapping
    @Operation(summary = "Get pending donations (optionally filtered by city)")
    public ResponseEntity<PageResponse<DonationResponse>> getPending(
            @RequestParam(required = false) String city,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(donationService.getPendingDonations(city,
                PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }

    @GetMapping("/my")
    @Operation(summary = "Get current provider's donations")
    public ResponseEntity<PageResponse<DonationResponse>> getMy(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(donationService.getMyDonations(user,
                PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }

    @GetMapping("/accepted")
    @Operation(summary = "Get donations accepted by current NGO/distributor")
    public ResponseEntity<PageResponse<DonationResponse>> getAccepted(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(donationService.getAcceptedDonations(user,
                PageRequest.of(page, size, Sort.by("acceptedAt").descending())));
    }

    @PostMapping("/{id}/accept")
    @Operation(summary = "Accept a donation (distributor only)")
    public ResponseEntity<DonationResponse> accept(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(donationService.acceptDonation(id, user));
    }

    @PostMapping("/{id}/withdraw")
    @Operation(summary = "Withdraw acceptance of a donation")
    public ResponseEntity<DonationResponse> withdraw(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(donationService.withdrawAcceptance(id, user));
    }

    @PostMapping("/{id}/complete")
    @Operation(summary = "Mark a donation as completed")
    public ResponseEntity<DonationResponse> complete(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(donationService.completeDonation(id, user));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a donation")
    public ResponseEntity<Void> delete(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        donationService.deleteDonation(id, user);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/rate")
    @Operation(summary = "Rate a completed donation")
    public ResponseEntity<Void> rate(
            @Valid @RequestBody RatingRequest request,
            @AuthenticationPrincipal User user) {
        donationService.rateDonation(request, user);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}
