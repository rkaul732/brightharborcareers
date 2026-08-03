do $$
begin
  if to_regclass('public.pipeline_settings') is not null then
    execute 'update public.pipeline_settings
      set stages = stages || ''{"hired":"Hired"}''::jsonb
      where not (stages ? ''hired'')';
  end if;

  if to_regclass('public.workflows') is not null then
    execute 'update public.workflows
      set stages = stages || ''{"hired":"Hired"}''::jsonb
      where not (stages ? ''hired'')';
  end if;
end $$;

create table if not exists public.onboarding_records (
  application_id uuid primary key references public.applications(id) on delete cascade,
  employee_id text,
  department_id uuid references public.departments(id) on delete set null,
  department_name text,
  manager_name text,
  reports_to text,
  start_date date,
  work_location text,
  employment_type text,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.onboarding_documents (
  id text primary key,
  application_id uuid not null references public.applications(id) on delete cascade,
  uploaded_by uuid references public.profiles(id) on delete set null,
  file_name text not null,
  file_type text,
  file_size bigint,
  storage_bucket text not null default 'onboarding-documents',
  storage_path text,
  matched_type_ids text[] not null default '{}',
  scan_summary text,
  status text not null default 'uploaded' check (status in ('uploaded', 'reviewed', 'rejected', 'archived')),
  uploaded_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists onboarding_records_department_idx
on public.onboarding_records (department_id);

create index if not exists onboarding_documents_application_idx
on public.onboarding_documents (application_id, uploaded_at desc);

create index if not exists onboarding_documents_status_idx
on public.onboarding_documents (status, uploaded_at desc);

drop trigger if exists touch_onboarding_records_updated_at on public.onboarding_records;
create trigger touch_onboarding_records_updated_at
before update on public.onboarding_records
for each row execute function public.touch_updated_at();

drop trigger if exists touch_onboarding_documents_updated_at on public.onboarding_documents;
create trigger touch_onboarding_documents_updated_at
before update on public.onboarding_documents
for each row execute function public.touch_updated_at();

alter table public.onboarding_records enable row level security;
alter table public.onboarding_documents enable row level security;

drop policy if exists "HR users read onboarding records" on public.onboarding_records;
create policy "HR users read onboarding records"
on public.onboarding_records for select
to authenticated
using (
  public.is_hr_user()
  or exists (
    select 1
    from public.applications
    where applications.id = onboarding_records.application_id
      and applications.applicant_id = auth.uid()
      and applications.status = 'hired'
  )
);

drop policy if exists "HR users manage onboarding records" on public.onboarding_records;
create policy "HR users manage onboarding records"
on public.onboarding_records for all
to authenticated
using (public.is_hr_user())
with check (public.is_hr_user());

drop policy if exists "HR users read onboarding documents" on public.onboarding_documents;
create policy "HR users read onboarding documents"
on public.onboarding_documents for select
to authenticated
using (
  public.is_hr_user()
  or exists (
    select 1
    from public.applications
    where applications.id = onboarding_documents.application_id
      and applications.applicant_id = auth.uid()
      and applications.status = 'hired'
  )
);

drop policy if exists "Hired applicants upload onboarding documents" on public.onboarding_documents;
create policy "Hired applicants upload onboarding documents"
on public.onboarding_documents for insert
to authenticated
with check (
  public.is_hr_user()
  or exists (
    select 1
    from public.applications
    where applications.id = onboarding_documents.application_id
      and applications.applicant_id = auth.uid()
      and applications.status = 'hired'
  )
);

drop policy if exists "HR users manage onboarding documents" on public.onboarding_documents;
create policy "HR users manage onboarding documents"
on public.onboarding_documents for all
to authenticated
using (public.is_hr_user())
with check (public.is_hr_user());

insert into storage.buckets (id, name, public, file_size_limit)
values ('onboarding-documents', 'onboarding-documents', false, 10485760)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit;

drop policy if exists "HR users read onboarding document files" on storage.objects;
create policy "HR users read onboarding document files"
on storage.objects for select
to authenticated
using (bucket_id = 'onboarding-documents' and public.is_hr_user());

drop policy if exists "HR users upload onboarding document files" on storage.objects;
create policy "HR users upload onboarding document files"
on storage.objects for insert
to authenticated
with check (bucket_id = 'onboarding-documents' and public.is_hr_user());

drop policy if exists "HR users update onboarding document files" on storage.objects;
create policy "HR users update onboarding document files"
on storage.objects for update
to authenticated
using (bucket_id = 'onboarding-documents' and public.is_hr_user())
with check (bucket_id = 'onboarding-documents' and public.is_hr_user());

drop policy if exists "HR users delete onboarding document files" on storage.objects;
create policy "HR users delete onboarding document files"
on storage.objects for delete
to authenticated
using (bucket_id = 'onboarding-documents' and public.is_hr_user());
