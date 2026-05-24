import { NextRequest, NextResponse } from "next/server";
import { findCustomerByPhone } from "@/lib/store";

// Public endpoint — returns only name/email/visitCount for booking form auto-fill.
export async function GET(request: NextRequest) {
  const phone = request.nextUrl.searchParams.get("phone") ?? "";
  if (phone.replace(/\D/g, "").length < 7) {
    return NextResponse.json(null);
  }
  const customer = findCustomerByPhone(phone);
  if (!customer) return NextResponse.json(null);
  return NextResponse.json({
    name: customer.name,
    email: customer.email,
    visitCount: customer.visitCount,
  });
}
