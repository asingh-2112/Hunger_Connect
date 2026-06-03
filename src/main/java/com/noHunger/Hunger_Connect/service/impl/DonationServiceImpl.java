package com.noHunger.Hunger_Connect.service.impl;

import com.noHunger.Hunger_Connect.dto.request.CreateDonationRequest;
import com.noHunger.Hunger_Connect.dto.request.RatingRequest;
import com.noHunger.Hunger_Connect.dto.response.DonationResponse;
import com.noHunger.Hunger_Connect.dto.response.PageResponse;
import com.noHunger.Hunger_Connect.entity.Donation;
import com.noHunger.Hunger_Connect.entity.DonationAcceptance;
import com.noHunger.Hunger_Connect.entity.Rating;
import com.noHunger.Hunger_Connect.entity.User;
import com.noHunger.Hunger_Connect.enums.DonationStatus;
import com.noHunger.Hunger_Connect.enums.UserRole;
import com.noHunger.Hunger_Connect.exception.ApiException;
import com.noHunger.Hunger_Connect.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DonationServiceImpl implements com.noHunger.Hunger_Connect.service.DonationService {

    private final DonationRepository donationRepository;
    private final DonationAcceptanceRepository acceptanceRepository;
    private final RatingRepository ratingRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public DonationResponse createDonation(CreateDonationRequest request, User currentUser) {
        if (currentUser.getRole() != UserRole.PROVIDER) {
            throw ApiException.forbidden("Only providers can create donations");
        }

        Donation donation = Donation.builder()
                .donor(currentUser)
                .foodTypes(request.getFoodTypes().toArray(new String[0]))
                .vegNonVeg(request.getVegNonVeg())
                .quantity(request.getQuantity())
                .addressLine1(request.getAddressLine1())
                .addressLine2(request.getAddressLine2())
                .city(request.getCity())
                .state(request.getState())
                .pincode(request.getPincode())
                .pickupDate(request.getPickupDate())
                .pickupTime(request.getPickupTime())
                .message(request.getMessage())
                .build();

        return toResponse(donationRepository.save(donation));
    }

    @Override
    public DonationResponse getDonation(UUID id) {
        Donation donation = donationRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Donation"));
        return toResponse(donation);
    }

    @Override
    public PageResponse<DonationResponse> getMyDonations(User currentUser, Pageable pageable) {
        Page<Donation> page = donationRepository.findByDonorId(currentUser.getId(), pageable);
        return toPageResponse(page);
    }

    @Override
    public PageResponse<DonationResponse> getPendingDonations(String city, Pageable pageable) {
        Page<Donation> page = donationRepository.findPendingByOptionalCity(DonationStatus.PENDING, city, pageable);
        return toPageResponse(page);
    }

    @Override
    public PageResponse<DonationResponse> getAcceptedDonations(User ngo, Pageable pageable) {
        Page<DonationAcceptance> page = acceptanceRepository.findByNgoId(ngo.getId(), pageable);
        List<DonationResponse> responses = page.getContent().stream()
                .map(acceptance -> toResponse(acceptance.getDonation()))
                .toList();
        return PageResponse.<DonationResponse>builder()
                .content(responses)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }

    @Override
    @Transactional
    public DonationResponse acceptDonation(UUID donationId, User ngo) {
        if (ngo.getRole() != UserRole.DISTRIBUTOR) {
            throw ApiException.forbidden("Only distributors can accept donations");
        }

        Donation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> ApiException.notFound("Donation"));

        if (donation.getStatus() != DonationStatus.PENDING) {
            throw ApiException.badRequest("Donation is not available for acceptance");
        }

        if (acceptanceRepository.existsByDonationId(donationId)) {
            throw ApiException.conflict("Donation already accepted");
        }

        DonationAcceptance acceptance = DonationAcceptance.builder()
                .donation(donation)
                .ngo(ngo)
                .build();
        acceptanceRepository.save(acceptance);

        donation.setStatus(DonationStatus.ACCEPTED);
        return toResponse(donationRepository.save(donation));
    }

    @Override
    @Transactional
    public DonationResponse withdrawAcceptance(UUID donationId, User ngo) {
        DonationAcceptance acceptance = acceptanceRepository.findByDonationId(donationId)
                .orElseThrow(() -> ApiException.notFound("Acceptance"));

        if (!acceptance.getNgo().getId().equals(ngo.getId())) {
            throw ApiException.forbidden("You did not accept this donation");
        }

        acceptanceRepository.delete(acceptance);

        Donation donation = acceptance.getDonation();
        donation.setStatus(DonationStatus.PENDING);
        return toResponse(donationRepository.save(donation));
    }

    @Override
    @Transactional
    public DonationResponse completeDonation(UUID donationId, User currentUser) {
        Donation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> ApiException.notFound("Donation"));

        boolean isDonor = donation.getDonor().getId().equals(currentUser.getId());
        boolean isAcceptingNgo = acceptanceRepository.findByDonationId(donationId)
                .map(a -> a.getNgo().getId().equals(currentUser.getId()))
                .orElse(false);

        if (!isDonor && !isAcceptingNgo && currentUser.getRole() != UserRole.ADMIN) {
            throw ApiException.forbidden("Not authorized to complete this donation");
        }

        donation.setStatus(DonationStatus.COMPLETED);
        return toResponse(donationRepository.save(donation));
    }

    @Override
    @Transactional
    public void deleteDonation(UUID donationId, User currentUser) {
        Donation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> ApiException.notFound("Donation"));

        if (!donation.getDonor().getId().equals(currentUser.getId()) && currentUser.getRole() != UserRole.ADMIN) {
            throw ApiException.forbidden("Not authorized to delete this donation");
        }

        if (donation.getStatus() == DonationStatus.ACCEPTED) {
            throw ApiException.badRequest("Cannot delete an accepted donation. Withdraw acceptance first.");
        }

        donationRepository.delete(donation);
    }

    @Override
    @Transactional
    public void rateDonation(RatingRequest request, User ratingUser) {
        Donation donation = donationRepository.findById(request.getDonationId())
                .orElseThrow(() -> ApiException.notFound("Donation"));

        if (donation.getStatus() != DonationStatus.COMPLETED) {
            throw ApiException.badRequest("Can only rate completed donations");
        }

        if (ratingRepository.existsByDonationIdAndRatedById(request.getDonationId(), ratingUser.getId())) {
            throw ApiException.conflict("You have already rated this donation");
        }

        User ratedFor = userRepository.findById(request.getRatedForId())
                .orElseThrow(() -> ApiException.notFound("User to rate"));

        Rating rating = Rating.builder()
                .donation(donation)
                .ratedBy(ratingUser)
                .ratedFor(ratedFor)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        ratingRepository.save(rating);
    }

    private DonationResponse toResponse(Donation donation) {
        DonationResponse.AcceptanceInfo acceptanceInfo = acceptanceRepository
                .findByDonationId(donation.getId())
                .map(a -> DonationResponse.AcceptanceInfo.builder()
                        .ngoId(a.getNgo().getId())
                        .ngoName(a.getNgo().getName())
                        .acceptedAt(a.getAcceptedAt())
                        .build())
                .orElse(null);

        return DonationResponse.builder()
                .id(donation.getId())
                .donorId(donation.getDonor().getId())
                .donorName(donation.getDonor().getName())
                .donorEmail(donation.getDonor().getEmail())
                .foodTypes(donation.getFoodTypes() != null ? Arrays.asList(donation.getFoodTypes()) : List.of())
                .vegNonVeg(donation.getVegNonVeg())
                .quantity(donation.getQuantity())
                .addressLine1(donation.getAddressLine1())
                .addressLine2(donation.getAddressLine2())
                .city(donation.getCity())
                .state(donation.getState())
                .pincode(donation.getPincode())
                .pickupDate(donation.getPickupDate())
                .pickupTime(donation.getPickupTime())
                .message(donation.getMessage())
                .status(donation.getStatus())
                .createdAt(donation.getCreatedAt())
                .acceptance(acceptanceInfo)
                .build();
    }

    private PageResponse<DonationResponse> toPageResponse(Page<Donation> page) {
        return PageResponse.<DonationResponse>builder()
                .content(page.getContent().stream().map(this::toResponse).toList())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }
}
