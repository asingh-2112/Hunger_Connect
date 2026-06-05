import React, { useContext, useEffect, useState } from 'react';
import myContext from '../../context/data/myContext';
import { useParams } from 'react-router';
import Layout from '../../components/layout/Layout';
import Loader from '../../components/loader/Loader';
import Comment from '../../components/comment/Comment';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { blogApi } from '../../api/blog';
import { useAuth } from '../../hooks/useAuth';
import { Favorite, FavoriteBorder } from '@mui/icons-material';

function BlogInfo() {
    const context = useContext(myContext);
    const { mode } = context;
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
            toast.success('Comment added successfully');
            setCommentText('');
            refetchComments();
        },
        onError: () => toast.error('Failed to add comment. Please log in first.'),
    });

    const handleAddComment = () => {
        if (!commentText.trim()) return toast.error('Please write a comment');
        addCommentMutation.mutate(commentText.trim());
    };

    useEffect(() => { window.scrollTo(0, 0); }, []);

    return (
        <Layout>
            <section className="rounded-lg h-full overflow-hidden max-w-4xl mx-auto px-4">
                <div className="py-4 lg:py-8">
                    {isLoading ? (
                        <Loader />
                    ) : blog ? (
                        <div>
                            {blog.imageUrl && (
                                <img
                                    alt="blog cover"
                                    className="mb-3 rounded-lg h-full w-full object-cover"
                                    src={blog.imageUrl}
                                />
                            )}

                            <div className="flex justify-between items-center mb-3">
                                <h1
                                    style={{ color: mode === 'dark' ? 'white' : 'black' }}
                                    className="text-xl md:text-2xl lg:text-2xl font-semibold"
                                >
                                    {blog.caption}
                                </h1>
                                <p style={{ color: mode === 'dark' ? 'white' : 'black' }}>
                                    {new Date(blog.createdAt).toLocaleDateString('en-US', {
                                        month: 'short', day: '2-digit', year: 'numeric'
                                    })}
                                </p>
                            </div>

                            <div className={`border-b mb-5 ${mode === 'dark' ? 'border-gray-600' : 'border-gray-400'}`} />

                            <div className="flex items-center gap-3 mb-5">
                                <button
                                    onClick={() => isAuthenticated ? likeMutation.mutate() : toast.error('Please log in to like')}
                                    className="flex items-center gap-1 text-sm"
                                    style={{ color: mode === 'dark' ? 'white' : 'black' }}
                                >
                                    {blog.likedByMe
                                        ? <Favorite className="text-red-500" />
                                        : <FavoriteBorder className="text-gray-400" />
                                    }
                                    <span>{blog.likesCount || 0}</span>
                                </button>
                                <span style={{ color: mode === 'dark' ? 'gray' : 'gray' }} className="text-sm">
                                    By {blog.authorName || 'Anonymous'}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <p className="text-center text-gray-500">Blog not found.</p>
                    )}

                    <Comment
                        addComment={handleAddComment}
                        commentText={commentText}
                        setcommentText={setCommentText}
                        allComment={comments}
                        isLoading={addCommentMutation.isPending}
                        mode={mode}
                    />
                </div>
            </section>
        </Layout>
    );
}

export default BlogInfo;
