# Architecture

## Surfaces

Applicant portal:

- Reads published jobs.
- Presents an editable image header with overlay text.
- Lists jobs alphabetically below search and filters.
- Filters by department, location, employment status, and search text.
- Opens the full job description before showing the application form.
- Submits applications to Supabase when configured.
- Falls back to demo/session data when Supabase is not configured.

HR workspace:

- Shows recruiter, hiring manager, and admin role views.
- Creates jobs and publishes selected roles in the local UI.
- Displays application pipeline stages.
- Moves candidates through `new`, `screening`, `interview`, and `offer`.
- Lets admins edit the public job board header image and overlay text.
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
- `job_board_settings`: public applicant-board header image and overlay content.

The schema keeps applicant-facing reads public only for `published` jobs. Application insertion is allowed for published jobs. HR reads and writes rely on Supabase Auth plus the role in `profiles`.
