alter table public.communication_templates
add column if not exists template_type text not null default 'Automated email';

create index if not exists communication_templates_type_idx
on public.communication_templates (template_type, category, status);
