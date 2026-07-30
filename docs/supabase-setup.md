# Supabase Setup

Bright Harbor Careers uses Supabase for durable job, application, note, scorecard, and role data.

1. Create a Supabase project.
2. Run `supabase/migrations/20260729160000_bright_harbor_careers.sql` in the SQL editor or through the Supabase CLI.
3. Enable email magic links in Supabase Auth.
4. Insert a matching row in `public.profiles` for each HR user with one of these roles: `recruiter`, `hiring_manager`, or `admin`.
5. Add the public anon key and URL to Netlify as `SUPABASE_URL` and `SUPABASE_ANON_KEY`.

The migration creates applicant profiles automatically for new Supabase Auth users. The public career site can read `published` jobs and submit fresh applications. HR users can request a magic link from the HR workspace; row-level security decides whether that signed-in user can create jobs, update applications, or manage profiles.

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
