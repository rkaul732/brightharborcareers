alter table public.workflows
add column if not exists department_ids text[] not null default '{}';

create index if not exists workflows_department_ids_idx
on public.workflows using gin (department_ids);
