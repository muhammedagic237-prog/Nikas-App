alter table public.shops enable row level security;
alter table public.profiles enable row level security;
alter table public.customers enable row level security;
alter table public.vehicles enable row level security;
alter table public.jobs enable row level security;
alter table public.job_status_history enable row level security;
alter table public.estimates enable row level security;
alter table public.approvals enable row level security;
alter table public.invoices enable row level security;

create or replace function public.current_shop_id()
returns uuid
language sql
stable
as $$
  select shop_id from public.profiles where id = auth.uid()
$$;

create policy "shop members can read shops"
on public.shops for select
using (id = public.current_shop_id());

create policy "shop members can manage profiles"
on public.profiles for all
using (shop_id = public.current_shop_id())
with check (shop_id = public.current_shop_id());

create policy "shop members can manage customers"
on public.customers for all
using (shop_id = public.current_shop_id())
with check (shop_id = public.current_shop_id());

create policy "shop members can manage vehicles"
on public.vehicles for all
using (shop_id = public.current_shop_id())
with check (shop_id = public.current_shop_id());

create policy "shop members can manage jobs"
on public.jobs for all
using (shop_id = public.current_shop_id())
with check (shop_id = public.current_shop_id());

create policy "shop members can manage history"
on public.job_status_history for all
using (
  exists (
    select 1 from public.jobs
    where public.jobs.id = public.job_status_history.job_id
      and public.jobs.shop_id = public.current_shop_id()
  )
)
with check (
  exists (
    select 1 from public.jobs
    where public.jobs.id = public.job_status_history.job_id
      and public.jobs.shop_id = public.current_shop_id()
  )
);

create policy "shop members can manage estimates"
on public.estimates for all
using (
  exists (
    select 1 from public.jobs
    where public.jobs.id = public.estimates.job_id
      and public.jobs.shop_id = public.current_shop_id()
  )
)
with check (
  exists (
    select 1 from public.jobs
    where public.jobs.id = public.estimates.job_id
      and public.jobs.shop_id = public.current_shop_id()
  )
);

create policy "shop members can manage approvals"
on public.approvals for all
using (
  exists (
    select 1
    from public.estimates
    join public.jobs on public.jobs.id = public.estimates.job_id
    where public.estimates.id = public.approvals.estimate_id
      and public.jobs.shop_id = public.current_shop_id()
  )
)
with check (
  exists (
    select 1
    from public.estimates
    join public.jobs on public.jobs.id = public.estimates.job_id
    where public.estimates.id = public.approvals.estimate_id
      and public.jobs.shop_id = public.current_shop_id()
  )
);

create policy "public approval lookup by token"
on public.approvals for select
using (true);

create policy "shop members can manage invoices"
on public.invoices for all
using (
  exists (
    select 1 from public.jobs
    where public.jobs.id = public.invoices.job_id
      and public.jobs.shop_id = public.current_shop_id()
  )
)
with check (
  exists (
    select 1 from public.jobs
    where public.jobs.id = public.invoices.job_id
      and public.jobs.shop_id = public.current_shop_id()
  )
);
