# Supabase Setup

Bright Harbor Careers uses Supabase for durable job, application, account request, note, scorecard, and role data.

1. Create a Supabase project.
2. Run `supabase/migrations/20260729160000_bright_harbor_careers.sql` in the SQL editor or through the Supabase CLI.
3. Enable email magic links in Supabase Auth.
4. Insert a matching row in `public.profiles` for each HR user with one of these roles: `recruiter`, `hiring_manager`, or `admin`.
5. Add the public anon key and URL to Netlify as `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
6. Add the private service role key to Netlify as `SUPABASE_SERVICE_ROLE_KEY`. Use it only in Netlify environment variables, never in browser code.
7. Add `RESEND_API_KEY`, `EMAIL_FROM`, `HR_APPROVAL_EMAIL`, and `SITE_URL` in Netlify so account request emails can be sent to HR.

The migration creates applicant profiles automatically for new Supabase Auth users. The public career site can read `published` jobs and submit fresh applications. Hiring-team visitors can request access, which creates an `account_requests` row and emails `hr@brightharbor.org` approval links through Netlify functions. HR users can request a magic link from the Hiring Team login page; row-level security decides whether that signed-in user can create jobs, update applications, or manage profiles.

Example HR profile:

```sql
insert into public.profiles (id, full_name, email, role, title, department)
values (
  '00000000-0000-0000-0000-000000000000',
  'Maya Rivera',
  'maya@brightharbor.example',
  'hiring_manager',
  'Director of Talent',
  'People Operations'
);
```
