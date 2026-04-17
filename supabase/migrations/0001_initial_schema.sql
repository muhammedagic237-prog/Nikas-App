create extension if not exists "pgcrypto";

create type public.staff_role as enum ('owner', 'advisor', 'technician');
create type public.job_status as enum ('checked_in', 'diagnosing', 'waiting_approval', 'approved', 'in_progress', 'waiting_parts', 'ready', 'completed');
create type public.estimate_status as enum ('draft', 'sent', 'approved', 'declined');
create type public.approval_status as enum ('pending', 'approved', 'declined');
create type public.invoice_status as enum ('draft', 'issued', 'paid');

create table if not exists public.shops (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text not null,
  address text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  shop_id uuid not null references public.shops(id) on delete cascade,
  full_name text not null,
  role public.staff_role not null,
  created_at timestamptz not null default now()
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  full_name text not null,
  phone text not null,
  email text not null,
  address text not null,
  notes text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  vin text not null,
  plate_number text not null,
  make text not null,
  model text not null,
  year integer not null,
  engine text not null,
  color text not null,
  mileage integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  job_number text not null unique,
  status public.job_status not null default 'checked_in',
  complaint text not null,
  internal_notes text not null default '',
  assigned_advisor_id uuid references public.profiles(id) on delete set null,
  assigned_technician_id uuid references public.profiles(id) on delete set null,
  check_in_at timestamptz not null default now(),
  due_at timestamptz not null,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.job_status_history (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  from_status public.job_status,
  to_status public.job_status not null,
  changed_by uuid references public.profiles(id) on delete set null,
  changed_at timestamptz not null default now()
);

create table if not exists public.estimates (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  status public.estimate_status not null default 'draft',
  subtotal numeric(12, 2) not null default 0,
  tax numeric(12, 2) not null default 0,
  total numeric(12, 2) not null default 0,
  notes text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.approvals (
  id uuid primary key default gen_random_uuid(),
  estimate_id uuid not null references public.estimates(id) on delete cascade,
  token text not null unique,
  status public.approval_status not null default 'pending',
  customer_message text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  invoice_number text not null unique,
  status public.invoice_status not null default 'draft',
  subtotal numeric(12, 2) not null default 0,
  tax numeric(12, 2) not null default 0,
  total numeric(12, 2) not null default 0,
  issued_at timestamptz not null default now(),
  paid_at timestamptz
);
