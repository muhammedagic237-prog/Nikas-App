"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { makeId, readStore, writeStore } from "@/lib/store";

export async function createVehicle(formData: FormData) {
  const store = await readStore();
  const vehicleId = makeId("vehicle");

  store.vehicles.unshift({
    id: vehicleId,
    shopId: "shop_1",
    customerId: String(formData.get("customerId") ?? ""),
    vin: String(formData.get("vin") ?? "").trim(),
    plateNumber: String(formData.get("plateNumber") ?? "").trim(),
    make: String(formData.get("make") ?? "").trim(),
    model: String(formData.get("model") ?? "").trim(),
    year: Number(formData.get("year") ?? 0),
    engine: String(formData.get("engine") ?? "").trim(),
    color: String(formData.get("color") ?? "").trim(),
    mileage: Number(formData.get("mileage") ?? 0)
  });

  await writeStore(store);
  revalidatePath("/vehicles");
  redirect(`/vehicles/${vehicleId}`);
}

export async function updateVehicle(id: string, formData: FormData) {
  const store = await readStore();
  const vehicle = store.vehicles.find((entry) => entry.id === id);

  if (!vehicle) {
    return;
  }

  vehicle.customerId = String(formData.get("customerId") ?? "");
  vehicle.vin = String(formData.get("vin") ?? "").trim();
  vehicle.plateNumber = String(formData.get("plateNumber") ?? "").trim();
  vehicle.make = String(formData.get("make") ?? "").trim();
  vehicle.model = String(formData.get("model") ?? "").trim();
  vehicle.year = Number(formData.get("year") ?? 0);
  vehicle.engine = String(formData.get("engine") ?? "").trim();
  vehicle.color = String(formData.get("color") ?? "").trim();
  vehicle.mileage = Number(formData.get("mileage") ?? 0);

  await writeStore(store);
  revalidatePath(`/vehicles/${id}`);
  revalidatePath("/vehicles");
}

export async function deleteVehicle(id: string) {
  const store = await readStore();
  store.vehicles = store.vehicles.filter((entry) => entry.id !== id);
  store.jobs = store.jobs.filter((entry) => entry.vehicleId !== id);

  await writeStore(store);
  revalidatePath("/vehicles");
  revalidatePath("/jobs");
  redirect("/vehicles");
}
