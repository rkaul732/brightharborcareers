alter table public.jobs
add column if not exists summary_requirement text not null default 'optional'
check (summary_requirement in ('mandatory', 'optional', 'not_required'));

alter table public.jobs
add column if not exists resume_requirement text not null default 'mandatory'
check (resume_requirement in ('mandatory', 'optional', 'not_required'));

alter table public.jobs
add column if not exists cover_letter_requirement text not null default 'optional'
check (cover_letter_requirement in ('mandatory', 'optional', 'not_required'));

alter table public.jobs
add column if not exists phone_requirement text not null default 'mandatory'
check (phone_requirement in ('mandatory', 'optional', 'not_required'));

alter table public.jobs
add column if not exists custom_question_requirement text not null default 'mandatory'
check (custom_question_requirement in ('mandatory', 'optional', 'not_required'));

update public.jobs
set resume_requirement = case when require_resume then 'mandatory' else 'optional' end
where resume_requirement = 'mandatory';

update public.jobs
set cover_letter_requirement = case when require_cover_letter then 'mandatory' else 'optional' end
where cover_letter_requirement = 'optional';

update public.jobs
set phone_requirement = case when require_phone then 'mandatory' else 'optional' end
where phone_requirement = 'mandatory';
