"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { makeId, readStore, writeStore } from "@/lib/store";

export async function createCustomer(formData: FormData) {
  const store = await readStore();
  const customerId = makeId("customer");

  store.customers.unshift({
    id: customerId,
    shopId: "shop_1",
    fullName: String(formData.get("fullName") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    address: String(formData.get("address") ?? "").trim(),
    notes: String(formData.get("notes") ?? "").trim()
  });

  await writeStore(store);
  revalidatePath("/customers");
  redirect(`/customers/${customerId}`);
}

export async function updateCustomer(id: string, formData: FormData) {
  const store = await readStore();
  const customer = store.customers.find((entry) => entry.id === id);

  if (!customer) {
    return;
  }

  customer.fullName = String(formData.get("fullName") ?? "").trim();
  customer.phone = String(formData.get("phone") ?? "").trim();
  customer.email = String(formData.get("email") ?? "").trim();
  customer.address = String(formData.get("address") ?? "").trim();
  customer.notes = String(formData.get("notes") ?? "").trim();

  await writeStore(store);
  revalidatePath(`/customers/${id}`);
  revalidatePath("/customers");
}

export async function deleteCustomer(id: string) {
  const store = await readStore();
  const jobIds = new Set(store.jobs.filter((entry) => entry.customerId === id).map((entry) => entry.id));

  store.customers = store.customers.filter((entry) => entry.id !== id);
  store.vehicles = store.vehicles.filter((entry) => entry.customerId !== id);
  store.jobs = store.jobs.filter((entry) => entry.customerId !== id);
  store.timeline = store.timeline.filter((entry) => !jobIds.has(entry.jobId));

  await writeStore(store);
  revalidatePath("/customers");
  revalidatePath("/vehicles");
  revalidatePath("/jobs");
  redirect("/customers");
}
