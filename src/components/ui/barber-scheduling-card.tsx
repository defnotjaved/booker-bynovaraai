"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Scissors, Check, Clock, Star } from "lucide-react";

interface TimeSlot {
  time: string;
  available: boolean;
}

interface DaySchedule {
  date: string;
  dayName: string;
  dayNumber: number;
  slots: TimeSlot[];
  hasAvailability: boolean;
}

interface Barber {
  id: string;
  name: string;
  slug: string;
}

interface Service {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
}

interface BookingData {
  barberId: string;
  serviceId: string;
  date: string;
  time: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
}

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
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--panel-strong)",
  border: "1px solid var(--line)",
  borderRadius: 8,
  padding: "10px 12px",
  color: "var(--ink)",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  color: "var(--muted)",
  fontWeight: 700,
  marginBottom: 6,
  textTransform: "uppercase",
  letterSpacing: "0.07em",
};

export function BarberSchedulingCard({
  barbers,
  services,
  weekSchedule,
  weekOffset = 0,
  onBarberChange,
  onWeekChange,
  onConfirm,
  enableAnimations = true,
}: BarberSchedulingProps) {
  const [step, setStep] = useState(1);
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id ?? "");
  const [selectedBarberId, setSelectedBarberId] = useState("");
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{
    date: string;
    time: string;
    dayName: string;
  } | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [returningCustomer, setReturningCustomer] = useState<{
    name: string;
    email: string;
    visitCount: number;
  } | null>(null);

  const shouldReduceMotion = useReducedMotion();
  const animate = enableAnimations && !shouldReduceMotion;

  const selectedService = services.find((s) => s.id === selectedServiceId) ?? services[0];
  const selectedBarber = barbers.find((b) => b.id === selectedBarberId) ?? null;
  const selectedDay = selectedDayIndex !== null ? weekSchedule[selectedDayIndex] : null;

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
    await onConfirm?.({
      barberId: selectedBarberId || (barbers[0]?.id ?? ""),
      serviceId: selectedServiceId,
      date: selectedSlot.date,
      time: selectedSlot.time,
      customerName: form.name,
      customerPhone: form.phone,
      customerEmail: form.email,
    });
    setSubmitting(false);
    setConfirmed(true);
  }

  function resetAll() {
    setStep(1);
    setSelectedServiceId(services[0]?.id ?? "");
    setSelectedBarberId("");
    setSelectedDayIndex(null);
    setSelectedSlot(null);
    setForm({ name: "", phone: "", email: "" });
    setConfirmed(false);
    setReturningCustomer(null);
  }

  const slideIn = {
    enter: { x: 30, opacity: 0 },
    center: { x: 0, opacity: 1, transition: { duration: 0.26, ease: "easeOut" as const } },
    exit: { x: -30, opacity: 0, transition: { duration: 0.16, ease: "easeIn" as const } },
  };

  const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.05 } },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.22 } },
  };

  const slotStagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.025 } },
  };

  const slotIn = {
    hidden: { opacity: 0, scale: 0.82 },
    visible: { opacity: 1, scale: 1, transition: { type: "spring" as const, stiffness: 500, damping: 26 } },
  };

  /* ── SUCCESS SCREEN ── */
  if (confirmed && selectedSlot) {
    return (
      <div style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 16, overflow: "hidden" }}>
        <div style={{ padding: "52px 32px", textAlign: "center" }}>
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "rgba(244,121,32,0.12)",
              border: "2px solid rgba(244,121,32,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <Scissors size={28} color="var(--accent)" />
          </motion.div>
          <h3 style={{ fontSize: 22, fontWeight: 900, marginBottom: 10, letterSpacing: "-0.02em" }}>
            Booking Confirmed!
          </h3>
          <p style={{ color: "var(--muted)", marginBottom: 6, fontSize: 15 }}>
            {selectedSlot.dayName}, {selectedSlot.date}{" "}
            <span style={{ color: "var(--accent)", fontWeight: 700 }}>at {selectedSlot.time}</span>
          </p>
          <p style={{ color: "var(--muted)", fontSize: 13 }}>
            {selectedService?.name} · {selectedBarber?.name ?? "Any Barber"}
          </p>
          <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 6 }}>
            See you at the shop!
          </p>
          <button
            onClick={resetAll}
            style={{
              marginTop: 28,
              background: "transparent",
              border: "1px solid var(--accent)",
              color: "var(--accent)",
              padding: "11px 28px",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Book Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "var(--panel)",
        border: "1px solid var(--line)",
        borderRadius: 16,
        overflow: "hidden",
        width: "100%",
      }}
    >
      {/* ── HEADER ── */}
      <div
        style={{
          padding: "18px 22px",
          borderBottom: "1px solid var(--line)",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: "rgba(244,121,32,0.12)",
            border: "1px solid rgba(244,121,32,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Scissors size={18} color="var(--accent)" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 15 }}>Icon Barbers</div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
            <Star size={11} fill="var(--accent)" color="var(--accent)" />
            <span style={{ fontWeight: 700, fontSize: 12 }}>5.0</span>
            <span style={{ color: "var(--muted)", fontSize: 12 }}>· 174 reviews · Aranguez</span>
          </div>
        </div>
      </div>

      {/* ── PROGRESS STRIP ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "14px 22px",
          borderBottom: "1px solid var(--line)",
          background: "var(--panel-strong)",
          gap: 0,
        }}
      >
        {STEP_LABELS.map((label, i) => {
          const num = i + 1;
          const isActive = step === num;
          const isDone = step > num;
          return (
            <div key={label} style={{ display: "flex", alignItems: "center", flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: isDone || isActive ? "var(--accent)" : "var(--panel)",
                    border: `2px solid ${isDone || isActive ? "var(--accent)" : "var(--line)"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transition: "all 0.2s",
                  }}
                >
                  {isDone ? (
                    <Check size={11} color="#fff" strokeWidth={3} />
                  ) : (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        color: isActive ? "#fff" : "var(--muted)",
                        lineHeight: 1,
                      }}
                    >
                      {num}
                    </span>
                  )}
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? "var(--ink)" : isDone ? "var(--accent)" : "var(--muted)",
                    transition: "color 0.2s",
                    whiteSpace: "nowrap",
                  }}
                >
                  {label}
                </span>
              </div>
              {i < STEP_LABELS.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: 1,
                    background: step > num ? "rgba(244,121,32,0.4)" : "var(--line)",
                    margin: "0 5px",
                    transition: "background 0.3s",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* ── STEP CONTENT ── */}
      <div style={{ padding: "24px 22px", minHeight: 320, position: "relative", overflow: "hidden" }}>
        <AnimatePresence mode="wait">
          {/* ── STEP 1: SERVICE ── */}
          {step === 1 && (
            <motion.div
              key="step1"
              variants={animate ? slideIn : {}}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16, fontWeight: 600 }}>
                What are you coming in for?
              </p>
              <motion.div
                variants={animate ? stagger : {}}
                initial="hidden"
                animate="visible"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                  marginBottom: 28,
                }}
              >
                {services.map((service) => {
                  const sel = selectedServiceId === service.id;
                  return (
                    <motion.button
                      key={service.id}
                      variants={animate ? fadeUp : {}}
                      onClick={() => setSelectedServiceId(service.id)}
                      style={{
                        background: sel ? "rgba(244,121,32,0.07)" : "var(--bg)",
                        border: `1.5px solid ${sel ? "var(--accent)" : "var(--line)"}`,
                        borderRadius: 12,
                        padding: "14px 12px",
                        textAlign: "left",
                        cursor: "pointer",
                        transition: "border-color 0.15s, box-shadow 0.15s",
                        boxShadow: sel ? "0 0 16px rgba(244,121,32,0.1)" : "none",
                      }}
                      onMouseEnter={(e) => {
                        if (!sel)
                          (e.currentTarget as HTMLElement).style.borderColor = "rgba(244,121,32,0.45)";
                      }}
                      onMouseLeave={(e) => {
                        if (!sel)
                          (e.currentTarget as HTMLElement).style.borderColor = "var(--line)";
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 10,
                        }}
                      >
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 7,
                            background: sel ? "rgba(244,121,32,0.18)" : "rgba(255,255,255,0.05)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Scissors size={13} color={sel ? "var(--accent)" : "var(--muted)"} />
                        </div>
                        {sel && (
                          <div
                            style={{
                              width: 18,
                              height: 18,
                              borderRadius: "50%",
                              background: "var(--accent)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Check size={10} color="#fff" strokeWidth={3} />
                          </div>
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "var(--ink)",
                          marginBottom: 6,
                          lineHeight: 1.3,
                        }}
                      >
                        {service.name}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: "var(--accent)" }}>
                          TT${service.price}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            color: "var(--muted)",
                            display: "flex",
                            alignItems: "center",
                            gap: 3,
                          }}
                        >
                          <Clock size={10} />
                          {service.durationMinutes} min
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </motion.div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  onClick={() => setStep(2)}
                  style={{
                    background: "var(--accent)",
                    color: "#fff",
                    border: "none",
                    padding: "11px 26px",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    boxShadow: "0 0 18px rgba(244,121,32,0.25)",
                  }}
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 2: BARBER ── */}
          {step === 2 && (
            <motion.div
              key="step2"
              variants={animate ? slideIn : {}}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 18, fontWeight: 600 }}>
                Who would you like?
              </p>
              <motion.div
                variants={animate ? stagger : {}}
                initial="hidden"
                animate="visible"
                style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 32 }}
              >
                {[{ id: "", name: "Any Barber" }, ...barbers].map((barber) => {
                  const sel = selectedBarberId === barber.id;
                  const initials = barber.id === "" ? "✂" : getInitials(barber.name);
                  return (
                    <motion.button
                      key={barber.id || "any"}
                      variants={animate ? fadeUp : {}}
                      onClick={() => handleBarberSelect(barber.id)}
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 8,
                        padding: "6px 10px",
                      }}
                    >
                      <div
                        style={{
                          width: 58,
                          height: 58,
                          borderRadius: "50%",
                          background: sel ? "rgba(244,121,32,0.14)" : "var(--panel-strong)",
                          border: `2.5px solid ${sel ? "var(--accent)" : "var(--line)"}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: barber.id === "" ? 18 : 16,
                          fontWeight: 800,
                          color: sel ? "var(--accent)" : "var(--muted)",
                          transition: "all 0.15s",
                          boxShadow: sel ? "0 0 0 4px rgba(244,121,32,0.15)" : "none",
                        }}
                      >
                        {initials}
                      </div>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: sel ? 700 : 500,
                          color: sel ? "var(--ink)" : "var(--muted)",
                          textAlign: "center",
                          maxWidth: 70,
                          lineHeight: 1.3,
                        }}
                      >
                        {barber.name}
                      </span>
                    </motion.button>
                  );
                })}
              </motion.div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button
                  onClick={() => setStep(1)}
                  style={{
                    background: "transparent",
                    border: "1px solid var(--line)",
                    color: "var(--muted)",
                    padding: "11px 18px",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <ChevronLeft size={14} /> Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  style={{
                    background: "var(--accent)",
                    color: "#fff",
                    border: "none",
                    padding: "11px 26px",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    boxShadow: "0 0 18px rgba(244,121,32,0.25)",
                  }}
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: DATE & TIME ── */}
          {step === 3 && (
            <motion.div
              key="step3"
              variants={animate ? slideIn : {}}
              initial="enter"
              animate="center"
              exit="exit"
            >
              {/* Date strip */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 22 }}>
                <button
                  onClick={() => {
                    onWeekChange?.("prev");
                    setSelectedDayIndex(null);
                  }}
                  disabled={weekOffset === 0}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    border: "1px solid var(--line)",
                    background: "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: weekOffset === 0 ? "not-allowed" : "pointer",
                    opacity: weekOffset === 0 ? 0.35 : 1,
                    flexShrink: 0,
                    color: "var(--muted)",
                  }}
                >
                  <ChevronLeft size={13} />
                </button>

                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    gap: 5,
                    overflowX: "auto",
                    scrollbarWidth: "none",
                  }}
                >
                  {weekSchedule.length === 0 ? (
                    <div style={{ color: "var(--muted)", fontSize: 13, padding: "8px 0" }}>
                      Loading…
                    </div>
                  ) : (
                    weekSchedule.map((day, i) => {
                      const sel = selectedDayIndex === i;
                      const noSlots = !day.hasAvailability;
                      return (
                        <button
                          key={day.date}
                          onClick={() => !noSlots && setSelectedDayIndex(i)}
                          disabled={noSlots}
                          style={{
                            flexShrink: 0,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 2,
                            padding: "8px 9px",
                            borderRadius: 10,
                            border: `1.5px solid ${sel ? "var(--accent)" : noSlots ? "transparent" : "var(--line)"}`,
                            background: sel ? "var(--accent)" : noSlots ? "transparent" : "var(--bg)",
                            cursor: noSlots ? "not-allowed" : "pointer",
                            opacity: noSlots ? 0.3 : 1,
                            minWidth: 44,
                            transition: "all 0.15s",
                          }}
                        >
                          <span
                            style={{
                              fontSize: 9,
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                              color: sel ? "rgba(255,255,255,0.75)" : "var(--muted)",
                            }}
                          >
                            {day.dayName.slice(0, 3)}
                          </span>
                          <span
                            style={{
                              fontSize: 17,
                              fontWeight: 800,
                              color: sel ? "#fff" : noSlots ? "var(--muted)" : "var(--ink)",
                              lineHeight: 1,
                            }}
                          >
                            {day.dayNumber}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>

                <button
                  onClick={() => {
                    onWeekChange?.("next");
                    setSelectedDayIndex(null);
                  }}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    border: "1px solid var(--line)",
                    background: "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    flexShrink: 0,
                    color: "var(--muted)",
                  }}
                >
                  <ChevronRight size={13} />
                </button>
              </div>

              {/* Time slots */}
              {selectedDay ? (
                <motion.div
                  key={`slots-${selectedDayIndex}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <p
                    style={{
                      fontSize: 13,
                      color: "var(--muted)",
                      marginBottom: 14,
                      fontWeight: 600,
                    }}
                  >
                    {selectedDay.dayName}, {selectedDay.date}
                  </p>
                  {selectedDay.hasAvailability ? (
                    <motion.div
                      variants={animate ? slotStagger : {}}
                      initial="hidden"
                      animate="visible"
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)",
                        gap: 7,
                        marginBottom: 24,
                      }}
                    >
                      {selectedDay.slots.map((slot) => (
                        <motion.button
                          key={slot.time}
                          variants={animate ? slotIn : {}}
                          onClick={() => handleSlotClick(slot, selectedDay)}
                          disabled={!slot.available}
                          style={{
                            background: slot.available ? "var(--bg)" : "transparent",
                            border: `1.5px solid ${slot.available ? "var(--line)" : "transparent"}`,
                            borderRadius: 8,
                            padding: "9px 4px",
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: slot.available ? "pointer" : "not-allowed",
                            color: slot.available ? "var(--ink)" : "var(--muted)",
                            opacity: slot.available ? 1 : 0.28,
                            textDecoration: slot.available ? "none" : "line-through",
                            transition: "border-color 0.12s, color 0.12s",
                          }}
                          onMouseEnter={(e) => {
                            if (slot.available) {
                              (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
                              (e.currentTarget as HTMLElement).style.color = "var(--accent)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (slot.available) {
                              (e.currentTarget as HTMLElement).style.borderColor = "var(--line)";
                              (e.currentTarget as HTMLElement).style.color = "var(--ink)";
                            }
                          }}
                        >
                          {slot.time}
                        </motion.button>
                      ))}
                    </motion.div>
                  ) : (
                    <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 24 }}>
                      No availability for this day.
                    </p>
                  )}
                </motion.div>
              ) : (
                <p
                  style={{
                    color: "var(--muted)",
                    fontSize: 13,
                    paddingTop: 6,
                    marginBottom: 24,
                  }}
                >
                  Pick a date above to see available times.
                </p>
              )}

              <button
                onClick={() => setStep(2)}
                style={{
                  background: "transparent",
                  border: "1px solid var(--line)",
                  color: "var(--muted)",
                  padding: "11px 18px",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <ChevronLeft size={14} /> Back
              </button>
            </motion.div>
          )}

          {/* ── STEP 4: DETAILS ── */}
          {step === 4 && selectedSlot && (
            <motion.div
              key="step4"
              variants={animate ? slideIn : {}}
              initial="enter"
              animate="center"
              exit="exit"
            >
              {/* Booking summary */}
              <div
                style={{
                  background: "rgba(244,121,32,0.07)",
                  border: "1px solid rgba(244,121,32,0.2)",
                  borderRadius: 10,
                  padding: "12px 16px",
                  marginBottom: 20,
                }}
              >
                <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                  Your appointment
                </div>
                <div style={{ fontWeight: 800, fontSize: 15 }}>
                  {selectedSlot.dayName}, {selectedSlot.date}
                  <span style={{ color: "var(--accent)", marginLeft: 8 }}>at {selectedSlot.time}</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 3 }}>
                  {selectedService?.name} · {selectedBarber?.name ?? "Any Barber"}
                </div>
              </div>

              {/* Returning customer badge */}
              {returningCustomer && (
                <div
                  style={{
                    background: "rgba(244,121,32,0.1)",
                    border: "1px solid rgba(244,121,32,0.3)",
                    borderRadius: 8,
                    padding: "8px 14px",
                    fontSize: 13,
                    color: "var(--accent)",
                    fontWeight: 600,
                    marginBottom: 16,
                  }}
                >
                  Welcome back, {returningCustomer.name}! 🎉 Visit #{returningCustomer.visitCount + 1}
                </div>
              )}

              {/* Form fields */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
                <div>
                  <label style={labelStyle}>Phone</label>
                  <input
                    type="tel"
                    placeholder="(868) 000-0000"
                    value={form.phone}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, phone: e.target.value }));
                      setReturningCustomer(null);
                    }}
                    onBlur={async (e) => {
                      const digits = e.target.value.replace(/\D/g, "");
                      if (digits.length < 7) return;
                      try {
                        const res = await fetch(
                          `/api/customers/lookup?phone=${encodeURIComponent(e.target.value)}`
                        );
                        const data = await res.json();
                        if (data) {
                          setReturningCustomer(data);
                          setForm((f) => ({ ...f, name: data.name, email: data.email }));
                        }
                      } catch {}
                      (e.target as HTMLElement).style.borderColor = "var(--line)";
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
                    style={inputStyle}
                  />
                </div>

                {(
                  [
                    { label: "Full Name", key: "name" as const, type: "text", placeholder: "Your name" },
                    { label: "Email", key: "email" as const, type: "email", placeholder: "you@example.com" },
                  ] as const
                ).map(({ label, key, type, placeholder }) => (
                  <div key={key}>
                    <label style={labelStyle}>{label}</label>
                    <input
                      type={type}
                      placeholder={placeholder}
                      value={form[key]}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "var(--line)")}
                      style={inputStyle}
                    />
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => setStep(3)}
                  style={{
                    background: "transparent",
                    border: "1px solid var(--line)",
                    color: "var(--muted)",
                    padding: "12px 16px",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    flexShrink: 0,
                  }}
                >
                  <ChevronLeft size={14} /> Back
                </button>
                <motion.button
                  whileHover={animate ? { scale: 1.01 } : {}}
                  whileTap={animate ? { scale: 0.98 } : {}}
                  onClick={handleConfirm}
                  disabled={submitting || !form.name || !form.phone || !form.email}
                  style={{
                    flex: 1,
                    background: "var(--accent)",
                    color: "#fff",
                    border: "none",
                    padding: "12px 24px",
                    borderRadius: 8,
                    fontSize: 15,
                    fontWeight: 700,
                    cursor:
                      submitting || !form.name || !form.phone || !form.email
                        ? "not-allowed"
                        : "pointer",
                    opacity:
                      submitting || !form.name || !form.phone || !form.email ? 0.55 : 1,
                    boxShadow: "0 0 20px rgba(244,121,32,0.22)",
                    transition: "opacity 0.15s",
                  }}
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
