import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { readStore } from "@/lib/store";

export const sessionCookieName = "garageflow-session";

export async function getSessionUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get(sessionCookieName)?.value;

  if (!userId) {
    return null;
  }

  const store = await readStore();
  return store.users.find((user) => user.id === userId) ?? null;
}

export async function requireSessionUser() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
