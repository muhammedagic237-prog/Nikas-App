# GarageFlow MVP Blueprint

## Core Workflow

1. Front desk creates a job when a car arrives.
2. Technician performs an inspection and adds notes and media.
3. Service advisor builds an estimate.
4. Customer approves or declines work from a phone link.
5. Shop completes the repair and issues an invoice.

## Primary Pages

- `/login`
- `/dashboard`
- `/customers`
- `/customers/[id]`
- `/vehicles`
- `/vehicles/[id]`
- `/jobs`
- `/jobs/new`
- `/jobs/[id]`
- `/approvals/[token]`
- `/invoices/[id]`
- `/settings`

## Core Tables

- `shops`
- `profiles`
- `customers`
- `vehicles`
- `jobs`
- `job_status_history`
- `inspections`
- `inspection_items`
- `media`
- `estimates`
- `estimate_items`
- `approvals`
- `parts_orders`
- `parts_order_items`
- `invoices`
- `payments`
- `notes`

## First Implementation Slice

1. App shell and auth
2. Supabase schema and RLS
3. Customers CRUD
4. Vehicles CRUD
5. Jobs CRUD
6. Jobs list and job detail skeleton
