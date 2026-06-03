import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Avatar, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton } from '@mui/material';
import { Favorite, FavoriteBorder, ChatBubbleOutline, Close } from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { blogApi } from '../../api/blog';
import { useAuth } from '../../hooks/useAuth';
import moment from 'moment';

function BlogFeed() {
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();

  const [selectedBlogId, setSelectedBlogId] = useState(null);
  const [openComments, setOpenComments] = useState(false);
  const [commentText, setCommentText] = useState('');

  const { data: blogsPage, isLoading } = useQuery({
    queryKey: ['blogs'],
    queryFn: () => blogApi.getAll({ page: 0, size: 30 }),
  });

  const { data: commentsPage } = useQuery({
    queryKey: ['blogComments', selectedBlogId],
    queryFn: () => blogApi.getComments(selectedBlogId, { page: 0, size: 50 }),
    enabled: !!selectedBlogId && openComments,
  });

  const likeMutation = useMutation({
    mutationFn: (blogId) => blogApi.toggleLike(blogId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
    },
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
      <div className="py-16 text-center text-gray-500">Loading stories...</div>
    );
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Community Stories
        </h1>
        <p className="text-md text-gray-600 max-w-2xl mx-auto">
          Discover inspiring stories from our community
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {blogs.map((blog) => (
          <div
            key={blog.id}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100"
          >
            <div className="p-3 flex items-center gap-2 bg-blue-50">
              <Avatar
                src={blog.authorProfileImageUrl}
                className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-500"
              >
                {blog.authorName?.charAt(0) || 'U'}
              </Avatar>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{blog.authorName}</h3>
                <p className="text-xs text-gray-500">{moment(blog.createdAt).fromNow()}</p>
              </div>
            </div>

            {blog.imageUrl && (
              <div className="relative h-48 w-full overflow-hidden">
                <img
                  src={blog.imageUrl}
                  alt={blog.caption}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
            )}

            <div className="p-3 bg-blue-50">
              <p className="text-sm text-purple-800 mb-2 line-clamp-3">{blog.caption}</p>
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => handleLike(blog.id)}
                  className={`flex items-center gap-1 ${blog.likedByCurrentUser ? 'text-red-500' : 'text-gray-500 hover:text-red-500'} transition-colors`}
                >
                  {blog.likedByCurrentUser ? <Favorite /> : <FavoriteBorder />}
                  <span>{blog.likesCount || 0}</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedBlogId(blog.id);
                    setOpenComments(true);
                  }}
                  className="flex items-center gap-1 text-gray-500 hover:text-blue-500 transition-colors"
                >
                  <ChatBubbleOutline />
                  <span>Comments</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {blogs.length === 0 && (
        <div className="text-center py-16">
          <h3 className="text-xl font-medium text-gray-700 mb-2">No stories yet</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Be the first to share your food sharing experience with the community
          </p>
        </div>
      )}

      <Dialog
        open={openComments}
        onClose={() => setOpenComments(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ className: "rounded-2xl" }}
      >
        <DialogTitle className="flex justify-between items-center border-b border-gray-200">
          <h3 className="text-lg font-semibold">Comments</h3>
          <IconButton onClick={() => setOpenComments(false)}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers className="p-0">
          <div className="max-h-[400px] overflow-y-auto">
            {(commentsPage?.content || []).length > 0 ? (
              <div className="divide-y divide-gray-200">
                {commentsPage.content.map((comment) => (
                  <div key={comment.id} className="p-4">
                    <div className="flex gap-3">
                      <Avatar src={comment.userProfileImageUrl} className="h-10 w-10">
                        {comment.userName?.charAt(0) || 'U'}
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{comment.userName}</span>
                          <span className="text-xs text-gray-500">{moment(comment.createdAt).fromNow()}</span>
                        </div>
                        <p className="text-gray-700 mt-1">{comment.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-gray-500">
                <p>No comments yet. Be the first to comment!</p>
              </div>
            )}
          </div>
        </DialogContent>

        <DialogActions className="p-4 border-t border-gray-200">
          <div className="flex w-full gap-2">
            <Avatar className="h-10 w-10">
              {user?.name?.charAt(0) || 'U'}
            </Avatar>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
            />
            <Button
              variant="contained"
              onClick={handleAddComment}
              disabled={!commentText.trim() || commentMutation.isPending}
            >
              Post
            </Button>
          </div>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default BlogFeed;
