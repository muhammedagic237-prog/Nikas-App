import { readStore } from "@/lib/store";

export async function getCustomers() {
  const store = await readStore();

  return store.customers.map((customer) => ({
    ...customer,
    vehicles: store.vehicles.filter((vehicle) => vehicle.customerId === customer.id),
    jobs: store.jobs.filter((job) => job.customerId === customer.id)
  }));
}

export async function getCustomerById(id: string) {
  const store = await readStore();
  const customer = store.customers.find((entry) => entry.id === id);

  if (!customer) {
    return null;
  }

  return {
    customer,
    vehicles: store.vehicles.filter((vehicle) => vehicle.customerId === id),
    jobs: store.jobs.filter((job) => job.customerId === id)
  };
}
