# Bright Harbor Careers

Bright Harbor Careers is a dual-sided applicant tracking system for applicants and HR teams.

- Applicants can browse an image-led job board, filter roles, view full job descriptions, and submit applications.
- Visitors first choose between Applicant and Hiring Team.
- Recruiters can create jobs, publish roles, and move candidates through the pipeline.
- Hiring managers can review candidates and advance interview-stage applicants.
- Admins can edit the public job board header, manage agency departments and subdepartments, and configure pipeline labels.
- HR users navigate Jobs, Candidates, and Reports from the top header, with Settings and profile editing in the profile menu.
- Hiring-team users without accounts can request access for HR approval.
- Supabase stores jobs, applications, notes, scorecards, activity, and role profiles.
- Netlify hosts the site, and GitHub stores the source.

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
  assets/             Brand and job board images
scripts/
  build.mjs           Creates Netlify-ready dist/ output
  dev-server.mjs      Runs local static preview
  load-env.mjs        Loads local .env values
  validate.mjs        Checks required ATS files and core features
supabase/
  migrations/         Database schema and row-level security policies
docs/
  architecture.md     Product and data model overview
  supabase-setup.md   Supabase setup notes
netlify.toml          Netlify build, redirects, and headers
netlify/functions/    Account request and approval endpoints
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

Without Supabase credentials, the app runs in demo mode. You can still browse jobs, submit a local demo application, create local demo jobs, view candidates, review reports, and move candidates through the pipeline.

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
3. Open each migration file in `supabase/migrations/` in filename order:

```text
supabase/migrations/20260729160000_bright_harbor_careers.sql
supabase/migrations/20260730170000_job_board_settings.sql
supabase/migrations/20260730183000_departments.sql
supabase/migrations/20260730190000_profile_avatar.sql
supabase/migrations/20260730200000_pipeline_settings.sql
```

4. Paste and run each file in Supabase before moving to the next one.

This creates:

- `profiles`
- `jobs`
- `applications`
- `application_notes`
- `scorecards`
- `activity_events`
- `account_requests`
- `job_board_settings`
- `departments`
- `pipeline_settings`
- profile avatar URLs
- HR role types for `recruiter`, `hiring_manager`, and `admin`
- row-level security policies

Important: use the Supabase `anon` key in this app, not the `service_role` key. The `service_role` key must stay private and should never be exposed in browser code or Netlify public builds.

## 4. Add Supabase Environment Variables

There are two places to add Supabase environment variables:

- Locally, add them to a `.env` file in this project folder.
- In production, add them to Netlify environment variables.

For local setup, create this file:

```text
/Users/rebeccakaul/Documents/Bright Harbor Careers/.env
```

Put this inside it, using your real Supabase values:

```text
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-public-anon-key
```

You can find these in Supabase under Project Settings, then API:

- `SUPABASE_URL` is the Project URL.
- `SUPABASE_ANON_KEY` is the public anon key.

Do not use the `service_role` key in this app.

To test hiring-team account requests locally, also add the server-only values:

```text
SUPABASE_SERVICE_ROLE_KEY=your-private-service-role-key
RESEND_API_KEY=your-resend-api-key
EMAIL_FROM=Bright Harbor Careers <no-reply@yourdomain.com>
HR_APPROVAL_EMAIL=hr@brightharbor.org
SITE_URL=http://localhost:5173
```

Important:

- `SUPABASE_ANON_KEY` is safe for the browser.
- `SUPABASE_SERVICE_ROLE_KEY` is private and must only be used in Netlify functions or local `.env`.
- `RESEND_API_KEY` is used by the account-request function to email HR.

After adding or changing `.env`, stop the local preview and start it again:

```bash
npm run dev
```

## 5. Enable HR Sign-In And Account Requests

Bright Harbor Careers uses Supabase username-and-password sign-in for HR sessions. The username is the approved user's work email address.

In Supabase:

1. Go to Authentication.
2. Make sure the Email provider is enabled.
3. Make sure email-and-password sign-in is allowed.
4. Add your local and production URLs to the allowed redirect URLs so Supabase invites and password recovery links return to the correct site.

For local development, add:

```text
http://localhost:5173
```

After Netlify is deployed, also add your Netlify URL, for example:

```text
https://bright-harbor-careers.netlify.app
```

Hiring-team account requests are emailed to:

```text
hr@brightharbor.org
```

The email contains two links:

- Approve request
- Deny request

Approving a request marks it approved in Supabase and attempts to send the requester a Supabase invite so they can set a password.

## 6. Create Your First HR User

1. In Supabase, go to Authentication, then Users.
2. Add your first HR user with their work email.
3. Set a password, or send an invite so the user can set one.
4. Open that user in Supabase Authentication.
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

After that, sign in from the Hiring Team login screen with the work email as the username and the password for that Supabase user. Admin and recruiter users can create jobs and publish roles. Hiring managers can review candidates.

## 7. Run Locally With Supabase

If you already created `.env`, start the app normally:

```bash
npm run dev
```

You can also pass values directly in Terminal instead of using `.env`:

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

## 8. Push To GitHub

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

Run `npm run validate` and `npm run build` locally before pushing changes.

## 9. Deploy With Netlify

In Netlify:

1. Create a new site from Git.
2. Select the GitHub repository.
3. Use these build settings:

```text
Build command: npm run build
Publish directory: dist
Node version: 20
```

4. Add these environment variables in Netlify under Site configuration, then Environment variables:

```text
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
RESEND_API_KEY
EMAIL_FROM
HR_APPROVAL_EMAIL
SITE_URL
```

Use `hr@brightharbor.org` for `HR_APPROVAL_EMAIL`. Use your deployed Netlify URL for `SITE_URL`.

5. Deploy the site.
6. Copy the Netlify URL.
7. Add that URL to Supabase Auth redirect URLs.

After deployment, applicants can use the public careers site and HR users can sign in through the HR workspace.

## 10. Add Your First Live Job

Once your HR user is an `admin` or `recruiter`:

1. Open the Netlify site.
2. Go to HR workspace.
3. Sign in with your username and password.
4. Create a job.
5. Set the job status to `Published`, or select a draft job and publish it.
6. Return to Applicant portal and confirm the job appears.

## Troubleshooting

If the applicant portal only shows demo jobs:

- Confirm `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set in Netlify.
- For local preview, confirm they are set in `/Users/rebeccakaul/Documents/Bright Harbor Careers/.env`.
- Confirm at least one job has `status = 'published'`.
- Restart `npm run dev` after changing local `.env`.
- Redeploy Netlify after changing Netlify environment variables.

If the browser says it cannot connect to `localhost:5173`:

- Make sure Terminal is in the project folder:

```bash
cd "/Users/rebeccakaul/Documents/Bright Harbor Careers"
```

- Start the preview again:

```bash
npm run dev
```

- Keep that Terminal window open while you use the preview.
- Open or refresh `http://localhost:5173`.

If HR job creation does not save:

- Confirm the HR user is signed in.
- Confirm the user has a `public.profiles` row.
- Confirm `public.profiles.role` is `recruiter` or `admin`.
- Confirm the Supabase migration ran successfully.

If HR sign-in works but HR actions still fail:

- Confirm your Netlify URL is listed in Supabase Auth redirect URLs.
- Confirm you used the Supabase anon key, not the service role key.
- Sign out, then sign in again with the approved user's username and password.

If a Supabase invite or account-request email does not arrive:

- Confirm the email address was typed correctly.
- Check spam, junk, promotions, and quarantine folders.
- If the message says `Missing server environment variables: SUPABASE_SERVICE_ROLE_KEY`, add `SUPABASE_SERVICE_ROLE_KEY` in Netlify under Site configuration, then Environment variables. For local preview, add it to `/Users/rebeccakaul/Documents/Bright Harbor Careers/.env`.
- Find `SUPABASE_SERVICE_ROLE_KEY` in Supabase under Project Settings, then API. Use the private service role key only for Netlify functions or local `.env`; never put it in `public/env.js` or browser code.
- In Supabase, go to Authentication, then Logs, and look for the email attempt.
- In Supabase, go to Authentication, then URL Configuration, and add `http://localhost:5173` and your Netlify URL to the redirect URLs.
- In Supabase, go to Authentication, then Providers, and confirm Email is enabled.
- Confirm `RESEND_API_KEY`, `EMAIL_FROM`, and `HR_APPROVAL_EMAIL` are also set if the missing email is an account request to HR.
- Wait a few minutes before retrying; email sending can be rate-limited.

## Useful Commands

```bash
npm run dev       # local preview
npm run validate  # check required app pieces
npm run build     # create dist/ for Netlify
```
