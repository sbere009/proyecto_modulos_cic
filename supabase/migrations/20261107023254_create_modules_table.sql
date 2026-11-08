/*
# Create modules table and link exam_results to it

## Overview
Adds a `modules` table so the teacher can manage multiple educational modules
(name, teacher, description) from the admin panel — instead of hardcoding a
single module and teacher name. Each exam result is linked to a module via a
new `module_id` foreign key (the existing `module` text column is kept for
backward compatibility with any rows already saved).

This remains a single-tenant app (no Supabase Auth). The teacher area is gated
by a client-side PIN; students "log in" by entering their credencial, which is
looked up in the `students` table. All data is shared within the platform, so
policies allow anon + authenticated CRUD.

## 1. New Tables

### modules
- `id` (uuid, primary key)
- `slug` (text, not null, unique) — URL-friendly identifier, e.g. "mantenimiento-preventivo"
- `name` (text, not null) — display name of the module
- `teacher` (text, not null) — name of the professor assigned to the module
- `description` (text, nullable) — short description shown on the module detail screen
- `is_active` (boolean, default true) — inactive modules are hidden from students
- `created_at` (timestamptz, default now())

## 2. Modified Tables

### exam_results
- Added `module_id` (uuid, nullable, foreign key → modules.id ON DELETE SET NULL).
  Kept nullable so existing rows (if any) don't break. New exam submissions
  will populate it. The original `module` text column is preserved.

## 3. Seed Data
- Inserts the "Mantenimiento Preventivo y Correctivo" module with the original
  teacher name so the app works identically out of the box. Uses an explicit
  fixed UUID so exam_results can reference it deterministically on rebuild.

## 4. Security
- RLS enabled on `modules`.
- CRUD granted to `anon` + `authenticated` (single-tenant, shared data).
- Policies allow all CRUD for anon + authenticated (intentionally public/shared).
- `exam_results` already has RLS + policies from the previous migration; no
  policy changes needed since `module_id` is just a new column on an already-
  open table. The existing table-level grants already cover all columns.

## 5. Indexes
- Unique index on `modules.slug`.
- Index on `exam_results.module_id` for fast per-module grade lookups.
*/

CREATE TABLE IF NOT EXISTS modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  teacher text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE modules ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON modules TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_modules" ON modules;
CREATE POLICY "anon_select_modules" ON modules FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_modules" ON modules;
CREATE POLICY "anon_insert_modules" ON modules FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_modules" ON modules;
CREATE POLICY "anon_update_modules" ON modules FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_modules" ON modules;
CREATE POLICY "anon_delete_modules" ON modules FOR DELETE
  TO anon, authenticated USING (true);

-- Add module_id column to exam_results (nullable, preserves existing rows)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'exam_results' AND column_name = 'module_id'
  ) THEN
    ALTER TABLE exam_results ADD COLUMN module_id uuid REFERENCES modules(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_exam_results_module_id ON exam_results(module_id);

-- Seed the default module with a fixed UUID (deterministic across rebuilds)
INSERT INTO modules (id, slug, name, teacher, description, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'mantenimiento-preventivo',
  'Mantenimiento Preventivo y Correctivo',
  'Ing. Claudia Elena Vega López',
  'Módulo sobre mantenimiento físico y lógico de equipo de cómputo, herramientas y precauciones.',
  true
)
ON CONFLICT (slug) DO NOTHING;
