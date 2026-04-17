"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { readStore } from "@/lib/store";

import { sessionCookieName } from "./session";

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "").trim();

  const store = await readStore();
  const user = store.users.find(
    (entry) => entry.email.toLowerCase() === email && entry.password === password
  );

  if (!user) {
    redirect("/login?error=1");
  }

  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName, user.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/"
  });

  redirect("/dashboard");
}

export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete(sessionCookieName);
  redirect("/login");
}
