import Link from "next/link";

import { PageIntro } from "@/components/shared/page-intro";
import { createVehicle } from "@/features/vehicles/actions";
import { getVehicles } from "@/features/vehicles/queries";
import { readStore } from "@/lib/store";

export default async function VehiclesPage() {
  const vehicles = await getVehicles();
  const store = await readStore();

  return (
    <>
      <PageIntro
        eyebrow="Vehicle records"
        title="Tie each job to the exact car, not just the customer memory at the counter."
        description="Every plate, VIN, mileage snapshot, and recurring issue needs to stay attached to the vehicle itself."
      />

      <div className="two-column-grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Vehicle directory</p>
              <h2>Current garage records</h2>
            </div>
          </div>

          <div className="list-stack">
            {vehicles.map((vehicle) => (
              <Link className="list-row" href={`/vehicles/${vehicle.id}`} key={vehicle.id}>
                <div>
                  <strong>
                    {vehicle.make} {vehicle.model}
                  </strong>
                  <p>
                    {vehicle.plateNumber} · {vehicle.customer?.fullName ?? "No customer"}
                  </p>
                </div>
                <span className="muted">{vehicle.mileage.toLocaleString("en-BA")} km</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Add vehicle</p>
              <h2>Create vehicle profile</h2>
            </div>
          </div>

          <form action={createVehicle} className="mini-form">
            <label>
              Customer
              <select defaultValue={store.customers[0]?.id} name="customerId" required>
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
                <input name="plateNumber" placeholder="SA-000-AA" required />
              </label>
              <label>
                VIN
                <input name="vin" placeholder="Vehicle identification number" required />
              </label>
            </div>
            <div className="field-grid">
              <label>
                Make
                <input name="make" placeholder="Audi" required />
              </label>
              <label>
                Model
                <input name="model" placeholder="A4" required />
              </label>
            </div>
            <div className="field-grid">
              <label>
                Year
                <input name="year" placeholder="2020" required type="number" />
              </label>
              <label>
                Mileage
                <input name="mileage" placeholder="145000" required type="number" />
              </label>
            </div>
            <div className="field-grid">
              <label>
                Engine
                <input name="engine" placeholder="2.0 TDI" required />
              </label>
              <label>
                Color
                <input name="color" placeholder="Grey" required />
              </label>
            </div>
            <button className="primary-button" type="submit">
              Create vehicle
            </button>
          </form>
        </section>
      </div>
    </>
  );
}
