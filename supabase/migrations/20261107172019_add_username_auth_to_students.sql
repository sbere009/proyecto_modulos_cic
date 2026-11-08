/*
# Add username and auth_user_id to students table

## Overview
Adds `username` and `auth_user_id` columns to the `students` table so each
student can log in with a personal username and password (managed via Supabase
Auth). This replaces the credencial-only lookup with proper authentication.

The teacher (admin) creates student accounts from the dashboard: a Supabase
Auth user is created with a synthetic email (username@alumno.cic.edu) and a
password chosen by the teacher. The student's `auth_user_id` links the auth
account to their roster row.

## 1. Modified Tables

### students
- Added `username` (text, nullable, unique) — the student's login name.
  Nullable so existing rows don't break; new students always get one.
- Added `auth_user_id` (uuid, nullable, unique) — foreign key to
  auth.users(id) ON DELETE SET NULL. Links the auth account to the roster row.

## 2. Security
- No RLS policy changes needed — students table already has full anon +
  authenticated CRUD policies from the original migration. The new columns
  are covered by the existing table-level grants.
- Added a unique index on `username` to prevent duplicate login names.
- Added a unique index on `auth_user_id` (partial, excluding nulls) to
  prevent accidental double-linking.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'students' AND column_name = 'username'
  ) THEN
    ALTER TABLE students ADD COLUMN username text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'students' AND column_name = 'auth_user_id'
  ) THEN
    ALTER TABLE students ADD COLUMN auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_students_username ON students(username) WHERE username IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_students_auth_user_id ON students(auth_user_id) WHERE auth_user_id IS NOT NULL;
