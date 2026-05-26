import { NextRequest, NextResponse } from "next/server";
import { createBooking } from "@/lib/store";
import { auth } from "@/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const body = await request.json();
    const requestedSource = body.source === "walk_in" ? "walk_in" : "online";
    const source =
      requestedSource === "walk_in" && session
        ? "walk_in"
        : "online";

    const appointment = await createBooking({
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      customerEmail: body.customerEmail,
      serviceId: body.serviceId,
      date: body.date,
      startTime: body.startTime,
      barberId: body.barberId || undefined,
      source,
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
