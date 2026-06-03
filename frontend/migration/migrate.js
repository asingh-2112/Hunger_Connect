/**
 * Hunger Connect — One-Time Firestore → PostgreSQL Migration
 *
 * Usage:
 *   cp .env.example .env && edit .env
 *   npm install
 *   node migrate.js          # Run migration
 *   DRY_RUN=true node migrate.js  # Preview only
 *
 * What this script does:
 *   1. Reads all users, donations, blogs, comments from Firestore
 *   2. Maps to the new PostgreSQL schema
 *   3. Inserts rows via SQL (skipping duplicates on re-run)
 *   4. Generates a report of migrated counts
 *
 * IMPORTANT: Firebase password hashes are not exportable.
 * All migrated users MUST reset their password on first login.
 * This script inserts a placeholder password hash that will force them to use
 * the "Forgot Password" flow.
 */

import 'dotenv/config';
import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import pg from 'pg';
import { v4 as uuidv4 } from 'crypto';

const DRY_RUN = process.env.DRY_RUN === 'true';

// ─── Firebase Init ─────────────────────────────────────────────────────────
const serviceAccount = JSON.parse(readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT, 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const firestore = admin.firestore();

// ─── PostgreSQL Init ───────────────────────────────────────────────────────
const pool = new pg.Pool({
  host: process.env.PG_HOST || 'localhost',
  port: parseInt(process.env.PG_PORT || '5432'),
  database: process.env.PG_DATABASE || 'hunger_connect',
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || 'postgres',
});

// Maps old Firebase UID → new PostgreSQL UUID
const userIdMap = new Map();

async function run() {
  console.log(`\n🚀 Hunger Connect Migration — DRY_RUN=${DRY_RUN}\n`);
  const counts = { users: 0, donations: 0, blogs: 0, comments: 0, skipped: 0 };

  const client = await pool.connect();
  try {
    // ─────────────────────────────────────────────────────────────────
    // 1. Migrate Users
    // ─────────────────────────────────────────────────────────────────
    console.log('📋 Migrating users...');
    const usersSnap = await firestore.collection('users').get();
    for (const userDoc of usersSnap.docs) {
      const d = userDoc.data();
      const firebaseUid = userDoc.id;

      // Map old role names to new enum values
      const roleMap = { provider: 'PROVIDER', distributor: 'DISTRIBUTOR', admin: 'ADMIN' };
      const role = roleMap[d.role] || 'PROVIDER';

      const donorTypeMap = {
        Individual: 'INDIVIDUAL',
        Restaurant: 'RESTAURANT',
        Hotel: 'HOTEL',
        Catering: 'CATERING',
        Other: 'OTHER',
      };
      const donorType = d.donorType ? (donorTypeMap[d.donorType] || 'OTHER') : null;

      const newId = uuidv4();
      userIdMap.set(firebaseUid, newId);

      if (DRY_RUN) {
        console.log(`  [DRY] user: ${d.email} → ${newId} (${role})`);
        counts.users++;
        continue;
      }

      try {
        await client.query(
          `INSERT INTO users (id, email, password_hash, name, role, donor_type, organization_name,
            organization_type, phone, address_line1, city, state, pincode, active, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5::user_role, $6::donor_type, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
           ON CONFLICT (email) DO NOTHING`,
          [
            newId,
            d.email || `migrated-${firebaseUid}@placeholder.invalid`,
            // Unusable bcrypt hash — forces password reset flow
            '$2a$10$MIGRATION_PLACEHOLDER_HASH_FORCE_RESET_xxxxxxxxxxxxxxxxxx',
            d.name || d.organizationName || 'Migrated User',
            role,
            donorType,
            d.organizationName || null,
            d.organizationType || null,
            d.phone || null,
            `${d.street || ''} ${d.locality || ''}`.trim() || null,
            d.city || null,
            d.state || null,
            d.pinCode || null,
            d.active !== false,
          ]
        );
        counts.users++;
      } catch (err) {
        console.warn(`  ⚠️  User ${d.email} skipped: ${err.message}`);
        counts.skipped++;
      }
    }
    console.log(`  ✅ Users: ${counts.users}`);

    // ─────────────────────────────────────────────────────────────────
    // 2. Migrate Donations
    // ─────────────────────────────────────────────────────────────────
    console.log('📦 Migrating donations...');
    const donationsSnap = await firestore.collection('donations').get();
    const donationIdMap = new Map();

    for (const donDoc of donationsSnap.docs) {
      const d = donDoc.data();
      const donorPgId = userIdMap.get(d.donorId);
      if (!donorPgId) {
        console.warn(`  ⚠️  Donation ${donDoc.id} has no mapped donor; skipping`);
        counts.skipped++;
        continue;
      }

      const vegMap = { Veg: 'VEG', 'Non-Veg': 'NON_VEG', Both: 'BOTH' };
      const vegNonVeg = vegMap[d.vegNonVeg] || 'VEG';

      const statusMap = {
        Pending: 'PENDING', Accepted: 'ACCEPTED', Rejected: 'REJECTED', Completed: 'COMPLETED',
      };
      const status = statusMap[d.status] || 'PENDING';

      const newId = uuidv4();
      donationIdMap.set(donDoc.id, newId);

      if (DRY_RUN) {
        console.log(`  [DRY] donation: ${donDoc.id} → ${newId} (${status})`);
        counts.donations++;
        continue;
      }

      try {
        const pickupDate = d.date ? new Date(d.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        await client.query(
          `INSERT INTO donations (id, donor_id, food_types, veg_non_veg, quantity, address_line1,
            city, state, pincode, pickup_date, pickup_time, message, status, created_at, updated_at)
           VALUES ($1, $2, $3, $4::veg_type, $5, $6, $7, $8, $9, $10, $11, $12, $13::donation_status, NOW(), NOW())
           ON CONFLICT (id) DO NOTHING`,
          [
            newId,
            donorPgId,
            Array.isArray(d.foodType) ? d.foodType : [d.foodType || 'Mixed'],
            vegNonVeg,
            d.quantity || '1',
            `${d.street || ''} ${d.locality || ''}`.trim() || 'N/A',
            d.city || 'N/A',
            d.state || 'N/A',
            d.pincode || '000000',
            pickupDate,
            d.time || '12:00',
            d.message || null,
            status,
          ]
        );
        counts.donations++;

        // Migrate acceptance record if donation was accepted
        if (status === 'ACCEPTED' && d.ngoDetails?.ngoId) {
          const ngoPgId = userIdMap.get(d.ngoDetails.ngoId);
          if (ngoPgId) {
            await client.query(
              `INSERT INTO donation_acceptances (id, donation_id, ngo_id, accepted_at)
               VALUES ($1, $2, $3, NOW())
               ON CONFLICT (donation_id) DO NOTHING`,
              [uuidv4(), newId, ngoPgId]
            );
          }
        }
      } catch (err) {
        console.warn(`  ⚠️  Donation ${donDoc.id} skipped: ${err.message}`);
        counts.skipped++;
      }
    }
    console.log(`  ✅ Donations: ${counts.donations}`);

    // ─────────────────────────────────────────────────────────────────
    // 3. Migrate Blogs
    // ─────────────────────────────────────────────────────────────────
    console.log('📝 Migrating blogs...');
    const blogsSnap = await firestore.collection('blogs').get();
    const blogIdMap = new Map();

    for (const blogDoc of blogsSnap.docs) {
      const d = blogDoc.data();
      const authorPgId = userIdMap.get(d.createdBy);
      if (!authorPgId) {
        console.warn(`  ⚠️  Blog ${blogDoc.id} has no mapped author; skipping`);
        counts.skipped++;
        continue;
      }

      const newId = uuidv4();
      blogIdMap.set(blogDoc.id, newId);

      if (DRY_RUN) {
        console.log(`  [DRY] blog: ${blogDoc.id} → ${newId}`);
        counts.blogs++;
        continue;
      }

      try {
        const createdAt = d.createdAt?._seconds
          ? new Date(d.createdAt._seconds * 1000).toISOString()
          : new Date().toISOString();

        await client.query(
          `INSERT INTO blogs (id, author_id, caption, image_url, likes_count, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $6)
           ON CONFLICT (id) DO NOTHING`,
          [newId, authorPgId, d.caption || '', d.imageUrl || null, d.likes || 0, createdAt]
        );
        counts.blogs++;

        // Migrate blog comments
        if (Array.isArray(d.comments)) {
          for (const comment of d.comments) {
            const commentUserPgId = userIdMap.get(comment.userId);
            if (!commentUserPgId) continue;
            try {
              await client.query(
                `INSERT INTO blog_comments (id, blog_id, user_id, text, created_at)
                 VALUES ($1, $2, $3, $4, $5)
                 ON CONFLICT (id) DO NOTHING`,
                [uuidv4(), newId, commentUserPgId, comment.text || '', new Date(comment.timestamp || Date.now()).toISOString()]
              );
              counts.comments++;
            } catch { /* skip invalid comments */ }
          }
        }

        // Migrate blog likes
        if (Array.isArray(d.likedBy)) {
          for (const likerUid of d.likedBy) {
            const likerPgId = userIdMap.get(likerUid);
            if (!likerPgId) continue;
            try {
              await client.query(
                `INSERT INTO blog_likes (blog_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
                [newId, likerPgId]
              );
            } catch { /* skip */ }
          }
        }
      } catch (err) {
        console.warn(`  ⚠️  Blog ${blogDoc.id} skipped: ${err.message}`);
        counts.skipped++;
      }
    }
    console.log(`  ✅ Blogs: ${counts.blogs}, Comments: ${counts.comments}`);

    // ─────────────────────────────────────────────────────────────────
    // 4. Summary
    // ─────────────────────────────────────────────────────────────────
    console.log('\n📊 Migration Summary:');
    console.log(`  Users:     ${counts.users}`);
    console.log(`  Donations: ${counts.donations}`);
    console.log(`  Blogs:     ${counts.blogs}`);
    console.log(`  Comments:  ${counts.comments}`);
    console.log(`  Skipped:   ${counts.skipped}`);
    console.log(DRY_RUN ? '\n⚠️  DRY RUN — no data was written\n' : '\n✅ Migration complete!\n');

    if (!DRY_RUN) {
      console.log('⚠️  IMPORTANT: All migrated users must reset their password.');
      console.log('   Their Firebase passwords cannot be imported.');
      console.log('   Configure your app to show "Reset Password" prompt on first login.\n');
    }
  } finally {
    client.release();
    await pool.end();
    admin.app().delete();
  }
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
