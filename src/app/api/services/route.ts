import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createService, getSnapshot } from "@/lib/store";

// Public GET — returns only active services for the landing page and booking modal.
export async function GET() {
  const { services } = getSnapshot();
  return NextResponse.json({ services: services.filter((s) => s.active) });
}

// Owner-only POST — create a new service.
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "owner") {
    return NextResponse.json({ error: "Owner access required." }, { status: 403 });
  }
  const body = await request.json();
  const { name, price, durationMinutes } = body;
  if (!name || typeof price !== "number" || typeof durationMinutes !== "number") {
    return NextResponse.json({ error: "name, price, and durationMinutes are required." }, { status: 400 });
  }
  const service = createService({ name, price, durationMinutes });
  return NextResponse.json({ service }, { status: 201 });
}
