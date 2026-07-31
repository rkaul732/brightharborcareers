create table if not exists public.workflows (
  id text primary key,
  name text not null,
  status text not null default 'active' check (status in ('active', 'inactive')),
  stages jsonb not null default '{"new":"New","screening":"Screening","interview":"Interview","offer":"Offer"}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (jsonb_typeof(stages) = 'object')
);

alter table public.jobs
add column if not exists workflow_id text;

alter table public.jobs
add column if not exists recruiter_name text;

alter table public.jobs
add column if not exists review_lead text;

alter table public.jobs
add column if not exists team_members text;

alter table public.jobs
add column if not exists application_summary text;

alter table public.jobs
add column if not exists require_resume boolean not null default true;

alter table public.jobs
add column if not exists require_cover_letter boolean not null default false;

alter table public.jobs
add column if not exists require_phone boolean not null default true;

alter table public.jobs
add column if not exists application_question text;

alter table public.applications
add column if not exists application_answers jsonb not null default '{}'::jsonb;

create index if not exists workflows_status_idx on public.workflows (status, name);
create index if not exists jobs_workflow_idx on public.jobs (workflow_id);

drop trigger if exists touch_workflows_updated_at on public.workflows;
create trigger touch_workflows_updated_at
before update on public.workflows
for each row execute function public.touch_updated_at();

alter table public.workflows enable row level security;

drop policy if exists "HR users read workflows" on public.workflows;
create policy "HR users read workflows"
on public.workflows for select
to authenticated
using (public.is_hr_user());

drop policy if exists "Admins manage workflows" on public.workflows;
create policy "Admins manage workflows"
on public.workflows for all
to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

insert into public.workflows (id, name, status, stages)
values
  (
    'workflow-standard',
    'Standard hiring',
    'active',
    '{"new":"New","screening":"Screening","interview":"Interview","offer":"Offer"}'::jsonb
  ),
  (
    'workflow-clinical',
    'Clinical hiring',
    'active',
    '{"new":"Applied","screening":"Credential review","interview":"Clinical interview","offer":"Offer"}'::jsonb
  ),
  (
    'workflow-high-volume',
    'High-volume hiring',
    'active',
    '{"new":"Applied","screening":"Phone screen","interview":"Team interview","offer":"Ready to offer"}'::jsonb
  )
on conflict (id) do nothing;

update public.jobs
set workflow_id = 'workflow-standard'
where workflow_id is null;
