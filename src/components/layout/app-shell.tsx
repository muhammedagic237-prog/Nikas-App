import { AppSidebar } from "@/components/layout/app-sidebar";
import { Topbar } from "@/components/layout/topbar";
import type { StaffUser } from "@/lib/types";

export function AppShell({ user, children }: { user: StaffUser; children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <AppSidebar />
      <div className="workspace">
        <Topbar user={user} />
        <main className="workspace-content">{children}</main>
      </div>
    </div>
  );
}
