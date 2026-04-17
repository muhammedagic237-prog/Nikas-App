import { notFound } from "next/navigation";

import { PageIntro } from "@/components/shared/page-intro";
import { deleteCustomer, updateCustomer } from "@/features/customers/actions";
import { getCustomerById } from "@/features/customers/queries";

export default async function CustomerDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getCustomerById(id);

  if (!data) {
    notFound();
  }

  return (
    <>
      <PageIntro
        eyebrow="Customer profile"
        title={data.customer.fullName}
        description="Update contact details, capture service notes, and keep the vehicle relationship attached to one record."
      />

      <div className="detail-grid">
        <section>
          <p className="eyebrow">Edit profile</p>
          <form action={updateCustomer.bind(null, data.customer.id)} className="mini-form">
            <label>
              Full name
              <input defaultValue={data.customer.fullName} name="fullName" required />
            </label>
            <label>
              Phone
              <input defaultValue={data.customer.phone} name="phone" required />
            </label>
            <label>
              Email
              <input defaultValue={data.customer.email} name="email" type="email" required />
            </label>
            <label>
              Address
              <input defaultValue={data.customer.address} name="address" required />
            </label>
            <label>
              Notes
              <textarea defaultValue={data.customer.notes} name="notes" />
            </label>
            <div className="split-actions">
              <button className="primary-button" type="submit">
                Save customer
              </button>
              <button className="danger-button" formAction={deleteCustomer.bind(null, data.customer.id)} type="submit">
                Delete customer
              </button>
            </div>
          </form>
        </section>

        <section>
          <p className="eyebrow">Linked vehicles</p>
          <div className="list-stack">
            {data.vehicles.length ? (
              data.vehicles.map((vehicle) => (
                <div className="list-row" key={vehicle.id}>
                  <div>
                    <strong>
                      {vehicle.make} {vehicle.model}
                    </strong>
                    <p>{vehicle.plateNumber}</p>
                  </div>
                  <span className="muted">{vehicle.mileage.toLocaleString("en-BA")} km</span>
                </div>
              ))
            ) : (
              <p className="muted">No vehicles linked yet.</p>
            )}
          </div>
        </section>

        <section className="full-span">
          <p className="eyebrow">Service history</p>
          <div className="list-stack">
            {data.jobs.length ? (
              data.jobs.map((job) => (
                <div className="list-row" key={job.id}>
                  <div>
                    <strong>{job.jobNumber}</strong>
                    <p>{job.complaint}</p>
                  </div>
                  <span className="muted">{job.status.replace("_", " ")}</span>
                </div>
              ))
            ) : (
              <p className="muted">No jobs have been recorded for this customer yet.</p>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
