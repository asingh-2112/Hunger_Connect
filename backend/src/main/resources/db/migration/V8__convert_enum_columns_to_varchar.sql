-- Migrate PostgreSQL native ENUM columns to VARCHAR to fix Hibernate 6 type binding
-- Native PG enums require explicit casting in Hibernate 6; VARCHAR works with @Enumerated(EnumType.STRING)

-- users.role: user_role -> VARCHAR
ALTER TABLE users
    ALTER COLUMN role TYPE VARCHAR(50) USING role::text;

-- users.donor_type: donor_type -> VARCHAR
ALTER TABLE users
    ALTER COLUMN donor_type TYPE VARCHAR(50) USING donor_type::text;

-- donations.veg_non_veg: veg_type -> VARCHAR
ALTER TABLE donations
    ALTER COLUMN veg_non_veg TYPE VARCHAR(50) USING veg_non_veg::text;

-- donations.status: donation_status -> VARCHAR
ALTER TABLE donations
    ALTER COLUMN status TYPE VARCHAR(50) USING status::text;

-- Drop the now-unused custom ENUM types (safe since columns no longer reference them)
DROP TYPE IF EXISTS user_role;
DROP TYPE IF EXISTS donor_type;
DROP TYPE IF EXISTS veg_type;
DROP TYPE IF EXISTS donation_status;
