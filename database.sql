-- Optional starter schema for a future persistent catalogue.
-- Run in Supabase SQL Editor only after creating your project.
create table if not exists products (
  id bigint generated always as identity primary key,
  provider_id text,
  title text not null,
  market text not null default 'us',
  category text,
  created_at timestamptz not null default now()
);
create table if not exists offers (
  id bigint generated always as identity primary key,
  product_id bigint references products(id) on delete cascade,
  seller text not null,
  price numeric(12,2),
  currency text not null default 'USD',
  product_url text,
  availability text,
  observed_at timestamptz,
  fetched_at timestamptz not null default now()
);
create table if not exists price_history (
  id bigint generated always as identity primary key,
  product_id bigint references products(id) on delete cascade,
  seller text not null,
  price numeric(12,2) not null,
  currency text not null default 'USD',
  recorded_at timestamptz not null default now()
);
-- Safe default: public users cannot read/write these tables until policies are added.
alter table products enable row level security;
alter table offers enable row level security;
alter table price_history enable row level security;
