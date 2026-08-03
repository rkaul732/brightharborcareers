# Architecture

## Surfaces

Applicant portal:

- Reads published jobs.
- Presents an editable image header with overlay text.
- Shows department boxes with live counts above search.
- Lists jobs alphabetically below search and filters.
- Filters by department, location, employment status, and search text.
- Opens the full job description before showing the application form.
- Submits applications to Supabase when configured.
- Falls back to demo/session data when Supabase is not configured.

New employee onboarding:

- Shows hired candidates in the onboarding experience.
- Displays application demographics, role details, and required document categories.
- Scans uploaded onboarding packets for expected forms such as I-9, W-4, direct deposit, identification, licenses, and background authorization.
- Gives HR a document review path for viewing, saving, and printing uploaded files.

HR workspace:

- Uses a top header menu for Home, Jobs, Candidates, Reports, and Onboarding.
- Shows a searchable Jobs list by default with job creation behind a Create new job action.
- Shows a focused job draft editor with categorization, salary range, content sections, and SEO keywords.
- Shows each job with pipeline-stage counts.
- Lists all candidates alphabetically in the Candidates view.
- Displays application pipeline stages in Reports.
- Moves candidates through `new`, `screening`, `interview`, `offer`, and `hired`.
- Lets HR assign hired candidates into an organizational hierarchy.
- Lets admins edit the public job board header image and overlay text.
- Lets admins create agency departments and subdepartments from Settings.
- Lets admins configure pipeline labels, workflows, and communications from Settings.
- Opens Settings and Edit my profile from the profile dropdown.

## Production Path

GitHub stores source and runs the validation workflow.

Netlify builds the static app with `npm run build` and publishes `dist/`.

Supabase stores the ATS records and enforces access through row-level security.

## Data Model

Core tables:

- `profiles`: Supabase Auth users plus role metadata.
- `profiles.avatar_url`: optional profile photo URL for the HR header avatar.
- `jobs`: requisitions and published career-site roles.
- `jobs` content fields: salary min/max, job description, requirements, benefits, and SEO metadata.
- `applications`: candidate submissions and pipeline status.
- `application_notes`: internal HR notes.
- `scorecards`: structured hiring feedback.
- `activity_events`: audit-ready activity log.
- `job_board_settings`: public applicant-board header image and overlay content.
- `departments`: agency department and subdepartment hierarchy.
- `pipeline_settings`: admin-managed labels for hiring pipeline stages.
- `workflows`: reusable hiring workflows that jobs can select.
- `communication_templates`, `automation_rules`, `communication_events`, and `sender_accounts`: reusable candidate communications and audit-ready email history.
- `onboarding_records`: employee setup details for hired candidates.
- `onboarding_documents`: uploaded onboarding packet metadata and scan results.
- Supabase Storage bucket `onboarding-documents`: private uploaded onboarding files for HR review.

The schema keeps applicant-facing reads public only for `published` jobs. Application insertion is allowed for published jobs. HR reads and writes rely on Supabase Auth plus the role in `profiles`.
