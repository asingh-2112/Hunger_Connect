package com.noHunger.Hunger_Connect.service.impl;

import com.noHunger.Hunger_Connect.dto.request.CreateBlogRequest;
import com.noHunger.Hunger_Connect.dto.request.CreateCommentRequest;
import com.noHunger.Hunger_Connect.dto.response.BlogResponse;
import com.noHunger.Hunger_Connect.dto.response.CommentResponse;
import com.noHunger.Hunger_Connect.dto.response.PageResponse;
import com.noHunger.Hunger_Connect.entity.Blog;
import com.noHunger.Hunger_Connect.entity.BlogComment;
import com.noHunger.Hunger_Connect.entity.User;
import com.noHunger.Hunger_Connect.enums.UserRole;
import com.noHunger.Hunger_Connect.exception.ApiException;
import com.noHunger.Hunger_Connect.repository.BlogCommentRepository;
import com.noHunger.Hunger_Connect.repository.BlogLikeRepository;
import com.noHunger.Hunger_Connect.repository.BlogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BlogServiceImpl implements com.noHunger.Hunger_Connect.service.BlogService {

    private final BlogRepository blogRepository;
    private final BlogCommentRepository commentRepository;
    private final BlogLikeRepository likeRepository;

    @Override
    @Transactional
    public BlogResponse createBlog(CreateBlogRequest request, User author) {
        Blog blog = Blog.builder()
                .author(author)
                .caption(request.getCaption())
                .imageUrl(request.getImageUrl())
                .build();
        return toResponse(blogRepository.save(blog), author);
    }

    @Override
    public BlogResponse getBlog(UUID id, User currentUser) {
        Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Blog"));
        return toResponse(blog, currentUser);
    }

    @Override
    public PageResponse<BlogResponse> getAllBlogs(User currentUser, Pageable pageable) {
        Page<Blog> page = blogRepository.findAll(pageable);
        return toPageResponse(page, currentUser);
    }

    @Override
    public PageResponse<BlogResponse> getMyBlogs(User author, Pageable pageable) {
        Page<Blog> page = blogRepository.findByAuthorId(author.getId(), pageable);
        return toPageResponse(page, author);
    }

    @Override
    @Transactional
    public void deleteBlog(UUID id, User currentUser) {
        Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Blog"));
        if (!blog.getAuthor().getId().equals(currentUser.getId()) && currentUser.getRole() != UserRole.ADMIN) {
            throw ApiException.forbidden("Not authorized to delete this blog");
        }
        blogRepository.delete(blog);
    }

    @Override
    @Transactional
    public boolean toggleLike(UUID blogId, User user) {
        if (!blogRepository.existsById(blogId)) {
            throw ApiException.notFound("Blog");
        }
        boolean alreadyLiked = likeRepository.existsByBlogIdAndUserId(blogId, user.getId());
        if (alreadyLiked) {
            likeRepository.deleteByBlogIdAndUserId(blogId, user.getId());
            blogRepository.decrementLikes(blogId);
            return false;
        } else {
            BlogLikeRepository.BlogLike like = new BlogLikeRepository.BlogLike(
                    new BlogLikeRepository.BlogLikeId(blogId, user.getId())
            );
            likeRepository.save(like);
            blogRepository.incrementLikes(blogId);
            return true;
        }
    }

    @Override
    @Transactional
    public CommentResponse addComment(UUID blogId, CreateCommentRequest request, User user) {
        Blog blog = blogRepository.findById(blogId)
                .orElseThrow(() -> ApiException.notFound("Blog"));
        BlogComment comment = BlogComment.builder()
                .blog(blog)
                .user(user)
                .text(request.getText())
                .build();
        return toCommentResponse(commentRepository.save(comment));
    }

    @Override
    public PageResponse<CommentResponse> getComments(UUID blogId, Pageable pageable) {
        if (!blogRepository.existsById(blogId)) {
            throw ApiException.notFound("Blog");
        }
        Page<BlogComment> page = commentRepository.findByBlogId(blogId, pageable);
        return PageResponse.<CommentResponse>builder()
                .content(page.getContent().stream().map(this::toCommentResponse).toList())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }

    @Override
    @Transactional
    public void deleteComment(UUID commentId, User currentUser) {
        BlogComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> ApiException.notFound("Comment"));
        if (!comment.getUser().getId().equals(currentUser.getId()) && currentUser.getRole() != UserRole.ADMIN) {
            throw ApiException.forbidden("Not authorized to delete this comment");
        }
        commentRepository.delete(comment);
    }

    private BlogResponse toResponse(Blog blog, User currentUser) {
        boolean liked = currentUser != null &&
                likeRepository.existsByBlogIdAndUserId(blog.getId(), currentUser.getId());
        return BlogResponse.builder()
                .id(blog.getId())
                .authorId(blog.getAuthor().getId())
                .authorName(blog.getAuthor().getName())
                .authorProfileImageUrl(blog.getAuthor().getProfileImageUrl())
                .caption(blog.getCaption())
                .imageUrl(blog.getImageUrl())
                .likesCount(blog.getLikesCount())
                .likedByCurrentUser(liked)
                .createdAt(blog.getCreatedAt())
                .build();
    }

    private CommentResponse toCommentResponse(BlogComment comment) {
        return CommentResponse.builder()
                .id(comment.getId())
                .userId(comment.getUser().getId())
                .userName(comment.getUser().getName())
                .userProfileImageUrl(comment.getUser().getProfileImageUrl())
                .text(comment.getText())
                .createdAt(comment.getCreatedAt())
                .build();
    }

    private PageResponse<BlogResponse> toPageResponse(Page<Blog> page, User currentUser) {
        return PageResponse.<BlogResponse>builder()
                .content(page.getContent().stream().map(b -> toResponse(b, currentUser)).toList())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }
}
