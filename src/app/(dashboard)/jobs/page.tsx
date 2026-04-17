import Link from "next/link";

import { PageIntro } from "@/components/shared/page-intro";
import { StatusPill } from "@/components/shared/status-pill";
import { getJobs } from "@/features/jobs/queries";
import { formatDate } from "@/lib/format";

export default async function JobsPage() {
  const jobs = await getJobs();

  return (
    <>
      <PageIntro
        eyebrow="Repair jobs"
        title="Track every job from the first complaint to the final keys-on-counter handoff."
        description="This board is the working center of the MVP: each repair order shows customer, vehicle, status, and who owns the next move."
      />

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Repair board</p>
            <h2>Open job cards</h2>
          </div>
          <Link className="primary-button" href="/jobs/new">
            Create job
          </Link>
        </div>

        <div className="table-grid">
          <div className="table-head">
            <span>Job</span>
            <span>Customer</span>
            <span>Assigned</span>
            <span>Due</span>
          </div>

          {jobs.map((job) => (
            <Link className="table-row" href={`/jobs/${job.id}`} key={job.id}>
              <div>
                <strong>{job.jobNumber}</strong>
                <small>{job.vehicle ? `${job.vehicle.make} ${job.vehicle.model}` : "Vehicle missing"}</small>
              </div>
              <div>
                <strong>{job.customer?.fullName ?? "Unknown customer"}</strong>
                <small>{job.complaint}</small>
              </div>
              <div>
                <StatusPill status={job.status} />
                <small>{job.technician?.fullName ?? "Unassigned tech"}</small>
              </div>
              <div>
                <strong>{formatDate(job.dueAt)}</strong>
                <small>{job.advisor?.fullName ?? "No advisor"}</small>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
