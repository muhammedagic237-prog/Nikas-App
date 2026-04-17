import Link from "next/link";

import { PageIntro } from "@/components/shared/page-intro";
import { createCustomer } from "@/features/customers/actions";
import { getCustomers } from "@/features/customers/queries";

export default async function CustomersPage() {
  const customers = await getCustomers();

  return (
    <>
      <PageIntro
        eyebrow="Customer records"
        title="Keep every driver, vehicle handoff, and service relationship easy to recover."
        description="This list is the clean source of truth for who the shop is serving and how much history sits behind each visit."
      />

      <div className="two-column-grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Active customers</p>
              <h2>Customer directory</h2>
            </div>
          </div>

          <div className="list-stack">
            {customers.map((customer) => (
              <Link className="list-row" href={`/customers/${customer.id}`} key={customer.id}>
                <div>
                  <strong>{customer.fullName}</strong>
                  <p>{customer.phone}</p>
                </div>
                <div className="topbar-actions">
                  <span className="muted">{customer.vehicles.length} vehicles</span>
                  <span className="muted">{customer.jobs.length} jobs</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">New profile</p>
              <h2>Create customer</h2>
            </div>
          </div>

          <form action={createCustomer} className="mini-form">
            <label>
              Full name
              <input name="fullName" placeholder="Customer name" required />
            </label>
            <label>
              Phone
              <input name="phone" placeholder="+387 ..." required />
            </label>
            <label>
              Email
              <input name="email" placeholder="name@example.com" type="email" required />
            </label>
            <label>
              Address
              <input name="address" placeholder="Street and city" required />
            </label>
            <label>
              Notes
              <textarea name="notes" placeholder="Pickup preferences, approval rules, reminders" />
            </label>
            <button className="primary-button" type="submit">
              Create customer
            </button>
          </form>
        </section>
      </div>
    </>
  );
}
