-- ============================================================================
-- Kedar AI — Complete PostgreSQL Schema & Row Level Security (RLS)
-- ============================================================================

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  education text not null default '',
  branch text not null default '',
  college text not null default '',
  current_semester text not null default '',
  target_role text not null default '',
  skills jsonb not null default '[]'::jsonb,
  interests jsonb not null default '[]'::jsonb,
  current_projects jsonb not null default '[]'::jsonb,
  preferred_learning_style text not null default 'Practical / Project-based',
  long_term_goals jsonb not null default '[]'::jsonb,
  bio text not null default '',
  user_tier text not null default 'free' check (user_tier in ('free', 'pro', 'campus')),
  referral_code text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. CONVERSATIONS TABLE
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'New Conversation',
  category text not null default 'general',
  is_pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. MESSAGES TABLE
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null default '',
  created_at timestamptz not null default now()
);

-- 4. MEMORIES TABLE (AI Memory System)
create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  category text not null default 'Profile' check (category in ('Profile', 'Education', 'Skills', 'Projects', 'Goals', 'Preferences', 'Other', 'skills', 'projects', 'preferences', 'career', 'academic', 'general')),
  importance text not null default 'medium' check (importance in ('high', 'medium', 'low', '1', '2', '3', '4', '5')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5. TASKS TABLE (Task Planner)
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null default '',
  priority text not null default 'medium' check (priority in ('high', 'medium', 'low')),
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'completed', 'active')),
  deadline text not null default '',
  is_completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 6. LEARNING ROADMAPS TABLE
create table if not exists public.learning_roadmaps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null default '',
  icon text not null default 'GraduationCap',
  estimated_weeks integer not null default 4,
  level text not null default 'Beginner',
  progress integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 7. LEARNING ITEMS TABLE (Roadmap Modules & Topics)
create table if not exists public.learning_items (
  id uuid primary key default gen_random_uuid(),
  roadmap_id uuid not null references public.learning_roadmaps(id) on delete cascade,
  title text not null,
  description text not null default '',
  completed boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

-- 8. BUSINESS IDEAS TABLE (Vault)
create table if not exists public.business_ideas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  tagline text not null default '',
  problem text not null default '',
  solution text not null default '',
  target_audience text not null default '',
  tech_stack jsonb not null default '[]'::jsonb,
  monetization jsonb not null default '[]'::jsonb,
  mvp_plan jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- 9. CONTENT POSTS TABLE (Content Studio)
create table if not exists public.content_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  platform text not null default 'linkedin',
  topic text not null default '',
  tone text not null default 'professional',
  generated_content text not null default '',
  hashtags jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
create index if not exists idx_conversations_user_id on public.conversations(user_id);
create index if not exists idx_messages_conversation_id on public.messages(conversation_id);
create index if not exists idx_memories_user_id on public.memories(user_id);
create index if not exists idx_tasks_user_id on public.tasks(user_id);
create index if not exists idx_learning_roadmaps_user_id on public.learning_roadmaps(user_id);
create index if not exists idx_learning_items_roadmap_id on public.learning_items(roadmap_id);
create index if not exists idx_business_ideas_user_id on public.business_ideas(user_id);
create index if not exists idx_content_posts_user_id on public.content_posts(user_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
alter table public.profiles enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.memories enable row level security;
alter table public.tasks enable row level security;
alter table public.learning_roadmaps enable row level security;
alter table public.learning_items enable row level security;
alter table public.business_ideas enable row level security;
alter table public.content_posts enable row level security;

-- Profiles Policies
drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile" on public.profiles for select using (auth.uid() = id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- Conversations Policies
drop policy if exists "Users can manage their conversations" on public.conversations;
create policy "Users can manage their conversations" on public.conversations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Messages Policies
drop policy if exists "Users can manage messages in their conversations" on public.messages;
create policy "Users can manage messages in their conversations" on public.messages for all using (
  exists (
    select 1 from public.conversations
    where conversations.id = messages.conversation_id
    and conversations.user_id = auth.uid()
  )
) with check (
  exists (
    select 1 from public.conversations
    where conversations.id = messages.conversation_id
    and conversations.user_id = auth.uid()
  )
);

-- Memories Policies
drop policy if exists "Users can manage their memories" on public.memories;
create policy "Users can manage their memories" on public.memories for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Tasks Policies
drop policy if exists "Users can manage their tasks" on public.tasks;
create policy "Users can manage their tasks" on public.tasks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Learning Roadmaps Policies
drop policy if exists "Users can manage their learning roadmaps" on public.learning_roadmaps;
create policy "Users can manage their learning roadmaps" on public.learning_roadmaps for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Learning Items Policies
drop policy if exists "Users can manage their learning items" on public.learning_items;
create policy "Users can manage their learning items" on public.learning_items for all using (
  exists (
    select 1 from public.learning_roadmaps
    where learning_roadmaps.id = learning_items.roadmap_id
    and learning_roadmaps.user_id = auth.uid()
  )
) with check (
  exists (
    select 1 from public.learning_roadmaps
    where learning_roadmaps.id = learning_items.roadmap_id
    and learning_roadmaps.user_id = auth.uid()
  )
);

-- Business Ideas Policies
drop policy if exists "Users can manage their business ideas" on public.business_ideas;
create policy "Users can manage their business ideas" on public.business_ideas for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Content Posts Policies
drop policy if exists "Users can manage their content posts" on public.content_posts;
create policy "Users can manage their content posts" on public.content_posts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================================
-- AUTH HOOK TRIGGER: Auto-create profile on new user signup
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (
    id,
    full_name,
    email,
    education,
    branch,
    college,
    current_semester,
    target_role,
    referral_code
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'education', 'B.Tech in Computer Science & Engineering'),
    coalesce(new.raw_user_meta_data->>'branch', 'CSE (AI & Data Science)'),
    coalesce(new.raw_user_meta_data->>'college', 'Engineering Institute of Technology'),
    coalesce(new.raw_user_meta_data->>'current_semester', '6th Semester'),
    coalesce(new.raw_user_meta_data->>'target_role', 'Full Stack AI Engineer / SDE-1'),
    'KEDAR-' || upper(substr(md5(random()::text), 1, 6))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
