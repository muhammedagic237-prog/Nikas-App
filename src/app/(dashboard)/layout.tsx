import { AppShell } from "@/components/layout/app-shell";
import { requireSessionUser } from "@/features/auth/session";

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const user = await requireSessionUser();

  return <AppShell user={user}>{children}</AppShell>;
}
