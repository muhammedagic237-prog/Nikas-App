import Link from "next/link";

import { PageIntro } from "@/components/shared/page-intro";
import { StatBlock } from "@/components/shared/stat-block";
import { StatusPill } from "@/components/shared/status-pill";
import { getDashboardSnapshot } from "@/features/dashboard/queries";
import { formatDate, formatMoney } from "@/lib/format";

export default async function DashboardPage() {
  const snapshot = await getDashboardSnapshot();

  return (
    <>
      <PageIntro
        eyebrow="Dispatch overview"
        title="One cockpit for jobs waiting at the counter and jobs already on the lift."
        description="The first build slice gives the shop one clean board for priorities, active work, and the signals that are easiest to miss when the day gets noisy."
      />

      <section className="stats-grid">
        <StatBlock label="Waiting approval" value={String(snapshot.waitingApproval)} tone="accent" />
        <StatBlock label="In progress" value={String(snapshot.inProgress)} />
        <StatBlock label="Ready for pickup" value={String(snapshot.ready)} />
        <StatBlock label="Issued invoices" value={formatMoney(snapshot.todayRevenue)} />
      </section>

      <div className="two-column-grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Open board</p>
              <h2>Jobs moving today</h2>
            </div>
            <Link className="ghost-button" href="/jobs/new">
              New job
            </Link>
          </div>

          <div className="list-stack">
            {snapshot.jobs.map((job) => (
              <Link className="list-row" key={job.id} href={`/jobs/${job.id}`}>
                <div>
                  <strong>{job.jobNumber}</strong>
                  <p>{job.complaint}</p>
                </div>
                <div className="topbar-actions">
                  <StatusPill status={job.status} />
                  <span className="muted">Due {formatDate(job.dueAt)}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Recent signals</p>
              <h2>Timeline pulse</h2>
            </div>
          </div>

          <div className="timeline-list">
            {snapshot.timeline.map((entry) => (
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
