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

create table if not exists public.staff_members (
    user_id uuid primary key references auth.users (id) on delete cascade,
    role text not null check (role in ('ADMIN', 'COORDINATOR')),
    club text,
    check (
        (role = 'ADMIN' and club is null)
        or (role = 'COORDINATOR' and club in (
            'i-Tech Hub',
            'Stage & Spotlight',
            'Social Impact',
            'Art & Expression',
            'Voice & Vision',
            'Nature Warrior',
            'Frame & Focus'
        ))
    )
);

alter table public.profiles enable row level security;  
alter table public.registrations enable row level security;
alter table public.staff_members enable row level security;

revoke all on public.profiles from anon, authenticated;
revoke all on public.registrations from anon, authenticated;
revoke all on public.staff_members from anon, authenticated;
grant select on public.profiles to authenticated;
grant select, insert on public.registrations to authenticated;
grant select on public.staff_members to authenticated;

create or replace function public.current_staff_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
    select role
    from public.staff_members
    where user_id = (select auth.uid())
$$;

create or replace function public.current_staff_club()
returns text
language sql
stable
security definer
set search_path = ''
as $$
    select club
    from public.staff_members
    where user_id = (select auth.uid())
$$;

revoke all on function public.current_staff_role() from public, anon;
revoke all on function public.current_staff_club() from public, anon;
grant execute on function public.current_staff_role() to authenticated;
grant execute on function public.current_staff_club() to authenticated;

drop policy if exists "Staff can read their own access" on public.staff_members;
create policy "Staff can read their own access"
    on public.staff_members for select to authenticated
    using ((select auth.uid()) = user_id);

drop policy if exists "Students can read their own profile" on public.profiles;
create policy "Students can read their own profile"
    on public.profiles for select to authenticated
    using (
        (select auth.uid()) = id
        or (select public.current_staff_role()) = 'ADMIN'
        or (
            (select public.current_staff_role()) = 'COORDINATOR'
            and exists (
                select 1
                from public.registrations
                where registrations.student_id = profiles.id
                    and registrations.club = (select public.current_staff_club())
            )
        )
    );

drop policy if exists "Students can read their own registrations" on public.registrations;
create policy "Students can read their own registrations"
    on public.registrations for select to authenticated
    using (
        (select auth.uid()) = student_id
        or (select public.current_staff_role()) = 'ADMIN'
        or (
            (select public.current_staff_role()) = 'COORDINATOR'
            and club = (select public.current_staff_club())
        )
    );

drop policy if exists "Students can create their own registrations" on public.registrations;
create policy "Students can create their own registrations"
    on public.registrations for insert to authenticated
    with check (
        (select auth.uid()) = student_id
        and exists (
            select 1
            from public.profiles
            where profiles.id = (select auth.uid())
                and profiles.role = 'STUDENT'
        )
    );

create or replace function public.create_student_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    if new.raw_user_meta_data ->> 'roll_number' is null then
        return new;
    end if;

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
