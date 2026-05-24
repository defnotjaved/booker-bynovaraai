import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { updateService } from "@/lib/store";

async function requireOwner() {
  const session = await auth();
  if (!session || session.user.role !== "owner") return null;
  return session;
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireOwner()) {
    return NextResponse.json({ error: "Owner access required." }, { status: 403 });
  }
  const { id } = await params;
  const body = await request.json();
  try {
    const service = updateService(id, body);
    return NextResponse.json({ service });
  } catch {
    return NextResponse.json({ error: "Service not found." }, { status: 404 });
  }
}

// Soft delete — sets active: false
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireOwner()) {
    return NextResponse.json({ error: "Owner access required." }, { status: 403 });
  }
  const { id } = await params;
  try {
    const service = updateService(id, { active: false });
    return NextResponse.json({ service });
  } catch {
    return NextResponse.json({ error: "Service not found." }, { status: 404 });
  }
}
