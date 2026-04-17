"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { makeId, makeJobNumber, readStore, writeStore } from "@/lib/store";
import type { JobStatus } from "@/lib/types";

const statuses: JobStatus[] = [
  "checked_in",
  "diagnosing",
  "waiting_approval",
  "approved",
  "in_progress",
  "waiting_parts",
  "ready",
  "completed"
];

export async function createJob(formData: FormData) {
  const store = await readStore();
  const jobId = makeId("job");

  store.jobs.unshift({
    id: jobId,
    shopId: "shop_1",
    customerId: String(formData.get("customerId") ?? ""),
    vehicleId: String(formData.get("vehicleId") ?? ""),
    jobNumber: makeJobNumber(store.jobs.length),
    status: "checked_in",
    complaint: String(formData.get("complaint") ?? "").trim(),
    internalNotes: String(formData.get("internalNotes") ?? "").trim(),
    assignedAdvisorId: String(formData.get("assignedAdvisorId") ?? ""),
    assignedTechnicianId: String(formData.get("assignedTechnicianId") ?? ""),
    checkInAt: new Date().toISOString(),
    dueAt: new Date(String(formData.get("dueAt") ?? new Date().toISOString())).toISOString(),
    completedAt: null
  });

  store.timeline.unshift({
    id: makeId("event"),
    jobId,
    type: "system",
    message: "Job created and checked in.",
    createdAt: new Date().toISOString()
  });

  await writeStore(store);
  revalidatePath("/jobs");
  redirect(`/jobs/${jobId}`);
}

export async function updateJob(id: string, formData: FormData) {
  const store = await readStore();
  const job = store.jobs.find((entry) => entry.id === id);

  if (!job) {
    return;
  }

  const nextStatus = String(formData.get("status") ?? job.status) as JobStatus;
  const previousStatus = job.status;

  job.complaint = String(formData.get("complaint") ?? "").trim();
  job.internalNotes = String(formData.get("internalNotes") ?? "").trim();
  job.assignedAdvisorId = String(formData.get("assignedAdvisorId") ?? "");
  job.assignedTechnicianId = String(formData.get("assignedTechnicianId") ?? "");
  job.dueAt = new Date(String(formData.get("dueAt") ?? job.dueAt)).toISOString();

  if (statuses.includes(nextStatus)) {
    job.status = nextStatus;
  }

  if (previousStatus !== job.status) {
    store.timeline.unshift({
      id: makeId("event"),
      jobId: job.id,
      type: "status_change",
      message: `Status updated from ${previousStatus.replace("_", " ")} to ${job.status.replace("_", " ")}.`,
      createdAt: new Date().toISOString()
    });
  }

  if (job.status === "completed" && !job.completedAt) {
    job.completedAt = new Date().toISOString();
  }

  await writeStore(store);
  revalidatePath(`/jobs/${id}`);
  revalidatePath("/jobs");
}

export async function deleteJob(id: string) {
  const store = await readStore();
  store.jobs = store.jobs.filter((entry) => entry.id !== id);
  store.estimates = store.estimates.filter((entry) => entry.jobId !== id);
  store.invoices = store.invoices.filter((entry) => entry.jobId !== id);
  store.timeline = store.timeline.filter((entry) => entry.jobId !== id);

  await writeStore(store);
  revalidatePath("/jobs");
  redirect("/jobs");
}
