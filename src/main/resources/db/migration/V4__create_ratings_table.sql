CREATE TABLE ratings (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    donation_id UUID        NOT NULL REFERENCES donations(id) ON DELETE CASCADE,
    rated_by    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rated_for   UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating      SMALLINT    NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment     TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (donation_id, rated_by)
);

CREATE INDEX idx_ratings_rated_for ON ratings(rated_for);
CREATE INDEX idx_ratings_donation  ON ratings(donation_id);
