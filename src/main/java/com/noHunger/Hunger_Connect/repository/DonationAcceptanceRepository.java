package com.noHunger.Hunger_Connect.repository;

import com.noHunger.Hunger_Connect.entity.DonationAcceptance;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface DonationAcceptanceRepository extends JpaRepository<DonationAcceptance, UUID> {

    Optional<DonationAcceptance> findByDonationId(UUID donationId);

    Page<DonationAcceptance> findByNgoId(UUID ngoId, Pageable pageable);

    boolean existsByDonationId(UUID donationId);
}
