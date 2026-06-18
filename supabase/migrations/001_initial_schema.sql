-- Enable UUID extension
create extension if not exists "pgcrypto";

-- Organizations (client companies)
create table public.organizations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text unique not null,
  created_at  timestamptz not null default now()
);

-- Profiles: HR managers tied to an organization, or superadmin
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  org_id      uuid references public.organizations(id) on delete set null,
  role        text not null default 'hr',  -- 'hr' | 'superadmin'
  created_at  timestamptz not null default now(),
  constraint profiles_role_check check (role in ('hr', 'superadmin'))
);

-- Survey campaigns: each company can run multiple rounds
create table public.campaigns (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references public.organizations(id) on delete cascade,
  name         text not null,
  access_code  text not null,
  status       text not null default 'active',  -- 'active' | 'closed'
  created_at   timestamptz not null default now(),
  closed_at    timestamptz,
  constraint campaigns_status_check check (status in ('active', 'closed'))
);

-- Ensure access codes are unique per organization
create unique index campaigns_org_code_unique on public.campaigns(org_id, access_code);

-- Anonymous survey responses
create table public.responses (
  id           uuid primary key default gen_random_uuid(),
  campaign_id  uuid not null references public.campaigns(id) on delete cascade,
  answers      jsonb not null,    -- { "1": 4, "2": 3, ... }
  role         text not null default 'Non specificato',
  open_answer  text,
  created_at   timestamptz not null default now()
);

-- ─── Row Level Security ──────────────────────────────────────────────────────

alter table public.organizations enable row level security;
alter table public.profiles       enable row level security;
alter table public.campaigns      enable row level security;
alter table public.responses      enable row level security;

-- Helper: reads the calling user's role, bypasses RLS via security definer
create or replace function public.get_my_role()
returns text language sql security definer stable as $$
  select role from public.profiles where id = auth.uid() limit 1;
$$;

-- Profiles: users see their own; superadmin sees all
create policy "profiles_select_own" on public.profiles for select
  using (id = auth.uid() or public.get_my_role() = 'superadmin');

create policy "profiles_insert_superadmin" on public.profiles for insert
  with check (public.get_my_role() = 'superadmin');

create policy "profiles_update_own" on public.profiles for update
  using (id = auth.uid() or public.get_my_role() = 'superadmin');

-- Organizations: superadmin sees all; HR sees only their org
create policy "orgs_select" on public.organizations for select
  using (public.get_my_role() = 'superadmin'
    or id = (select org_id from public.profiles where id = auth.uid()));

create policy "orgs_insert" on public.organizations for insert
  with check (public.get_my_role() = 'superadmin');

create policy "orgs_update" on public.organizations for update
  using (public.get_my_role() = 'superadmin');

create policy "orgs_delete" on public.organizations for delete
  using (public.get_my_role() = 'superadmin');

-- Campaigns: superadmin sees all; HR sees their org
create policy "campaigns_select" on public.campaigns for select
  using (public.get_my_role() = 'superadmin'
    or org_id = (select org_id from public.profiles where id = auth.uid()));

create policy "campaigns_insert" on public.campaigns for insert
  with check (public.get_my_role() = 'superadmin');

create policy "campaigns_update" on public.campaigns for update
  using (public.get_my_role() = 'superadmin'
    or org_id = (select org_id from public.profiles where id = auth.uid()));

create policy "campaigns_delete" on public.campaigns for delete
  using (public.get_my_role() = 'superadmin');

-- Responses: superadmin sees all; HR sees responses for their org's campaigns
create policy "responses_select" on public.responses for select
  using (
    public.get_my_role() = 'superadmin'
    or campaign_id in (
      select id from public.campaigns
      where org_id = (select org_id from public.profiles where id = auth.uid())
    )
  );

-- Public insert: anyone with a valid campaign_id can submit (enforced in API)
create policy "responses_insert_anon" on public.responses for insert
  with check (true);

-- ─── Auto-create profile on sign-up ──────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer
as $$
begin
  insert into public.profiles (id, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'role', 'hr'));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
