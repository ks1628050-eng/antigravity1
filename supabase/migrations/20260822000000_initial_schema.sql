create table if not exists public.user_workspaces (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_workspaces enable row level security;

drop policy if exists "Users can read their workspace" on public.user_workspaces;
create policy "Users can read their workspace" on public.user_workspaces for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their workspace" on public.user_workspaces;
create policy "Users can insert their workspace" on public.user_workspaces for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their workspace" on public.user_workspaces;
create policy "Users can update their workspace" on public.user_workspaces for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.user_workspaces (user_id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();
