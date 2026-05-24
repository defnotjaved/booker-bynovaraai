"use client";

import Link from "next/link";
import { BarChart3, CalendarDays, LogIn, LogOut, Settings, Scissors } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

type TopBarVariant = "public" | "dashboard";

export function TopBar({
  variant = "dashboard",
  onBookNow,
}: {
  variant?: TopBarVariant;
  onBookNow?: () => void;
}) {
  const { data: session } = useSession();

  return (
    <header className="topbar">
      <Link className="brand" href="/">
        <span className="brand-mark">
          <Scissors size={18} />
        </span>
        <span>IconBook</span>
      </Link>

      {variant === "public" ? (
        <nav className="nav" aria-label="Primary">
          <a href="#services">Services</a>
          <a href="#about">About</a>
          <a href="#reviews">Reviews</a>
          <a href="#contact">Contact</a>
        </nav>
      ) : (
        <nav className="nav" aria-label="Primary">
          <Link href="/dashboard">
            <CalendarDays size={16} />
            Today
          </Link>
          <Link href="/dashboard/calendar">
            <CalendarDays size={16} />
            Calendar
          </Link>
          <Link href="/dashboard/analytics">
            <BarChart3 size={16} />
            Analytics
          </Link>
          <Link href="/dashboard/settings">
            <Settings size={16} />
            Settings
          </Link>
        </nav>
      )}

      <div className="topbar-user">
        {variant === "public" ? (
          <>
            <button
              onClick={onBookNow}
              className="btn"
              style={{ background: "var(--accent)", color: "#fff", border: "none", display: "inline-flex", alignItems: "center", gap: 8, minHeight: 38, padding: "8px 18px", fontWeight: 600, borderRadius: 6, cursor: "pointer" }}
            >
              Book Now
            </button>
            <Link href="/login" className="btn ghost" style={{ display: "inline-flex", alignItems: "center", gap: 8, minHeight: 38, padding: "8px 14px" }}>
              <LogIn size={16} />
              Staff login
            </Link>
          </>
        ) : session?.user ? (
          <>
            <span className="topbar-name">
              {session.user.name}
              <span className="tag">{session.user.role}</span>
            </span>
            <button
              className="btn ghost"
              onClick={() => signOut({ callbackUrl: "/login" })}
              title="Sign out"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </>
        ) : null}
      </div>
    </header>
  );
}
