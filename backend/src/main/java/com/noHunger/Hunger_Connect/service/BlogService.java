package com.noHunger.Hunger_Connect.service;

import com.noHunger.Hunger_Connect.dto.request.CreateBlogRequest;
import com.noHunger.Hunger_Connect.dto.request.CreateCommentRequest;
import com.noHunger.Hunger_Connect.dto.response.BlogResponse;
import com.noHunger.Hunger_Connect.dto.response.CommentResponse;
import com.noHunger.Hunger_Connect.dto.response.PageResponse;
import com.noHunger.Hunger_Connect.entity.User;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface BlogService {
    BlogResponse createBlog(CreateBlogRequest request, User author);
    BlogResponse getBlog(UUID id, User currentUser);
    PageResponse<BlogResponse> getAllBlogs(User currentUser, Pageable pageable);
    PageResponse<BlogResponse> getMyBlogs(User author, Pageable pageable);
    void deleteBlog(UUID id, User currentUser);
    boolean toggleLike(UUID blogId, User user);
    CommentResponse addComment(UUID blogId, CreateCommentRequest request, User user);
    PageResponse<CommentResponse> getComments(UUID blogId, Pageable pageable);
    void deleteComment(UUID commentId, User currentUser);
}
