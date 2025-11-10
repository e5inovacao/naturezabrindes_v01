-- Create products table and open read access for anon
begin;

create table if not exists public.products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text not null,
  category_id text,
  images text[],
  sustainability_features text[],
  featured boolean default false,
  specifications jsonb,
  features text[],
  certifications text[],
  rating numeric,
  review_count integer,
  in_stock boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS and allow public read via anon key
alter table public.products enable row level security;
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'products' and policyname = 'public read products'
  ) then
    create policy "public read products" on public.products for select using (true);
  end if;
end $$;

commit;