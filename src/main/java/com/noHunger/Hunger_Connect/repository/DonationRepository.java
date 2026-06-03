package com.noHunger.Hunger_Connect.repository;

import com.noHunger.Hunger_Connect.entity.Donation;
import com.noHunger.Hunger_Connect.enums.DonationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface DonationRepository extends JpaRepository<Donation, UUID> {

    Page<Donation> findByDonorId(UUID donorId, Pageable pageable);

    Page<Donation> findByStatus(DonationStatus status, Pageable pageable);

    Page<Donation> findByStatusAndCity(DonationStatus status, String city, Pageable pageable);

    @Query("SELECT d FROM Donation d WHERE d.status = :status AND (:city IS NULL OR LOWER(d.city) = LOWER(:city))")
    Page<Donation> findPendingByOptionalCity(@Param("status") DonationStatus status,
                                              @Param("city") String city,
                                              Pageable pageable);
}
