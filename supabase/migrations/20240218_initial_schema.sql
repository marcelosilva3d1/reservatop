-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade,
  name text,
  email text unique,
  phone text,
  role text check (role in ('admin', 'professional', 'client')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (id)
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Create professionals table
create table public.professionals (
  id uuid references auth.users on delete cascade,
  name text not null,
  email text unique not null,
  phone text,
  profile_url text unique,
  profession text,
  bio text,
  avatar text,
  cover_image text,
  status text check (status in ('pending', 'approved', 'rejected', 'blocked')) default 'pending',
  rejection_reason text,
  address jsonb,
  services jsonb[],
  working_hours jsonb[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (id)
);

-- Enable RLS
alter table public.professionals enable row level security;

-- Create appointments table
create table public.appointments (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references profiles(id) on delete cascade,
  professional_id uuid references professionals(id) on delete cascade,
  service_id text,
  date date not null,
  time time not null,
  status text check (status in ('pending', 'confirmed', 'cancelled', 'completed')) default 'pending',
  cancellation_reason text,
  service_name text not null,
  client_name text not null,
  client_phone text,
  professional_name text not null,
  price numeric(10,2),
  duration integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.appointments enable row level security;

-- Create RLS policies

-- Profiles policies
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Professionals policies
create policy "Anyone can view approved professionals"
  on public.professionals for select
  using (status = 'approved');

create policy "Professionals can view and update their own profile"
  on public.professionals for all
  using (auth.uid() = id);

create policy "Admins can view all professionals"
  on public.professionals for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Appointments policies
create policy "Users can view their own appointments"
  on public.appointments for select
  using (
    client_id = auth.uid() or
    professional_id = auth.uid() or
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

create policy "Users can create appointments"
  on public.appointments for insert
  with check (true);

create policy "Users can update their own appointments"
  on public.appointments for update
  using (
    client_id = auth.uid() or
    professional_id = auth.uid() or
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Create storage bucket
insert into storage.buckets (id, name)
values ('images', 'images');

-- Set up storage policies
create policy "Anyone can view images"
  on storage.objects for select
  using ( bucket_id = 'images' );

create policy "Authenticated users can upload images"
  on storage.objects for insert
  with check (
    bucket_id = 'images' and
    auth.role() = 'authenticated'
  );

create policy "Users can update their own images"
  on storage.objects for update
  using (
    bucket_id = 'images' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create functions
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'role', 'client'));
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
