import { PageIntro } from "@/components/shared/page-intro";
import { createJob } from "@/features/jobs/actions";
import { readStore } from "@/lib/store";

export default async function NewJobPage() {
  const store = await readStore();

  return (
    <>
      <PageIntro
        eyebrow="New repair order"
        title="Check the car in with enough detail that the next handoff is frictionless."
        description="A good job card keeps the front desk, the technician, and the customer aligned before the wrench work even starts."
      />

      <section className="panel">
        <form action={createJob} className="mini-form">
          <div className="field-grid">
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
            <label>
              Vehicle
              <select defaultValue={store.vehicles[0]?.id} name="vehicleId" required>
                {store.vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.make} {vehicle.model} · {vehicle.plateNumber}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="field-grid">
            <label>
              Advisor
              <select defaultValue={store.users[1]?.id} name="assignedAdvisorId" required>
                {store.users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.fullName} · {user.role}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Technician
              <select defaultValue={store.users[2]?.id} name="assignedTechnicianId" required>
                {store.users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.fullName} · {user.role}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label>
            Customer complaint
            <textarea
              name="complaint"
              placeholder="What did the customer report and when does it happen?"
              required
            />
          </label>

          <label>
            Internal notes
            <textarea
              name="internalNotes"
              placeholder="Initial observations, risk flags, or promised follow-up."
            />
          </label>

          <label>
            Due at
            <input defaultValue="2026-04-16T16:00" name="dueAt" required type="datetime-local" />
          </label>

          <button className="primary-button" type="submit">
            Create repair order
          </button>
        </form>
      </section>
    </>
  );
}
