import { NextRequest, NextResponse } from "next/server";
import { updateSchedule } from "@/lib/store";
import { auth } from "@/auth";

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "owner") {
    return NextResponse.json({ error: "Owner access required." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const scheduleRule = updateSchedule(body);

    return NextResponse.json({ scheduleRule });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update schedule." },
      { status: 400 }
    );
  }
}
