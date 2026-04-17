import { promises as fs } from "fs";
import path from "path";

import { seedData } from "@/lib/seed-data";
import type { GarageFlowStore } from "@/lib/types";

const dataPath = path.join(process.cwd(), "data", "garageflow.json");

export async function readStore(): Promise<GarageFlowStore> {
  try {
    const raw = await fs.readFile(dataPath, "utf8");
    return JSON.parse(raw) as GarageFlowStore;
  } catch {
    return seedData;
  }
}

export async function writeStore(store: GarageFlowStore) {
  await fs.mkdir(path.dirname(dataPath), { recursive: true });
  await fs.writeFile(dataPath, JSON.stringify(store, null, 2), "utf8");
}

export function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function makeJobNumber(jobCount: number) {
  return `GF-${String(24017 + jobCount).padStart(5, "0")}`;
}
