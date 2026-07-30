# Bright Harbor Careers

Bright Harbor Careers is a dual-sided applicant tracking system for applicants and HR teams.

- Applicants can browse published jobs, filter roles, view job details, and submit applications.
- Recruiters can create jobs, publish roles, and move candidates through the pipeline.
- Hiring managers can review candidates and advance interview-stage applicants.
- Admins can see role controls and are intended to manage users, permissions, and governance.
- Supabase stores jobs, applications, notes, scorecards, activity, and role profiles.
- Netlify hosts the site, and GitHub stores the source plus validation workflow.

## What You Need

Before going live, create accounts or projects for:

- GitHub
- Netlify
- Supabase

You can preview the app locally without Supabase. In that mode, it uses built-in demo jobs and demo applicants.

## Project Structure

```text
public/
  index.html          App shell
  styles.css          Responsive interface styling
  app.js              Applicant portal, HR workspace, Supabase REST/Auth hooks
  env.js              Empty local placeholder
scripts/
  build.mjs           Creates Netlify-ready dist/ output
  dev-server.mjs      Runs local static preview
  validate.mjs        Checks required ATS files and core features
supabase/
  migrations/         Database schema and row-level security policies
docs/
  architecture.md     Product and data model overview
  supabase-setup.md   Supabase setup notes
netlify.toml          Netlify build, redirects, and headers
```

## 1. Run The App Locally

Open Terminal and first move into the project folder:

```bash
cd "/Users/rebeccakaul/Documents/Bright Harbor Careers"
```

Then start the app:

```bash
npm run dev
```

If Terminal shows this prompt before you run `npm run dev`, you are in the right place:

```text
rebeccakaul@Rebeccas-MacBook-Air Bright Harbor Careers %
```

If Terminal shows `~ %`, you are still in your home folder. Run the `cd` command above first.

Open the printed URL, usually:

```text
http://localhost:5173
```

Without Supabase credentials, the app runs in demo mode. You can still browse jobs, submit a local demo application, switch HR roles, create local demo jobs, and move candidates through the pipeline.

## 2. Validate And Build Locally

Run these before pushing or deploying:

```bash
npm run validate
npm run build
```

The production build is written to:

```text
dist/
```

Netlify publishes that `dist/` folder.

## 3. Create The Supabase Database

1. Open Supabase and create a new project.
2. Go to the SQL editor.
3. Open this migration file:

```text
supabase/migrations/20260729160000_bright_harbor_careers.sql
```

4. Paste the full SQL into Supabase and run it.

This creates:

- `profiles`
- `jobs`
- `applications`
- `application_notes`
- `scorecards`
- `activity_events`
- HR role types for `recruiter`, `hiring_manager`, and `admin`
- row-level security policies

Important: use the Supabase `anon` key in this app, not the `service_role` key. The `service_role` key must stay private and should never be exposed in browser code or Netlify public builds.

## 4. Enable HR Sign-In

Bright Harbor Careers uses Supabase email magic links for HR sessions.

In Supabase:

1. Go to Authentication.
2. Make sure email sign-in is enabled.
3. Add your local and production URLs to the allowed redirect URLs.

For local development, add:

```text
http://localhost:5173
```

After Netlify is deployed, also add your Netlify URL, for example:

```text
https://bright-harbor-careers.netlify.app
```

## 5. Create Your First HR User

1. Open the HR workspace in the app.
2. Enter your HR email in the Supabase sign-in box.
3. Click the magic link in your email.
4. In Supabase, find that user in Authentication.
5. Copy the user ID.
6. Run this SQL with your real user ID and email:

```sql
update public.profiles
set
  full_name = 'Your Name',
  email = 'you@example.com',
  role = 'admin',
  title = 'HR Admin',
  department = 'People Operations'
where id = 'YOUR-SUPABASE-AUTH-USER-ID';
```

Use one of these roles:

```text
recruiter
hiring_manager
admin
```

After that, sign in again from the HR workspace. Admin and recruiter users can create jobs and publish roles. Hiring managers can review candidates.

## 6. Run Locally With Supabase

Use your Supabase project URL and anon key.

```bash
SUPABASE_URL="https://your-project-ref.supabase.co" \
SUPABASE_ANON_KEY="your-public-anon-key" \
npm run dev
```

Then open:

```text
http://localhost:5173
```

The applicant side will read published jobs from Supabase. The HR side can write to Supabase after an HR user signs in and has the right role in `public.profiles`.

## 7. Push To GitHub

If this folder is not already a Git repository:

```bash
git init -b main
git add .
git commit -m "Initial Bright Harbor Careers ATS"
```

Create a new GitHub repository named something like:

```text
bright-harbor-careers
```

Then connect and push:

```bash
git remote add origin https://github.com/YOUR-USER/bright-harbor-careers.git
git push -u origin main
```

The included GitHub workflow runs validation and the Netlify build on pushes and pull requests to `main`.

## 8. Deploy With Netlify

In Netlify:

1. Create a new site from Git.
2. Select the GitHub repository.
3. Use these build settings:

```text
Build command: npm run build
Publish directory: dist
Node version: 20
```

4. Add these environment variables:

```text
SUPABASE_URL
SUPABASE_ANON_KEY
```

5. Deploy the site.
6. Copy the Netlify URL.
7. Add that URL to Supabase Auth redirect URLs.

After deployment, applicants can use the public careers site and HR users can sign in through the HR workspace.

## 9. Add Your First Live Job

Once your HR user is an `admin` or `recruiter`:

1. Open the Netlify site.
2. Go to HR workspace.
3. Send yourself a Supabase sign-in link.
4. Sign in.
5. Create a job.
6. Set the job status to `Published`, or select a draft job and publish it.
7. Return to Applicant portal and confirm the job appears.

## Troubleshooting

If the applicant portal only shows demo jobs:

- Confirm `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set in Netlify.
- Confirm at least one job has `status = 'published'`.
- Redeploy Netlify after changing environment variables.

If HR job creation does not save:

- Confirm the HR user is signed in.
- Confirm the user has a `public.profiles` row.
- Confirm `public.profiles.role` is `recruiter` or `admin`.
- Confirm the Supabase migration ran successfully.

If the magic link opens but HR actions still fail:

- Confirm your Netlify URL is listed in Supabase Auth redirect URLs.
- Confirm you used the Supabase anon key, not the service role key.
- Sign out, request a fresh magic link, and sign in again.

## Useful Commands

```bash
npm run dev       # local preview
npm run validate  # check required app pieces
npm run build     # create dist/ for Netlify
```
