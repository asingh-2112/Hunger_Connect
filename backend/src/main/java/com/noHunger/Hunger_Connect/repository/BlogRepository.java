package com.noHunger.Hunger_Connect.repository;

import com.noHunger.Hunger_Connect.entity.Blog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface BlogRepository extends JpaRepository<Blog, UUID> {

    Page<Blog> findByAuthorId(UUID authorId, Pageable pageable);

    @Modifying
    @Query("UPDATE Blog b SET b.likesCount = b.likesCount + 1 WHERE b.id = :id")
    void incrementLikes(@Param("id") UUID id);

    @Modifying
    @Query("UPDATE Blog b SET b.likesCount = b.likesCount - 1 WHERE b.id = :id AND b.likesCount > 0")
    void decrementLikes(@Param("id") UUID id);
}
