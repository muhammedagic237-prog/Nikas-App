import { signOut } from "@/features/auth/actions";
import type { StaffUser } from "@/lib/types";

export function Topbar({ user }: { user: StaffUser }) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">Live shop floor</p>
        <h2>Keep intake, approvals, and delivery moving.</h2>
      </div>

      <div className="topbar-actions">
        <div className="session-pill">
          <span>{user.fullName}</span>
          <small>{user.role}</small>
        </div>
        <form action={signOut}>
          <button className="ghost-button" type="submit">
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
