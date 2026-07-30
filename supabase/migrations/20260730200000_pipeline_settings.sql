create table if not exists public.pipeline_settings (
  id text primary key default 'default',
  stages jsonb not null default '{"new":"New","screening":"Screening","interview":"Interview","offer":"Offer"}'::jsonb,
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now(),
  check (jsonb_typeof(stages) = 'object')
);

insert into public.pipeline_settings (id, stages)
values (
  'default',
  '{"new":"New","screening":"Screening","interview":"Interview","offer":"Offer"}'::jsonb
)
on conflict (id) do nothing;

drop trigger if exists touch_pipeline_settings_updated_at on public.pipeline_settings;
create trigger touch_pipeline_settings_updated_at
before update on public.pipeline_settings
for each row execute function public.touch_updated_at();

alter table public.pipeline_settings enable row level security;

drop policy if exists "HR users read pipeline settings" on public.pipeline_settings;
create policy "HR users read pipeline settings"
on public.pipeline_settings for select
to authenticated
using (public.is_hr_user());

drop policy if exists "Admins manage pipeline settings" on public.pipeline_settings;
create policy "Admins manage pipeline settings"
on public.pipeline_settings for all
to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');
