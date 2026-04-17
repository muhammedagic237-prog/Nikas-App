import { readStore } from "@/lib/store";

export async function getVehicles() {
  const store = await readStore();

  return store.vehicles.map((vehicle) => ({
    ...vehicle,
    customer: store.customers.find((customer) => customer.id === vehicle.customerId) ?? null,
    jobs: store.jobs.filter((job) => job.vehicleId === vehicle.id)
  }));
}

export async function getVehicleById(id: string) {
  const store = await readStore();
  const vehicle = store.vehicles.find((entry) => entry.id === id);

  if (!vehicle) {
    return null;
  }

  return {
    vehicle,
    customer: store.customers.find((customer) => customer.id === vehicle.customerId) ?? null,
    jobs: store.jobs.filter((job) => job.vehicleId === id)
  };
}
