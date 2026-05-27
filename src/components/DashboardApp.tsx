"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  BarChart3,
  CalendarDays,
  Check,
  Clock,
  Link2,
  Mail,
  Plus,
  Scissors,
  Settings,
  TrendingDown,
  TrendingUp,
  UserCheck,
  X
} from "lucide-react";
import {
  BootstrapData,
  createAppointment,
  createService,
  loadBootstrap,
  patchScheduleRule,
  updateAppointment,
  updateService,
  updateSettings
} from "./api";
import { BrandLogo } from "./BrandLogo";
import { TopBar } from "./TopBar";
import type { Appointment, AppointmentStatus, Role, Service } from "@/lib/types";
import { formatMoney, formatTime, generateTimes, todayString } from "@/lib/time";

type DashboardView = "today" | "calendar" | "analytics" | "settings";
type DashboardAppProps = { view: DashboardView };
type WalkInPrefill = { customerName: string; customerPhone: string; barberId: string; date: string };

function addInterval(dateStr: string, interval: "1w" | "2w" | "1m"): string {
  const d = new Date(dateStr);
  if (interval === "1w") d.setDate(d.getDate() + 7);
  else if (interval === "2w") d.setDate(d.getDate() + 14);
  else d.setMonth(d.getMonth() + 1);
  return d.toISOString().split("T")[0];
}

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  booked: "Booked",
  arrived: "Arrived",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No-show"
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const SIDEBAR_NAV = [
  { key: "today",     href: "/dashboard",           label: "Today",     Icon: Clock },
  { key: "calendar",  href: "/dashboard/calendar",  label: "Calendar",  Icon: CalendarDays },
  { key: "analytics", href: "/dashboard/analytics", label: "Analytics", Icon: BarChart3 },
  { key: "settings",  href: "/dashboard/settings",  label: "Settings",  Icon: Settings },
];

/* ── Count-up animation hook ── */
function useCountUp(target: number, duration = 900) {
  const [count, setCount] = useState(0);
  const rafRef = useRef<number>(0);
  useEffect(() => {
    const startTime = performance.now();
    function step(now: number) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    }
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);
  return count;
}

/* ── Stat card with animated count ── */
function StatCard({
  label,
  rawValue,
  display,
  accent = false,
  trend,
  trendText
}: {
  label: string;
  rawValue: number;
  display: (n: number) => string;
  accent?: boolean;
  trend?: "up" | "down";
  trendText?: string;
}) {
  const count = useCountUp(Math.abs(rawValue));
  const formatted = rawValue < 0 ? `-${display(count)}` : display(count);
  return (
    <div className="stat-card screen-enter">
      <div className="stat-lbl">{label}</div>
      <div className={`stat-val${accent ? " accent" : ""}`} style={{ fontFamily: "var(--font-code)" }}>{formatted}</div>
      {trend && trendText && (
        <div className="stat-trend">
          {trend === "up"
            ? <TrendingUp size={13} className="trend-up" style={{ color: "var(--success)" }} />
            : <TrendingDown size={13} className="trend-down" style={{ color: "var(--danger)" }} />
          }
          <span className={`trend-${trend}`}>{trendText}</span>
        </div>
      )}
    </div>
  );
}

export function DashboardApp({ view }: DashboardAppProps) {
  const { data: session } = useSession();
  const [data, setData] = useState<BootstrapData | null>(null);
  const [selectedDate, setSelectedDate] = useState(todayString());
  const [error, setError] = useState("");
  const [prefillData, setPrefillData] = useState<WalkInPrefill | null>(null);

  async function refresh() {
    const payload = await loadBootstrap();
    setData(payload);
  }

  useEffect(() => { refresh().catch((err) => setError(err.message)); }, []);

  const currentUser = session?.user
    ? { id: session.user.id, name: session.user.name ?? "", email: session.user.email ?? "", role: session.user.role as Role, barberId: session.user.barberId }
    : null;

  const activeBarbers = useMemo(() => data?.barbers.filter((b) => b.active) ?? [], [data]);
  const visibleBarbers = currentUser?.role === "owner"
    ? activeBarbers
    : activeBarbers.filter((b) => b.id === currentUser?.barberId);
  const canSeePerformance = currentUser?.role === "owner" || !!data?.settings.performanceVisibleToBarbers;
  const visibleNav = currentUser?.role === "owner"
    ? SIDEBAR_NAV
    : SIDEBAR_NAV.filter((item) => item.key === "today" || item.key === "calendar");

  if (!data) {
    return (
      <main className="dash-shell">
        <TopBar />
        <div className="dash-body">
          <nav className="dash-sidebar" />
          <main className="dash-main">
            <div className="empty" style={{ marginTop: 40 }}>
              <div className="skel" style={{ width: 180, height: 18 }} />
            </div>
          </main>
        </div>
      </main>
    );
  }

  const { analytics } = data;

  return (
    <main className="dash-shell">
      <TopBar />
      <div className="dash-body">

        {/* ── Sidebar ── */}
        <nav className="dash-sidebar">
          {/* Brand header */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "16px 12px 14px",
            borderBottom: "1px solid var(--line)", marginBottom: 6,
          }}>
            <BrandLogo className="brand-logo-sidebar" sizes="148px" />
          </div>

          <div className="sidebar-label">Navigation</div>
          {visibleNav.map(({ key, href, label, Icon }) => (
            <Link
              key={key}
              href={href}
              className={`sidebar-item${view === key ? " active" : ""}`}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}

          <div className="sidebar-divider" />
          <div className="sidebar-label">Booking Links</div>
          <Link className="sidebar-item" href="/book">
            <Link2 size={15} />
            Any barber
          </Link>
          {activeBarbers.map((barber) => (
            <Link key={barber.id} className="sidebar-item" href={`/book/${barber.slug}`}>
              <Scissors size={15} />
              {barber.name}
            </Link>
          ))}
        </nav>

        {/* ── Main content ── */}
        <main className="dash-main screen-enter">
          {error ? <p style={{ color: "var(--danger)", marginBottom: 16 }}>{error}</p> : null}

          {/* Stats row — hide on settings */}
          {view !== "settings" && (
            <div className="stats-grid">
              <StatCard
                label="Today Revenue"
                rawValue={analytics.todayRevenue}
                display={(n) => formatMoney(n)}
                accent
              />
              <StatCard
                label="Cuts Today"
                rawValue={analytics.todayCuts}
                display={(n) => String(n)}
              />
              <StatCard
                label="Vs Yesterday"
                rawValue={analytics.revenueDeltaPercent}
                display={(n) => `${n}%`}
                trend={analytics.revenueDeltaPercent >= 0 ? "up" : "down"}
                trendText={`${Math.abs(analytics.revenueDeltaPercent)}% vs yesterday`}
              />
              <StatCard
                label="Attendance"
                rawValue={analytics.attendanceRate}
                display={(n) => `${n}%`}
                trend={analytics.attendanceRate >= 80 ? "up" : "down"}
                trendText={analytics.attendanceRate >= 80 ? "On track" : "Below target"}
              />
            </div>
          )}

          {/* View-specific content */}
          {view === "today" ? (
            <>
              <WalkInPanel
                data={data}
                onChange={refresh}
                prefillData={prefillData}
                onClearPrefill={() => setPrefillData(null)}
              />
              <CalendarPanel
                data={data}
                visibleBarbers={visibleBarbers}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                onChange={refresh}
                compact
                onPrefill={setPrefillData}
              />
            </>
          ) : null}

          {view === "calendar" ? (
            <CalendarPanel
              data={data}
              visibleBarbers={visibleBarbers}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              onChange={refresh}
            />
          ) : null}

          {view === "analytics" ? (
            <AnalyticsPanel data={data} canSeePerformance={canSeePerformance} />
          ) : null}

          {view === "settings" ? (
            <SettingsPanel data={data} canEdit={currentUser?.role === "owner"} onChange={refresh} />
          ) : null}
        </main>
      </div>
    </main>
  );
}

/* ── Walk-in panel ── */
function WalkInPanel({
  data,
  onChange,
  prefillData,
  onClearPrefill
}: {
  data: BootstrapData;
  onChange: () => Promise<void>;
  prefillData?: WalkInPrefill | null;
  onClearPrefill?: () => void;
}) {
  const activeServices = data.services.filter((s) => s.active !== false);
  const activeBarbers  = data.barbers.filter((b) => b.active);
  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "walkin@iconbook.local",
    serviceId: activeServices[0]?.id ?? "",
    date: todayString(),
    startTime: "09:00",
    barberId: activeBarbers[0]?.id ?? ""
  });
  const [saving, setSaving] = useState(false);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    if (prefillData) {
      setForm((f) => ({ ...f, customerName: prefillData.customerName, customerPhone: prefillData.customerPhone, barberId: prefillData.barberId, date: prefillData.date }));
    }
  }, [prefillData]);

  async function addWalkIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    await createAppointment({
      ...form,
      source: "walk_in",
      customerName: form.customerName || "Walk-in client",
      customerPhone: form.customerPhone || "Not recorded"
    });
    setForm((f) => ({ ...f, customerName: "", customerPhone: "" }));
    onClearPrefill?.();
    await onChange();
    setSaving(false);
  }

  return (
    <div className="walkin-card">
      <div className="section-bar">
        <Plus size={16} style={{ color: "var(--accent)" }} />
        <span className="section-title">Add Walk-in</span>
      </div>

      <form className="form-stack" onSubmit={addWalkIn}>
        {/* Customer */}
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 2 }}>Customer</div>
        <div className="two-col">
          <div className="field"><label>Name</label>
            <input value={form.customerName} onChange={set("customerName")} placeholder="Walk-in client" />
          </div>
          <div className="field"><label>Phone</label>
            <input value={form.customerPhone} onChange={set("customerPhone")} placeholder="Optional" />
          </div>
        </div>

        {/* Appointment */}
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-3)", marginTop: 4, marginBottom: 2 }}>Appointment</div>
        <div className="two-col">
          <div className="field"><label>Barber</label>
            <select value={form.barberId} onChange={set("barberId")}>
              {activeBarbers.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div className="field"><label>Service</label>
            <select value={form.serviceId} onChange={set("serviceId")}>
              {activeServices.map((s) => <option key={s.id} value={s.id}>{s.name} — {formatMoney(s.price)}</option>)}
            </select>
          </div>
        </div>
        <div className="two-col">
          <div className="field"><label>Date</label>
            <input type="date" value={form.date} onChange={set("date")} />
          </div>
          <div className="field"><label>Start time</label>
            <select value={form.startTime} onChange={set("startTime")}>
              {generateTimes(data.settings.shopStartTime, data.settings.overflowEndTime).map((t) => (
                <option key={t} value={t}>{formatTime(t)}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button className="btn btn-primary" type="submit" disabled={saving}>
            <Plus size={16} />
            {saving ? "Adding…" : "Add walk-in"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ── Calendar panel ── */
function CalendarPanel({
  data, visibleBarbers, selectedDate, setSelectedDate, onChange, compact = false, onPrefill
}: {
  data: BootstrapData;
  visibleBarbers: BootstrapData["barbers"];
  selectedDate: string;
  setSelectedDate: (d: string) => void;
  onChange: () => Promise<void>;
  compact?: boolean;
  onPrefill?: (p: WalkInPrefill) => void;
}) {
  const times = generateTimes(data.settings.shopStartTime, data.settings.overflowEndTime);
  const appointments = data.appointments.filter((a) => a.date === selectedDate);
  const colCount = visibleBarbers.length;

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden", marginBottom: 20 }}>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--line)" }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, fontFamily: "var(--font-heading)" }}>{compact ? "Today's book" : "Shared calendar"}</h3>
        <div className="field" style={{ margin: 0, width: "auto" }}>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ minHeight: 36, padding: "6px 10px", width: "auto" }}
          />
        </div>
      </div>

      {/* Calendar grid */}
      <div className="cal-outer">
        <div className="cal-grid" style={{ gridTemplateColumns: `80px repeat(${colCount}, minmax(160px, 1fr))` }}>
          {/* Column headers */}
          <div className="cal-head-cell">
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-3)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Time</span>
          </div>
          {visibleBarbers.map((barber) => (
            <div className="cal-head-cell" key={barber.id}>
              <div className="cal-avatar">{barber.name.charAt(0)}</div>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{barber.name}</span>
            </div>
          ))}

          {/* Time rows */}
          {times.flatMap((time) => [
            <div className="cal-time" key={`${time}-t`}>{formatTime(time)}</div>,
            ...visibleBarbers.map((barber) => {
              const apt = appointments.find((a) => a.barberId === barber.id && a.startTime === time);
              return (
                <div className="cal-cell" key={`${barber.id}-${time}`}>
                  {apt ? (
                    <AppointmentCard appointment={apt} data={data} onChange={onChange} onPrefill={onPrefill} />
                  ) : null}
                </div>
              );
            })
          ])}
        </div>
      </div>
    </div>
  );
}

/* ── Appointment card ── */
function AppointmentCard({
  appointment, data, onChange, onPrefill
}: {
  appointment: Appointment;
  data: BootstrapData;
  onChange: () => Promise<void>;
  onPrefill?: (p: WalkInPrefill) => void;
}) {
  const service = data.services.find((s) => s.id === appointment.serviceId);
  const [svcAmt, setSvcAmt] = useState(`${appointment.finalServiceAmount ?? service?.price ?? 0}`);
  const [prodAmt, setProdAmt] = useState(`${appointment.productAmount ?? 0}`);
  const [busy, setBusy] = useState(false);

  const status = appointment.status;
  const done = status === "completed" || status === "cancelled" || status === "no_show";

  async function patch(body: Partial<Appointment>) {
    setBusy(true);
    await updateAppointment(appointment.id, body);
    await onChange();
    setBusy(false);
  }

  const chipClass = {
    booked: "chip-booked", arrived: "chip-arrived", completed: "chip-completed",
    cancelled: "chip-cancelled", no_show: "chip-cancelled"
  }[status] ?? "chip-booked";

  return (
    <div className={`apt-card${appointment.source === "walk_in" ? " walk-in" : ""}${status === "completed" ? " completed" : ""}${status === "cancelled" || status === "no_show" ? " cancelled" : ""}`}>
      <div className="apt-name">{appointment.customerName}</div>
      <div className="apt-svc">{service?.name}</div>
      <div className="apt-row">
        <span className={`chip ${chipClass}`}>{STATUS_LABELS[status]}</span>
        <span className="apt-price">{formatMoney(service?.price ?? 0)}</span>
      </div>

      {!done && (
        <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
          <div className="two-col" style={{ gap: 6 }}>
            <input aria-label="Service amount" value={svcAmt} onChange={(e) => setSvcAmt(e.target.value)} style={{ minHeight: 32, padding: "4px 8px", fontSize: 12 }} />
            <input aria-label="Product amount" value={prodAmt} onChange={(e) => setProdAmt(e.target.value)} style={{ minHeight: 32, padding: "4px 8px", fontSize: 12 }} />
          </div>

          {/* Action overlay */}
          <div className="apt-actions" style={{ position: "static", opacity: 1, transform: "none", background: "none", padding: 0 }}>
            <button className="btn btn-secondary btn-sm" type="button" disabled={busy} onClick={() => patch({ status: "arrived" })}>
              <UserCheck size={12} />
            </button>
            <button className="btn btn-ghost btn-sm" type="button" disabled={busy} onClick={() => patch({ status: "cancelled" })}>
              <X size={12} />
            </button>
            <button
              className="btn btn-primary btn-sm"
              type="button"
              disabled={busy}
              onClick={() => patch({ status: "completed", finalServiceAmount: Number(svcAmt) || service?.price || 0, productAmount: Number(prodAmt) || 0 })}
              style={{ flex: 1 }}
            >
              <Check size={12} />
              Done
            </button>
          </div>
        </div>
      )}

      {status === "completed" && onPrefill && (
        <div style={{ marginTop: 8, display: "flex", gap: 4, flexWrap: "wrap" }}>
          <span style={{ fontSize: 10, color: "var(--ink-3)", width: "100%", marginBottom: 2 }}>Next visit:</span>
          {(["1w", "2w", "1m"] as const).map((iv) => (
            <button key={iv} className="btn btn-secondary btn-sm" type="button" style={{ fontSize: 10, padding: "2px 8px" }}
              onClick={() => onPrefill({ customerName: appointment.customerName, customerPhone: appointment.customerPhone, barberId: appointment.barberId, date: addInterval(appointment.date, iv) })}
            >
              +{iv === "1w" ? "1 Wk" : iv === "2w" ? "2 Wks" : "1 Mo"}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Analytics panel ── */
function AnalyticsPanel({ data, canSeePerformance }: { data: BootstrapData; canSeePerformance: boolean }) {
  const { analytics } = data;
  return (
    <>
      {/* Owner snapshot */}
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(4,1fr)", marginBottom: 24 }}>
        <StatCard label="Yesterday Revenue" rawValue={analytics.yesterdayRevenue} display={formatMoney} />
        <StatCard label="Week Revenue"       rawValue={analytics.weekRevenue}       display={formatMoney} accent />
        <StatCard label="Product Sales"      rawValue={analytics.productRevenue}    display={formatMoney} />
        <StatCard label="Owner Commission"   rawValue={analytics.ownerCommission}   display={formatMoney} />
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(2,1fr)", marginBottom: 24 }}>
        <StatCard label="Online Bookings" rawValue={analytics.onlineBookingCount} display={(n) => String(n)} />
        <StatCard label="Walk-ins" rawValue={analytics.walkInCount} display={(n) => String(n)} />
      </div>

      {/* Barber performance */}
      <div className="card" style={{ padding: 0, overflow: "hidden", marginBottom: 20 }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>Barber Performance</h3>
          <BarChart3 size={17} style={{ color: "var(--ink-3)" }} />
        </div>
        {canSeePerformance ? (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Barber</th>
                  <th>Cuts</th>
                  <th>Service Rev</th>
                  <th>Owner Share</th>
                  <th>Barber Share</th>
                </tr>
              </thead>
              <tbody>
                {analytics.barberPerformance.map((item) => {
                  const barber = data.barbers.find((b) => b.id === item.barberId);
                  return (
                    <tr key={item.barberId}>
                      <td>
                        <div className="barber-c">
                          <div className="mini-av">{barber?.name.charAt(0)}</div>
                          {barber?.name}
                        </div>
                      </td>
                      <td>{item.cuts}</td>
                      <td><span className="rev-val">{formatMoney(item.serviceRevenue)}</span></td>
                      <td>{formatMoney(item.ownerShare)}</td>
                      <td>{formatMoney(item.barberShare)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty" style={{ margin: 20 }}>Performance comparison is owner-only.</div>
        )}
      </div>

      {/* Email log */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>Email Notification Log</h3>
          <Mail size={17} style={{ color: "var(--ink-3)" }} />
        </div>
        <div style={{ padding: "8px 20px 20px" }}>
          {data.notifications.length ? (
            <div className="timeline">
              {data.notifications.slice(0, 8).map((n) => (
                <div className="tl-item" key={n.id}>
                  <div className="tl-subject">{n.subject}</div>
                  <div className="tl-email">{n.recipientEmail}</div>
                  <div className="tl-ts" style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                    <span className={`chip ${n.status === "sent" ? "chip-sent" : "chip-failed"}`}>{n.status}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty" style={{ marginTop: 16 }}>No notifications sent yet.</div>
          )}
        </div>
      </div>
    </>
  );
}

/* ── Services panel ── */
function ServicesPanel({ data, onChange }: { data: BootstrapData; onChange: () => Promise<void> }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", price: "", durationMinutes: "" });
  const [addForm, setAddForm] = useState({ name: "", price: "", durationMinutes: "30" });
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  function startEdit(s: Service) {
    setEditingId(s.id);
    setEditForm({ name: s.name, price: String(s.price), durationMinutes: String(s.durationMinutes) });
  }
  async function saveEdit(id: string) {
    setSaving(true);
    await updateService(id, { name: editForm.name, price: Number(editForm.price), durationMinutes: Number(editForm.durationMinutes) });
    setEditingId(null); setSaving(false); await onChange();
  }
  async function toggleActive(s: Service) {
    await updateService(s.id, { active: !s.active }); await onChange();
  }
  async function addService(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    await createService({ name: addForm.name, price: Number(addForm.price), durationMinutes: Number(addForm.durationMinutes) });
    setAddForm({ name: "", price: "", durationMinutes: "30" });
    setAdding(false); setSaving(false); await onChange();
  }

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden", marginTop: 16 }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--line)" }}>
        <h3 style={{ fontSize: 15, fontWeight: 700 }}>Services</h3>
      </div>
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr><th>Name</th><th>Price</th><th>Duration</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {data.services.map((s) =>
              editingId === s.id ? (
                <tr key={s.id}>
                  <td><input value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} style={{ minHeight: 34 }} /></td>
                  <td><input type="number" value={editForm.price} onChange={(e) => setEditForm((f) => ({ ...f, price: e.target.value }))} style={{ width: 80, minHeight: 34 }} /></td>
                  <td><input type="number" value={editForm.durationMinutes} onChange={(e) => setEditForm((f) => ({ ...f, durationMinutes: e.target.value }))} style={{ width: 64, minHeight: 34 }} /></td>
                  <td />
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-primary btn-sm" type="button" disabled={saving} onClick={() => saveEdit(s.id)}>Save</button>
                      <button className="btn btn-ghost btn-sm" type="button" onClick={() => setEditingId(null)}>Cancel</button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={s.id} style={{ opacity: s.active === false ? 0.5 : 1 }}>
                  <td>{s.name}</td>
                  <td><span className="rev-val">{formatMoney(s.price)}</span></td>
                  <td style={{ color: "var(--ink-3)" }}>{s.durationMinutes} min</td>
                  <td><span className={`chip ${s.active === false ? "chip-cancelled" : "chip-completed"}`}>{s.active === false ? "Inactive" : "Active"}</span></td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-secondary btn-sm" type="button" onClick={() => startEdit(s)}>Edit</button>
                      <button className="btn btn-ghost btn-sm" type="button" onClick={() => toggleActive(s)}>{s.active === false ? "Activate" : "Deactivate"}</button>
                    </div>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      <div style={{ padding: "12px 20px 20px" }}>
        {adding ? (
          <form className="form-stack" onSubmit={addService}>
            <div className="two-col">
              <div className="field"><label>Name</label>
                <input value={addForm.name} onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))} placeholder="Service name" required />
              </div>
              <div className="field"><label>Price (TT$)</label>
                <input type="number" value={addForm.price} onChange={(e) => setAddForm((f) => ({ ...f, price: e.target.value }))} placeholder="120" required />
              </div>
            </div>
            <div className="field" style={{ maxWidth: 200 }}><label>Duration (min)</label>
              <input type="number" value={addForm.durationMinutes} onChange={(e) => setAddForm((f) => ({ ...f, durationMinutes: e.target.value }))} placeholder="30" required />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-primary btn-sm" type="submit" disabled={saving}><Plus size={14} /> Add</button>
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => setAdding(false)}>Cancel</button>
            </div>
          </form>
        ) : (
          <button className="btn btn-secondary btn-sm" type="button" onClick={() => setAdding(true)}>
            <Plus size={14} /> Add Service
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Settings panel ── */
function SettingsPanel({ data, canEdit, onChange }: { data: BootstrapData; canEdit: boolean; onChange: () => Promise<void> }) {
  async function toggleVisibility() {
    await updateSettings({ performanceVisibleToBarbers: !data.settings.performanceVisibleToBarbers });
    await onChange();
  }
  async function updateSchedule(ruleId: string, patch: Record<string, unknown>) {
    const rule = data.scheduleRules.find((r) => r.id === ruleId);
    if (!rule) return;
    await patchScheduleRule({ ...rule, ...patch });
    await onChange();
  }

  return (
    <>
      {/* Owner controls */}
      <div className="card" style={{ padding: "20px 24px", marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Owner Controls</h3>
        <div className="settings-row">
          <div className="settings-row-info">
            <div className="sr-label">Team performance visibility</div>
            <div className="sr-desc">Allow barbers to see the full performance comparison table</div>
          </div>
          <button
            className={`toggle${data.settings.performanceVisibleToBarbers ? " on" : ""}`}
            type="button"
            disabled={!canEdit}
            onClick={toggleVisibility}
            aria-label="Toggle performance visibility"
          />
        </div>
      </div>

      {/* Weekly availability */}
      <div className="card" style={{ padding: 0, overflow: "hidden", marginBottom: 20 }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--line)" }}>
        <h3 style={{ fontSize: 15, fontWeight: 700 }}>Weekly Availability</h3>
      </div>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr><th>Barber</th><th>Day</th><th>Working</th><th>Start</th><th>End</th></tr>
            </thead>
            <tbody>
              {data.scheduleRules.map((rule) => {
                const barber = data.barbers.find((b) => b.id === rule.barberId);
                return (
                  <tr key={rule.id}>
                    <td>
                      <div className="barber-c">
                        <div className="mini-av">{barber?.name.charAt(0)}</div>
                        {barber?.name}
                      </div>
                    </td>
                    <td style={{ color: "var(--ink-3)" }}>{DAY_NAMES[rule.dayOfWeek]}</td>
                    <td>
                      <input
                        type="checkbox"
                        disabled={!canEdit}
                        checked={rule.isWorking}
                        onChange={(e) => updateSchedule(rule.id, { isWorking: e.target.checked })}
                        style={{ accentColor: "var(--accent)", width: 16, height: 16, minHeight: "unset" }}
                      />
                    </td>
                    <td>
                      <input type="time" disabled={!canEdit} value={rule.startTime}
                        onChange={(e) => updateSchedule(rule.id, { startTime: e.target.value })}
                        style={{ width: 110, minHeight: 34, padding: "4px 8px" }}
                      />
                    </td>
                    <td>
                      <input type="time" disabled={!canEdit} value={rule.endTime}
                        onChange={(e) => updateSchedule(rule.id, { endTime: e.target.value })}
                        style={{ width: 110, minHeight: 34, padding: "4px 8px" }}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {canEdit ? <ServicesPanel data={data} onChange={onChange} /> : null}
    </>
  );
}
