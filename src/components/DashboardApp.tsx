"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  BarChart3,
  CalendarDays,
  Check,
  Clock,
  Mail,
  Plus,
  Settings,
  UserCheck,
  X
} from "lucide-react";
import { api, BootstrapData, loadBootstrap } from "./api";
import { TopBar } from "./TopBar";
import type { Appointment, AppointmentStatus, Role, Service } from "@/lib/types";
import { formatMoney, formatTime, generateTimes, todayString } from "@/lib/time";

type DashboardView = "today" | "calendar" | "analytics" | "settings";

type DashboardAppProps = {
  view: DashboardView;
};

type WalkInPrefill = {
  customerName: string;
  customerPhone: string;
  barberId: string;
  date: string;
};

function addInterval(dateStr: string, interval: "1w" | "2w" | "1m"): string {
  const d = new Date(dateStr);
  if (interval === "1w") d.setDate(d.getDate() + 7);
  else if (interval === "2w") d.setDate(d.getDate() + 14);
  else d.setMonth(d.getMonth() + 1);
  return d.toISOString().split("T")[0];
}

const statusLabels: Record<AppointmentStatus, string> = {
  booked: "Booked",
  arrived: "Arrived",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No-show"
};

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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

  useEffect(() => {
    refresh().catch((err) => setError(err.message));
  }, []);

  const currentUser = session?.user
    ? {
        id: session.user.id,
        name: session.user.name ?? "",
        email: session.user.email ?? "",
        role: session.user.role as Role,
        barberId: session.user.barberId,
      }
    : null;

  const activeBarbers = useMemo(
    () => data?.barbers.filter((barber) => barber.active) ?? [],
    [data]
  );
  const visibleBarbers =
    currentUser?.role === "owner"
      ? activeBarbers
      : activeBarbers.filter((barber) => barber.id === currentUser?.barberId);
  const canSeePerformance =
    currentUser?.role === "owner" || !!data?.settings.performanceVisibleToBarbers;

  if (!data) {
    return (
      <main className="shell">
        <TopBar />
        <section className="page">
          <div className="empty">Loading IconBook dashboard...</div>
        </section>
      </main>
    );
  }

  return (
    <main className="shell">
      <TopBar />
      <section className="page panel-stack">
        <div className="panel-head">
          <div>
            <span className="eyebrow">Shop command center</span>
            <h2>{viewTitle(view)}</h2>
          </div>
        </div>

        <div className="stats">
          <Stat label="Today revenue" value={formatMoney(data.analytics.todayRevenue)} />
          <Stat label="Cuts today" value={`${data.analytics.todayCuts}`} />
          <Stat
            label="Vs yesterday"
            value={`${data.analytics.revenueDeltaPercent}%`}
            tone={data.analytics.revenueDeltaPercent >= 0 ? "up" : "down"}
          />
          <Stat label="Attendance" value={`${data.analytics.attendanceRate}%`} />
        </div>

        <div className="dash-grid">
          <aside className="sidebar">
            <div className="panel">
              <div className="panel-stack">
                <Link className="pill" href="/dashboard">
                  <CalendarDays size={16} />
                  Today
                </Link>
                <Link className="pill" href="/dashboard/calendar">
                  <Clock size={16} />
                  Calendar
                </Link>
                <Link className="pill" href="/dashboard/analytics">
                  <BarChart3 size={16} />
                  Analytics
                </Link>
                <Link className="pill" href="/dashboard/settings">
                  <Settings size={16} />
                  Settings
                </Link>
              </div>
            </div>
            <ShareLinks barbers={activeBarbers} />
          </aside>

          <div className="panel-stack">
            {error ? <p className="down">{error}</p> : null}
            {view === "today" ? (
              <>
                <WalkInPanel
                  data={data}
                  onChange={refresh}
                  prefillData={prefillData}
                  onClearPrefill={() => setPrefillData(null)}
                />
                <TodayPanel
                  data={data}
                  visibleBarbers={visibleBarbers}
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  onChange={refresh}
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
          </div>
        </div>
      </section>
    </main>
  );
}

function viewTitle(view: DashboardView) {
  if (view === "calendar") return "Calendar";
  if (view === "analytics") return "Analytics";
  if (view === "settings") return "Settings";
  return "Today";
}

function Stat({
  label,
  value,
  tone
}: {
  label: string;
  value: string;
  tone?: "up" | "down";
}) {
  return (
    <div className="stat">
      <span>{label}</span>
      <strong className={tone}>{value}</strong>
    </div>
  );
}

function ShareLinks({ barbers }: { barbers: BootstrapData["barbers"] }) {
  return (
    <div className="panel">
      <div className="panel-head">
        <h3>Booking links</h3>
      </div>
      <div className="list">
        <Link className="pill" href="/book">
          Any barber
        </Link>
        {barbers.map((barber) => (
          <Link className="pill" href={`/book/${barber.slug}`} key={barber.id}>
            {barber.name}
          </Link>
        ))}
      </div>
    </div>
  );
}

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
  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "walkin@iconbook.local",
    serviceId: activeServices[0]?.id ?? "",
    date: todayString(),
    startTime: "09:00",
    barberId: data.barbers.find((barber) => barber.active)?.id ?? ""
  });
  const [saving, setSaving] = useState(false);
  const activeBarbers = data.barbers.filter((barber) => barber.active);

  useEffect(() => {
    if (prefillData) {
      setForm((f) => ({
        ...f,
        customerName: prefillData.customerName,
        customerPhone: prefillData.customerPhone,
        barberId: prefillData.barberId,
        date: prefillData.date
      }));
    }
  }, [prefillData]);

  async function addWalkIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    await api("/api/appointments", {
      method: "POST",
      body: JSON.stringify({
        ...form,
        source: "walk_in",
        customerName: form.customerName || "Walk-in client",
        customerPhone: form.customerPhone || "Not recorded"
      })
    });
    setForm((current) => ({ ...current, customerName: "", customerPhone: "" }));
    onClearPrefill?.();
    await onChange();
    setSaving(false);
  }

  return (
    <div className="panel">
      <div className="panel-head">
        <h3>Add walk-in</h3>
        <Plus size={18} />
      </div>
      <form className="form-grid" onSubmit={addWalkIn}>
        <div className="two-col">
          <div className="field">
            <label>Name</label>
            <input
              value={form.customerName}
              onChange={(event) =>
                setForm((current) => ({ ...current, customerName: event.target.value }))
              }
              placeholder="Walk-in client"
            />
          </div>
          <div className="field">
            <label>Phone</label>
            <input
              value={form.customerPhone}
              onChange={(event) =>
                setForm((current) => ({ ...current, customerPhone: event.target.value }))
              }
              placeholder="Optional"
            />
          </div>
        </div>
        <div className="two-col">
          <div className="field">
            <label>Barber</label>
            <select
              value={form.barberId}
              onChange={(event) =>
                setForm((current) => ({ ...current, barberId: event.target.value }))
              }
            >
              {activeBarbers.map((barber) => (
                <option key={barber.id} value={barber.id}>
                  {barber.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Service</label>
            <select
              value={form.serviceId}
              onChange={(event) =>
                setForm((current) => ({ ...current, serviceId: event.target.value }))
              }
            >
              {activeServices.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} - {formatMoney(service.price)}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="two-col">
          <div className="field">
            <label>Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(event) =>
                setForm((current) => ({ ...current, date: event.target.value }))
              }
            />
          </div>
          <div className="field">
            <label>Start</label>
            <select
              value={form.startTime}
              onChange={(event) =>
                setForm((current) => ({ ...current, startTime: event.target.value }))
              }
            >
              {generateTimes(data.settings.shopStartTime, data.settings.overflowEndTime).map(
                (time) => (
                  <option key={time} value={time}>
                    {formatTime(time)}
                  </option>
                )
              )}
            </select>
          </div>
        </div>
        <button className="btn" disabled={saving}>
          <Plus size={17} />
          Add walk-in
        </button>
      </form>
    </div>
  );
}

function TodayPanel(props: {
  data: BootstrapData;
  visibleBarbers: BootstrapData["barbers"];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  onChange: () => Promise<void>;
  onPrefill?: (prefill: WalkInPrefill) => void;
}) {
  return <CalendarPanel compact {...props} />;
}

function CalendarPanel({
  data,
  visibleBarbers,
  selectedDate,
  setSelectedDate,
  onChange,
  compact = false,
  onPrefill
}: {
  data: BootstrapData;
  visibleBarbers: BootstrapData["barbers"];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  onChange: () => Promise<void>;
  compact?: boolean;
  onPrefill?: (prefill: WalkInPrefill) => void;
}) {
  const times = generateTimes(data.settings.shopStartTime, data.settings.overflowEndTime);
  const appointments = data.appointments.filter((item) => item.date === selectedDate);

  return (
    <div className="panel">
      <div className="panel-head">
        <h3>{compact ? "Today’s synced book" : "Shared calendar"}</h3>
        <div className="field">
          <label>Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
          />
        </div>
      </div>
      <div className="calendar">
        <div
          className="calendar-grid"
          style={{
            gridTemplateColumns: `74px repeat(${visibleBarbers.length}, minmax(180px, 1fr))`
          }}
        >
          <div className="calendar-cell header">Time</div>
          {visibleBarbers.map((barber) => (
            <div className="calendar-cell header" key={barber.id}>
              {barber.name}
            </div>
          ))}
          {times.flatMap((time) => [
            <div className="calendar-cell time-cell" key={`${time}-time`}>
              {formatTime(time)}
            </div>,
            ...visibleBarbers.map((barber) => {
              const appointment = appointments.find(
                (item) => item.barberId === barber.id && item.startTime === time
              );
              return (
                <div className="calendar-cell" key={`${barber.id}-${time}`}>
                  {appointment ? (
                    <AppointmentCard
                      appointment={appointment}
                      data={data}
                      onChange={onChange}
                      onPrefill={onPrefill}
                    />
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

function AppointmentCard({
  appointment,
  data,
  onChange,
  onPrefill
}: {
  appointment: Appointment;
  data: BootstrapData;
  onChange: () => Promise<void>;
  onPrefill?: (prefill: WalkInPrefill) => void;
}) {
  const service = data.services.find((item) => item.id === appointment.serviceId);
  const [finalServiceAmount, setFinalServiceAmount] = useState(
    `${appointment.finalServiceAmount ?? service?.price ?? 0}`
  );
  const [productAmount, setProductAmount] = useState(`${appointment.productAmount ?? 0}`);

  async function patch(body: Partial<Appointment>) {
    await api(`/api/appointments/${appointment.id}`, {
      method: "PATCH",
      body: JSON.stringify(body)
    });
    await onChange();
  }

  return (
    <div className={`appointment ${appointment.source} ${appointment.status}`}>
      <strong>{appointment.customerName}</strong>
      <span>{service?.name}</span>
      <div className="tag-row">
        <span className="tag">{statusLabels[appointment.status]}</span>
        <span className="tag">{appointment.source === "walk_in" ? "Walk-in" : "Online"}</span>
      </div>
      {appointment.status !== "completed" ? (
        <div className="tag-row">
          <button className="btn secondary" type="button" onClick={() => patch({ status: "arrived" })}>
            <UserCheck size={14} />
          </button>
          <button className="btn secondary" type="button" onClick={() => patch({ status: "cancelled" })}>
            <X size={14} />
          </button>
        </div>
      ) : null}
      <div className="two-col">
        <input
          aria-label="Final service amount"
          value={finalServiceAmount}
          onChange={(event) => setFinalServiceAmount(event.target.value)}
        />
        <input
          aria-label="Product amount"
          value={productAmount}
          onChange={(event) => setProductAmount(event.target.value)}
        />
      </div>
      <button
        className="btn"
        type="button"
        onClick={() =>
          patch({
            status: "completed",
            finalServiceAmount: Number(finalServiceAmount) || service?.price || 0,
            productAmount: Number(productAmount) || 0
          })
        }
      >
        <Check size={14} />
        Complete
      </button>
      {appointment.status === "completed" && onPrefill ? (
        <div className="tag-row" style={{ flexWrap: "wrap", gap: 4 }}>
          <span style={{ fontSize: 11, color: "var(--muted)", width: "100%" }}>
            Schedule next visit:
          </span>
          {(["1w", "2w", "1m"] as const).map((interval) => (
            <button
              key={interval}
              className="btn secondary"
              type="button"
              style={{ fontSize: 11, padding: "2px 8px" }}
              onClick={() =>
                onPrefill({
                  customerName: appointment.customerName,
                  customerPhone: appointment.customerPhone,
                  barberId: appointment.barberId,
                  date: addInterval(appointment.date, interval)
                })
              }
            >
              +{interval === "1w" ? "1 Wk" : interval === "2w" ? "2 Wks" : "1 Mo"}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function AnalyticsPanel({
  data,
  canSeePerformance
}: {
  data: BootstrapData;
  canSeePerformance: boolean;
}) {
  return (
    <>
      <div className="panel">
        <div className="panel-head">
          <h3>Owner snapshot</h3>
          <BarChart3 size={18} />
        </div>
        <div className="stats">
          <Stat label="Yesterday revenue" value={formatMoney(data.analytics.yesterdayRevenue)} />
          <Stat label="Week revenue" value={formatMoney(data.analytics.weekRevenue)} />
          <Stat label="Product sales" value={formatMoney(data.analytics.productRevenue)} />
          <Stat label="Anil owner share" value={formatMoney(data.analytics.ownerCommission)} />
        </div>
      </div>
      <div className="panel">
        <div className="panel-head">
          <h3>Barber performance</h3>
        </div>
        {canSeePerformance ? (
          <table className="table">
            <thead>
              <tr>
                <th>Barber</th>
                <th>Cuts</th>
                <th>Service revenue</th>
                <th>Owner share</th>
                <th>Barber share</th>
              </tr>
            </thead>
            <tbody>
              {data.analytics.barberPerformance.map((item) => {
                const barber = data.barbers.find((entry) => entry.id === item.barberId);
                return (
                  <tr key={item.barberId}>
                    <td>{barber?.name}</td>
                    <td>{item.cuts}</td>
                    <td>{formatMoney(item.serviceRevenue)}</td>
                    <td>{formatMoney(item.ownerShare)}</td>
                    <td>{formatMoney(item.barberShare)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="empty">Performance comparison is owner-only right now.</div>
        )}
      </div>
      <div className="panel">
        <div className="panel-head">
          <h3>Email notification log</h3>
          <Mail size={18} />
        </div>
        <div className="list">
          {data.notifications.length ? (
            data.notifications.slice(0, 8).map((notification) => (
              <div className="row" key={notification.id}>
                <div>
                  <strong>{notification.subject}</strong>
                  <p className="lead">{notification.recipientEmail}</p>
                </div>
                <span className="tag">{notification.status}</span>
              </div>
            ))
          ) : (
            <div className="empty">No notifications have been sent yet.</div>
          )}
        </div>
      </div>
    </>
  );
}

function ServicesPanel({
  data,
  onChange
}: {
  data: BootstrapData;
  onChange: () => Promise<void>;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", price: "", durationMinutes: "" });
  const [addForm, setAddForm] = useState({ name: "", price: "", durationMinutes: "30" });
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  function startEdit(service: Service) {
    setEditingId(service.id);
    setEditForm({
      name: service.name,
      price: String(service.price),
      durationMinutes: String(service.durationMinutes)
    });
  }

  async function saveEdit(id: string) {
    setSaving(true);
    await api(`/api/services/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        name: editForm.name,
        price: Number(editForm.price),
        durationMinutes: Number(editForm.durationMinutes)
      })
    });
    setEditingId(null);
    setSaving(false);
    await onChange();
  }

  async function toggleActive(service: Service) {
    await api(`/api/services/${service.id}`, {
      method: "PATCH",
      body: JSON.stringify({ active: !service.active })
    });
    await onChange();
  }

  async function addService(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    await api("/api/services", {
      method: "POST",
      body: JSON.stringify({
        name: addForm.name,
        price: Number(addForm.price),
        durationMinutes: Number(addForm.durationMinutes)
      })
    });
    setAddForm({ name: "", price: "", durationMinutes: "30" });
    setAdding(false);
    setSaving(false);
    await onChange();
  }

  return (
    <div className="panel">
      <div className="panel-head">
        <h3>Services</h3>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Duration</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {data.services.map((service) =>
            editingId === service.id ? (
              <tr key={service.id}>
                <td>
                  <input
                    value={editForm.name}
                    onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={editForm.price}
                    onChange={(e) => setEditForm((f) => ({ ...f, price: e.target.value }))}
                    style={{ width: 80 }}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={editForm.durationMinutes}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, durationMinutes: e.target.value }))
                    }
                    style={{ width: 64 }}
                  />
                </td>
                <td></td>
                <td>
                  <div className="tag-row">
                    <button
                      className="btn"
                      type="button"
                      disabled={saving}
                      onClick={() => saveEdit(service.id)}
                    >
                      Save
                    </button>
                    <button
                      className="btn secondary"
                      type="button"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              <tr key={service.id} style={{ opacity: service.active === false ? 0.5 : 1 }}>
                <td>{service.name}</td>
                <td>{formatMoney(service.price)}</td>
                <td>{service.durationMinutes} min</td>
                <td>
                  <span className="tag" style={service.active === false ? { color: "var(--muted)" } : {}}>
                    {service.active === false ? "Inactive" : "Active"}
                  </span>
                </td>
                <td>
                  <div className="tag-row">
                    <button
                      className="btn secondary"
                      type="button"
                      onClick={() => startEdit(service)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn secondary"
                      type="button"
                      onClick={() => toggleActive(service)}
                    >
                      {service.active === false ? "Activate" : "Deactivate"}
                    </button>
                  </div>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
      {adding ? (
        <form className="form-grid" onSubmit={addService} style={{ marginTop: 12 }}>
          <div className="two-col">
            <div className="field">
              <label>Name</label>
              <input
                value={addForm.name}
                onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Service name"
                required
              />
            </div>
            <div className="field">
              <label>Price (TT$)</label>
              <input
                type="number"
                value={addForm.price}
                onChange={(e) => setAddForm((f) => ({ ...f, price: e.target.value }))}
                placeholder="120"
                required
              />
            </div>
          </div>
          <div className="field">
            <label>Duration (minutes)</label>
            <input
              type="number"
              value={addForm.durationMinutes}
              onChange={(e) => setAddForm((f) => ({ ...f, durationMinutes: e.target.value }))}
              placeholder="30"
              required
            />
          </div>
          <div className="tag-row">
            <button className="btn" type="submit" disabled={saving}>
              <Plus size={14} />
              Add Service
            </button>
            <button className="btn secondary" type="button" onClick={() => setAdding(false)}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          className="btn secondary"
          type="button"
          style={{ marginTop: 12 }}
          onClick={() => setAdding(true)}
        >
          <Plus size={14} />
          Add Service
        </button>
      )}
    </div>
  );
}

function SettingsPanel({
  data,
  canEdit,
  onChange
}: {
  data: BootstrapData;
  canEdit: boolean;
  onChange: () => Promise<void>;
}) {
  async function toggleVisibility() {
    await api("/api/settings", {
      method: "PATCH",
      body: JSON.stringify({
        performanceVisibleToBarbers: !data.settings.performanceVisibleToBarbers
      })
    });
    await onChange();
  }

  async function updateSchedule(ruleId: string, patch: Record<string, unknown>) {
    const rule = data.scheduleRules.find((item) => item.id === ruleId);
    if (!rule) return;
    await api("/api/schedule", {
      method: "PATCH",
      body: JSON.stringify({ ...rule, ...patch })
    });
    await onChange();
  }

  return (
    <>
      <div className="panel">
        <div className="panel-head">
          <h3>Owner controls</h3>
        </div>
        <button className="btn secondary" disabled={!canEdit} onClick={toggleVisibility}>
          {data.settings.performanceVisibleToBarbers
            ? "Hide team performance from barbers"
            : "Show team performance to barbers"}
        </button>
      </div>
      <div className="panel">
        <div className="panel-head">
          <h3>Weekly availability</h3>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Barber</th>
              <th>Day</th>
              <th>Working</th>
              <th>Start</th>
              <th>End</th>
            </tr>
          </thead>
          <tbody>
            {data.scheduleRules.map((rule) => {
              const barber = data.barbers.find((item) => item.id === rule.barberId);
              return (
                <tr key={rule.id}>
                  <td>{barber?.name}</td>
                  <td>{dayNames[rule.dayOfWeek]}</td>
                  <td>
                    <input
                      disabled={!canEdit}
                      type="checkbox"
                      checked={rule.isWorking}
                      onChange={(event) =>
                        updateSchedule(rule.id, { isWorking: event.target.checked })
                      }
                    />
                  </td>
                  <td>
                    <input
                      disabled={!canEdit}
                      type="time"
                      value={rule.startTime}
                      onChange={(event) =>
                        updateSchedule(rule.id, { startTime: event.target.value })
                      }
                    />
                  </td>
                  <td>
                    <input
                      disabled={!canEdit}
                      type="time"
                      value={rule.endTime}
                      onChange={(event) =>
                        updateSchedule(rule.id, { endTime: event.target.value })
                      }
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {canEdit ? <ServicesPanel data={data} onChange={onChange} /> : null}
    </>
  );
}
