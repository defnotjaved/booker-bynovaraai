import {
  AnalyticsSummary,
  Appointment,
  AppointmentStatus,
  BarberProfile,
  Customer,
  NotificationLog,
  ScheduleException,
  ScheduleRule,
  Service,
  Settings,
  Slot,
  User
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

type StoreState = {
  users: User[];
  barbers: BarberProfile[];
  services: Service[];
  customers: Customer[];
  appointments: Appointment[];
  scheduleRules: ScheduleRule[];
  scheduleExceptions: ScheduleException[];
  notifications: NotificationLog[];
  settings: Settings;
};

const ownerId = "barber-anil";

const services: Service[] = [
  {
    id: "service-haircut",
    name: "Haircut",
    price: 120,
    durationMinutes: 30,
    active: true
  },
  {
    id: "service-haircut-beard",
    name: "Haircut + Beard/Touch-up",
    price: 150,
    durationMinutes: 30,
    active: true
  }
];

const barbers: BarberProfile[] = [
  {
    id: ownerId,
    slug: "anil",
    name: "Anil",
    email: "anil@iconbook.local",
    active: true,
    chair: 1,
    isOwner: true
  },
  {
    id: "barber-shivam",
    slug: "shivam",
    name: "Shivam",
    email: "shivam@iconbook.local",
    active: true,
    chair: 2,
    isOwner: false
  },
  {
    id: "barber-shastri",
    slug: "shastri",
    name: "Shastri",
    email: "shastri@iconbook.local",
    active: true,
    chair: 3,
    isOwner: false
  },
  {
    id: "barber-open-chair",
    slug: "open-chair",
    name: "Open Chair",
    email: "unused@iconbook.local",
    active: false,
    chair: 4,
    isOwner: false
  }
];

function makeWeeklySchedule() {
  const offDays: Record<string, number> = {
    "barber-anil": 1,
    "barber-shivam": 2,
    "barber-shastri": 3
  };

  return barbers
    .filter((barber) => barber.active)
    .flatMap((barber) =>
      [0, 1, 2, 3, 4, 5, 6].map((day) => ({
        id: `schedule-${barber.id}-${day}`,
        barberId: barber.id,
        dayOfWeek: day,
        startTime: "09:00",
        endTime: "19:00",
        isWorking: offDays[barber.id] !== day
      }))
    );
}

function seedAppointments(): Appointment[] {
  const today = todayString();
  const yesterday = addDays(today, -1);
  const tomorrow = addDays(today, 1);
  const base = new Date().toISOString();

  return [
    makeAppointment("seed-1", "Darren", "868-555-1010", "darren@example.com", ownerId, "service-haircut", today, "09:30", "completed", "online", 120, 0, base),
    makeAppointment("seed-2", "Marcus", "868-555-2020", "marcus@example.com", "barber-shivam", "service-haircut-beard", today, "10:30", "arrived", "online", undefined, undefined, base),
    makeAppointment("seed-3", "Kevin", "868-555-3030", "kevin@example.com", "barber-shastri", "service-haircut", today, "12:00", "booked", "walk_in", undefined, undefined, base),
    makeAppointment("seed-4", "Jamal", "868-555-4040", "jamal@example.com", "barber-shivam", "service-haircut", yesterday, "11:00", "completed", "online", 120, 30, base),
    makeAppointment("seed-5", "Andre", "868-555-5050", "andre@example.com", "barber-shastri", "service-haircut-beard", yesterday, "13:30", "completed", "online", 150, 0, base),
    makeAppointment("seed-6", "Nicholas", "868-555-6060", "nicholas@example.com", ownerId, "service-haircut-beard", yesterday, "15:00", "no_show", "online", undefined, undefined, base),
    makeAppointment("seed-7", "Ravi", "868-555-7070", "ravi@example.com", ownerId, "service-haircut", tomorrow, "10:00", "booked", "online", undefined, undefined, base)
  ];
}

function makeAppointment(
  id: string,
  customerName: string,
  customerPhone: string,
  customerEmail: string,
  barberId: string,
  serviceId: string,
  date: string,
  startTime: string,
  status: AppointmentStatus,
  source: "online" | "walk_in",
  finalServiceAmount: number | undefined,
  productAmount: number | undefined,
  createdAt: string
): Appointment {
  const service = services.find((item) => item.id === serviceId) ?? services[0];
  return {
    id,
    customerName,
    customerPhone,
    customerEmail,
    barberId,
    serviceId,
    date,
    startTime,
    endTime: addMinutes(startTime, service.durationMinutes),
    status,
    source,
    finalServiceAmount,
    productAmount,
    createdAt
  };
}

function createInitialState(): StoreState {
  return {
    users: [
      {
        id: "user-anil",
        name: "Anil",
        role: "owner",
        barberId: ownerId,
        email: "anil@iconbook.local"
      },
      {
        id: "user-shivam",
        name: "Shivam",
        role: "barber",
        barberId: "barber-shivam",
        email: "shivam@iconbook.local"
      },
      {
        id: "user-shastri",
        name: "Shastri",
        role: "barber",
        barberId: "barber-shastri",
        email: "shastri@iconbook.local"
      }
    ],
    barbers,
    services,
    customers: [],
    appointments: seedAppointments(),
    scheduleRules: makeWeeklySchedule(),
    scheduleExceptions: [
      {
        id: "exception-anil-demo",
        barberId: ownerId,
        date: addDays(todayString(), 2),
        isUnavailable: true,
        reason: "Owner day off"
      }
    ],
    notifications: [],
    settings: {
      performanceVisibleToBarbers: false,
      shopStartTime: "09:00",
      shopEndTime: "19:00",
      overflowEndTime: "20:30"
    }
  };
}

const globalStore = globalThis as typeof globalThis & {
  __iconBookStore?: StoreState;
};

function state() {
  if (!globalStore.__iconBookStore) {
    globalStore.__iconBookStore = createInitialState();
  }
  return globalStore.__iconBookStore;
}

export function getSnapshot() {
  return structuredClone(state());
}

export function getBarberBySlug(slug: string) {
  return state().barbers.find((barber) => barber.slug === slug);
}

export function getAvailableSlots(date: string, barberId?: string): Slot[] {
  const data = state();
  const activeBarbers = data.barbers.filter((barber) => barber.active);
  const targetBarbers = barberId
    ? activeBarbers.filter((barber) => barber.id === barberId)
    : activeBarbers;
  const dow = dayOfWeek(date);

  return targetBarbers.flatMap((barber) => {
    const exception = data.scheduleExceptions.find(
      (item) => item.barberId === barber.id && item.date === date
    );
    const rule = data.scheduleRules.find(
      (item) => item.barberId === barber.id && item.dayOfWeek === dow
    );

    if (exception?.isUnavailable || !rule?.isWorking) {
      return [];
    }

    const start = exception?.startTime ?? rule.startTime;
    const end = exception?.endTime ?? rule.endTime;
    return generateTimes(start, end).map((time) => ({
      barberId: barber.id,
      time,
      available: !isSlotTaken(date, barber.id, time)
    }));
  });
}

export function getAnyAvailableSlot(date: string, time: string, preferredBarberId?: string) {
  const slots = getAvailableSlots(date, preferredBarberId).filter(
    (slot) => slot.time === time && slot.available
  );
  if (slots[0]) {
    return slots[0];
  }

  return getAvailableSlots(date).find((slot) => slot.time === time && slot.available);
}

function isSlotTaken(date: string, barberId: string, time: string) {
  const start = timeToMinutes(time);
  return state().appointments.some((appointment) => {
    if (
      appointment.date !== date ||
      appointment.barberId !== barberId ||
      appointment.status === "cancelled" ||
      appointment.status === "no_show"
    ) {
      return false;
    }

    const appointmentStart = timeToMinutes(appointment.startTime);
    const appointmentEnd = timeToMinutes(appointment.endTime);
    return start >= appointmentStart && start < appointmentEnd;
  });
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

function upsertCustomer(input: {
  name: string;
  phone: string;
  email: string;
  barberId: string;
  date: string;
}): Customer {
  const data = state();
  const normalized = normalizePhone(input.phone);
  const existing = data.customers.find((c) => normalizePhone(c.phone) === normalized);

  if (existing) {
    existing.name = input.name;
    existing.email = input.email;
    existing.visitCount += 1;
    existing.lastVisit = input.date;
    if (!existing.preferredBarberId) existing.preferredBarberId = input.barberId;
    return existing;
  }

  const customer: Customer = {
    id: `cust-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: input.name,
    phone: input.phone,
    email: input.email,
    preferredBarberId: input.barberId,
    visitCount: 1,
    lastVisit: input.date,
    createdAt: new Date().toISOString(),
  };
  data.customers.push(customer);
  return customer;
}

export function findCustomerByPhone(phone: string): Customer | undefined {
  const normalized = normalizePhone(phone);
  return structuredClone(
    state().customers.find((c) => normalizePhone(c.phone) === normalized)
  );
}

export function getCustomerAppointments(customerId: string): Appointment[] {
  return structuredClone(
    state()
      .appointments.filter((a) => a.customerId === customerId)
      .sort((a, b) => b.date.localeCompare(a.date))
  );
}

export function createService(input: {
  name: string;
  price: number;
  durationMinutes: number;
}): Service {
  const service: Service = {
    id: `service-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: input.name,
    price: input.price,
    durationMinutes: input.durationMinutes,
    active: true,
  };
  state().services.push(service);
  return structuredClone(service);
}

export function updateService(
  id: string,
  input: Partial<Pick<Service, "name" | "price" | "durationMinutes" | "active">>
): Service {
  const data = state();
  const service = data.services.find((s) => s.id === id);
  if (!service) throw new Error("Service not found.");
  Object.assign(service, input);
  return structuredClone(service);
}

export function createBooking(input: {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  serviceId: string;
  date: string;
  startTime: string;
  barberId?: string;
  source?: "online" | "walk_in";
  notes?: string;
}) {
  const data = state();
  const service = data.services.find((item) => item.id === input.serviceId);
  if (!service) {
    throw new Error("Service was not found.");
  }

  const slot = getAnyAvailableSlot(input.date, input.startTime, input.barberId);
  if (!slot) {
    throw new Error("That time is no longer available.");
  }

  const customer = upsertCustomer({
    name: input.customerName,
    phone: input.customerPhone,
    email: input.customerEmail,
    barberId: slot.barberId,
    date: input.date,
  });

  const appointment: Appointment = {
    id: `appt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    customerId: customer.id,
    customerName: input.customerName,
    customerPhone: input.customerPhone,
    customerEmail: input.customerEmail,
    barberId: slot.barberId,
    serviceId: service.id,
    date: input.date,
    startTime: input.startTime,
    endTime: addMinutes(input.startTime, service.durationMinutes),
    status: input.source === "walk_in" ? "arrived" : "booked",
    source: input.source ?? "online",
    notes: input.notes,
    createdAt: new Date().toISOString()
  };

  data.appointments.push(appointment);
  logEmail(appointment.id, "booking", appointment.customerEmail, "Your IconBook appointment is confirmed");
  const barber = data.barbers.find((item) => item.id === appointment.barberId);
  if (barber) {
    logEmail(appointment.id, "booking", barber.email, `New IconBook booking for ${formatTime(appointment.startTime)}`);
  }

  return appointment;
}

export function updateAppointment(
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
) {
  const data = state();
  const appointment = data.appointments.find((item) => item.id === id);
  if (!appointment) {
    throw new Error("Appointment was not found.");
  }

  const service = input.serviceId
    ? data.services.find((item) => item.id === input.serviceId)
    : data.services.find((item) => item.id === appointment.serviceId);

  const nextDate = input.date ?? appointment.date;
  const nextTime = input.startTime ?? appointment.startTime;
  const nextBarberId = input.barberId ?? appointment.barberId;

  const moved =
    nextDate !== appointment.date ||
    nextTime !== appointment.startTime ||
    nextBarberId !== appointment.barberId;

  if (moved) {
    const originalStatus = appointment.status;
    appointment.status = "cancelled";
    const slots = getAvailableSlots(nextDate, nextBarberId).filter(
      (slot) => slot.time === nextTime && slot.available
    );
    appointment.status = originalStatus;
    if (!slots[0]) {
      throw new Error("The rescheduled time is not available.");
    }
  }

  Object.assign(appointment, input);
  appointment.endTime = addMinutes(nextTime, service?.durationMinutes ?? 30);

  if (moved) {
    logEmail(appointment.id, "reschedule", appointment.customerEmail, "Your IconBook appointment was rescheduled");
  }

  if (input.status === "cancelled") {
    logEmail(appointment.id, "cancellation", appointment.customerEmail, "Your IconBook appointment was cancelled");
  }

  return appointment;
}

export function updateSettings(input: Partial<Settings>) {
  const data = state();
  data.settings = {
    ...data.settings,
    ...input
  };
  return data.settings;
}

export function updateSchedule(input: {
  barberId: string;
  dayOfWeek: number;
  isWorking: boolean;
  startTime: string;
  endTime: string;
}) {
  const data = state();
  const rule = data.scheduleRules.find(
    (item) => item.barberId === input.barberId && item.dayOfWeek === input.dayOfWeek
  );
  if (!rule) {
    throw new Error("Schedule rule was not found.");
  }

  Object.assign(rule, input);
  return rule;
}

function logEmail(
  appointmentId: string,
  type: NotificationLog["type"],
  recipientEmail: string,
  subject: string
) {
  state().notifications.unshift({
    id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    appointmentId,
    type,
    recipientEmail,
    subject,
    status: "sent",
    createdAt: new Date().toISOString()
  });
}

export function getAnalytics(date = todayString()): AnalyticsSummary {
  const data = state();
  const yesterday = addDays(date, -1);
  const weekStart = addDays(date, -6);

  const completed = data.appointments.filter((item) => item.status === "completed");
  const revenueForDate = (targetDate: string) =>
    completed
      .filter((item) => item.date === targetDate)
      .reduce((sum, item) => sum + serviceAmount(item), 0);
  const cutsForDate = (targetDate: string) =>
    completed.filter((item) => item.date === targetDate).length;

  const todayRevenue = revenueForDate(date);
  const yesterdayRevenue = revenueForDate(yesterday);
  const weekRevenue = completed
    .filter((item) => item.date >= weekStart && item.date <= date)
    .reduce((sum, item) => sum + serviceAmount(item), 0);
  const todayCuts = cutsForDate(date);
  const yesterdayCuts = cutsForDate(yesterday);
  const eligibleAttendance = data.appointments.filter((item) =>
    ["completed", "no_show", "cancelled"].includes(item.status)
  );
  const attendanceRate = eligibleAttendance.length
    ? Math.round(
        (eligibleAttendance.filter((item) => item.status === "completed").length /
          eligibleAttendance.length) *
          100
      )
    : 100;
  const productRevenue = completed.reduce((sum, item) => sum + (item.productAmount ?? 0), 0);
  const barberPerformance = data.barbers
    .filter((barber) => barber.active)
    .map((barber) => {
      const barberAppointments = completed.filter((item) => item.barberId === barber.id);
      const serviceRevenue = barberAppointments.reduce((sum, item) => sum + serviceAmount(item), 0);
      const barberProducts = barberAppointments.reduce((sum, item) => sum + (item.productAmount ?? 0), 0);
      const ownerShare = barber.isOwner ? serviceRevenue : serviceRevenue * 0.4;
      return {
        barberId: barber.id,
        cuts: barberAppointments.length,
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
        ? todayRevenue > 0
          ? 100
          : 0
        : Math.round(((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100),
    attendanceRate,
    productRevenue,
    ownerCommission: barberPerformance.reduce((sum, item) => sum + item.ownerShare, 0),
    barberPerformance
  };
}

function serviceAmount(appointment: Appointment) {
  if (typeof appointment.finalServiceAmount === "number") {
    return appointment.finalServiceAmount;
  }
  return state().services.find((item) => item.id === appointment.serviceId)?.price ?? 0;
}
