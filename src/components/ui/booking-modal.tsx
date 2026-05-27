"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";
import type { Service } from "@/lib/types";
import { BarberSchedulingCard } from "./barber-scheduling-card";

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
  const [hours, minutes] = time24.split(":").map(Number);
  const suffix = hours >= 12 ? "PM" : "AM";
  const hour = hours % 12 || 12;
  return `${hour}:${minutes.toString().padStart(2, "0")} ${suffix}`;
}

function addDaysToDate(dateString: string, days: number) {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

function formatDateLabel(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getDayName(dateString: string, weekOffset: number) {
  const date = new Date(`${dateString}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (weekOffset === 0 && date.getTime() === today.getTime()) {
    return "Today";
  }

  return date.toLocaleDateString("en-US", { weekday: "short" });
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

  const activeBarbers = barbers.filter((barber) => barber.active);

  const loadWeekSlots = useCallback(async (barberId: string, offset: number) => {
    setLoadingSlots(true);
    const startDate = todayISO();
    const days = Array.from({ length: 7 }, (_, index) => addDaysToDate(startDate, offset * 7 + index));

    try {
      const results = await Promise.all(
        days.map(async (dateString) => {
          try {
            const params = new URLSearchParams({ date: dateString });
            if (barberId) params.set("barberId", barberId);

            const response = await fetch(`/api/slots?${params.toString()}`);
            const payload = await response.json();
            const slots = (payload.slots ?? []).map(
              (slot: { time: string; available: boolean }) => ({
                time: formatTime24to12(slot.time),
                available: slot.available,
              })
            );

            return {
              date: formatDateLabel(dateString),
              dayName: getDayName(dateString, offset),
              dayNumber: new Date(`${dateString}T00:00:00`).getDate(),
              slots,
              hasAvailability: slots.some((slot: { available: boolean }) => slot.available),
            };
          } catch {
            return {
              date: formatDateLabel(dateString),
              dayName: getDayName(dateString, offset),
              dayNumber: new Date(`${dateString}T00:00:00`).getDate(),
              slots: [],
              hasAvailability: false,
            };
          }
        })
      );

      setWeekSchedule(results);
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen || variant === "inline") {
      loadWeekSlots(selectedBarberId, weekOffset);
    }
  }, [isOpen, loadWeekSlots, selectedBarberId, variant, weekOffset]);

  useEffect(() => {
    const channel = supabase
      .channel("appointments-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "appointments" },
        () => {
          void loadWeekSlots(selectedBarberId, weekOffset);
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadWeekSlots, selectedBarberId, weekOffset]);

  function handleBarberChange(barberId: string) {
    setSelectedBarberId(barberId);
  }

  function handleWeekChange(direction: "prev" | "next") {
    setWeekOffset((current) => Math.max(0, direction === "next" ? current + 1 : current - 1));
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
    const dayIndex = weekSchedule.findIndex((day) => day.date === data.date);
    const isoDate = addDaysToDate(today, weekOffset * 7 + dayIndex);

    const [timePart, suffix] = data.time.split(" ");
    const [hourString, minuteString] = timePart.split(":");
    let hour = parseInt(hourString, 10);
    if (suffix === "PM" && hour !== 12) hour += 12;
    if (suffix === "AM" && hour === 12) hour = 0;
    const startTime = `${hour.toString().padStart(2, "0")}:${minuteString}`;

    const response = await fetch("/api/appointments", {
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

    await loadWeekSlots(data.barberId, weekOffset);

    if (!response.ok) {
      const payload = await response.json().catch(() => ({ error: "Unable to create booking." }));
      throw new Error(payload.error ?? "Unable to create booking.");
    }
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

  return (
    <AnimatePresence>
      {isOpen ? (
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
          onClick={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
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
              type="button"
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
      ) : null}
    </AnimatePresence>
  );
}
