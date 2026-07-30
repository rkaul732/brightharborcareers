create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.departments(id) on delete cascade,
  name text not null,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (parent_id is null or parent_id <> id)
);

create unique index if not exists departments_root_name_idx
on public.departments (lower(name))
where parent_id is null;

create unique index if not exists departments_child_name_idx
on public.departments (parent_id, lower(name))
where parent_id is not null;

create index if not exists departments_parent_idx on public.departments (parent_id);
create index if not exists departments_status_idx on public.departments (status);

alter table public.jobs
add column if not exists department_id uuid references public.departments(id) on delete set null;

alter table public.jobs
add column if not exists subdepartment_id uuid references public.departments(id) on delete set null;

alter table public.jobs
add column if not exists subdepartment text;

create index if not exists jobs_department_id_idx on public.jobs (department_id);
create index if not exists jobs_subdepartment_id_idx on public.jobs (subdepartment_id);

insert into public.departments (id, name, status)
values
  ('10000000-0000-0000-0000-000000000001', 'People Operations', 'active'),
  ('10000000-0000-0000-0000-000000000002', 'Client Experience', 'active'),
  ('10000000-0000-0000-0000-000000000003', 'Analytics', 'active'),
  ('10000000-0000-0000-0000-000000000004', 'Clinical Services', 'active')
on conflict (id) do nothing;

insert into public.departments (id, parent_id, name, status)
values
  ('10000000-0000-0000-0000-000000000101', '10000000-0000-0000-0000-000000000001', 'Recruiting', 'active'),
  ('10000000-0000-0000-0000-000000000102', '10000000-0000-0000-0000-000000000004', 'Program Coordination', 'active')
on conflict (id) do nothing;

update public.jobs
set department_id = departments.id
from public.departments
where public.jobs.department_id is null
  and departments.parent_id is null
  and public.jobs.department = departments.name;

drop trigger if exists touch_departments_updated_at on public.departments;
create trigger touch_departments_updated_at
before update on public.departments
for each row execute function public.touch_updated_at();

alter table public.departments enable row level security;

drop policy if exists "Active departments are public" on public.departments;
create policy "Active departments are public"
on public.departments for select
to anon, authenticated
using (status = 'active' or public.is_hr_user());

drop policy if exists "Admins manage departments" on public.departments;
create policy "Admins manage departments"
on public.departments for all
to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');
