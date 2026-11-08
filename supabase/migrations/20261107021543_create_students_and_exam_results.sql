/*
# Create students and exam_results tables

## Overview
Creates the data model for the CIC Zimapán evaluation platform:
- `students` — the official roster of enrolled students (managed by teachers).
- `exam_results` — a record of each exam attempt (score, answers, date).

This is a single-tenant application with no user sign-in. The teacher area is
gated by a client-side PIN (not Supabase Auth). All data is intentionally shared
across users of the platform, so read/write access is granted to both the
`anon` and `authenticated` roles.

## 1. New Tables

### students
- `id` (uuid, primary key)
- `name` (text, not null) — full student name
- `credencial` (text, not null, unique) — matrícula / credential number
- `shift` (text, not null) — turno (Matutino/Vespertino Sábado/Domingo)
- `created_at` (timestamptz, default now())

### exam_results
- `id` (uuid, primary key)
- `student_id` (uuid, foreign key → students.id, on delete cascade)
- `module` (text, not null) — exam module name
- `score` (integer, not null) — final score (0–100)
- `answers` (jsonb, not null default '{}') — the student's submitted answers
- `taken_at` (timestamptz, default now())

## 2. Security
- RLS enabled on both tables.
- CRUD granted to `anon` + `authenticated` (single-tenant, shared data).
- Policies allow all CRUD for anon + authenticated because the data is
  intentionally public/shared within the platform (no per-user isolation).

## 3. Indexes
- Unique index on `students.credencial` to prevent duplicate matrículas.
- Index on `exam_results.student_id` for fast lookup of a student's history.
*/

CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  credencial text NOT NULL UNIQUE,
  shift text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON students TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_students" ON students;
CREATE POLICY "anon_select_students" ON students FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_students" ON students;
CREATE POLICY "anon_insert_students" ON students FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_students" ON students;
CREATE POLICY "anon_update_students" ON students FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_students" ON students;
CREATE POLICY "anon_delete_students" ON students FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS exam_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  module text NOT NULL,
  score integer NOT NULL,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  taken_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON exam_results TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_exam_results" ON exam_results;
CREATE POLICY "anon_select_exam_results" ON exam_results FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_exam_results" ON exam_results;
CREATE POLICY "anon_insert_exam_results" ON exam_results FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_exam_results" ON exam_results;
CREATE POLICY "anon_update_exam_results" ON exam_results FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_exam_results" ON exam_results;
CREATE POLICY "anon_delete_exam_results" ON exam_results FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_exam_results_student_id ON exam_results(student_id);
