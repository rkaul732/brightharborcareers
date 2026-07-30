create extension if not exists "pgcrypto";
create extension if not exists "citext";

do $$
begin
  create type public.user_role as enum ('applicant', 'recruiter', 'hiring_manager', 'admin');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.job_status as enum ('draft', 'published', 'paused', 'closed', 'archived');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.application_status as enum (
    'new',
    'screening',
    'interview',
    'offer',
    'hired',
    'declined',
    'archived'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email citext unique,
  role public.user_role not null default 'applicant',
  title text,
  department text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  department text not null,
  location text not null,
  work_type text not null default 'Full-time',
  status public.job_status not null default 'draft',
  hiring_manager text,
  hiring_manager_id uuid references public.profiles(id) on delete set null,
  recruiter_id uuid references public.profiles(id) on delete set null,
  summary text not null,
  salary_range text,
  review_days integer not null default 5 check (review_days between 1 and 45),
  remote boolean not null default false,
  skills text[] not null default '{}',
  posted_at date not null default current_date,
  closes_at date,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  applicant_id uuid references public.profiles(id) on delete set null,
  full_name text not null,
  email citext not null,
  phone text,
  resume_url text,
  cover_note text,
  source text not null default 'Career site',
  status public.application_status not null default 'new',
  score integer check (score is null or score between 0 and 100),
  recruiter_id uuid references public.profiles(id) on delete set null,
  applied_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (job_id, email)
);

create table if not exists public.application_notes (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  body text not null,
  is_private boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.scorecards (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  reviewer_id uuid references public.profiles(id) on delete set null,
  recommendation text not null check (recommendation in ('strong_yes', 'yes', 'mixed', 'no')),
  competency_score integer not null check (competency_score between 1 and 5),
  culture_score integer not null check (culture_score between 1 and 5),
  notes text,
  created_at timestamptz not null default now(),
  unique (application_id, reviewer_id)
);

create table if not exists public.activity_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  job_id uuid references public.jobs(id) on delete cascade,
  application_id uuid references public.applications(id) on delete cascade,
  event_type text not null,
  event_body text,
  created_at timestamptz not null default now()
);

create index if not exists jobs_status_posted_idx on public.jobs (status, posted_at desc);
create index if not exists jobs_department_idx on public.jobs (department);
create index if not exists applications_job_status_idx on public.applications (job_id, status);
create index if not exists applications_email_idx on public.applications (email);
create index if not exists notes_application_idx on public.application_notes (application_id);
create index if not exists scorecards_application_idx on public.scorecards (application_id);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_profiles_updated_at on public.profiles;
create trigger touch_profiles_updated_at
before update on public.profiles
for each row execute function public.touch_updated_at();

drop trigger if exists touch_jobs_updated_at on public.jobs;
create trigger touch_jobs_updated_at
before update on public.jobs
for each row execute function public.touch_updated_at();

drop trigger if exists touch_applications_updated_at on public.applications;
create trigger touch_applications_updated_at
before update on public.applications
for each row execute function public.touch_updated_at();

create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.is_hr_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_role() in ('recruiter', 'hiring_manager', 'admin')
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email,
    'applicant'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;
alter table public.application_notes enable row level security;
alter table public.scorecards enable row level security;
alter table public.activity_events enable row level security;

drop policy if exists "Users can view their profile" on public.profiles;
create policy "Users can view their profile"
on public.profiles for select
to authenticated
using (id = auth.uid() or public.is_hr_user());

drop policy if exists "Users can update their profile" on public.profiles;
create policy "Users can update their profile"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "Admins manage profiles" on public.profiles;
create policy "Admins manage profiles"
on public.profiles for all
to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

drop policy if exists "Published jobs are public" on public.jobs;
create policy "Published jobs are public"
on public.jobs for select
to anon, authenticated
using (status = 'published' or public.is_hr_user());

drop policy if exists "Recruiters and admins manage jobs" on public.jobs;
create policy "Recruiters and admins manage jobs"
on public.jobs for all
to authenticated
using (public.current_user_role() in ('recruiter', 'admin'))
with check (public.current_user_role() in ('recruiter', 'admin'));

drop policy if exists "Hiring managers update assigned jobs" on public.jobs;
create policy "Hiring managers update assigned jobs"
on public.jobs for update
to authenticated
using (
  public.current_user_role() = 'hiring_manager'
  and hiring_manager_id = auth.uid()
)
with check (
  public.current_user_role() = 'hiring_manager'
  and hiring_manager_id = auth.uid()
);

drop policy if exists "Anyone can apply to published jobs" on public.applications;
create policy "Anyone can apply to published jobs"
on public.applications for insert
to anon, authenticated
with check (
  status = 'new'
  and score is null
  and recruiter_id is null
  and (applicant_id is null or applicant_id = auth.uid())
  and
  exists (
    select 1
    from public.jobs
    where jobs.id = applications.job_id
      and jobs.status = 'published'
  )
);

drop policy if exists "Applicants view their own applications" on public.applications;
create policy "Applicants view their own applications"
on public.applications for select
to authenticated
using (applicant_id = auth.uid() or public.is_hr_user());

drop policy if exists "HR users manage applications" on public.applications;
create policy "HR users manage applications"
on public.applications for update
to authenticated
using (public.is_hr_user())
with check (public.is_hr_user());

drop policy if exists "HR users read application notes" on public.application_notes;
create policy "HR users read application notes"
on public.application_notes for select
to authenticated
using (public.is_hr_user());

drop policy if exists "HR users create application notes" on public.application_notes;
create policy "HR users create application notes"
on public.application_notes for insert
to authenticated
with check (public.is_hr_user());

drop policy if exists "HR users read scorecards" on public.scorecards;
create policy "HR users read scorecards"
on public.scorecards for select
to authenticated
using (public.is_hr_user());

drop policy if exists "Managers and admins create scorecards" on public.scorecards;
create policy "Managers and admins create scorecards"
on public.scorecards for insert
to authenticated
with check (public.current_user_role() in ('hiring_manager', 'admin'));

drop policy if exists "HR users read activity" on public.activity_events;
create policy "HR users read activity"
on public.activity_events for select
to authenticated
using (public.is_hr_user());

drop policy if exists "HR users create activity" on public.activity_events;
create policy "HR users create activity"
on public.activity_events for insert
to authenticated
with check (public.is_hr_user());
