/*
# Prevent duplicate exam attempts per student and module

## Overview
Makes every exam a one-time attempt. Once a student has a result for a
module, the database rejects another result for that same student and module.
This protects the rule even if the page is refreshed or a request is sent
outside the visible interface.

## 1. Modified Tables

### exam_results
- No columns are removed or changed.
- A unique partial index is added for `(student_id, module_id)` when `module_id`
  is present. Existing results are preserved.

## 2. Security and integrity
- The unique index is the server-side enforcement for one attempt per module.
- Existing row-level security and grants remain unchanged.
- The migration was checked for duplicate student/module attempts before
  applying; none were present.

## 3. Important notes
- Results with a null `module_id` are excluded because they are legacy records
  from before modules were linked.
- Existing results are not deleted or modified.
*/

CREATE UNIQUE INDEX IF NOT EXISTS uq_exam_results_one_attempt_per_module
ON exam_results(student_id, module_id)
WHERE module_id IS NOT NULL;
