import { notFound } from "next/navigation";

import { PageIntro } from "@/components/shared/page-intro";
import { formatMoney } from "@/lib/format";
import { readStore } from "@/lib/store";

export default async function ApprovalPage({
  params
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const store = await readStore();
  const approval = store.approvals.find((entry) => entry.token === token);

  if (!approval) {
    notFound();
  }

  const estimate = store.estimates.find((entry) => entry.id === approval.estimateId);
  const job = estimate ? store.jobs.find((entry) => entry.id === estimate.jobId) ?? null : null;
  const customer = job ? store.customers.find((entry) => entry.id === job.customerId) ?? null : null;
  const vehicle = job ? store.vehicles.find((entry) => entry.id === job.vehicleId) ?? null : null;

  return (
    <div className="landing-shell">
      <div className="auth-grid">
        <section className="hero-panel">
          <p className="eyebrow">Customer approval</p>
          <h1>Review the proposed repair before the shop continues.</h1>
          <p>
            This route is the public-facing approval surface. In the next slice we can wire the approve and decline
            buttons directly to persisted estimate status updates.
          </p>
        </section>

        <section className="form-panel">
          <PageIntro
            eyebrow="Estimate summary"
            title={customer?.fullName ?? "Customer"}
            description={`${vehicle?.make ?? ""} ${vehicle?.model ?? ""} · ${vehicle?.plateNumber ?? ""}`}
          />

          <dl className="key-value-list">
            <div>
              <dt>Approval status</dt>
              <dd>{approval.status}</dd>
            </div>
            <div>
              <dt>Repair total</dt>
              <dd>{estimate ? formatMoney(estimate.total) : "Unavailable"}</dd>
            </div>
            <div>
              <dt>Scope</dt>
              <dd>{estimate?.notes ?? "Estimate details pending"}</dd>
            </div>
          </dl>

          <div className="inline-actions">
            <button className="primary-button" type="button">
              Approve work
            </button>
            <button className="ghost-button" type="button">
              Ask for a callback
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
