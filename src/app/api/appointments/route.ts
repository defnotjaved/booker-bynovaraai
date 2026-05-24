import { NextRequest, NextResponse } from "next/server";
import { createBooking } from "@/lib/store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const appointment = createBooking({
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      customerEmail: body.customerEmail,
      serviceId: body.serviceId,
      date: body.date,
      startTime: body.startTime,
      barberId: body.barberId || undefined,
      source: body.source ?? "online",
      notes: body.notes
    });

    return NextResponse.json({ appointment }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create booking." },
      { status: 400 }
    );
  }
}
