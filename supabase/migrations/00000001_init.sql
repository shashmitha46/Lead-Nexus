-- Create the buyers table
drop table if exists buyer_history;
drop table if exists buyers;

create table buyers (
  id uuid primary key default gen_random_uuid(),
  fullName text not null,
  email text,
  phone text not null,
  city text not null,
  propertyType text not null,
  bhk text,
  purpose text not null,
  budgetMin int,
  budgetMax int,
  timeline text not null,
  source text not null,
  status text not null default 'New',
  notes text,
  tags jsonb default '[]',
  ownerId text not null,
  updatedAt timestamp with time zone not null default now()
);

-- Create the buyer history table
create table buyer_history (
  id uuid primary key default gen_random_uuid(),
  buyerId uuid not null references buyers(id) on delete cascade,
  changedBy text not null,
  changedAt timestamp with time zone not null default now(),
  diff jsonb not null
);

-- Create indexes
create index idx_buyers_updatedAt on buyers(updatedAt desc);
create index idx_history_buyerId on buyer_history(buyerId);

-- Enable RLS and create policies
alter table buyers enable row level security;
create policy "read_all_buyers" on buyers for select using (true);
create policy "update_own_buyers" on buyers for update using (auth.uid()::text = ownerId);
create policy "delete_own_buyers" on buyers for delete using (auth.uid()::text = ownerId);