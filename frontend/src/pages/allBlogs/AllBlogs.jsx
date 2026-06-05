import React, { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { blogApi } from '../../api/blog';
import { useAuth } from '../../hooks/useAuth';
import moment from 'moment';

function AllBlogs() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user } = useAuth();

    const [deleteId, setDeleteId] = useState(null);

    useEffect(() => { window.scrollTo(0, 0); }, []);

    const { data: blogsPage, isLoading } = useQuery({
        queryKey: ['blogs', 'my'],
        queryFn: () => blogApi.getMy({ page: 0, size: 50 }),
    });

    const blogs = blogsPage?.content || [];

    const deleteMutation = useMutation({
        mutationFn: (id) => blogApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['blogs'] });
            toast.success('Blog deleted');
            setDeleteId(null);
        },
        onError: () => toast.error('Failed to delete blog'),
    });

    return (
        <Layout>
            <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">

                    {/* Page header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="section-title mb-1">My Posts</h1>
                            <p className="text-sm text-slate-500">
                                {blogs.length} {blogs.length === 1 ? 'story' : 'stories'} published
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/createblog')}
                            className="btn-primary"
                        >
                            + New Post
                        </button>
                    </div>

                    {isLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="card p-4 flex gap-4 animate-pulse">
                                    <div className="w-28 h-20 bg-slate-200 rounded-lg flex-shrink-0" />
                                    <div className="flex-1 space-y-3">
                                        <div className="h-4 bg-slate-200 rounded w-3/4" />
                                        <div className="h-3 bg-slate-200 rounded w-1/3" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : blogs.length === 0 ? (
                        <div className="text-center py-24">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                            <h2 className="text-lg font-semibold text-slate-900 mb-2">No stories yet</h2>
                            <p className="text-slate-500 mb-6 text-sm max-w-xs mx-auto">
                                Share your first story with the HungerConnect community.
                            </p>
                            <button onClick={() => navigate('/createblog')} className="btn-primary">
                                Create Your First Post
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {blogs.map((blog) => (
                                <div
                                    key={blog.id}
                                    className="card p-4 flex gap-4 hover:shadow-md transition-shadow"
                                >
                                    {/* Thumbnail */}
                                    <div
                                        className="w-28 h-20 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 cursor-pointer"
                                        onClick={() => navigate(`/bloginfo/${blog.id}`)}
                                    >
                                        {blog.imageUrl ? (
                                            <img
                                                src={blog.imageUrl}
                                                alt={blog.caption}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <Link
                                            to={`/bloginfo/${blog.id}`}
                                            className="text-sm font-semibold text-slate-900 hover:text-brand-600 transition-colors line-clamp-2 leading-snug"
                                        >
                                            {blog.caption}
                                        </Link>
                                        <p className="text-xs text-slate-400 mt-1">
                                            {moment(blog.createdAt).format('MMM D, YYYY')}
                                        </p>
                                        {/* Stats */}
                                        <div className="flex items-center gap-4 mt-2">
                                            <span className="flex items-center gap-1 text-xs text-slate-500">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                </svg>
                                                {blog.likesCount || 0}
                                            </span>
                                            <span className="flex items-center gap-1 text-xs text-slate-500">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                </svg>
                                                {blog.commentsCount || 0}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Delete button */}
                                    <button
                                        onClick={() => setDeleteId(blog.id)}
                                        className="flex-shrink-0 p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors self-start"
                                        aria-label="Delete post"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Delete confirmation modal */}
            {deleteId && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="card p-6 w-full max-w-sm shadow-xl">
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Post?</h3>
                        <p className="text-sm text-slate-500 mb-6">This action cannot be undone.</p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setDeleteId(null)}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => deleteMutation.mutate(deleteId)}
                                disabled={deleteMutation.isPending}
                                className="btn-danger disabled:opacity-60"
                            >
                                {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}

export default AllBlogs;
