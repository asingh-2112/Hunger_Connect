import React from 'react';

function Comment({ addComment, commentText, setcommentText, allComment, isLoading, mode = 'light' }) {
    const bg = mode === 'dark' ? '#353b48' : 'rgb(226, 232, 240)';
    const textColor = mode === 'dark' ? 'white' : 'black';

    return (
        <section className="py-8 lg:py-16">
            <div className="max-w-2xl mx-auto px-4">
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-lg lg:text-2xl font-bold" style={{ color: textColor }}>
                        Comments
                    </h2>
                </div>

                <form className="mb-6" onSubmit={(e) => { e.preventDefault(); addComment(); }}>
                    <div className="py-2 px-4 mb-4 rounded-lg shadow-[inset_0_0_4px_rgba(0,0,0,0.6)] border border-gray-200" style={{ background: bg }}>
                        <textarea
                            value={commentText}
                            onChange={(e) => setcommentText(e.target.value)}
                            rows={4}
                            className="px-0 w-full text-sm border-0 focus:ring-0 focus:outline-none dark:text-white dark:placeholder-gray-400 resize-none"
                            style={{ background: bg, color: textColor }}
                            placeholder="Write a comment..."
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            background: mode === 'dark' ? 'rgb(226, 232, 240)' : 'rgb(30, 41, 59)',
                            color: mode === 'dark' ? 'rgb(30, 41, 59)' : 'rgb(226, 232, 240)',
                        }}
                        className="px-8 py-2 rounded-lg font-medium disabled:opacity-60"
                    >
                        {isLoading ? 'Posting...' : 'Post comment'}
                    </button>
                </form>

                <div className="space-y-4">
                    {allComment.map((item) => (
                        <article
                            key={item.id}
                            className="p-4 rounded-lg"
                            style={{ background: bg }}
                        >
                            <footer className="flex items-center gap-2 mb-2">
                                <p className="font-semibold text-sm" style={{ color: textColor }}>
                                    {item.authorName || item.fullName || 'Anonymous'}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {item.createdAt
                                        ? new Date(item.createdAt).toLocaleDateString('en-US', {
                                            month: 'short', day: '2-digit', year: 'numeric'
                                        })
                                        : item.date || ''}
                                </p>
                            </footer>
                            <p className="text-sm" style={{ color: textColor }}>
                                {item.text || item.commentText}
                            </p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default Comment;
