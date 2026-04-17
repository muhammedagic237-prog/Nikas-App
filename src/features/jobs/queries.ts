import { readStore } from "@/lib/store";

export async function getJobs() {
  const store = await readStore();

  return store.jobs.map((job) => ({
    ...job,
    customer: store.customers.find((customer) => customer.id === job.customerId) ?? null,
    vehicle: store.vehicles.find((vehicle) => vehicle.id === job.vehicleId) ?? null,
    advisor: store.users.find((user) => user.id === job.assignedAdvisorId) ?? null,
    technician: store.users.find((user) => user.id === job.assignedTechnicianId) ?? null
  }));
}

export async function getJobById(id: string) {
  const store = await readStore();
  const job = store.jobs.find((entry) => entry.id === id);

  if (!job) {
    return null;
  }

  const estimate = store.estimates.find((entry) => entry.jobId === id) ?? null;
  const approval = estimate
    ? store.approvals.find((entry) => entry.estimateId === estimate.id) ?? null
    : null;
  const invoice = store.invoices.find((entry) => entry.jobId === id) ?? null;

  return {
    job,
    customer: store.customers.find((customer) => customer.id === job.customerId) ?? null,
    vehicle: store.vehicles.find((vehicle) => vehicle.id === job.vehicleId) ?? null,
    advisor: store.users.find((user) => user.id === job.assignedAdvisorId) ?? null,
    technician: store.users.find((user) => user.id === job.assignedTechnicianId) ?? null,
    estimate,
    approval,
    invoice,
    timeline: store.timeline
      .filter((entry) => entry.jobId === id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  };
}
