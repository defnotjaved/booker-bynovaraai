import { NextRequest, NextResponse } from "next/server";
import { updateAppointment } from "@/lib/store";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const appointment = updateAppointment(id, body);

    return NextResponse.json({ appointment });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update appointment." },
      { status: 400 }
    );
  }
}
