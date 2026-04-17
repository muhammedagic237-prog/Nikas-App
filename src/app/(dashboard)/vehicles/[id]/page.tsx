import { notFound } from "next/navigation";

import { PageIntro } from "@/components/shared/page-intro";
import { deleteVehicle, updateVehicle } from "@/features/vehicles/actions";
import { getVehicleById } from "@/features/vehicles/queries";
import { readStore } from "@/lib/store";

export default async function VehicleDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getVehicleById(id);
  const store = await readStore();

  if (!data) {
    notFound();
  }

  return (
    <>
      <PageIntro
        eyebrow="Vehicle profile"
        title={`${data.vehicle.make} ${data.vehicle.model}`}
        description="Keep the spec sheet, ownership link, and job history attached to the vehicle so the next visit starts with context."
      />

      <div className="detail-grid">
        <section>
          <p className="eyebrow">Edit vehicle</p>
          <form action={updateVehicle.bind(null, data.vehicle.id)} className="mini-form">
            <label>
              Customer
              <select defaultValue={data.vehicle.customerId} name="customerId" required>
                {store.customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.fullName}
                  </option>
                ))}
              </select>
            </label>
            <div className="field-grid">
              <label>
                Plate number
                <input defaultValue={data.vehicle.plateNumber} name="plateNumber" required />
              </label>
              <label>
                VIN
                <input defaultValue={data.vehicle.vin} name="vin" required />
              </label>
            </div>
            <div className="field-grid">
              <label>
                Make
                <input defaultValue={data.vehicle.make} name="make" required />
              </label>
              <label>
                Model
                <input defaultValue={data.vehicle.model} name="model" required />
              </label>
            </div>
            <div className="field-grid">
              <label>
                Year
                <input defaultValue={data.vehicle.year} name="year" required type="number" />
              </label>
              <label>
                Mileage
                <input defaultValue={data.vehicle.mileage} name="mileage" required type="number" />
              </label>
            </div>
            <div className="field-grid">
              <label>
                Engine
                <input defaultValue={data.vehicle.engine} name="engine" required />
              </label>
              <label>
                Color
                <input defaultValue={data.vehicle.color} name="color" required />
              </label>
            </div>
            <div className="split-actions">
              <button className="primary-button" type="submit">
                Save vehicle
              </button>
              <button className="danger-button" formAction={deleteVehicle.bind(null, data.vehicle.id)} type="submit">
                Delete vehicle
              </button>
            </div>
          </form>
        </section>

        <section>
          <p className="eyebrow">Vehicle snapshot</p>
          <dl className="key-value-list">
            <div>
              <dt>Owner</dt>
              <dd>{data.customer?.fullName ?? "Unknown"}</dd>
            </div>
            <div>
              <dt>Plate</dt>
              <dd>{data.vehicle.plateNumber}</dd>
            </div>
            <div>
              <dt>VIN</dt>
              <dd>{data.vehicle.vin}</dd>
            </div>
            <div>
              <dt>Mileage</dt>
              <dd>{data.vehicle.mileage.toLocaleString("en-BA")} km</dd>
            </div>
          </dl>
        </section>

        <section className="full-span">
          <p className="eyebrow">Job history</p>
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
              <p className="muted">No jobs have been linked to this vehicle yet.</p>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
