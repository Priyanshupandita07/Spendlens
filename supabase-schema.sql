-- SpendLens Supabase Schema
-- Run this in your Supabase SQL editor at supabase.com

-- Audits table: one row per audit run
create table if not exists audits (
  id text primary key,
  audit_data jsonb not null,
  audit_summary jsonb not null,
  created_at timestamptz default now(),
  email text,
  company_name text,
  role text
);

-- Leads table: one row per email capture
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  audit_id text references audits(id),
  email text not null,
  company_name text,
  role text,
  team_size int,
  total_monthly_savings numeric,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table audits enable row level security;
alter table leads enable row level security;

-- Audits: anyone can insert and read by ID (public audits)
create policy "Public insert audits"
  on audits for insert with check (true);

create policy "Public read audits by id"
  on audits for select using (true);

-- Leads: anyone can insert (server handles auth via service key)
create policy "Public insert leads"
  on leads for insert with check (true);

-- Index for fast audit lookups
create index if not exists audits_created_at_idx on audits(created_at desc);
create index if not exists leads_audit_id_idx on leads(audit_id);
create index if not exists leads_created_at_idx on leads(created_at desc);
