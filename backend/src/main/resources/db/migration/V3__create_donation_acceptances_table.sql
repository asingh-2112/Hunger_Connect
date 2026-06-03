CREATE TABLE donation_acceptances (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    donation_id UUID        NOT NULL REFERENCES donations(id) ON DELETE CASCADE,
    ngo_id      UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    accepted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (donation_id)
);

CREATE INDEX idx_acceptances_ngo_id      ON donation_acceptances(ngo_id);
CREATE INDEX idx_acceptances_donation_id ON donation_acceptances(donation_id);
