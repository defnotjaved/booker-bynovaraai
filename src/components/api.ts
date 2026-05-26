"use client";

import type {
  AnalyticsSummary,
  Appointment,
  AppointmentStatus,
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

// ── Base fetch wrapper ────────────────────────────────────────────────────────

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

// ── Bootstrap / Slots ─────────────────────────────────────────────────────────

export async function loadBootstrap() {
  return api<BootstrapData>("/api/bootstrap", { cache: "no-store" });
}

export async function loadSlots(date: string, barberId?: string) {
  const params = new URLSearchParams({ date });
  if (barberId) params.set("barberId", barberId);
  return api<{ slots: Slot[] }>(`/api/slots?${params.toString()}`, { cache: "no-store" });
}

// ── Appointments ──────────────────────────────────────────────────────────────

export type CreateAppointmentBody = {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  serviceId: string;
  barberId: string;
  date: string;
  startTime: string;
  source: "online" | "walk_in";
  notes?: string;
};

export async function createAppointment(body: CreateAppointmentBody) {
  return api<{ appointment: Appointment }>("/api/appointments", {
    method: "POST",
    body: JSON.stringify(body)
  });
}

export async function updateAppointment(id: string, patch: Partial<Appointment> & { status?: AppointmentStatus }) {
  return api<{ appointment: Appointment }>(`/api/appointments/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch)
  });
}

// ── Services ──────────────────────────────────────────────────────────────────

export type ServiceBody = {
  name: string;
  price: number;
  durationMinutes: number;
};

export async function createService(body: ServiceBody) {
  return api<{ service: Service }>("/api/services", {
    method: "POST",
    body: JSON.stringify(body)
  });
}

export async function updateService(id: string, patch: Partial<ServiceBody> & { active?: boolean }) {
  return api<{ service: Service }>(`/api/services/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch)
  });
}

export async function deleteService(id: string) {
  return api<{ ok: boolean }>(`/api/services/${id}`, { method: "DELETE" });
}

// ── Settings ──────────────────────────────────────────────────────────────────

export async function updateSettings(patch: Partial<Settings>) {
  return api<{ settings: Settings }>("/api/settings", {
    method: "PATCH",
    body: JSON.stringify(patch)
  });
}

// ── Schedule ──────────────────────────────────────────────────────────────────

export async function patchScheduleRule(rule: ScheduleRule) {
  return api<{ scheduleRule: ScheduleRule }>("/api/schedule", {
    method: "PATCH",
    body: JSON.stringify(rule)
  });
}

export async function patchScheduleExceptions(exceptions: ScheduleException[]) {
  return api<{ exceptions: ScheduleException[] }>("/api/schedule", {
    method: "PATCH",
    body: JSON.stringify({ exceptions })
  });
}

// ── Customers ─────────────────────────────────────────────────────────────────

export type CustomerLookupResult = {
  found: boolean;
  name?: string;
  email?: string;
  visitCount?: number;
};

export async function lookupCustomer(phone: string) {
  return api<CustomerLookupResult>(`/api/customers/lookup?phone=${encodeURIComponent(phone)}`);
}
