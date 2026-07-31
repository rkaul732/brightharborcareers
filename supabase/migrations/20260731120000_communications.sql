create table if not exists public.communication_templates (
  id text primary key,
  name text not null,
  subject text not null,
  body text not null,
  category text not null default 'General',
  status text not null default 'active' check (status in ('active', 'inactive')),
  archived_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sender_accounts (
  id text primary key,
  name text not null,
  email citext not null,
  reply_to citext not null,
  provider text not null default 'outlook_dns',
  status text not null default 'active' check (status in ('active', 'inactive')),
  dns_status text not null default 'pending' check (dns_status in ('pending', 'verified', 'failed')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.automation_rules (
  id text primary key,
  name text not null,
  trigger_event text not null,
  pipeline_id text not null default 'default',
  pipeline_stage text,
  template_id text references public.communication_templates(id) on delete set null,
  sender_account_id text references public.sender_accounts(id) on delete set null,
  sender_email citext not null,
  reply_to citext not null,
  delay_minutes integer not null default 0 check (delay_minutes >= 0),
  status text not null default 'active' check (status in ('active', 'inactive')),
  action_type text not null default 'send_email',
  action_config jsonb not null default '{"actions":["send_email"]}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.communication_events (
  id text primary key,
  application_id text,
  job_id text,
  candidate_name text not null default '',
  candidate_email citext not null,
  template_id text references public.communication_templates(id) on delete set null,
  automation_rule_id text references public.automation_rules(id) on delete set null,
  trigger_event text not null default 'manual_send',
  direction text not null default 'outbound',
  send_type text not null default 'manual',
  subject text not null,
  body text not null,
  sender_email citext not null,
  reply_to citext not null,
  status text not null default 'queued' check (status in ('queued', 'sent', 'failed', 'canceled')),
  delivery_status text not null default 'queued',
  provider text not null default 'resend',
  provider_message_id text,
  error_message text,
  queued_at timestamptz not null default now(),
  send_after timestamptz not null default now(),
  sent_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists communication_templates_status_idx on public.communication_templates (status, category);
create index if not exists sender_accounts_status_idx on public.sender_accounts (status, dns_status);
create index if not exists automation_rules_trigger_idx on public.automation_rules (trigger_event, pipeline_stage, status);
create index if not exists communication_events_application_idx on public.communication_events (application_id, created_at desc);
create index if not exists communication_events_queue_idx on public.communication_events (status, send_after);
create index if not exists communication_events_candidate_idx on public.communication_events (candidate_email, created_at desc);

drop trigger if exists touch_communication_templates_updated_at on public.communication_templates;
create trigger touch_communication_templates_updated_at
before update on public.communication_templates
for each row execute function public.touch_updated_at();

drop trigger if exists touch_sender_accounts_updated_at on public.sender_accounts;
create trigger touch_sender_accounts_updated_at
before update on public.sender_accounts
for each row execute function public.touch_updated_at();

drop trigger if exists touch_automation_rules_updated_at on public.automation_rules;
create trigger touch_automation_rules_updated_at
before update on public.automation_rules
for each row execute function public.touch_updated_at();

alter table public.communication_templates enable row level security;
alter table public.sender_accounts enable row level security;
alter table public.automation_rules enable row level security;
alter table public.communication_events enable row level security;

drop policy if exists "HR users read communication templates" on public.communication_templates;
create policy "HR users read communication templates"
on public.communication_templates for select
to authenticated
using (public.is_hr_user());

drop policy if exists "Admins manage communication templates" on public.communication_templates;
create policy "Admins manage communication templates"
on public.communication_templates for all
to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

drop policy if exists "HR users read sender accounts" on public.sender_accounts;
create policy "HR users read sender accounts"
on public.sender_accounts for select
to authenticated
using (public.is_hr_user());

drop policy if exists "Admins manage sender accounts" on public.sender_accounts;
create policy "Admins manage sender accounts"
on public.sender_accounts for all
to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

drop policy if exists "HR users read automation rules" on public.automation_rules;
create policy "HR users read automation rules"
on public.automation_rules for select
to authenticated
using (public.is_hr_user());

drop policy if exists "Admins manage automation rules" on public.automation_rules;
create policy "Admins manage automation rules"
on public.automation_rules for all
to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

drop policy if exists "HR users manage communication events" on public.communication_events;
create policy "HR users manage communication events"
on public.communication_events for all
to authenticated
using (public.is_hr_user())
with check (public.is_hr_user());

insert into public.sender_accounts (id, name, email, reply_to, provider, status, dns_status)
values (
  'sender-bright-harbor-hr',
  'Bright Harbor HR',
  'hr@brightharbor.org',
  'hr@brightharbor.org',
  'outlook_dns',
  'active',
  'pending'
)
on conflict (id) do nothing;

insert into public.communication_templates (id, name, subject, body, category, status)
values
  (
    'tmpl-application-received',
    'Application received',
    'We received your application for {{job_title}}',
    'Hello {{candidate_name}},

Thank you for applying for {{job_title}} at {{company_name}}. Our hiring team has received your application and will review your experience soon.

If your background aligns with the role, {{recruiter_name}} will contact you with next steps.

Thank you,
{{company_name}} Careers',
    'Application',
    'active'
  ),
  (
    'tmpl-interview-stage',
    'Interview stage follow-up',
    'Next steps for {{job_title}}',
    'Hello {{candidate_name}},

We are glad to move you forward for {{job_title}}. The next step is an interview with our team.

Interview timing: {{interview_date_time}}

Please reply to {{reply_to}} with any scheduling questions.

Thank you,
{{recruiter_name}}',
    'Interview',
    'active'
  ),
  (
    'tmpl-offer-sent',
    'Offer sent',
    'Offer details for {{job_title}}',
    'Hello {{candidate_name}},

We are excited to share offer details for {{job_title}} with {{company_name}}.

{{offer_details}}

Please review and reply to {{reply_to}} with any questions.

Warmly,
{{recruiter_name}}',
    'Offer',
    'active'
  )
on conflict (id) do nothing;

insert into public.automation_rules (
  id,
  name,
  trigger_event,
  pipeline_stage,
  template_id,
  sender_account_id,
  sender_email,
  reply_to,
  delay_minutes,
  status,
  action_type,
  action_config
)
values
  (
    'rule-application-received',
    'Application confirmation',
    'candidate_applies',
    null,
    'tmpl-application-received',
    'sender-bright-harbor-hr',
    'hr@brightharbor.org',
    'hr@brightharbor.org',
    0,
    'active',
    'send_email',
    '{"actions":["send_email"]}'::jsonb
  ),
  (
    'rule-interview-stage',
    'Interview stage message',
    'candidate_stage_changed',
    'interview',
    'tmpl-interview-stage',
    'sender-bright-harbor-hr',
    'hr@brightharbor.org',
    'hr@brightharbor.org',
    15,
    'active',
    'send_email',
    '{"actions":["send_email"]}'::jsonb
  )
on conflict (id) do nothing;
