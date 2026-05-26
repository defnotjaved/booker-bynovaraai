"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarCheck, Check, Mail, Scissors, Send } from "lucide-react";
import { api, BootstrapData, loadBootstrap, loadSlots } from "./api";
import type { Appointment, Slot } from "@/lib/types";
import { addDays, formatMoney, formatTime, todayString } from "@/lib/time";

type BookingExperienceProps = {
  barberSlug?: string;
};

export function BookingExperience({ barberSlug }: BookingExperienceProps) {
  const [data, setData] = useState<BootstrapData | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState<Appointment | null>(null);
  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    serviceId: "service-haircut",
    date: todayString(),
    startTime: "",
    barberId: ""
  });

  useEffect(() => {
    loadBootstrap()
      .then((payload) => {
        const preselected = payload.barbers.find((barber) => barber.slug === barberSlug);
        setData(payload);
        setForm((current) => ({
          ...current,
          barberId: preselected?.active ? preselected.id : ""
        }));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [barberSlug]);

  useEffect(() => {
    loadSlots(form.date, form.barberId || undefined)
      .then((payload) => setSlots(payload.slots))
      .catch((err) => setError(err.message));
  }, [form.date, form.barberId]);

  const activeBarbers = useMemo(
    () => data?.barbers.filter((barber) => barber.active) ?? [],
    [data]
  );
  const selectedService = data?.services.find((service) => service.id === form.serviceId);
  const uniqueTimes = useMemo(() => {
    const availableTimes = new Set(
      slots.filter((slot) => slot.available).map((slot) => slot.time)
    );
    return Array.from(availableTimes).sort();
  }, [slots]);

  async function submitBooking(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const payload = await api<{ appointment: Appointment }>("/api/appointments", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          barberId: form.barberId || undefined
        })
      });
      setConfirmation(payload.appointment);
      const nextSlots = await loadSlots(form.date, form.barberId || undefined);
      setSlots(nextSlots.slots);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create booking.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="empty">Opening the book...</div>;
  }

  const confirmedBarber = confirmation
    ? data?.barbers.find((barber) => barber.id === confirmation.barberId)
    : null;
  const confirmedService = confirmation
    ? data?.services.find((service) => service.id === confirmation.serviceId)
    : null;

  return (
    <div className="booking-panel">
      {confirmation ? (
        <div className="form-stack" style={{ textAlign: "center", padding: "8px 0" }}>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div className="success-icon" style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--accent-glow)", border: "2px solid rgba(244,121,32,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Scissors size={26} color="var(--accent)" />
            </div>
          </div>
          <div>
            <span className="eyebrow">Booking confirmed</span>
            <h2 style={{ marginTop: 8 }}>{confirmation.customerName}, you&apos;re set.</h2>
          </div>
          <p className="lead">
            {confirmedService?.name} with {confirmedBarber?.name} on{" "}
            {confirmation.date} at {formatTime(confirmation.startTime)}.
          </p>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            <span className="chip chip-completed"><Check size={12} /> Email sent</span>
            <span className="chip chip-arrived"><Mail size={12} /> Barber notified</span>
          </div>
          <button
            className="btn btn-secondary"
            style={{ alignSelf: "center" }}
            onClick={() => {
              setConfirmation(null);
              setForm((current) => ({ ...current, startTime: "" }));
            }}
          >
            <CalendarCheck size={17} />
            Book another
          </button>
        </div>
      ) : (
        <form className="form-grid" onSubmit={submitBooking}>
          <div>
            <span className="eyebrow">Immediate booking</span>
            <h2>Choose a cut, pick a time, get confirmed.</h2>
          </div>

          <div className="field">
            <label htmlFor="service">Service</label>
            <select
              id="service"
              value={form.serviceId}
              onChange={(event) =>
                setForm((current) => ({ ...current, serviceId: event.target.value }))
              }
            >
              {data?.services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} - {formatMoney(service.price)}
                </option>
              ))}
            </select>
          </div>

          <div className="two-col">
            <div className="field">
              <label htmlFor="date">Date</label>
              <select
                id="date"
                value={form.date}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    date: event.target.value,
                    startTime: ""
                  }))
                }
              >
                {[0, 1, 2, 3, 4, 5, 6].map((offset) => {
                  const date = addDays(todayString(), offset);
                  return (
                    <option key={date} value={date}>
                      {date}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="field">
              <label htmlFor="barber">Barber</label>
              <select
                id="barber"
                value={form.barberId}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    barberId: event.target.value,
                    startTime: ""
                  }))
                }
              >
                <option value="">Any available barber</option>
                {activeBarbers.map((barber) => (
                  <option key={barber.id} value={barber.id}>
                    {barber.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="field">
            <label>Available times</label>
            <div className="slot-grid">
              {uniqueTimes.length ? (
                uniqueTimes.map((time) => (
                  <button
                    className={`time-slot${form.startTime === time ? " sel" : ""}`}
                    key={time}
                    type="button"
                    onClick={() => setForm((current) => ({ ...current, startTime: time }))}
                  >
                    {formatTime(time)}
                  </button>
                ))
              ) : (
                <div className="empty">No times available for this selection.</div>
              )}
            </div>
          </div>

          <div className="two-col">
            <div className="field">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                required
                value={form.customerName}
                onChange={(event) =>
                  setForm((current) => ({ ...current, customerName: event.target.value }))
                }
              />
            </div>
            <div className="field">
              <label htmlFor="phone">Phone</label>
              <input
                id="phone"
                required
                value={form.customerPhone}
                onChange={(event) =>
                  setForm((current) => ({ ...current, customerPhone: event.target.value }))
                }
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              required
              type="email"
              value={form.customerEmail}
              onChange={(event) =>
                setForm((current) => ({ ...current, customerEmail: event.target.value }))
              }
            />
          </div>

          {selectedService ? (
            <div className="tag-row">
              <span className="tag">
                <Scissors size={14} /> {selectedService.durationMinutes} min
              </span>
              <span className="tag">{formatMoney(selectedService.price)}</span>
            </div>
          ) : null}

          {error ? <p className="down">{error}</p> : null}
          <button className="btn" disabled={!form.startTime || submitting}>
            <Send size={17} />
            {submitting ? "Booking..." : "Confirm booking"}
          </button>
        </form>
      )}
    </div>
  );
}
