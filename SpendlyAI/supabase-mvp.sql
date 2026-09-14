-- Spendly AI MVP schema: run in Supabase SQL editor.
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric not null check (amount >= 0),
  currency text not null default 'EUR',
  category text not null default 'other',
  merchant text, date date not null default current_date,
  note text, receipt_url text,
  items jsonb, tax numeric, ai_confidence numeric,
  created_at timestamptz default now()
);
create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  month text not null, category text not null default 'total',
  "limit" numeric not null, currency text default 'EUR',
  unique(user_id, month, category)
);
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null, target numeric not null,
  current numeric not null default 0, currency text default 'EUR',
  deadline date, created_at timestamptz default now()
);
alter table public.expenses enable row level security;
alter table public.budgets enable row level security;
alter table public.goals enable row level security;
drop policy if exists "own expenses" on public.expenses;
create policy "own expenses" on public.expenses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "own budgets" on public.budgets;
create policy "own budgets" on public.budgets for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "own goals" on public.goals;
create policy "own goals" on public.goals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Grants table privileges to authenticated and anon roles for Supabase RLS
grant usage on schema public to anon, authenticated;
grant all privileges on all tables in schema public to anon, authenticated;
grant all privileges on all sequences in schema public to anon, authenticated;
alter default privileges in schema public grant all on tables to anon, authenticated;
alter default privileges in schema public grant all on sequences to anon, authenticated;

create storage bucket if not exists receipts; -- make private; use: storage.objects policies for auth.uid()
