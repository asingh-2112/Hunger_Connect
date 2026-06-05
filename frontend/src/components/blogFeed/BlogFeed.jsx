import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { blogApi } from '../../api/blog';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import moment from 'moment';

function BlogFeed() {
    const queryClient = useQueryClient();
    const { user, isAuthenticated } = useAuth();

    const [selectedBlogId, setSelectedBlogId] = useState(null);
    const [commentText, setCommentText] = useState('');

    const { data: blogsPage, isLoading } = useQuery({
        queryKey: ['blogs'],
        queryFn: () => blogApi.getAll({ page: 0, size: 30 }),
    });

    const { data: commentsPage } = useQuery({
        queryKey: ['blogComments', selectedBlogId],
        queryFn: () => blogApi.getComments(selectedBlogId, { page: 0, size: 50 }),
        enabled: !!selectedBlogId,
    });

    const likeMutation = useMutation({
        mutationFn: (blogId) => blogApi.toggleLike(blogId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['blogs'] }),
        onError: () => toast.error('Failed to update like'),
    });

    const commentMutation = useMutation({
        mutationFn: ({ blogId, text }) => blogApi.addComment(blogId, text),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['blogComments', selectedBlogId] });
            queryClient.invalidateQueries({ queryKey: ['blogs'] });
            setCommentText('');
            toast.success('Comment added!');
        },
        onError: () => toast.error('Failed to add comment'),
    });

    const handleLike = (blogId) => {
        if (!isAuthenticated) return toast.error('Please login to like posts');
        likeMutation.mutate(blogId);
    };

    const handleAddComment = () => {
        if (!commentText.trim()) return;
        if (!isAuthenticated) return toast.error('Please login to comment');
        commentMutation.mutate({ blogId: selectedBlogId, text: commentText });
    };

    const blogs = blogsPage?.content || [];

    if (isLoading) {
        return (
            <section className="py-16">
                <div className="max-w-3xl mx-auto px-4 space-y-8">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                            <div className="h-4 bg-slate-200 rounded w-1/3 mb-3" />
                            <div className="h-64 bg-slate-200 rounded-xl mb-3" />
                            <div className="h-4 bg-slate-200 rounded w-2/3" />
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    return (
        <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-10">
                    <h2 className="section-title mb-1">Community Stories</h2>
                    <p className="text-slate-500">Inspiring stories from our community</p>
                </div>

                {blogs.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-slate-400 text-lg">No stories yet. Be the first to share!</p>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {blogs.map((blog) => (
                            <article key={blog.id} className="group">
                                {/* Author row */}
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {blog.authorProfileImageUrl ? (
                                            <img src={blog.authorProfileImageUrl} alt={blog.authorName} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-brand-700 font-semibold text-sm">
                                                {blog.authorName?.charAt(0)?.toUpperCase() || 'U'}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-800">{blog.authorName || 'Anonymous'}</p>
                                        <p className="text-xs text-slate-400">{moment(blog.createdAt).format('MMM D, YYYY')} · {readingTime(blog.caption)} min read</p>
                                    </div>
                                </div>

                                {/* Hero image */}
                                {blog.imageUrl && (
                                    <Link to={`/bloginfo/${blog.id}`} className="block mb-4 overflow-hidden rounded-xl">
                                        <img
                                            src={blog.imageUrl}
                                            alt={blog.caption}
                                            className="w-full h-72 object-cover group-hover:scale-[1.01] transition-transform duration-500"
                                        />
                                    </Link>
                                )}

                                {/* Title / caption */}
                                <Link to={`/bloginfo/${blog.id}`}>
                                    <p className="article-title text-xl font-bold text-slate-900 leading-snug mb-3 group-hover:text-brand-600 transition-colors line-clamp-3">
                                        {blog.caption}
                                    </p>
                                </Link>

                                {/* Actions */}
                                <div className="flex items-center gap-5">
                                    <button
                                        onClick={() => handleLike(blog.id)}
                                        className={`flex items-center gap-1.5 text-sm transition-colors ${
                                            blog.likedByCurrentUser ? 'text-red-500' : 'text-slate-500 hover:text-red-500'
                                        }`}
                                    >
                                        {blog.likedByCurrentUser ? (
                                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                            </svg>
                                        ) : (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                            </svg>
                                        )}
                                        <span>{blog.likesCount || 0}</span>
                                    </button>

                                    <button
                                        onClick={() => setSelectedBlogId(selectedBlogId === blog.id ? null : blog.id)}
                                        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-600 transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                        <span>{blog.commentsCount || 0} comments</span>
                                    </button>

                                    <Link
                                        to={`/bloginfo/${blog.id}`}
                                        className="ml-auto text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors"
                                    >
                                        Read more →
                                    </Link>
                                </div>

                                {/* Inline comments panel */}
                                {selectedBlogId === blog.id && (
                                    <div className="mt-6 border-t border-slate-100 pt-5">
                                        {(commentsPage?.content || []).length === 0 ? (
                                            <p className="text-sm text-slate-400 mb-4">No comments yet.</p>
                                        ) : (
                                            <div className="space-y-4 mb-5">
                                                {commentsPage.content.map((c) => (
                                                    <div key={c.id} className="flex gap-3">
                                                        <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 text-xs font-semibold text-slate-600">
                                                            {c.userName?.charAt(0)?.toUpperCase() || 'U'}
                                                        </div>
                                                        <div>
                                                            <span className="text-sm font-medium text-slate-800 mr-2">{c.userName}</span>
                                                            <span className="text-xs text-slate-400">{moment(c.createdAt).fromNow()}</span>
                                                            <p className="text-sm text-slate-600 mt-0.5">{c.text}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {isAuthenticated ? (
                                            <div className="flex gap-3 items-start">
                                                <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0 text-xs font-semibold text-brand-700">
                                                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                                </div>
                                                <div className="flex-1 flex gap-2">
                                                    <input
                                                        type="text"
                                                        className="input flex-1"
                                                        placeholder="Write a comment…"
                                                        value={commentText}
                                                        onChange={(e) => setCommentText(e.target.value)}
                                                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                                                    />
                                                    <button
                                                        onClick={handleAddComment}
                                                        disabled={!commentText.trim() || commentMutation.isPending}
                                                        className="btn-primary disabled:opacity-50"
                                                    >
                                                        Post
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-slate-500">
                                                <Link to="/adminlogin" className="text-brand-600 hover:underline">Sign in</Link> to comment.
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Divider */}
                                <hr className="mt-10 border-slate-100" />
                            </article>
                        ))}
                    </div>
                )}

                {blogs.length > 0 && (
                    <div className="mt-12 text-center">
                        <Link to="/allblogs" className="btn-secondary">
                            View all stories →
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
}

function readingTime(text = '') {
    const words = text.trim().split(/\s+/).length;
    return Math.max(1, Math.round(words / 200));
}

export default BlogFeed;
