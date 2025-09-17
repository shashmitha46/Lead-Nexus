-- Create the buyers table with constraints
create table if not exists buyers (
    id uuid primary key default gen_random_uuid(),
    fullName text not null check (char_length(fullName) between 2 and 80),
    email text check (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' or email is null),
    phone text not null check (char_length(phone) between 10 and 15),
    city text not null check (city in ('Chandigarh', 'Mohali', 'Zirakpur', 'Panchkula', 'Other')),
    propertyType text not null check (propertyType in ('Apartment', 'Villa', 'Plot', 'Office', 'Retail')),
    bhk text check (
        bhk in ('1', '2', '3', '4', 'Studio') and
        (
            (propertyType in ('Apartment', 'Villa') and bhk is not null) or
            (propertyType in ('Plot', 'Office', 'Retail'))
        )
    ),
    purpose text not null check (purpose in ('Buy', 'Rent')),
    budgetMin int check (budgetMin > 0),
    budgetMax int check (budgetMax > 0),
    timeline text not null check (timeline in ('0-3m', '3-6m', '>6m', 'Exploring')),
    source text not null check (source in ('Website', 'Referral', 'Walk-in', 'Call', 'Other')),
    status text not null check (status in ('New', 'Qualified', 'Contacted', 'Visited', 'Negotiation', 'Converted', 'Dropped')) default 'New',
    notes text check (char_length(notes) <= 1000),
    tags jsonb default '[]' check (jsonb_typeof(tags) = 'array'),
    ownerId text not null,
    updatedAt timestamp with time zone not null default now(),
    -- Add constraint to ensure budgetMax >= budgetMin when both are present
    constraint budget_range_check check (
        (budgetMin is null) or
        (budgetMax is null) or
        (budgetMax >= budgetMin)
    )
);

-- Create the buyer history table
create table if not exists buyer_history (
    id uuid primary key default gen_random_uuid(),
    buyerId uuid not null references buyers(id) on delete cascade,
    changedBy text not null,
    changedAt timestamp with time zone not null default now(),
    diff jsonb not null check (jsonb_typeof(diff) = 'object')
);

-- Create indexes for performance
create index if not exists idx_buyers_updatedAt on buyers(updatedAt desc);
create index if not exists idx_buyers_status on buyers(status);
create index if not exists idx_buyers_city on buyers(city);
create index if not exists idx_buyers_property_type on buyers(propertyType);
create index if not exists idx_history_buyerid on buyer_history(buyerId);
create index if not exists idx_history_changedat on buyer_history(changedAt desc);

-- Enable RLS (Row Level Security)
alter table buyers enable row level security;
alter table buyer_history enable row level security;

-- Create RLS policies
create policy "read_all_buyers" on buyers 
    for select using (authenticated());

create policy "update_own_buyers" on buyers 
    for update using (auth.uid()::text = ownerId);

create policy "delete_own_buyers" on buyers 
    for delete using (auth.uid()::text = ownerId);

create policy "insert_own_buyers" on buyers 
    for insert with check (auth.uid()::text = ownerId);

create policy "read_own_buyer_history" on buyer_history 
    for select using (exists (
        select 1 from buyers 
        where buyers.id = buyer_history.buyerId 
        and buyers.ownerId = auth.uid()::text
    ));

-- Create function to automatically update the updatedAt timestamp
create or replace function update_updated_at()
returns trigger as $$
begin
    new.updatedAt = now();
    return new;
end;
$$ language plpgsql;

-- Create trigger to update the updatedAt timestamp
create trigger set_timestamp
    before update on buyers
    for each row
    execute function update_updated_at();

-- Set ownerId to current authenticated user on insert
create or replace function set_owner_id()
returns trigger as $$
begin
    new.ownerId = auth.uid()::text;
    return new;
end;
$$ language plpgsql;

drop trigger if exists set_owner_before_insert on buyers;
create trigger set_owner_before_insert
    before insert on buyers
    for each row
    execute function set_owner_id();
