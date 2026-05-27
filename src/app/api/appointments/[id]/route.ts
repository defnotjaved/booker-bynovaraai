import { NextRequest, NextResponse } from "next/server";
import { BookingConflictError, updateAppointment } from "@/lib/store";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const existing = await prisma.appointment.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Appointment not found." }, { status: 404 });
    }
    if (session.user.role !== "owner" && existing.barberId !== session.user.barberId) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const body = await request.json();
    const appointment = await updateAppointment(id, body);

    return NextResponse.json({ appointment });
  } catch (error) {
    if (error instanceof BookingConflictError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update appointment." },
      { status: 400 }
    );
  }
}
