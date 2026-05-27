import type {
  AnalyticsSummary,
  Appointment,
  BarberProfile,
  Customer,
  NotificationLog,
  ScheduleException,
  ScheduleRule,
  Service,
  Settings,
  Slot
} from "./types";
import {
  addDays,
  addMinutes,
  dayOfWeek,
  formatTime,
  generateTimes,
  timeToMinutes,
  todayString
} from "./time";
import { prisma } from "./db";
import { sendBarberNotification, sendBookingConfirmation } from "./email";

const APPOINTMENT_OVERLAP_CONSTRAINT = "appointment_no_overlap_active";

export class BookingConflictError extends Error {
  statusCode = 409;

  constructor(message = "That time is no longer available.") {
    super(message);
    this.name = "BookingConflictError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isAppointmentOverlapDatabaseError(error: unknown) {
  const pending: unknown[] = [error];
  const seen = new Set<object>();

  while (pending.length > 0) {
    const current = pending.pop();
    if (!isRecord(current)) continue;
    if (seen.has(current)) continue;
    seen.add(current);

    const code = typeof current.code === "string" ? current.code : "";
    const constraint = typeof current.constraint === "string" ? current.constraint : "";
    const message = typeof current.message === "string" ? current.message : "";
    const detail = typeof current.detail === "string" ? current.detail : "";

    if (code === "23P01") return true;
    if (constraint === APPOINTMENT_OVERLAP_CONSTRAINT) return true;
    if (message.includes(APPOINTMENT_OVERLAP_CONSTRAINT)) return true;
    if (detail.includes(APPOINTMENT_OVERLAP_CONSTRAINT)) return true;

    if ("cause" in current) pending.push(current.cause);
    if ("meta" in current) pending.push(current.meta);
    if ("originalError" in current) pending.push(current.originalError);
  }

  return false;
}

export type StoreSnapshot = {
  barbers: BarberProfile[];
  services: Service[];
  customers: Customer[];
  appointments: Appointment[];
  scheduleRules: ScheduleRule[];
  scheduleExceptions: ScheduleException[];
  notifications: NotificationLog[];
  settings: Settings;
};

export async function getSnapshot(): Promise<StoreSnapshot> {
  const [
    barbers,
    services,
    customers,
    appointments,
    scheduleRules,
    scheduleExceptions,
    notifications,
    settingsRow
  ] = await Promise.all([
    prisma.barberProfile.findMany(),
    prisma.service.findMany(),
    prisma.customer.findMany(),
    prisma.appointment.findMany({ orderBy: { date: "desc" } }),
    prisma.scheduleRule.findMany(),
    prisma.scheduleException.findMany(),
    prisma.notificationLog.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.settings.findUnique({ where: { id: "shop" } })
  ]);

  const settings: Settings = settingsRow ?? {
    performanceVisibleToBarbers: false,
    shopStartTime: "09:00",
    shopEndTime: "19:00",
    overflowEndTime: "20:30"
  };

  return {
    barbers: barbers as BarberProfile[],
    services: services as Service[],
    customers: customers as Customer[],
    appointments: appointments as unknown as Appointment[],
    scheduleRules: scheduleRules as ScheduleRule[],
    scheduleExceptions: scheduleExceptions as ScheduleException[],
    notifications: notifications as NotificationLog[],
    settings
  };
}

export async function getBarberBySlug(slug: string): Promise<BarberProfile | null> {
  return prisma.barberProfile.findUnique({ where: { slug } }) as Promise<BarberProfile | null>;
}

export async function getAvailableSlots(date: string, barberId?: string): Promise<Slot[]> {
  const dow = dayOfWeek(date);

  const [barbers, scheduleRules, scheduleExceptions, appointments] = await Promise.all([
    prisma.barberProfile.findMany({
      where: barberId ? { id: barberId, active: true } : { active: true }
    }),
    prisma.scheduleRule.findMany({ where: { dayOfWeek: dow } }),
    prisma.scheduleException.findMany({ where: { date } }),
    prisma.appointment.findMany({
      where: { date, status: { notIn: ["cancelled", "no_show"] } }
    })
  ]);

  return barbers.flatMap((barber) => {
    const exception = scheduleExceptions.find((e) => e.barberId === barber.id);
    const rule = scheduleRules.find((r) => r.barberId === barber.id);

    if (exception?.isUnavailable || !rule?.isWorking) return [];

    const start = exception?.startTime ?? rule.startTime;
    const end = exception?.endTime ?? rule.endTime;

    return generateTimes(start, end).map((time) => ({
      barberId: barber.id,
      time,
      available: !isSlotTaken(appointments as unknown as Appointment[], barber.id, time)
    }));
  });
}

export async function getAnyAvailableSlot(
  date: string,
  time: string,
  preferredBarberId?: string
): Promise<Slot | undefined> {
  const preferred = await getAvailableSlots(date, preferredBarberId);
  const found = preferred.find((s) => s.time === time && s.available);
  if (found) return found;

  const all = await getAvailableSlots(date);
  return all.find((s) => s.time === time && s.available);
}

type AppointmentConflictClient = Pick<typeof prisma, "appointment">;

async function hasAppointmentConflict(
  client: AppointmentConflictClient,
  input: {
    barberId: string;
    date: string;
    startTime: string;
    endTime: string;
    excludeAppointmentId?: string;
  }
) {
  const requestedStart = timeToMinutes(input.startTime);
  const requestedEnd = timeToMinutes(input.endTime);

  const appointments = await client.appointment.findMany({
    where: {
      barberId: input.barberId,
      date: input.date,
      status: { notIn: ["cancelled", "no_show"] },
      ...(input.excludeAppointmentId
        ? { id: { not: input.excludeAppointmentId } }
        : {})
    }
  });

  return appointments.some((appointment) => {
    const existingStart = timeToMinutes(appointment.startTime);
    const existingEnd = timeToMinutes(appointment.endTime);
    return requestedStart < existingEnd && requestedEnd > existingStart;
  });
}

function isSlotTaken(appointments: Appointment[], barberId: string, time: string): boolean {
  const start = timeToMinutes(time);
  return appointments.some((appt) => {
    if (appt.barberId !== barberId) return false;
    const s = timeToMinutes(appt.startTime);
    const e = timeToMinutes(appt.endTime);
    return start >= s && start < e;
  });
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

export async function findCustomerByPhone(phone: string): Promise<Customer | null> {
  const normalized = normalizePhone(phone);
  return prisma.customer.findFirst({
    where: { phone: { contains: normalized } }
  }) as Promise<Customer | null>;
}

export async function getCustomerAppointments(customerId: string): Promise<Appointment[]> {
  const rows = await prisma.appointment.findMany({
    where: { customerId },
    orderBy: { date: "desc" }
  });
  return rows as unknown as Appointment[];
}

export async function createService(input: {
  name: string;
  price: number;
  durationMinutes: number;
}): Promise<Service> {
  return prisma.service.create({ data: input }) as Promise<Service>;
}

export async function updateService(
  id: string,
  input: Partial<Pick<Service, "name" | "price" | "durationMinutes" | "active">>
): Promise<Service> {
  return prisma.service.update({ where: { id }, data: input }) as Promise<Service>;
}

export async function createBooking(input: {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  serviceId: string;
  date: string;
  startTime: string;
  barberId?: string;
  source?: "online" | "walk_in";
  notes?: string;
}): Promise<Appointment> {
  const service = await prisma.service.findUnique({ where: { id: input.serviceId } });
  if (!service) throw new Error("Service was not found.");

  const slot = await getAnyAvailableSlot(input.date, input.startTime, input.barberId);
  if (!slot) throw new BookingConflictError();

  const normalized = normalizePhone(input.customerPhone);
  const appointmentEndTime = addMinutes(input.startTime, service.durationMinutes);
  const createdAt = new Date().toISOString();

  let appointment: Appointment;

  try {
    appointment = await prisma.$transaction(async (tx) => {
      const conflict = await hasAppointmentConflict(tx, {
        barberId: slot.barberId,
        date: input.date,
        startTime: input.startTime,
        endTime: appointmentEndTime
      });

      if (conflict) {
        throw new BookingConflictError();
      }

      const customer = await tx.customer.upsert({
        where: { phone: normalized },
        update: {
          name: input.customerName,
          email: input.customerEmail,
          visitCount: { increment: 1 },
          lastVisit: input.date,
          preferredBarberId: slot.barberId
        },
        create: {
          name: input.customerName,
          phone: normalized,
          email: input.customerEmail,
          preferredBarberId: slot.barberId,
          visitCount: 1,
          lastVisit: input.date,
          createdAt
        }
      });

      return tx.appointment.create({
        data: {
          customerId: customer.id,
          customerName: input.customerName,
          customerPhone: input.customerPhone,
          customerEmail: input.customerEmail,
          barberId: slot.barberId,
          serviceId: service.id,
          date: input.date,
          startTime: input.startTime,
          endTime: appointmentEndTime,
          status: input.source === "walk_in" ? "arrived" : "booked",
          source: input.source ?? "online",
          notes: input.notes,
          createdAt
        }
      }) as unknown as Appointment;
    });
  } catch (error) {
    if (isAppointmentOverlapDatabaseError(error)) {
      throw new BookingConflictError();
    }
    throw error;
  }

  const barber = await prisma.barberProfile.findUnique({ where: { id: slot.barberId } });

  await Promise.allSettled([
    sendBookingConfirmation(appointment, service as Service, barber as BarberProfile),
    sendBarberNotification(appointment, service as Service, barber as BarberProfile)
  ]);

  return appointment;
}

export async function updateAppointment(
  id: string,
  input: Partial<
    Pick<
      Appointment,
      | "status"
      | "finalServiceAmount"
      | "productAmount"
      | "date"
      | "startTime"
      | "barberId"
      | "serviceId"
      | "notes"
    >
  >
): Promise<Appointment> {
  const existing = await prisma.appointment.findUnique({ where: { id } });
  if (!existing) throw new Error("Appointment was not found.");

  const serviceId = input.serviceId ?? existing.serviceId;
  const service = await prisma.service.findUnique({ where: { id: serviceId } });

  const nextDate = input.date ?? existing.date;
  const nextTime = input.startTime ?? existing.startTime;
  const nextBarberId = input.barberId ?? existing.barberId;

  const moved =
    nextDate !== existing.date ||
    nextTime !== existing.startTime ||
    nextBarberId !== existing.barberId;

  if (moved) {
    const slots = await getAvailableSlots(nextDate, nextBarberId);
    const available = slots.filter((s) => s.time === nextTime && s.available);
    if (!available.length) throw new Error("The rescheduled time is not available.");
  }

  let updated: Appointment;

  try {
    updated = await prisma.appointment.update({
      where: { id },
      data: {
        ...input,
        endTime: addMinutes(nextTime, service?.durationMinutes ?? 30)
      }
    }) as unknown as Appointment;
  } catch (error) {
    if (isAppointmentOverlapDatabaseError(error)) {
      throw new BookingConflictError("The rescheduled time is no longer available.");
    }
    throw error;
  }

  if (moved) {
    await prisma.notificationLog.create({
      data: {
        appointmentId: id,
        type: "reschedule",
        recipientEmail: existing.customerEmail,
        subject: "Your IconBook appointment was rescheduled",
        status: "sent",
        createdAt: new Date().toISOString()
      }
    });
  }

  if (input.status === "cancelled") {
    await prisma.notificationLog.create({
      data: {
        appointmentId: id,
        type: "cancellation",
        recipientEmail: existing.customerEmail,
        subject: "Your IconBook appointment was cancelled",
        status: "sent",
        createdAt: new Date().toISOString()
      }
    });
  }

  return updated;
}

export async function updateSettings(input: Partial<Settings>): Promise<Settings> {
  return prisma.settings.upsert({
    where: { id: "shop" },
    update: input,
    create: {
      id: "shop",
      performanceVisibleToBarbers: false,
      shopStartTime: "09:00",
      shopEndTime: "19:00",
      overflowEndTime: "20:30",
      ...input
    }
  }) as Promise<Settings>;
}

export async function updateSchedule(input: {
  id: string;
  barberId: string;
  dayOfWeek: number;
  isWorking: boolean;
  startTime: string;
  endTime: string;
}): Promise<ScheduleRule> {
  return prisma.scheduleRule.upsert({
    where: { barberId_dayOfWeek: { barberId: input.barberId, dayOfWeek: input.dayOfWeek } },
    update: { isWorking: input.isWorking, startTime: input.startTime, endTime: input.endTime },
    create: {
      barberId: input.barberId,
      dayOfWeek: input.dayOfWeek,
      isWorking: input.isWorking,
      startTime: input.startTime,
      endTime: input.endTime
    }
  }) as Promise<ScheduleRule>;
}

export async function getAnalytics(
  date = todayString(),
  options?: { barberId?: string }
): Promise<AnalyticsSummary> {
  const yesterday = addDays(date, -1);
  const weekStart = addDays(date, -6);
  const barberWhere = options?.barberId ? { barberId: options.barberId } : {};

  const [completed, allAppointments, todayAppointments, barbers, services] = await Promise.all([
    prisma.appointment.findMany({ where: { status: "completed", ...barberWhere } }),
    prisma.appointment.findMany({
      where: { status: { in: ["completed", "no_show", "cancelled"] }, ...barberWhere }
    }),
    prisma.appointment.findMany({ where: { date, ...barberWhere } }),
    prisma.barberProfile.findMany({
      where: options?.barberId ? { active: true, id: options.barberId } : { active: true }
    }),
    prisma.service.findMany()
  ]);

  function serviceAmount(appt: typeof completed[0]) {
    if (typeof appt.finalServiceAmount === "number") return appt.finalServiceAmount;
    return services.find((s) => s.id === appt.serviceId)?.price ?? 0;
  }

  const revenueForDate = (d: string) =>
    completed.filter((a) => a.date === d).reduce((sum, a) => sum + serviceAmount(a), 0);

  const cutsForDate = (d: string) => completed.filter((a) => a.date === d).length;

  const todayRevenue = revenueForDate(date);
  const yesterdayRevenue = revenueForDate(yesterday);
  const weekRevenue = completed
    .filter((a) => a.date >= weekStart && a.date <= date)
    .reduce((sum, a) => sum + serviceAmount(a), 0);

  const todayCuts = cutsForDate(date);
  const yesterdayCuts = cutsForDate(yesterday);

  const attendanceRate = allAppointments.length
    ? Math.round(
        (completed.length / allAppointments.length) * 100
      )
    : 100;
  const walkInCount = todayAppointments.filter((a) => a.source === "walk_in").length;
  const onlineBookingCount = todayAppointments.filter((a) => a.source === "online").length;

  const productRevenue = completed.reduce((sum, a) => sum + (a.productAmount ?? 0), 0);

  const barberPerformance = barbers.map((barber) => {
    const barberAppts = completed.filter((a) => a.barberId === barber.id);
    const serviceRevenue = barberAppts.reduce((sum, a) => sum + serviceAmount(a), 0);
    const barberProducts = barberAppts.reduce((sum, a) => sum + (a.productAmount ?? 0), 0);
    const ownerShare = barber.isOwner ? serviceRevenue : serviceRevenue * 0.4;
    return {
      barberId: barber.id,
      cuts: barberAppts.length,
      serviceRevenue,
      productRevenue: barberProducts,
      ownerShare,
      barberShare: barber.isOwner ? serviceRevenue : serviceRevenue * 0.6
    };
  });

  return {
    todayRevenue,
    yesterdayRevenue,
    weekRevenue,
    todayCuts,
    yesterdayCuts,
    revenueDeltaPercent:
      yesterdayRevenue === 0
        ? todayRevenue > 0 ? 100 : 0
        : Math.round(((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100),
    attendanceRate,
    onlineBookingCount,
    walkInCount,
    productRevenue,
    ownerCommission: barberPerformance.reduce((sum, b) => sum + b.ownerShare, 0),
    barberPerformance
  };
}

// Not exported — analytics helper uses inline service lookup instead
export function _formatTime(time: string) {
  return formatTime(time);
}
