import { NextResponse } from "next/server";
import { getAnalytics, getSnapshot } from "@/lib/store";
import { todayString } from "@/lib/time";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const data = getSnapshot();

  // Barbers only receive their own appointments to prevent data leakage
  if (session.user.role !== "owner" && session.user.barberId) {
    data.appointments = data.appointments.filter(
      (appt) => appt.barberId === session.user.barberId
    );
  }

  return NextResponse.json({
    ...data,
    analytics: getAnalytics(todayString())
  });
}
