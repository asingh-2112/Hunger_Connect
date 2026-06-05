import React, { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import Layout from "../../components/layout/Layout";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { blogApi } from "../../api/blog";
import { fileApi } from "../../api/file";

const WORD_LIMIT = 2000;

function wordCount(text) {
    return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
}

function CreateBlog() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const fileInputRef = useRef(null);

    const [caption, setCaption] = useState("");
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const words = wordCount(caption);
    const readTime = Math.max(1, Math.round(words / 200));

    const publishMutation = useMutation({
        mutationFn: (blogData) => blogApi.create(blogData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["blogs"] });
            toast.success("Story published!");
            navigate("/");
        },
        onError: (err) => toast.error(err.response?.data?.message || "Failed to publish."),
    });

    const setImageFile = (file) => {
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image must be under 5MB");
            return;
        }
        setImage(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleFileChange = (e) => setImageFile(e.target.files[0]);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file?.type.startsWith("image/")) setImageFile(file);
    }, []);

    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = () => setIsDragging(false);

    const removeImage = () => {
        setImage(null);
        if (imagePreview) URL.revokeObjectURL(imagePreview);
        setImagePreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!caption.trim()) return toast.error("Please write your story");

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
            <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
                <div className="max-w-2xl mx-auto">

                    {/* Back */}
                    <button
                        onClick={() => navigate(-1)}
                        className="btn-ghost mb-8 -ml-2 text-slate-500"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back
                    </button>

                    <form onSubmit={handleSubmit}>
                        <div className="card overflow-hidden">
                            <div className="px-8 py-6 border-b border-slate-100">
                                <h1 className="text-2xl font-bold text-slate-900">Write a Story</h1>
                                <p className="text-sm text-slate-500 mt-1">Share your experience with the HungerConnect community</p>
                            </div>

                            <div className="px-8 py-6 space-y-8">

                                {/* Image upload */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Cover Image <span className="text-slate-400 font-normal">(optional, max 5MB)</span>
                                    </label>

                                    {!imagePreview ? (
                                        <div
                                            className={`relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
                                                isDragging
                                                    ? "border-brand-400 bg-brand-50"
                                                    : "border-slate-200 hover:border-brand-300 hover:bg-slate-50"
                                            }`}
                                            onDrop={handleDrop}
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-700">
                                                        Drag & drop or <span className="text-brand-600">browse</span>
                                                    </p>
                                                    <p className="text-xs text-slate-400 mt-0.5">JPEG, PNG, WebP</p>
                                                </div>
                                            </div>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />
                                        </div>
                                    ) : (
                                        <div className="relative group rounded-xl overflow-hidden">
                                            <img
                                                src={imagePreview}
                                                alt="Cover preview"
                                                className="w-full h-64 object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                                                <button
                                                    type="button"
                                                    onClick={removeImage}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-slate-700 rounded-full px-4 py-2 text-sm font-medium shadow-lg hover:bg-red-50 hover:text-red-500"
                                                >
                                                    Remove image
                                                </button>
                                            </div>
                                            {isUploading && (
                                                <div className="absolute bottom-0 inset-x-0 h-1 bg-slate-200">
                                                    <div className="h-full bg-brand-500 animate-pulse w-1/2" />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Story textarea */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-medium text-slate-700">
                                            Your Story
                                        </label>
                                        <span className={`text-xs ${words > WORD_LIMIT ? "text-red-500 font-medium" : "text-slate-400"}`}>
                                            {words} / {WORD_LIMIT} words · ~{readTime} min read
                                        </span>
                                    </div>
                                    <textarea
                                        value={caption}
                                        onChange={(e) => setCaption(e.target.value)}
                                        placeholder="Share your food donation experience, a community success story, or insights about hunger in your area…"
                                        className="w-full border border-slate-300 rounded-xl p-4 text-slate-800 placeholder-slate-400 font-serif text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 resize-none transition"
                                        rows={14}
                                    />
                                    {words > WORD_LIMIT && (
                                        <p className="text-xs text-red-500 mt-1">Please shorten your story to under {WORD_LIMIT} words.</p>
                                    )}
                                </div>
                            </div>

                            {/* Footer actions */}
                            <div className="px-8 py-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                                <div className="text-xs text-slate-400">
                                    {words === 0 ? "Start writing…" : `${words} word${words !== 1 ? "s" : ""}`}
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => navigate(-1)}
                                        disabled={isLoading}
                                        className="btn-secondary disabled:opacity-60"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading || !caption.trim() || words > WORD_LIMIT}
                                        className="btn-primary disabled:opacity-60"
                                    >
                                        {isLoading ? (
                                            <span className="flex items-center gap-2">
                                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                </svg>
                                                Publishing…
                                            </span>
                                        ) : "Publish Story"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>

                    {/* Tips */}
                    <div className="mt-6 p-5 rounded-xl bg-brand-50 border border-brand-100">
                        <h3 className="text-sm font-semibold text-brand-800 mb-2">Tips for a great story</h3>
                        <ul className="space-y-1 text-xs text-brand-700 list-disc list-inside">
                            <li>Use a compelling cover image that represents your story</li>
                            <li>Share personal experiences — authentic stories resonate most</li>
                            <li>Describe the impact: how many meals, who was helped, what changed</li>
                        </ul>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default CreateBlog;
