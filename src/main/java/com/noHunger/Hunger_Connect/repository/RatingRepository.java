package com.noHunger.Hunger_Connect.repository;

import com.noHunger.Hunger_Connect.entity.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RatingRepository extends JpaRepository<Rating, UUID> {

    Optional<Rating> findByDonationIdAndRatedById(UUID donationId, UUID ratedById);

    List<Rating> findByRatedForId(UUID ratedForId);

    boolean existsByDonationIdAndRatedById(UUID donationId, UUID ratedById);

    @Query("SELECT AVG(r.rating) FROM Rating r WHERE r.ratedFor.id = :userId")
    Optional<Double> findAverageRatingByUser(@Param("userId") UUID userId);
}
