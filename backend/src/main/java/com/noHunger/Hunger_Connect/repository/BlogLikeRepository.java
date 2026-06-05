package com.noHunger.Hunger_Connect.repository;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.io.Serializable;
import java.util.UUID;

public interface BlogLikeRepository extends JpaRepository<BlogLikeRepository.BlogLike, BlogLikeRepository.BlogLikeId> {

    boolean existsByIdBlogIdAndIdUserId(UUID blogId, UUID userId);

    @Modifying
    @Query(value = "DELETE FROM blog_likes WHERE blog_id = :blogId AND user_id = :userId", nativeQuery = true)
    void deleteByBlogIdAndUserId(@Param("blogId") UUID blogId, @Param("userId") UUID userId);

    @Entity
    @Table(name = "blog_likes")
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    class BlogLike {
        @EmbeddedId
        private BlogLikeId id;
    }

    @Embeddable
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode
    class BlogLikeId implements Serializable {
        @Column(name = "blog_id")
        private UUID blogId;

        @Column(name = "user_id")
        private UUID userId;
    }
}
