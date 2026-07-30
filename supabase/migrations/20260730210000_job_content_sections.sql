alter table public.jobs
add column if not exists salary_min numeric;

alter table public.jobs
add column if not exists salary_max numeric;

alter table public.jobs
add column if not exists job_description text;

alter table public.jobs
add column if not exists requirements text;

alter table public.jobs
add column if not exists benefits text;

alter table public.jobs
add column if not exists seo_title text;

alter table public.jobs
add column if not exists seo_description text;

alter table public.jobs
add column if not exists seo_keywords text[] not null default '{}';

update public.jobs
set job_description = summary
where job_description is null;

update public.jobs
set seo_keywords = skills
where seo_keywords = '{}'::text[]
  and skills <> '{}'::text[];
