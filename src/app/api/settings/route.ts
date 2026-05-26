import { NextRequest, NextResponse } from "next/server";
import { updateSettings } from "@/lib/store";
import { auth } from "@/auth";

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "owner") {
    return NextResponse.json({ error: "Owner access required." }, { status: 403 });
  }

  const body = await request.json();
  const settings = await updateSettings(body);

  return NextResponse.json({ settings });
}
