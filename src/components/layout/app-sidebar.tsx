"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/dashboard", label: "Dispatch" },
  { href: "/customers", label: "Customers" },
  { href: "/vehicles", label: "Vehicles" },
  { href: "/jobs", label: "Jobs" },
  { href: "/settings", label: "Settings" }
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="brand-lockup">
        <span className="brand-mark">GF</span>
        <div>
          <p className="eyebrow">Repair-shop ops</p>
          <h1>GarageFlow</h1>
        </div>
      </div>

      <nav className="sidebar-nav">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              className={active ? "nav-link active" : "nav-link"}
              href={item.href}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-note">
        <p className="eyebrow">Demo access</p>
        <p>`owner@garageflow.app` / `garageflow`</p>
      </div>
    </aside>
  );
}
