import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import Layout from "../../components/layout/Layout";
import { FiUpload, FiX, FiArrowLeft } from "react-icons/fi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { blogApi } from "../../api/blog";
import { fileApi } from "../../api/file";

function CreateBlog() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [caption, setCaption] = useState("");
  const [image, setImage] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const publishMutation = useMutation({
    mutationFn: (blogData) => blogApi.create(blogData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      toast.success("Blog published successfully!");
      navigate("/");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to publish blog.");
    },
  });

  const handleImageChange = (e) => {
    if (e.target.files[0]) setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!caption.trim()) return toast.error("Please write a caption");

    let imageUrl = null;

    if (image) {
      setIsUploading(true);
      try {
        const result = await fileApi.upload(image, "blogs");
        imageUrl = result.url;
      } catch {
        toast.error("Image upload failed");
        setIsUploading(false);
        return;
      } finally {
        setIsUploading(false);
      }
    }

    publishMutation.mutate({ caption, imageUrl });
  };

  const isLoading = isUploading || publishMutation.isPending;

  return (
    <Layout>
      <div className="min-h-screen py-8 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center mb-8">
            <button
              onClick={() => navigate("/")}
              className="flex items-center space-x-2 text-gray-700 hover:text-blue-500 transition-colors"
            >
              <FiArrowLeft className="text-xl" />
              <span className="font-medium">Back to Home</span>
            </button>
          </div>

          <div className="rounded-xl shadow-lg overflow-hidden bg-white">
            <div className="p-6 border-b border-gray-200">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                Create New Post
              </h1>
              <p className="mt-1 text-gray-600">Share your story with the community</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-8">
                <label className="block text-sm font-medium mb-3 text-gray-700">
                  Featured Image (optional, max 5MB)
                </label>

                {!image ? (
                  <div className="relative border-2 border-dashed rounded-xl p-6 text-center border-gray-300 hover:border-blue-400 transition-all">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <FiUpload className="text-3xl text-gray-400" />
                      <p className="text-sm text-gray-500">Click to select an image</p>
                      <span className="text-xs text-gray-400">JPEG, PNG, WebP (max 5MB)</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                ) : (
                  <div className="relative group">
                    <img
                      src={URL.createObjectURL(image)}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded-lg shadow-md"
                    />
                    <button
                      type="button"
                      onClick={() => setImage(null)}
                      className="absolute top-3 right-3 bg-black bg-opacity-70 text-white p-2 rounded-full hover:bg-opacity-100 transition-all"
                    >
                      <FiX className="text-lg" />
                    </button>
                    {isUploading && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gray-200 h-1.5">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full transition-all" style={{ width: "50%" }} />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="mb-8">
                <label className="block text-sm font-medium mb-3 text-gray-700">Your Story</label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Share your thoughts, experiences, or news with the community..."
                  className="w-full border border-gray-300 focus:border-blue-400 rounded-lg p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                  rows={8}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => navigate("/")} disabled={isLoading} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-60">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !caption.trim()}
                  className="px-5 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-60"
                >
                  {isLoading ? "Publishing..." : "Publish Now"}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-8 p-6 rounded-xl bg-blue-50 border border-blue-100">
            <h3 className="text-lg font-semibold mb-3 text-blue-800">Posting Tips</h3>
            <ul className="space-y-2 text-sm text-blue-700">
              <li>• Use high-quality images that represent your content</li>
              <li>• Tell a story — people engage more with personal experiences</li>
              <li>• Keep it authentic and relevant to your cause</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default CreateBlog;
