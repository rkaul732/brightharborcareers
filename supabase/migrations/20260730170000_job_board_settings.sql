create table if not exists public.job_board_settings (
  id text primary key default 'default',
  hero_image_url text not null default '/assets/job-board-hero.png',
  hero_eyebrow text not null default 'Bright Harbor Careers',
  hero_title text not null default 'Find your next role at Bright Harbor.',
  hero_subtitle text not null default 'Explore current openings and apply to the role that fits your next chapter.',
  overlay_opacity integer not null default 55 check (overlay_opacity between 20 and 80),
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);

insert into public.job_board_settings (
  id,
  hero_image_url,
  hero_eyebrow,
  hero_title,
  hero_subtitle,
  overlay_opacity
)
values (
  'default',
  '/assets/job-board-hero.png',
  'Bright Harbor Careers',
  'Find your next role at Bright Harbor.',
  'Explore current openings and apply to the role that fits your next chapter.',
  55
)
on conflict (id) do nothing;

drop trigger if exists touch_job_board_settings_updated_at on public.job_board_settings;
create trigger touch_job_board_settings_updated_at
before update on public.job_board_settings
for each row execute function public.touch_updated_at();

alter table public.job_board_settings enable row level security;

drop policy if exists "Job board settings are public" on public.job_board_settings;
create policy "Job board settings are public"
on public.job_board_settings for select
to anon, authenticated
using (true);

drop policy if exists "Admins manage job board settings" on public.job_board_settings;
create policy "Admins manage job board settings"
on public.job_board_settings for all
to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');
