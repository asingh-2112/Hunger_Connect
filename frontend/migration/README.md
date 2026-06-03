# Firestore → PostgreSQL Migration

One-time data migration from Firebase Firestore to the new PostgreSQL backend.

## Prerequisites

1. Export your Firebase service account key: Firebase Console → Project Settings → Service Accounts → Generate new private key → Save as `serviceAccountKey.json`
2. Ensure the Spring Boot backend is running with Flyway migrations applied
3. Have access to the PostgreSQL database

## Setup

```bash
cd migration
cp .env.example .env
# Edit .env with your database credentials and service account path
npm install
```

## Dry Run (Preview)

```bash
npm run migrate:dry
```

## Run Migration

```bash
npm run migrate
```

## What gets migrated

| Firestore Collection | PostgreSQL Table        |
|----------------------|-------------------------|
| `users`              | `users`                 |
| `donations`          | `donations` + `donation_acceptances` |
| `blogs`              | `blogs` + `blog_likes`  |
| `blogs[].comments`   | `blog_comments`         |

## Important Notes

- **Password Reset Required**: Firebase password hashes are not exportable. All migrated users will need to use the "Forgot Password" flow to set a new password.
- The script is idempotent — it skips existing records on re-run (`ON CONFLICT DO NOTHING`).
- Firebase Storage files (blog images) are NOT migrated automatically. Existing CDN URLs in `imageUrl` fields will continue to work as long as Firebase Storage is accessible.
