import React, { useEffect } from 'react';
import Layout from '../../../components/layout/Layout';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { blogApi } from '../../../api/blog';
import { useAuth } from '../../../hooks/useAuth';
import { toast } from 'react-hot-toast';
import moment from 'moment';

function Dashboard() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user, logout } = useAuth();

    const { data: blogsPage, isLoading } = useQuery({
        queryKey: ['blogs', 'my'],
        queryFn: () => blogApi.getMy({ page: 0, size: 50 }),
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => blogApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['blogs'] });
            toast.success('Blog deleted');
        },
        onError: () => toast.error('Failed to delete blog'),
    });

    const handleLogout = async () => {
        await logout();
        toast.success('Logged out');
        navigate('/');
    };

    useEffect(() => { window.scrollTo(0, 0); }, []);

    const blogs = blogsPage?.content || [];

    return (
        <Layout>
            <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto space-y-8">

                    {/* Admin profile card */}
                    <div className="card p-6">
                        <div className="flex flex-col sm:flex-row items-center gap-5">
                            <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-2xl flex-shrink-0 overflow-hidden">
                                {user?.profileImageUrl
                                    ? <img src={user.profileImageUrl} alt={user.name} className="w-full h-full object-cover" />
                                    : user?.name?.charAt(0)?.toUpperCase() || 'A'
                                }
                            </div>
                            <div className="flex-1 text-center sm:text-left">
                                <h1 className="text-xl font-bold text-slate-900">{user?.name || 'Admin'}</h1>
                                <p className="text-sm text-brand-600 font-medium">Administrator</p>
                                <p className="text-sm text-slate-500">{user?.email}</p>
                            </div>
                            <div className="flex gap-2">
                                <Link to="/createblog" className="btn-secondary text-sm">
                                    + New Blog
                                </Link>
                                <button onClick={handleLogout} className="btn-ghost text-red-500 hover:bg-red-50">
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Blogs table */}
                    <div className="card overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100">
                            <h2 className="font-bold text-slate-900">All Blogs ({blogs.length})</h2>
                        </div>

                        {isLoading ? (
                            <div className="p-8 flex justify-center">
                                <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
                            </div>
                        ) : blogs.length === 0 ? (
                            <div className="p-10 text-center text-slate-400 text-sm">No blogs yet.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-slate-50 text-left">
                                            <th className="px-6 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">#</th>
                                            <th className="px-6 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Thumbnail</th>
                                            <th className="px-6 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Title</th>
                                            <th className="px-6 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Date</th>
                                            <th className="px-6 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {blogs.map((blog, i) => (
                                            <tr key={blog.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-3 text-slate-500">{i + 1}</td>
                                                <td className="px-6 py-3">
                                                    {blog.imageUrl && (
                                                        <img src={blog.imageUrl} alt="thumb" className="w-12 h-9 rounded object-cover" />
                                                    )}
                                                </td>
                                                <td className="px-6 py-3 text-slate-800 font-medium max-w-xs">
                                                    <Link to={`/bloginfo/${blog.id}`} className="hover:text-brand-600 transition-colors line-clamp-2">
                                                        {blog.caption}
                                                    </Link>
                                                </td>
                                                <td className="px-6 py-3 text-slate-400 whitespace-nowrap">
                                                    {moment(blog.createdAt).format('MMM D, YYYY')}
                                                </td>
                                                <td className="px-6 py-3">
                                                    <button
                                                        onClick={() => deleteMutation.mutate(blog.id)}
                                                        disabled={deleteMutation.isPending}
                                                        className="btn-danger text-xs py-1.5 px-3 disabled:opacity-60"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default Dashboard;
