"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  Clock,
  LogIn,
  LogOut,
  Menu,
  Settings,
  X,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { BrandLogo } from "./BrandLogo";

type TopBarVariant = "public" | "dashboard";

const DASH_TABS = [
  { href: "/dashboard", label: "Today", icon: Clock },
  { href: "/dashboard/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

const PUBLIC_LINKS = [
  { href: "#services", label: "Services" },
  { href: "#about", label: "About" },
  { href: "#reviews", label: "Reviews" },
  { href: "#contact", label: "Contact" },
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
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isOwner = (session?.user as { role?: string } | undefined)?.role === "owner";
  const visibleTabs = useMemo(
    () =>
      isOwner
        ? DASH_TABS
        : DASH_TABS.filter((tab) => tab.href === "/dashboard" || tab.href === "/dashboard/calendar"),
    [isOwner]
  );

  const activeTabLabel = useMemo(() => {
    const activeTab = visibleTabs.find((tab) =>
      tab.href === "/dashboard" ? pathname === tab.href : pathname.startsWith(tab.href)
    );
    return activeTab?.label ?? "Dashboard";
  }, [pathname, visibleTabs]);

  const initials = session?.user?.name
    ? session.user.name.charAt(0).toUpperCase()
    : "?";

  useEffect(() => {
    if (variant !== "public") return;
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [variant]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <header className={`topbar${scrolled ? " scrolled" : ""}`}>
        <Link className="brand" href="/" aria-label="Icon Barbers">
          <BrandLogo
            priority
            className="brand-logo-topbar"
            sizes="(max-width: 480px) 128px, (max-width: 900px) 146px, 168px"
          />
        </Link>

        {variant === "public" ? (
          <nav className="nav" aria-label="Primary">
            {PUBLIC_LINKS.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>
        ) : (
          <nav className="nav-tabs" aria-label="Dashboard">
            {visibleTabs.map(({ href, label, icon: Icon }) => {
              const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
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

        <div className="topbar-right">
          {variant === "public" ? (
            <>
              <button
                onClick={onBookNow}
                className="btn btn-primary btn-sm btn-glow"
              >
                Book Now
              </button>
              <Link href="/login" className="btn btn-ghost btn-sm topbar-desktop-only">
                <LogIn size={14} />
                Admin Login
              </Link>
              <button
                className="btn btn-ghost btn-icon topbar-mobile-only"
                type="button"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileMenuOpen}
                onClick={() => setMobileMenuOpen((current) => !current)}
              >
                {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </>
          ) : session?.user ? (
            <>
              <div className="topbar-current topbar-mobile-only">{activeTabLabel}</div>
              <div className="user-badge topbar-desktop-only">
                <div className="user-dot">{initials}</div>
                <div className="user-meta">
                  <div className="user-name">{session.user.name}</div>
                  <div className="user-role">
                    {(session.user as { role?: string }).role ?? "staff"}
                  </div>
                </div>
              </div>
              <button
                className="btn btn-ghost btn-sm topbar-desktop-only"
                onClick={() => signOut({ callbackUrl: "/login" })}
                title="Sign out"
              >
                <LogOut size={15} />
              </button>
              <button
                className="btn btn-ghost btn-icon topbar-mobile-only"
                type="button"
                aria-label={mobileMenuOpen ? "Close dashboard menu" : "Open dashboard menu"}
                aria-expanded={mobileMenuOpen}
                onClick={() => setMobileMenuOpen((current) => !current)}
              >
                {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </>
          ) : null}
        </div>
      </header>

      <div
        className={`mobile-drawer-backdrop${mobileMenuOpen ? " open" : ""}`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden={!mobileMenuOpen}
      >
        <aside
          className={`mobile-drawer${mobileMenuOpen ? " open" : ""}`}
          onClick={(event) => event.stopPropagation()}
        >
            <div className="mobile-drawer-header">
            <div className="brand" aria-label="Icon Barbers">
              <BrandLogo className="brand-logo-drawer" sizes="144px" />
            </div>
            <button
              className="btn btn-ghost btn-icon"
              type="button"
              aria-label="Close menu"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X size={18} />
            </button>
          </div>

          {variant === "public" ? (
            <div className="mobile-drawer-section">
              <div className="sidebar-label">Explore</div>
              <nav className="mobile-drawer-nav" aria-label="Mobile primary">
                {PUBLIC_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="mobile-drawer-link"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}
                <Link
                  href="/login"
                  className="mobile-drawer-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LogIn size={16} />
                  Admin Login
                </Link>
              </nav>
            </div>
          ) : (
            <>
              <div className="mobile-drawer-section">
                <div className="user-badge mobile-user-badge">
                  <div className="user-dot">{initials}</div>
                  <div className="user-meta">
                    <div className="user-name">{session?.user?.name}</div>
                    <div className="user-role">
                      {(session?.user as { role?: string } | undefined)?.role ?? "staff"}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mobile-drawer-section">
                <div className="sidebar-label">Navigation</div>
                <nav className="mobile-drawer-nav" aria-label="Mobile dashboard">
                  {visibleTabs.map(({ href, label, icon: Icon }) => {
                    const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
                    return (
                      <Link
                        key={href}
                        href={href}
                        className={`mobile-drawer-link${active ? " active" : ""}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Icon size={16} />
                        {label}
                      </Link>
                    );
                  })}
                </nav>
              </div>
              <div className="mobile-drawer-section">
                <button
                  className="mobile-drawer-link"
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </aside>
      </div>
    </>
  );
}
