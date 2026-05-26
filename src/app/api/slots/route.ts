import { NextRequest, NextResponse } from "next/server";
import { getAvailableSlots } from "@/lib/store";
import { todayString } from "@/lib/time";

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams;
  const date = search.get("date") ?? todayString();
  const barberId = search.get("barberId") ?? undefined;

  return NextResponse.json({
    slots: await getAvailableSlots(date, barberId)
  });
}
