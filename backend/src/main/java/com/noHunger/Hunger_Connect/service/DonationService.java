package com.noHunger.Hunger_Connect.service;

import com.noHunger.Hunger_Connect.dto.request.CreateDonationRequest;
import com.noHunger.Hunger_Connect.dto.request.RatingRequest;
import com.noHunger.Hunger_Connect.dto.response.DonationResponse;
import com.noHunger.Hunger_Connect.dto.response.PageResponse;
import com.noHunger.Hunger_Connect.entity.User;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface DonationService {
    DonationResponse createDonation(CreateDonationRequest request, User currentUser);
    DonationResponse getDonation(UUID id);
    PageResponse<DonationResponse> getMyDonations(User currentUser, Pageable pageable);
    PageResponse<DonationResponse> getPendingDonations(String city, Pageable pageable);
    PageResponse<DonationResponse> getAcceptedDonations(User ngo, Pageable pageable);
    DonationResponse acceptDonation(UUID donationId, User ngo);
    DonationResponse withdrawAcceptance(UUID donationId, User ngo);
    DonationResponse completeDonation(UUID donationId, User currentUser);
    void deleteDonation(UUID donationId, User currentUser);
    void rateDonation(RatingRequest request, User ratingUser);
}
