package com.noHunger.Hunger_Connect.repository;

import com.noHunger.Hunger_Connect.entity.BlogComment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface BlogCommentRepository extends JpaRepository<BlogComment, UUID> {

    Page<BlogComment> findByBlogId(UUID blogId, Pageable pageable);
}
