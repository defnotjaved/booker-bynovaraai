"use client";

import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BarberSchedulingCard } from "./barber-scheduling-card";
import type { Service } from "@/lib/types";

interface Barber {
  id: string;
  name: string;
  slug: string;
  active: boolean;
}

interface DaySchedule {
  date: string;
  dayName: string;
  dayNumber: number;
  slots: { time: string; available: boolean }[];
  hasAvailability: boolean;
}

function formatTime24to12(time24: string) {
  const [h, m] = time24.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function addDaysToDate(dateStr: string, days: number) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function formatDateLabel(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getDayName(dateStr: string, index: number, weekOffset: number) {
  const d = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (weekOffset === 0 && d.getTime() === today.getTime()) return "Today";
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

export function BookingModal({
  isOpen,
  onClose,
  barbers,
  services,
  variant = "modal",
}: {
  isOpen: boolean;
  onClose: () => void;
  barbers: Barber[];
  services: Service[];
  variant?: "modal" | "inline";
}) {
  const [selectedBarberId, setSelectedBarberId] = useState(barbers[0]?.id ?? "");
  const [weekOffset, setWeekOffset] = useState(0);
  const [weekSchedule, setWeekSchedule] = useState<DaySchedule[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const activeBarbers = barbers.filter((b) => b.active);

  const loadWeekSlots = useCallback(async (barberId: string, offset: number) => {
    setLoadingSlots(true);
    const today = todayISO();
    // 7 days per week
    const days = Array.from({ length: 7 }, (_, i) => addDaysToDate(today, offset * 7 + i));

    const results: DaySchedule[] = await Promise.all(
      days.map(async (date, i) => {
        try {
          const params = new URLSearchParams({ date });
          if (barberId) params.set("barberId", barberId);
          const res = await fetch(`/api/slots?${params}`);
          const data = await res.json();
          const slots: { time: string; available: boolean }[] = (data.slots ?? []).map(
            (s: { time: string; available: boolean }) => ({
              time: formatTime24to12(s.time),
              available: s.available,
            })
          );
          return {
            date: formatDateLabel(date),
            dayName: getDayName(date, i, offset),
            dayNumber: new Date(date + "T00:00:00").getDate(),
            slots,
            hasAvailability: slots.some((s) => s.available),
          };
        } catch {
          return {
            date: formatDateLabel(date),
            dayName: getDayName(date, i, offset),
            dayNumber: new Date(date + "T00:00:00").getDate(),
            slots: [],
            hasAvailability: false,
          };
        }
      })
    );

    setWeekSchedule(results);
    setLoadingSlots(false);
  }, []);

  // Load on open (modal) or on mount (inline)
  useEffect(() => {
    if (isOpen || variant === "inline") {
      loadWeekSlots(selectedBarberId, weekOffset);
    }
  }, [isOpen, variant, selectedBarberId, weekOffset, loadWeekSlots]);

  function handleBarberChange(barberId: string) {
    setSelectedBarberId(barberId);
  }

  function handleWeekChange(direction: "prev" | "next") {
    setWeekOffset((prev) => Math.max(0, direction === "next" ? prev + 1 : prev - 1));
  }

  async function handleConfirm(data: {
    barberId: string;
    serviceId: string;
    date: string;
    time: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
  }) {
    const today = todayISO();
    const dayIndex = weekSchedule.findIndex((d) => d.date === data.date);
    // 7-day multiplier
    const isoDate = addDaysToDate(today, weekOffset * 7 + dayIndex);

    const [timePart, ampm] = data.time.split(" ");
    const [hStr, mStr] = timePart.split(":");
    let h = parseInt(hStr, 10);
    if (ampm === "PM" && h !== 12) h += 12;
    if (ampm === "AM" && h === 12) h = 0;
    const startTime = `${h.toString().padStart(2, "0")}:${mStr}`;

    await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail,
        serviceId: data.serviceId,
        date: isoDate,
        startTime,
        barberId: data.barberId,
        source: "online",
      }),
    });
  }

  const card = (
    <BarberSchedulingCard
      barbers={activeBarbers}
      services={services}
      weekSchedule={weekSchedule}
      weekOffset={weekOffset}
      onBarberChange={handleBarberChange}
      onWeekChange={handleWeekChange}
      onConfirm={handleConfirm}
    />
  );

  // ── INLINE variant: no overlay, render card directly ──
  if (variant === "inline") {
    return loadingSlots && weekSchedule.length === 0 ? (
      <div
        style={{
          background: "var(--panel)",
          border: "1px solid var(--line)",
          borderRadius: 16,
          padding: "48px 24px",
          textAlign: "center",
          color: "var(--muted)",
          fontSize: 14,
        }}
      >
        Loading availability…
      </div>
    ) : (
      card
    );
  }

  // ── MODAL variant: overlay + spring animation ──
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            background: "rgba(0,0,0,0.85)",
          }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 600,
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <button
              onClick={onClose}
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                zIndex: 10,
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                background: "var(--panel-strong)",
                border: "1px solid var(--line)",
                color: "var(--muted)",
                cursor: "pointer",
              }}
              aria-label="Close"
            >
              <X size={16} />
            </button>

            {loadingSlots && weekSchedule.length === 0 ? (
              <div
                style={{
                  background: "var(--panel)",
                  borderRadius: 16,
                  padding: "48px 24px",
                  textAlign: "center",
                  color: "var(--muted)",
                }}
              >
                Loading availability…
              </div>
            ) : (
              card
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
