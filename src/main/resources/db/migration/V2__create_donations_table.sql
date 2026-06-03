CREATE TYPE donation_status AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED');
CREATE TYPE veg_type AS ENUM ('VEG', 'NON_VEG', 'BOTH');

CREATE TABLE donations (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_id        UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    food_types      TEXT[]          NOT NULL DEFAULT '{}',
    veg_non_veg     veg_type        NOT NULL,
    quantity        VARCHAR(255)    NOT NULL,
    address_line1   VARCHAR(255)    NOT NULL,
    address_line2   VARCHAR(255),
    city            VARCHAR(100)    NOT NULL,
    state           VARCHAR(100)    NOT NULL,
    pincode         VARCHAR(10)     NOT NULL,
    pickup_date     DATE            NOT NULL,
    pickup_time     VARCHAR(50)     NOT NULL,
    message         TEXT,
    status          donation_status NOT NULL DEFAULT 'PENDING',
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_donations_donor_id ON donations(donor_id);
CREATE INDEX idx_donations_status   ON donations(status);
CREATE INDEX idx_donations_city     ON donations(city);
