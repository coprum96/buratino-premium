-- Buratino Premium research database
-- Run ALL of this once in Supabase → SQL Editor → Run
-- Project: yldvpgwbzayxyxowxjjo
--
-- Tables: sessions + quiz_answers + dialogue_choices + test_results + material_views
-- Write path: RPC upsert_game_session(jsonb)
-- Anon can write via RPC, cannot SELECT participant data.

create extension if not exists pgcrypto;

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  session_id text not null unique,
  user_id text,
  start_time timestamptz not null,
  end_time timestamptz,
  total_play_time integer not null default 0,
  final_coins integer not null default 5,
  final_wisdom integer not null default 0,
  completed_levels jsonb not null default '[]'::jsonb,
  achievements jsonb not null default '[]'::jsonb,
  time_per_level jsonb not null default '{}'::jsonb,
  raw_json jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sessions_start_time_idx on public.sessions (start_time);
create index if not exists sessions_user_id_idx on public.sessions (user_id);

create table if not exists public.quiz_answers (
  id uuid primary key default gen_random_uuid(),
  session_id text not null references public.sessions (session_id) on delete cascade,
  level_id integer not null,
  question_index integer not null,
  question_text text not null,
  selected_answer text not null,
  is_correct boolean not null,
  timestamp timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists quiz_answers_session_id_idx on public.quiz_answers (session_id);
create index if not exists quiz_answers_level_id_idx on public.quiz_answers (level_id);
create index if not exists quiz_answers_is_correct_idx on public.quiz_answers (is_correct);

create table if not exists public.dialogue_choices (
  id uuid primary key default gen_random_uuid(),
  session_id text not null references public.sessions (session_id) on delete cascade,
  level_id integer not null,
  dialogue_index integer not null,
  character_name text not null,
  choice_text text not null,
  wisdom_change integer not null default 0,
  coin_change integer not null default 0,
  timestamp timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists dialogue_choices_session_id_idx on public.dialogue_choices (session_id);
create index if not exists dialogue_choices_level_id_idx on public.dialogue_choices (level_id);
create index if not exists dialogue_choices_character_name_idx on public.dialogue_choices (character_name);

create table if not exists public.test_results (
  id uuid primary key default gen_random_uuid(),
  session_id text not null references public.sessions (session_id) on delete cascade,
  test_type text not null,
  score integer not null,
  total_questions integer not null,
  raw_answers jsonb not null,
  timestamp timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists test_results_session_id_idx on public.test_results (session_id);
create index if not exists test_results_test_type_idx on public.test_results (test_type);

create table if not exists public.material_views (
  id uuid primary key default gen_random_uuid(),
  session_id text not null references public.sessions (session_id) on delete cascade,
  material_id integer not null,
  material_title text not null,
  view_duration integer not null,
  timestamp timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists material_views_session_id_idx on public.material_views (session_id);
create index if not exists material_views_material_id_idx on public.material_views (material_id);

alter table public.sessions enable row level security;
alter table public.quiz_answers enable row level security;
alter table public.dialogue_choices enable row level security;
alter table public.test_results enable row level security;
alter table public.material_views enable row level security;

grant usage on schema public to anon, authenticated;

revoke all on table public.sessions from anon, authenticated;
revoke all on table public.quiz_answers from anon, authenticated;
revoke all on table public.dialogue_choices from anon, authenticated;
revoke all on table public.test_results from anon, authenticated;
revoke all on table public.material_views from anon, authenticated;

create or replace function public.upsert_game_session(p_row jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_session_id text;
begin
  if p_row is null or coalesce(p_row->>'sessionId', '') = '' then
    raise exception 'invalid game session payload';
  end if;

  v_session_id := p_row->>'sessionId';

  insert into public.sessions as s (
    session_id,
    user_id,
    start_time,
    end_time,
    total_play_time,
    final_coins,
    final_wisdom,
    completed_levels,
    achievements,
    time_per_level,
    raw_json,
    updated_at
  )
  values (
    v_session_id,
    nullif(p_row->>'userId', ''),
    coalesce((p_row->>'startTime')::timestamptz, now()),
    nullif(p_row->>'endTime', '')::timestamptz,
    coalesce((p_row->>'totalPlayTime')::integer, 0),
    coalesce((p_row->>'finalCoins')::integer, 5),
    coalesce((p_row->>'finalWisdom')::integer, 0),
    coalesce(p_row->'completedLevels', '[]'::jsonb),
    coalesce(p_row->'achievements', '[]'::jsonb),
    coalesce(p_row->'timePerLevel', '{}'::jsonb),
    p_row,
    now()
  )
  on conflict (session_id) do update
  set
    user_id = excluded.user_id,
    start_time = excluded.start_time,
    end_time = excluded.end_time,
    total_play_time = excluded.total_play_time,
    final_coins = excluded.final_coins,
    final_wisdom = excluded.final_wisdom,
    completed_levels = excluded.completed_levels,
    achievements = excluded.achievements,
    time_per_level = excluded.time_per_level,
    raw_json = excluded.raw_json,
    updated_at = excluded.updated_at
  where s.end_time is null or excluded.end_time is not null
  returning s.id into v_id;

  if v_id is null then
    select id into v_id from public.sessions where session_id = v_session_id;
    return v_id;
  end if;

  delete from public.quiz_answers where session_id = v_session_id;
  delete from public.dialogue_choices where session_id = v_session_id;
  delete from public.test_results where session_id = v_session_id;
  delete from public.material_views where session_id = v_session_id;

  insert into public.quiz_answers (
    session_id, level_id, question_index, question_text,
    selected_answer, is_correct, timestamp
  )
  select
    v_session_id,
    coalesce((a->>'levelId')::integer, 0),
    coalesce((a->>'questionIndex')::integer, 0),
    coalesce(a->>'questionText', ''),
    coalesce(a->>'selectedAnswer', ''),
    coalesce((a->>'isCorrect')::boolean, false),
    coalesce((a->>'timestamp')::timestamptz, now())
  from jsonb_array_elements(coalesce(p_row->'quizAnswers', '[]'::jsonb)) as a;

  insert into public.dialogue_choices (
    session_id, level_id, dialogue_index, character_name,
    choice_text, wisdom_change, coin_change, timestamp
  )
  select
    v_session_id,
    coalesce((c->>'levelId')::integer, 0),
    coalesce((c->>'dialogueIndex')::integer, 0),
    coalesce(c->>'characterName', ''),
    coalesce(c->>'choiceText', ''),
    coalesce((c->>'wisdomChange')::integer, 0),
    coalesce((c->>'coinChange')::integer, 0),
    coalesce((c->>'timestamp')::timestamptz, now())
  from jsonb_array_elements(coalesce(p_row->'dialogueChoices', '[]'::jsonb)) as c;

  insert into public.test_results (
    session_id, test_type, score, total_questions, raw_answers, timestamp
  )
  select
    v_session_id,
    coalesce(t->>'testType', 'unknown'),
    coalesce((t->>'score')::integer, 0),
    coalesce((t->>'totalQuestions')::integer, 0),
    coalesce(t->'answers', '[]'::jsonb),
    coalesce((t->>'timestamp')::timestamptz, now())
  from jsonb_array_elements(coalesce(p_row->'testResults', '[]'::jsonb)) as t;

  insert into public.material_views (
    session_id, material_id, material_title, view_duration, timestamp
  )
  select
    v_session_id,
    coalesce((m->>'materialId')::integer, 0),
    coalesce(m->>'materialTitle', ''),
    coalesce((m->>'viewDuration')::integer, 0),
    coalesce((m->>'timestamp')::timestamptz, now())
  from jsonb_array_elements(coalesce(p_row->'materialViews', '[]'::jsonb)) as m;

  return v_id;
end;
$$;

revoke all on function public.upsert_game_session(jsonb) from public;
grant execute on function public.upsert_game_session(jsonb) to anon, authenticated;

comment on table public.sessions is 'Buratino game sessions: progress, stats, and full JSON dump';
comment on table public.quiz_answers is 'Quiz answers per level';
comment on table public.dialogue_choices is 'Dialogue choices and their coin/wisdom effects';
comment on table public.test_results is 'Scenario / complex / post test results';
comment on table public.material_views is 'Educational material view durations';
comment on function public.upsert_game_session(jsonb) is 'Anon-safe upsert for research clients; no SELECT on tables for anon';
