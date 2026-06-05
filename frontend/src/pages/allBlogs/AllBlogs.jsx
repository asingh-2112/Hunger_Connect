import React, { useContext, useEffect, useState } from 'react';
import myContext from '../../context/data/myContext';
import Layout from '../../components/layout/Layout';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FiTrash2, FiPlus, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { Favorite, ChatBubbleOutline } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { blogApi } from '../../api/blog';
import { useAuth } from '../../hooks/useAuth';

function AllBlogs() {
    const context = useContext(myContext);
    const { mode } = context;
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user } = useAuth();

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [blogToDelete, setBlogToDelete] = useState(null);

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
            toast.success('Blog deleted successfully');
            setDeleteDialogOpen(false);
            setBlogToDelete(null);
        },
        onError: () => toast.error('Failed to delete blog'),
    });

    const handleDeleteClick = (blogId) => {
        setBlogToDelete(blogId);
        setDeleteDialogOpen(true);
    };

    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } },
    };
    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    };

    return (
        <Layout>
            <div className={`min-h-screen py-8 px-4 sm:px-6 lg:px-8 ${mode === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <motion.h1
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent"
                        >
                            Your Blog Posts
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className={`text-lg ${mode === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
                        >
                            Manage and edit your published stories
                        </motion.p>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/createblog')}
                        className={`fixed bottom-8 right-8 z-50 p-4 rounded-full shadow-lg ${
                            mode === 'dark'
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600'
                                : 'bg-gradient-to-r from-blue-500 to-purple-500'
                        } text-white`}
                    >
                        <FiPlus className="text-2xl" />
                    </motion.button>

                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"
                            />
                        </div>
                    ) : (
                        <AnimatePresence>
                            {blogs.length > 0 ? (
                                <motion.div
                                    variants={container}
                                    initial="hidden"
                                    animate="show"
                                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                                >
                                    {blogs.map((blog) => (
                                        <motion.div
                                            key={blog.id}
                                            variants={item}
                                            className={`rounded-2xl overflow-hidden ${
                                                mode === 'dark' ? 'bg-gray-800' : 'bg-white'
                                            } shadow-lg hover:shadow-xl transition-all duration-300`}
                                            whileHover={{ y: -5 }}
                                        >
                                            <div className="relative aspect-video overflow-hidden">
                                                {blog.imageUrl && (
                                                    <img
                                                        onClick={() => navigate(`/bloginfo/${blog.id}`)}
                                                        src={blog.imageUrl}
                                                        alt={blog.caption}
                                                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105 cursor-pointer"
                                                    />
                                                )}
                                                <div className="absolute top-3 right-3 flex space-x-2">
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteClick(blog.id); }}
                                                        className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-gray-100 transition-colors"
                                                    >
                                                        <FiTrash2 className="text-red-500" />
                                                    </motion.button>
                                                </div>
                                            </div>

                                            <div className="p-5">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <h3 className={`text-sm font-medium ${mode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                                            {new Date(blog.createdAt).toLocaleDateString('en-US', {
                                                                month: 'short', day: '2-digit', year: 'numeric'
                                                            })}
                                                        </h3>
                                                        <h2
                                                            onClick={() => navigate(`/bloginfo/${blog.id}`)}
                                                            className={`text-xl font-bold mt-1 cursor-pointer ${
                                                                mode === 'dark' ? 'text-white' : 'text-gray-800'
                                                            } line-clamp-2`}
                                                        >
                                                            {blog.caption}
                                                        </h2>
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                                                    <div className="flex items-center space-x-1">
                                                        <Favorite className={`h-5 w-5 ${blog.likedByMe ? 'text-red-500' : 'text-gray-400'}`} />
                                                        <span className={`text-sm ${mode === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                                            {blog.likesCount || 0}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <ChatBubbleOutline className="h-5 w-5 text-gray-400" />
                                                        <span className={`text-sm ${mode === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                                            {blog.commentsCount || 0}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                    className="text-center py-16"
                                >
                                    <div className="mx-auto w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h2 className={`text-2xl font-bold mb-2 ${mode === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                                        No blogs yet
                                    </h2>
                                    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                                        You haven't published any blogs yet. Share your first story with the community!
                                    </p>
                                    <motion.button
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => navigate('/createblog')}
                                        className={`px-6 py-3 rounded-lg font-medium ${
                                            mode === 'dark'
                                                ? 'bg-gradient-to-r from-blue-600 to-purple-600'
                                                : 'bg-gradient-to-r from-blue-500 to-purple-500'
                                        } text-white shadow-md`}
                                    >
                                        Create Your First Blog
                                    </motion.button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    )}

                    <AnimatePresence>
                        {deleteDialogOpen && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                            >
                                <motion.div
                                    initial={{ scale: 0.9, y: 20 }}
                                    animate={{ scale: 1, y: 0 }}
                                    exit={{ scale: 0.9, y: 20 }}
                                    className={`rounded-2xl p-6 w-full max-w-md ${mode === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-xl`}
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className={`text-xl font-bold ${mode === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                                            Confirm Deletion
                                        </h3>
                                        <button
                                            onClick={() => setDeleteDialogOpen(false)}
                                            className={`p-1 rounded-full ${mode === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                                        >
                                            <FiX className={`text-lg ${mode === 'dark' ? 'text-gray-300' : 'text-gray-500'}`} />
                                        </button>
                                    </div>
                                    <p className={`mb-6 ${mode === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                        Are you sure you want to delete this blog? This action cannot be undone.
                                    </p>
                                    <div className="flex justify-end space-x-3">
                                        <button
                                            onClick={() => setDeleteDialogOpen(false)}
                                            className={`px-4 py-2 rounded-lg font-medium ${
                                                mode === 'dark'
                                                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                                                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                                            }`}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => deleteMutation.mutate(blogToDelete)}
                                            disabled={deleteMutation.isPending}
                                            className={`px-4 py-2 rounded-lg font-medium text-white disabled:opacity-60 ${
                                                mode === 'dark' ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'
                                            }`}
                                        >
                                            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                                        </button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </Layout>
    );
}

export default AllBlogs;
