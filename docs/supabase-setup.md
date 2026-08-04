# Supabase Setup

Bright Harbor Careers uses Supabase for durable job, application, account request, department, job content, job board layout, workflow and pipeline configuration, onboarding, communication, profile, note, scorecard, and role data.

1. Create a Supabase project.
2. Run every SQL file in `supabase/migrations/` in filename order in the SQL editor or through the Supabase CLI.
3. Enable the Email provider with email-and-password sign-in in Supabase Auth.
4. Insert a matching row in `public.profiles` for each HR user with one of these roles: `recruiter`, `hiring_manager`, or `admin`.
5. Add the public anon key and URL to Netlify as `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
6. Add the private service role key to Netlify as `SUPABASE_SERVICE_ROLE_KEY`. Use it only in Netlify environment variables, never in browser code.
7. Add `RESEND_API_KEY`, `EMAIL_FROM`, `HR_APPROVAL_EMAIL`, and `SITE_URL` in Netlify so account request emails can be sent to HR.

The migrations create applicant profiles automatically for new Supabase Auth users, add optional profile avatar URLs, add sectioned job content fields, add communication automation tables, add onboarding records and document storage, add workflow department access, and add settings records for the editable applicant-board header and department filters. The public career site can read `published` jobs and active departments, then submit fresh applications. Hiring-team visitors can request access, which creates an `account_requests` row and emails `hr@brightharbor.org` approval links through Netlify functions. HR users sign in from the Hiring Team login page with their work email as the username and their Supabase password; row-level security decides whether that signed-in user can create jobs, update applications, manage profiles, edit the job board layout, configure workflows, manage onboarding, or manage departments.

Example HR profile:

```sql
insert into public.profiles (id, full_name, email, role, title, department, avatar_url)
values (
  '00000000-0000-0000-0000-000000000000',
  'Maya Rivera',
  'maya@brightharbor.example',
  'hiring_manager',
  'Director of Talent',
  'People Operations',
  null
);
```
