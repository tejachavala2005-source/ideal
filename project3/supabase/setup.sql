create table if not exists public.profiles (
    id uuid primary key references auth.users (id) on delete cascade,
    roll_number text not null unique
        check (char_length(roll_number) between 1 and 40),
    full_name text not null,
    mobile text not null check (mobile ~ '^[0-9]{10}$'),
    year text not null,
    group_name text not null,
    role text not null default 'STUDENT' check (role = 'STUDENT'),
    created_at timestamptz not null default now()
);

create table if not exists public.registrations (
    id uuid primary key default gen_random_uuid(),
    student_id uuid not null references public.profiles (id) on delete cascade,
    type text not null check (type in ('Club Join', 'Competition')),
    title text not null,
    club text not null,
    created_at timestamptz not null default now(),
    unique (student_id, type, title)
);

alter table public.profiles enable row level security;
alter table public.registrations enable row level security;

revoke all on public.profiles from anon, authenticated;
revoke all on public.registrations from anon, authenticated;
grant select on public.profiles to authenticated;
grant select, insert on public.registrations to authenticated;

drop policy if exists "Students can read their own profile" on public.profiles;
create policy "Students can read their own profile"
    on public.profiles for select to authenticated
    using ((select auth.uid()) = id);

drop policy if exists "Students can read their own registrations" on public.registrations;
create policy "Students can read their own registrations"
    on public.registrations for select to authenticated
    using ((select auth.uid()) = student_id);

drop policy if exists "Students can create their own registrations" on public.registrations;
create policy "Students can create their own registrations"
    on public.registrations for insert to authenticated
    with check ((select auth.uid()) = student_id);

create or replace function public.create_student_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    insert into public.profiles (
        id, roll_number, full_name, mobile, year, group_name
    )
    values (
        new.id,
        upper(trim(new.raw_user_meta_data ->> 'roll_number')),
        trim(new.raw_user_meta_data ->> 'full_name'),
        trim(new.raw_user_meta_data ->> 'mobile'),
        trim(new.raw_user_meta_data ->> 'year'),
        trim(new.raw_user_meta_data ->> 'group_name')
    );
    return new;
end;
$$;

revoke all on function public.create_student_profile() from public, anon, authenticated;

drop trigger if exists create_student_profile on auth.users;
create trigger create_student_profile
    after insert on auth.users
    for each row execute function public.create_student_profile();
