import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Loader from '../../components/loader/Loader';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { blogApi } from '../../api/blog';
import { useAuth } from '../../hooks/useAuth';
import moment from 'moment';

function readingTime(text = '') {
    const words = text.trim().split(/\s+/).length;
    return Math.max(1, Math.round(words / 200));
}

function BlogInfo() {
    const { id } = useParams();
    const queryClient = useQueryClient();
    const { user, isAuthenticated } = useAuth();
    const [commentText, setCommentText] = useState('');

    const { data: blog, isLoading } = useQuery({
        queryKey: ['blog', id],
        queryFn: () => blogApi.getById(id),
        enabled: !!id,
    });

    const { data: commentsPage, refetch: refetchComments } = useQuery({
        queryKey: ['blog-comments', id],
        queryFn: () => blogApi.getComments(id, { page: 0, size: 50 }),
        enabled: !!id,
    });

    const comments = commentsPage?.content || [];

    const likeMutation = useMutation({
        mutationFn: () => blogApi.toggleLike(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['blog', id] }),
    });

    const addCommentMutation = useMutation({
        mutationFn: (text) => blogApi.addComment(id, text),
        onSuccess: () => {
            toast.success('Comment added');
            setCommentText('');
            refetchComments();
        },
        onError: () => toast.error('Please log in to comment'),
    });

    const handleAddComment = () => {
        if (!commentText.trim()) return;
        addCommentMutation.mutate(commentText.trim());
    };

    useEffect(() => { window.scrollTo(0, 0); }, []);

    if (isLoading) {
        return (
            <Layout>
                <div className="max-w-3xl mx-auto px-4 py-20 flex justify-center">
                    <Loader />
                </div>
            </Layout>
        );
    }

    if (!blog) {
        return (
            <Layout>
                <div className="max-w-3xl mx-auto px-4 py-20 text-center">
                    <p className="text-slate-500 text-lg">Blog not found.</p>
                    <Link to="/" className="btn-primary mt-6 inline-block">← Back to Home</Link>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">

                {/* Article header */}
                <header className="mb-8">
                    <p className="text-sm text-brand-600 font-medium mb-3">Community Story</p>
                    <h1 className="article-title text-3xl sm:text-4xl font-bold text-slate-900 leading-tight mb-6">
                        {blog.caption}
                    </h1>

                    {/* Author byline */}
                    <div className="flex items-center gap-4 py-4 border-y border-slate-100">
                        <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {blog.authorProfileImageUrl ? (
                                <img src={blog.authorProfileImageUrl} alt={blog.authorName} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-brand-700 font-semibold">{blog.authorName?.charAt(0)?.toUpperCase() || 'U'}</span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800">{blog.authorName || 'Anonymous'}</p>
                            <p className="text-xs text-slate-400">
                                {moment(blog.createdAt).format('MMM D, YYYY')} · {readingTime(blog.caption)} min read
                            </p>
                        </div>
                        {/* Like button */}
                        <button
                            onClick={() => isAuthenticated ? likeMutation.mutate() : toast.error('Please log in to like')}
                            className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border transition-colors ${
                                blog.likedByMe
                                    ? 'border-red-200 bg-red-50 text-red-500'
                                    : 'border-slate-200 text-slate-500 hover:border-red-200 hover:text-red-500'
                            }`}
                        >
                            {blog.likedByMe ? (
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
                    </div>
                </header>

                {/* Hero image */}
                {blog.imageUrl && (
                    <div className="mb-10 -mx-4 sm:-mx-6 md:mx-0">
                        <img
                            src={blog.imageUrl}
                            alt={blog.caption}
                            className="w-full max-h-[480px] object-cover rounded-xl shadow-sm"
                        />
                    </div>
                )}

                {/* Comments section */}
                <section className="mt-14 pt-10 border-t border-slate-100">
                    <h2 className="text-xl font-bold text-slate-900 mb-8">
                        {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
                    </h2>

                    {/* Comment list */}
                    {comments.length > 0 && (
                        <div className="space-y-6 mb-10">
                            {comments.map((c) => (
                                <div key={c.id} className="flex gap-4">
                                    <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 text-sm font-semibold text-slate-600 overflow-hidden">
                                        {c.userProfileImageUrl ? (
                                            <img src={c.userProfileImageUrl} alt={c.userName} className="w-full h-full object-cover" />
                                        ) : (
                                            c.userName?.charAt(0)?.toUpperCase() || 'U'
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-semibold text-slate-800">{c.userName}</span>
                                            <span className="text-xs text-slate-400">{moment(c.createdAt).fromNow()}</span>
                                        </div>
                                        <p className="text-slate-700 text-sm leading-relaxed">{c.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Add comment */}
                    {isAuthenticated ? (
                        <div className="flex gap-4 items-start">
                            <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0 text-sm font-semibold text-brand-700 overflow-hidden">
                                {user?.profileImageUrl ? (
                                    <img src={user.profileImageUrl} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    user?.name?.charAt(0)?.toUpperCase() || 'U'
                                )}
                            </div>
                            <div className="flex-1 space-y-2">
                                <textarea
                                    rows={3}
                                    className="input resize-none"
                                    placeholder="Share your thoughts…"
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                />
                                <div className="flex justify-end">
                                    <button
                                        onClick={handleAddComment}
                                        disabled={!commentText.trim() || addCommentMutation.isPending}
                                        className="btn-primary disabled:opacity-50"
                                    >
                                        {addCommentMutation.isPending ? 'Posting…' : 'Post Comment'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
                            <p className="text-slate-500 mb-3">Sign in to join the conversation</p>
                            <Link to="/adminlogin" className="btn-primary">Sign In</Link>
                        </div>
                    )}
                </section>

                {/* Back link */}
                <div className="mt-12 pt-8 border-t border-slate-100">
                    <Link to="/" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
                        ← Back to stories
                    </Link>
                </div>
            </article>
        </Layout>
    );
}

export default BlogInfo;
