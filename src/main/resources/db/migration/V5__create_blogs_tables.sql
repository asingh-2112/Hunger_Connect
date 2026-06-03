CREATE TABLE blogs (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id   UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    caption     TEXT        NOT NULL,
    image_url   TEXT,
    likes_count INT         NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE blog_likes (
    blog_id     UUID    NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
    user_id     UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (blog_id, user_id)
);

CREATE TABLE blog_comments (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    blog_id     UUID        NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
    user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    text        TEXT        NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_blogs_author       ON blogs(author_id);
CREATE INDEX idx_blogs_created_at   ON blogs(created_at DESC);
CREATE INDEX idx_blog_comments_blog ON blog_comments(blog_id);
