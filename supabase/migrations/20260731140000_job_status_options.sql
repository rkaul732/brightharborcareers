alter type public.job_status add value if not exists 'internal';
alter type public.job_status add value if not exists 'confidential';

update public.jobs
set status = 'draft'
where status::text in ('paused', 'closed', 'archived');

alter table public.jobs
drop constraint if exists jobs_status_current_options_check;

alter table public.jobs
add constraint jobs_status_current_options_check
check (status::text in ('published', 'draft', 'internal', 'confidential'));
