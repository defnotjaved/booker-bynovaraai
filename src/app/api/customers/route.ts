import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { findCustomerByPhone, getCustomerAppointments } from "@/lib/store";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const phone = request.nextUrl.searchParams.get("phone") ?? "";
  const customer = findCustomerByPhone(phone);
  if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

  const recentAppointments = getCustomerAppointments(customer.id).slice(0, 10);
  return NextResponse.json({ customer, recentAppointments });
}
