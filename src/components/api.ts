"use client";

import type {
  AnalyticsSummary,
  Appointment,
  BarberProfile,
  NotificationLog,
  ScheduleException,
  ScheduleRule,
  Service,
  Settings,
  Slot,
  User
} from "@/lib/types";

export type BootstrapData = {
  users: User[];
  barbers: BarberProfile[];
  services: Service[];
  appointments: Appointment[];
  scheduleRules: ScheduleRule[];
  scheduleExceptions: ScheduleException[];
  notifications: NotificationLog[];
  settings: Settings;
  analytics: AnalyticsSummary;
};

export async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    }
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error ?? "Request failed.");
  }

  return payload;
}

export async function loadBootstrap() {
  return api<BootstrapData>("/api/bootstrap", { cache: "no-store" });
}

export async function loadSlots(date: string, barberId?: string) {
  const params = new URLSearchParams({ date });
  if (barberId) {
    params.set("barberId", barberId);
  }

  return api<{ slots: Slot[] }>(`/api/slots?${params.toString()}`, {
    cache: "no-store"
  });
}
