import { readStore } from "@/lib/store";

export async function getDashboardSnapshot() {
  const store = await readStore();

  return {
    waitingApproval: store.jobs.filter((job) => job.status === "waiting_approval").length,
    inProgress: store.jobs.filter((job) => job.status === "in_progress").length,
    ready: store.jobs.filter((job) => job.status === "ready").length,
    todayRevenue: store.invoices.reduce((sum, invoice) => sum + invoice.total, 0),
    jobs: store.jobs,
    timeline: [...store.timeline].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5)
  };
}
