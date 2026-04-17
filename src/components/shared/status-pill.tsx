import type { JobStatus } from "@/lib/types";

const labels: Record<JobStatus, string> = {
  checked_in: "Checked in",
  diagnosing: "Diagnosing",
  waiting_approval: "Waiting approval",
  approved: "Approved",
  in_progress: "In progress",
  waiting_parts: "Waiting parts",
  ready: "Ready",
  completed: "Completed"
};

export function StatusPill({ status }: { status: JobStatus }) {
  return <span className={`status-pill ${status}`}>{labels[status]}</span>;
}
