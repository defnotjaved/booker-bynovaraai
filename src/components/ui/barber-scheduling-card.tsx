"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Scissors, Check, Clock } from "lucide-react";

interface TimeSlot { time: string; available: boolean; }
interface DaySchedule { date: string; dayName: string; dayNumber: number; slots: TimeSlot[]; hasAvailability: boolean; }
interface Barber { id: string; name: string; slug: string; }
interface Service { id: string; name: string; price: number; durationMinutes: number; }
interface BookingData { barberId: string; serviceId: string; date: string; time: string; customerName: string; customerPhone: string; customerEmail: string; }

interface BarberSchedulingProps {
  barbers: Barber[];
  services: Service[];
  weekSchedule: DaySchedule[];
  weekOffset?: number;
  onBarberChange?: (barberId: string) => void;
  onTimeSlotSelect?: (day: string, time: string, barberId: string) => void;
  onWeekChange?: (direction: "prev" | "next") => void;
  onConfirm?: (data: BookingData) => Promise<void>;
  enableAnimations?: boolean;
}

const STEP_LABELS = ["Service", "Barber", "Date & Time", "Your Details"];

function getInitials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

export function BarberSchedulingCard({
  barbers, services, weekSchedule, weekOffset = 0,
  onBarberChange, onWeekChange, onConfirm, enableAnimations = true,
}: BarberSchedulingProps) {
  const [step, setStep] = useState(1);
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id ?? "");
  const [selectedBarberId, setSelectedBarberId] = useState("");
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; time: string; dayName: string } | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [returningCustomer, setReturningCustomer] = useState<{ name: string; email: string; visitCount: number } | null>(null);

  const shouldReduceMotion = useReducedMotion();
  const animate = enableAnimations && !shouldReduceMotion;

  const selectedService = services.find((s) => s.id === selectedServiceId) ?? services[0];
  const selectedBarber  = barbers.find((b) => b.id === selectedBarberId) ?? null;
  const selectedDay     = selectedDayIndex !== null ? weekSchedule[selectedDayIndex] : null;

  function handleBarberSelect(barberId: string) {
    setSelectedBarberId(barberId);
    onBarberChange?.(barberId);
  }

  function handleSlotClick(slot: TimeSlot, day: DaySchedule) {
    if (!slot.available) return;
    setSelectedSlot({ date: day.date, time: slot.time, dayName: day.dayName });
    setStep(4);
  }

  async function handleConfirm() {
    if (!selectedSlot || !form.name || !form.phone || !form.email) return;
    setSubmitting(true);
    await onConfirm?.({ barberId: selectedBarberId || (barbers[0]?.id ?? ""), serviceId: selectedServiceId, date: selectedSlot.date, time: selectedSlot.time, customerName: form.name, customerPhone: form.phone, customerEmail: form.email });
    setSubmitting(false);
    setConfirmed(true);
  }

  function resetAll() {
    setStep(1); setSelectedServiceId(services[0]?.id ?? ""); setSelectedBarberId("");
    setSelectedDayIndex(null); setSelectedSlot(null); setForm({ name: "", phone: "", email: "" });
    setConfirmed(false); setReturningCustomer(null);
  }

  const slideIn = {
    enter:  { x: 30, opacity: 0 },
    center: { x: 0, opacity: 1, transition: { duration: 0.26, ease: "easeOut" as const } },
    exit:   { x: -30, opacity: 0, transition: { duration: 0.16, ease: "easeIn" as const } },
  };
  const stagger   = { hidden: {}, visible: { transition: { staggerChildren: 0.05 } } };
  const fadeUp    = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.22 } } };
  const slotStagger = { hidden: {}, visible: { transition: { staggerChildren: 0.025 } } };
  const slotIn    = { hidden: { opacity: 0, scale: 0.82 }, visible: { opacity: 1, scale: 1, transition: { type: "spring" as const, stiffness: 500, damping: 26 } } };

  /* ── SUCCESS SCREEN ── */
  if (confirmed && selectedSlot) {
    return (
      <div className="wizard-card">
        <div style={{ padding: "52px 32px", textAlign: "center" }}>
          <motion.div
            className="success-icon"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--accent-glow)", border: "2px solid rgba(244,121,32,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}
          >
            <Scissors size={28} color="var(--accent)" />
          </motion.div>
          <h3 style={{ fontSize: 22, fontWeight: 900, marginBottom: 10, letterSpacing: "-0.02em", fontFamily: "var(--font-heading)" }}>Booking Confirmed!</h3>
          <p style={{ color: "var(--ink-3)", marginBottom: 6, fontSize: 15 }}>
            {selectedSlot.dayName}, {selectedSlot.date}{" "}
            <span style={{ color: "var(--accent)", fontWeight: 700 }}>at {selectedSlot.time}</span>
          </p>
          <p style={{ color: "var(--ink-3)", fontSize: 13 }}>{selectedService?.name} · {selectedBarber?.name ?? "Any Barber"}</p>
          <p style={{ color: "var(--ink-3)", fontSize: 13, marginTop: 6 }}>See you at the shop!</p>
          <button onClick={resetAll} className="btn btn-secondary" style={{ marginTop: 28 }}>Book Another</button>
        </div>
      </div>
    );
  }

  const progressPct = ((step - 1) / (STEP_LABELS.length - 1)) * 100;

  return (
    <div className="wizard-card">
      {/* Progress bar */}
      <div className="wiz-progress">
        <motion.div className="wiz-progress-fill" style={{ width: `${progressPct}%` }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} />
      </div>

      {/* Header: shop info + step indicator */}
      <div className="wiz-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 16, borderBottom: "1px solid var(--line)" }}>
          <div style={{ width: 40, height: 40, borderRadius: "var(--radius-md)", background: "var(--accent-glow)", border: "1px solid rgba(244,121,32,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Scissors size={18} color="var(--accent)" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 15, fontFamily: "var(--font-heading)" }}>Icon Barbers</div>
            <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 1 }}>Aranguez · 5.0 ★ · 174 reviews</div>
          </div>
          <span className="wiz-step-hint">Step {step} of {STEP_LABELS.length}</span>
        </div>

        {/* Step dots */}
        <div style={{ display: "flex", alignItems: "center", paddingTop: 14, gap: 0 }}>
          {STEP_LABELS.map((label, i) => {
            const num = i + 1;
            const isActive = step === num;
            const isDone = step > num;
            return (
              <div key={label} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: isDone || isActive ? "var(--accent)" : "var(--panel-strong)", border: `2px solid ${isDone || isActive ? "var(--accent)" : "var(--line)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}>
                    {isDone ? <Check size={11} color="#fff" strokeWidth={3} /> : <span style={{ fontSize: 10, fontWeight: 800, color: isActive ? "#fff" : "var(--ink-3)", lineHeight: 1 }}>{num}</span>}
                  </div>
                  <span className={isActive ? "wiz-label wiz-label-active" : "wiz-label"} style={{ fontSize: 11, fontWeight: isActive ? 700 : 500, color: isActive ? "var(--ink)" : isDone ? "var(--accent)" : "var(--ink-3)", transition: "color 0.2s", whiteSpace: "nowrap" }}>{label}</span>
                </div>
                {i < STEP_LABELS.length - 1 && <div style={{ flex: 1, height: 1, background: step > num ? "rgba(244,121,32,0.4)" : "var(--line)", margin: "0 6px", transition: "background 0.3s" }} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step content */}
      <div className="wiz-body" style={{ minHeight: 320, position: "relative", overflow: "hidden" }}>
        <AnimatePresence mode="wait">

          {/* ── STEP 1: SERVICE ── */}
          {step === 1 && (
            <motion.div key="step1" variants={animate ? slideIn : {}} initial="enter" animate="center" exit="exit">
              <p style={{ fontSize: 13, color: "var(--ink-3)", marginBottom: 16, fontWeight: 600 }}>What are you coming in for?</p>
              <motion.div variants={animate ? stagger : {}} initial="hidden" animate="visible" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(180px, 100%), 1fr))", gap: 10, marginBottom: 28 }}>
                {services.map((service) => {
                  const sel = selectedServiceId === service.id;
                  return (
                    <motion.button
                      key={service.id}
                      variants={animate ? fadeUp : {}}
                      className={`svc-card${sel ? " sel" : ""}`}
                      onClick={() => setSelectedServiceId(service.id)}
                    >
                      <div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 7, background: sel ? "var(--accent-glow)" : "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Scissors size={13} color={sel ? "var(--accent)" : "var(--ink-3)"} />
                          </div>
                          {sel && <div style={{ width: 18, height: 18, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}><Check size={10} color="#fff" strokeWidth={3} /></div>}
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", marginBottom: 6, lineHeight: 1.3 }}>{service.name}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 14, fontWeight: 800, color: "var(--accent)" }}>TT${service.price}</span>
                          <span style={{ fontSize: 11, color: "var(--ink-3)", display: "flex", alignItems: "center", gap: 3 }}><Clock size={10} />{service.durationMinutes} min</span>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </motion.div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button className="btn btn-primary" onClick={() => setStep(2)}>Next <ChevronRight size={14} /></button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 2: BARBER ── */}
          {step === 2 && (
            <motion.div key="step2" variants={animate ? slideIn : {}} initial="enter" animate="center" exit="exit">
              <p style={{ fontSize: 13, color: "var(--ink-3)", marginBottom: 18, fontWeight: 600 }}>Who would you like?</p>
              <motion.div variants={animate ? stagger : {}} initial="hidden" animate="visible" style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 32 }}>
                {[{ id: "", name: "Any Barber" }, ...barbers].map((barber) => {
                  const sel = selectedBarberId === barber.id;
                  const initials = barber.id === "" ? "✂" : getInitials(barber.name);
                  return (
                    <motion.div key={barber.id || "any"} variants={animate ? fadeUp : {}}>
                      <button className={`barber-pick${sel ? " sel" : ""}`} onClick={() => handleBarberSelect(barber.id)}>
                        <div className="barber-av">{initials}</div>
                        <span className="barber-nm">{barber.name}</span>
                      </button>
                    </motion.div>
                  );
                })}
              </motion.div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setStep(1)}><ChevronLeft size={14} /> Back</button>
                <button className="btn btn-primary" onClick={() => setStep(3)}>Next <ChevronRight size={14} /></button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: DATE & TIME ── */}
          {step === 3 && (
            <motion.div key="step3" variants={animate ? slideIn : {}} initial="enter" animate="center" exit="exit">
              {/* Date strip */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 22 }}>
                <button
                  className="btn btn-ghost btn-icon"
                  onClick={() => { onWeekChange?.("prev"); setSelectedDayIndex(null); }}
                  disabled={weekOffset === 0}
                  style={{ borderRadius: "50%", border: "1px solid var(--line)" }}
                >
                  <ChevronLeft size={13} />
                </button>
                <div style={{ flex: 1, display: "flex", gap: 5, overflowX: "auto", scrollbarWidth: "none" }}>
                  {weekSchedule.length === 0 ? (
                    <div style={{ color: "var(--ink-3)", fontSize: 13, padding: "8px 0" }}>Loading…</div>
                  ) : (
                    weekSchedule.map((day, i) => {
                      const sel = selectedDayIndex === i;
                      const noSlots = !day.hasAvailability;
                      return (
                        <button
                          key={day.date}
                          className={`date-chip${sel ? " sel" : ""}`}
                          onClick={() => !noSlots && setSelectedDayIndex(i)}
                          disabled={noSlots}
                          style={{ opacity: noSlots ? 0.3 : 1 }}
                        >
                          <span className="dc-day">{day.dayName.slice(0, 3)}</span>
                          <span className="dc-num">{day.dayNumber}</span>
                        </button>
                      );
                    })
                  )}
                </div>
                <button
                  className="btn btn-ghost btn-icon"
                  onClick={() => { onWeekChange?.("next"); setSelectedDayIndex(null); }}
                  style={{ borderRadius: "50%", border: "1px solid var(--line)" }}
                >
                  <ChevronRight size={13} />
                </button>
              </div>

              {/* Time slots */}
              {selectedDay ? (
                <motion.div key={`slots-${selectedDayIndex}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                  <p style={{ fontSize: 13, color: "var(--ink-3)", marginBottom: 14, fontWeight: 600 }}>{selectedDay.dayName}, {selectedDay.date}</p>
                  {selectedDay.hasAvailability ? (
                    <motion.div
                      variants={animate ? slotStagger : {}}
                      initial="hidden" animate="visible"
                      style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 24 }}
                    >
                      {selectedDay.slots.map((slot) => (
                        <motion.button
                          key={slot.time}
                          variants={animate ? slotIn : {}}
                          className={`time-slot${!slot.available ? " dis" : ""}`}
                          onClick={() => handleSlotClick(slot, selectedDay)}
                          disabled={!slot.available}
                        >
                          {slot.time}
                        </motion.button>
                      ))}
                    </motion.div>
                  ) : (
                    <p style={{ color: "var(--ink-3)", fontSize: 13, marginBottom: 24 }}>No availability for this day.</p>
                  )}
                </motion.div>
              ) : (
                <p style={{ color: "var(--ink-3)", fontSize: 13, paddingTop: 6, marginBottom: 24 }}>Pick a date above to see available times.</p>
              )}

              <button className="btn btn-secondary btn-sm" onClick={() => setStep(2)}><ChevronLeft size={14} /> Back</button>
            </motion.div>
          )}

          {/* ── STEP 4: DETAILS ── */}
          {step === 4 && selectedSlot && (
            <motion.div key="step4" variants={animate ? slideIn : {}} initial="enter" animate="center" exit="exit">
              {/* Booking summary */}
              <div style={{ background: "var(--accent-glow)", border: "1px solid rgba(244,121,32,0.2)", borderRadius: "var(--radius-md)", padding: "12px 16px", marginBottom: 20 }}>
                <div className="label-sm" style={{ marginBottom: 4 }}>Your appointment</div>
                <div style={{ fontWeight: 800, fontSize: 15 }}>
                  {selectedSlot.dayName}, {selectedSlot.date}
                  <span style={{ color: "var(--accent)", marginLeft: 8 }}>at {selectedSlot.time}</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 3 }}>{selectedService?.name} · {selectedBarber?.name ?? "Any Barber"}</div>
              </div>

              {returningCustomer && (
                <div style={{ background: "var(--accent-glow)", border: "1px solid rgba(244,121,32,0.3)", borderRadius: "var(--radius-md)", padding: "8px 14px", fontSize: 13, color: "var(--accent)", fontWeight: 600, marginBottom: 16 }}>
                  Welcome back, {returningCustomer.name}! Visit #{returningCustomer.visitCount + 1}
                </div>
              )}

              <div className="form-stack" style={{ marginBottom: 20 }}>
                <div className="field">
                  <label>Phone</label>
                  <input
                    type="tel" placeholder="(868) 000-0000" value={form.phone}
                    onChange={(e) => { setForm((f) => ({ ...f, phone: e.target.value })); setReturningCustomer(null); }}
                    onBlur={async (e) => {
                      const digits = e.target.value.replace(/\D/g, "");
                      if (digits.length < 7) return;
                      try {
                        const res = await fetch(`/api/customers/lookup?phone=${encodeURIComponent(e.target.value)}`);
                        const data = await res.json();
                        if (data) { setReturningCustomer(data); setForm((f) => ({ ...f, name: data.name, email: data.email })); }
                      } catch {}
                    }}
                  />
                </div>
                <div className="field">
                  <label>Full Name</label>
                  <input type="text" placeholder="Your name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="field">
                  <label>Email</label>
                  <input type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setStep(3)}><ChevronLeft size={14} /> Back</button>
                <motion.button
                  className="btn btn-primary btn-lg"
                  whileHover={animate ? { scale: 1.01 } : {}}
                  whileTap={animate ? { scale: 0.98 } : {}}
                  onClick={handleConfirm}
                  disabled={submitting || !form.name || !form.phone || !form.email}
                  style={{ flex: 1, animation: "pulseGlow 2s ease-in-out infinite" }}
                >
                  {submitting ? "Booking…" : "Confirm Booking"}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
