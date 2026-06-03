package com.noHunger.Hunger_Connect.controller;

import com.noHunger.Hunger_Connect.dto.request.CreateBlogRequest;
import com.noHunger.Hunger_Connect.dto.request.CreateCommentRequest;
import com.noHunger.Hunger_Connect.dto.response.BlogResponse;
import com.noHunger.Hunger_Connect.dto.response.CommentResponse;
import com.noHunger.Hunger_Connect.dto.response.PageResponse;
import com.noHunger.Hunger_Connect.entity.User;
import com.noHunger.Hunger_Connect.service.BlogService;
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

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/blogs")
@RequiredArgsConstructor
@Tag(name = "Blogs", description = "Blog management")
public class BlogController {

    private final BlogService blogService;

    @PostMapping
    @Operation(summary = "Create a blog post")
    public ResponseEntity<BlogResponse> create(
            @Valid @RequestBody CreateBlogRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED).body(blogService.createBlog(request, user));
    }

    @GetMapping
    @Operation(summary = "Get all blog posts (public)")
    public ResponseEntity<PageResponse<BlogResponse>> getAll(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(blogService.getAllBlogs(user,
                PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }

    @GetMapping("/my")
    @Operation(summary = "Get current user's blog posts")
    public ResponseEntity<PageResponse<BlogResponse>> getMy(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(blogService.getMyBlogs(user,
                PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get blog by ID (public)")
    public ResponseEntity<BlogResponse> getById(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(blogService.getBlog(id, user));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete blog post")
    public ResponseEntity<Void> delete(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        blogService.deleteBlog(id, user);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/like")
    @Operation(summary = "Toggle like on a blog post")
    public ResponseEntity<Map<String, Boolean>> toggleLike(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        boolean liked = blogService.toggleLike(id, user);
        return ResponseEntity.ok(Map.of("liked", liked));
    }

    @GetMapping("/{id}/comments")
    @Operation(summary = "Get comments on a blog (public)")
    public ResponseEntity<PageResponse<CommentResponse>> getComments(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(blogService.getComments(id,
                PageRequest.of(page, size, Sort.by("createdAt").ascending())));
    }

    @PostMapping("/{id}/comments")
    @Operation(summary = "Add a comment to a blog post")
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable UUID id,
            @Valid @RequestBody CreateCommentRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED).body(blogService.addComment(id, request, user));
    }

    @DeleteMapping("/comments/{commentId}")
    @Operation(summary = "Delete a comment")
    public ResponseEntity<Void> deleteComment(
            @PathVariable UUID commentId,
            @AuthenticationPrincipal User user) {
        blogService.deleteComment(commentId, user);
        return ResponseEntity.noContent().build();
    }
}
