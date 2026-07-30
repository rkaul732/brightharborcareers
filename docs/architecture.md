# Architecture

## Surfaces

Applicant portal:

- Reads published jobs.
- Filters by department, location, work type, and search text.
- Submits applications to Supabase when configured.
- Falls back to demo/session data when Supabase is not configured.

HR workspace:

- Shows recruiter, hiring manager, and admin role views.
- Creates jobs and publishes selected roles in the local UI.
- Displays application pipeline stages.
- Moves candidates through `new`, `screening`, `interview`, and `offer`.
- Shows admin-oriented role controls.

## Production Path

GitHub stores source and runs the validation workflow.

Netlify builds the static app with `npm run build` and publishes `dist/`.

Supabase stores the ATS records and enforces access through row-level security.

## Data Model

Core tables:

- `profiles`: Supabase Auth users plus role metadata.
- `jobs`: requisitions and published career-site roles.
- `applications`: candidate submissions and pipeline status.
- `application_notes`: internal HR notes.
- `scorecards`: structured hiring feedback.
- `activity_events`: audit-ready activity log.

The schema keeps applicant-facing reads public only for `published` jobs. Application insertion is allowed for published jobs. HR reads and writes rely on Supabase Auth plus the role in `profiles`.
