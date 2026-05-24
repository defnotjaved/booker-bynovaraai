export type Role = "owner" | "barber";

export type AppointmentStatus =
  | "booked"
  | "arrived"
  | "completed"
  | "cancelled"
  | "no_show";

export type AppointmentSource = "online" | "walk_in";

export type NotificationType = "booking" | "reschedule" | "cancellation" | "status";

export type User = {
  id: string;
  name: string;
  role: Role;
  barberId?: string;
  email: string;
};

export type BarberProfile = {
  id: string;
  slug: string;
  name: string;
  email: string;
  active: boolean;
  chair: number;
  isOwner: boolean;
};

export type Service = {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
  active: boolean;
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  preferredBarberId?: string;
  visitCount: number;
  lastVisit?: string;
  createdAt: string;
};

export type Appointment = {
  id: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  barberId: string;
  serviceId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  source: AppointmentSource;
  finalServiceAmount?: number;
  productAmount?: number;
  notes?: string;
  createdAt: string;
};

export type ScheduleRule = {
  id: string;
  barberId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isWorking: boolean;
};

export type ScheduleException = {
  id: string;
  barberId: string;
  date: string;
  startTime?: string;
  endTime?: string;
  isUnavailable: boolean;
  reason: string;
};

export type NotificationLog = {
  id: string;
  appointmentId: string;
  type: NotificationType;
  recipientEmail: string;
  subject: string;
  status: "sent" | "failed";
  createdAt: string;
};

export type Settings = {
  performanceVisibleToBarbers: boolean;
  shopStartTime: string;
  shopEndTime: string;
  overflowEndTime: string;
};

export type Slot = {
  barberId: string;
  time: string;
  available: boolean;
};

export type AnalyticsSummary = {
  todayRevenue: number;
  yesterdayRevenue: number;
  weekRevenue: number;
  todayCuts: number;
  yesterdayCuts: number;
  revenueDeltaPercent: number;
  attendanceRate: number;
  productRevenue: number;
  ownerCommission: number;
  barberPerformance: Array<{
    barberId: string;
    cuts: number;
    serviceRevenue: number;
    productRevenue: number;
    ownerShare: number;
    barberShare: number;
  }>;
};
