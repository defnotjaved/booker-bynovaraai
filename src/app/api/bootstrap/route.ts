import { NextResponse } from "next/server";
import { getAnalytics, getSnapshot } from "@/lib/store";
import { todayString } from "@/lib/time";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  const data = await getSnapshot();

  if (!session) {
    return NextResponse.json({
      barbers: data.barbers.filter((barber) => barber.active),
      services: data.services.filter((service) => service.active),
      appointments: [],
      scheduleRules: [],
      scheduleExceptions: [],
      notifications: [],
      settings: data.settings,
      analytics: {
        todayRevenue: 0,
        yesterdayRevenue: 0,
        weekRevenue: 0,
        todayCuts: 0,
        yesterdayCuts: 0,
        revenueDeltaPercent: 0,
        attendanceRate: 0,
        onlineBookingCount: 0,
        walkInCount: 0,
        productRevenue: 0,
        ownerCommission: 0,
        barberPerformance: []
      }
    });
  }

  const isOwner = session.user.role === "owner";
  const barberId = session.user.barberId;

  if (!isOwner && barberId) {
    data.appointments = data.appointments.filter(
      (appt) => appt.barberId === barberId
    );
    data.scheduleRules = data.scheduleRules.filter((rule) => rule.barberId === barberId);
    data.scheduleExceptions = data.scheduleExceptions.filter((rule) => rule.barberId === barberId);
    data.notifications = [];
  }

  return NextResponse.json({
    barbers: data.barbers,
    services: data.services,
    appointments: data.appointments,
    scheduleRules: data.scheduleRules,
    scheduleExceptions: data.scheduleExceptions,
    notifications: data.notifications,
    settings: data.settings,
    analytics: await getAnalytics(todayString(), isOwner ? undefined : { barberId })
  });
}
