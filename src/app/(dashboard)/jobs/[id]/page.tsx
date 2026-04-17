import Link from "next/link";
import { notFound } from "next/navigation";

import { PageIntro } from "@/components/shared/page-intro";
import { StatusPill } from "@/components/shared/status-pill";
import { deleteJob, updateJob } from "@/features/jobs/actions";
import { getJobById } from "@/features/jobs/queries";
import { formatDate, formatMoney } from "@/lib/format";
import { readStore } from "@/lib/store";

const statusOptions = [
  "checked_in",
  "diagnosing",
  "waiting_approval",
  "approved",
  "in_progress",
  "waiting_parts",
  "ready",
  "completed"
] as const;

export default async function JobDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getJobById(id);
  const store = await readStore();

  if (!data) {
    notFound();
  }

  return (
    <>
      <PageIntro
        eyebrow="Repair order"
        title={data.job.jobNumber}
        description="This is the operating surface for the job: assignment, status, estimate signal, invoice state, and the timeline that explains how the car got here."
      />

      <div className="cards-grid">
        <div className="surface-tile">
          <p className="eyebrow">Customer</p>
          <strong>{data.customer?.fullName ?? "Unknown customer"}</strong>
          <p className="muted">{data.customer?.phone ?? "No phone recorded"}</p>
        </div>
        <div className="surface-tile">
          <p className="eyebrow">Vehicle</p>
          <strong>
            {data.vehicle?.make} {data.vehicle?.model}
          </strong>
          <p className="muted">{data.vehicle?.plateNumber ?? "No plate"}</p>
        </div>
        <div className="surface-tile">
          <p className="eyebrow">Status</p>
          <StatusPill status={data.job.status} />
          <p className="muted">Due {formatDate(data.job.dueAt)}</p>
        </div>
        <div className="surface-tile">
          <p className="eyebrow">Estimate signal</p>
          <strong>{data.estimate ? formatMoney(data.estimate.total) : "Not drafted"}</strong>
          <p className="muted">
            {data.approval ? `Approval: ${data.approval.status}` : "No approval route yet"}
          </p>
        </div>
      </div>

      <div className="detail-grid">
        <section>
          <p className="eyebrow">Update job</p>
          <form action={updateJob.bind(null, data.job.id)} className="mini-form">
            <label>
              Status
              <select defaultValue={data.job.status} name="status">
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option.replace("_", " ")}
                  </option>
                ))}
              </select>
            </label>

            <div className="field-grid">
              <label>
                Advisor
                <select defaultValue={data.job.assignedAdvisorId} name="assignedAdvisorId">
                  {store.users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.fullName}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Technician
                <select defaultValue={data.job.assignedTechnicianId} name="assignedTechnicianId">
                  {store.users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.fullName}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label>
              Complaint
              <textarea defaultValue={data.job.complaint} name="complaint" />
            </label>

            <label>
              Internal notes
              <textarea defaultValue={data.job.internalNotes} name="internalNotes" />
            </label>

            <label>
              Due at
              <input defaultValue={data.job.dueAt.slice(0, 16)} name="dueAt" type="datetime-local" />
            </label>

            <div className="split-actions">
              <button className="primary-button" type="submit">
                Save job
              </button>
              <button className="danger-button" formAction={deleteJob.bind(null, data.job.id)} type="submit">
                Delete job
              </button>
            </div>
          </form>
        </section>

        <section>
          <p className="eyebrow">Commercial state</p>
          <dl className="key-value-list">
            <div>
              <dt>Estimate</dt>
              <dd>{data.estimate ? formatMoney(data.estimate.total) : "Not drafted"}</dd>
            </div>
            <div>
              <dt>Approval page</dt>
              <dd>
                {data.approval ? <Link href={`/approvals/${data.approval.token}`}>Open approval</Link> : "Unavailable"}
              </dd>
            </div>
            <div>
              <dt>Invoice</dt>
              <dd>{data.invoice ? data.invoice.invoiceNumber : "Not issued"}</dd>
            </div>
            <div>
              <dt>Invoice total</dt>
              <dd>{data.invoice ? formatMoney(data.invoice.total) : "Pending"}</dd>
            </div>
          </dl>
        </section>

        <section className="full-span">
          <p className="eyebrow">Timeline</p>
          <div className="timeline-list">
            {data.timeline.map((entry) => (
              <div className="timeline-item" key={entry.id}>
                <p>{entry.message}</p>
                <span className="muted">{formatDate(entry.createdAt)}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
