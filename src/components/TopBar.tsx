"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CalendarDays, LogIn, LogOut, Settings, Scissors, Clock } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

type TopBarVariant = "public" | "dashboard";

const DASH_TABS = [
  { href: "/dashboard",            label: "Today",     icon: Clock },
  { href: "/dashboard/calendar",   label: "Calendar",  icon: CalendarDays },
  { href: "/dashboard/analytics",  label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/settings",   label: "Settings",  icon: Settings },
];

export function TopBar({
  variant = "dashboard",
  onBookNow,
}: {
  variant?: TopBarVariant;
  onBookNow?: () => void;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isOwner = (session?.user as { role?: string } | undefined)?.role === "owner";
  const visibleTabs = isOwner
    ? DASH_TABS
    : DASH_TABS.filter((tab) => tab.href === "/dashboard" || tab.href === "/dashboard/calendar");

  const initials = session?.user?.name
    ? session.user.name.charAt(0).toUpperCase()
    : "?";

  return (
    <header className="topbar">
      {/* Brand */}
      <Link className="brand" href="/">
        <span className="brand-icon">
          <Scissors size={18} />
        </span>
        <span>
          <span className="brand-dim">Icon</span>
          <span className="brand-bold">Book</span>
        </span>
      </Link>

      {/* Nav */}
      {variant === "public" ? (
        <nav className="nav" aria-label="Primary">
          <a href="#services">Services</a>
          <a href="#about">About</a>
          <a href="#reviews">Reviews</a>
          <a href="#contact">Contact</a>
        </nav>
      ) : (
        <nav className="nav-tabs" aria-label="Dashboard">
          {visibleTabs.map(({ href, label, icon: Icon }) => {
            const active = href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`nav-tab${active ? " active" : ""}`}
              >
                <Icon size={15} />
                {label}
              </Link>
            );
          })}
        </nav>
      )}

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        {variant === "public" ? (
          <>
            <button
              onClick={onBookNow}
              className="btn btn-primary btn-sm"
            >
              Book Now
            </button>
            <Link href="/login" className="btn btn-ghost btn-sm">
              <LogIn size={15} />
              Staff login
            </Link>
          </>
        ) : session?.user ? (
          <>
            <div className="user-badge">
              <div className="user-dot">{initials}</div>
              <div className="user-meta">
                <div className="user-name">{session.user.name}</div>
                <div className="user-role">{(session.user as { role?: string }).role ?? "staff"}</div>
              </div>
            </div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => signOut({ callbackUrl: "/login" })}
              title="Sign out"
            >
              <LogOut size={15} />
            </button>
          </>
        ) : null}
      </div>
    </header>
  );
}
