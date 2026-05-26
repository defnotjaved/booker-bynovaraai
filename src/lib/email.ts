import { Resend } from "resend";
import { prisma } from "./db";
import type { Appointment, BarberProfile, Service } from "./types";
import { formatTime } from "./time";

function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}
const FROM = process.env.EMAIL_FROM ?? "IconBook <bookings@iconbook.local>";

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric"
  });
}

export async function sendBookingConfirmation(
  appointment: Appointment,
  service: Service,
  barber: BarberProfile
) {
  const subject = "Your IconBook appointment is confirmed";
  const html = `
    <div style="font-family:Inter,sans-serif;background:#0a0a0a;color:#f0f0f0;padding:32px;max-width:520px;margin:0 auto;">
      <div style="background:#f47920;color:#fff;padding:8px 14px;display:inline-block;font-weight:800;font-size:13px;letter-spacing:0.06em;margin-bottom:24px;">ICON BARBERS</div>
      <h1 style="font-size:22px;font-weight:800;margin:0 0 8px;">Booking Confirmed ✓</h1>
      <p style="color:#888;margin:0 0 24px;">See you soon, ${appointment.customerName}!</p>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:10px 0;border-bottom:1px solid #2a2a2a;color:#888;font-size:13px;">Service</td><td style="padding:10px 0;border-bottom:1px solid #2a2a2a;font-weight:600;">${service.name}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #2a2a2a;color:#888;font-size:13px;">Barber</td><td style="padding:10px 0;border-bottom:1px solid #2a2a2a;font-weight:600;">${barber.name}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #2a2a2a;color:#888;font-size:13px;">Date</td><td style="padding:10px 0;border-bottom:1px solid #2a2a2a;font-weight:600;">${formatDate(appointment.date)}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #2a2a2a;color:#888;font-size:13px;">Time</td><td style="padding:10px 0;border-bottom:1px solid #2a2a2a;font-weight:600;">${formatTime(appointment.startTime)}</td></tr>
        <tr><td style="padding:10px 0;color:#888;font-size:13px;">Price</td><td style="padding:10px 0;color:#f47920;font-weight:800;">TT$${service.price}</td></tr>
      </table>
      <p style="color:#888;font-size:12px;margin-top:32px;">Icon Plaza, Aranguez · (868) 123-4567</p>
    </div>`;

  const status = await send(appointment.customerEmail, subject, html);
  await logEmailResult(appointment.id, "booking", appointment.customerEmail, subject, status);
}

export async function sendBarberNotification(
  appointment: Appointment,
  service: Service,
  barber: BarberProfile
) {
  const subject = `New booking for ${formatTime(appointment.startTime)} — ${appointment.customerName}`;
  const html = `
    <div style="font-family:Inter,sans-serif;background:#0a0a0a;color:#f0f0f0;padding:32px;max-width:520px;margin:0 auto;">
      <div style="background:#f47920;color:#fff;padding:8px 14px;display:inline-block;font-weight:800;font-size:13px;letter-spacing:0.06em;margin-bottom:24px;">ICON BARBERS — Staff</div>
      <h1 style="font-size:20px;font-weight:800;margin:0 0 8px;">New Appointment, ${barber.name}</h1>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:10px 0;border-bottom:1px solid #2a2a2a;color:#888;font-size:13px;">Client</td><td style="padding:10px 0;border-bottom:1px solid #2a2a2a;font-weight:600;">${appointment.customerName}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #2a2a2a;color:#888;font-size:13px;">Phone</td><td style="padding:10px 0;border-bottom:1px solid #2a2a2a;font-weight:600;">${appointment.customerPhone}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #2a2a2a;color:#888;font-size:13px;">Service</td><td style="padding:10px 0;border-bottom:1px solid #2a2a2a;font-weight:600;">${service.name}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #2a2a2a;color:#888;font-size:13px;">Date</td><td style="padding:10px 0;border-bottom:1px solid #2a2a2a;font-weight:600;">${formatDate(appointment.date)}</td></tr>
        <tr><td style="padding:10px 0;color:#888;font-size:13px;">Time</td><td style="padding:10px 0;color:#f47920;font-weight:800;">${formatTime(appointment.startTime)}</td></tr>
      </table>
    </div>`;

  const status = await send(barber.email, subject, html);
  await logEmailResult(appointment.id, "booking", barber.email, subject, status);
}

async function send(to: string, subject: string, html: string): Promise<"sent" | "failed"> {
  const resend = getResend();
  if (!resend) return "failed";
  try {
    const { error } = await resend.emails.send({ from: FROM, to, subject, html });
    return error ? "failed" : "sent";
  } catch {
    return "failed";
  }
}

async function logEmailResult(
  appointmentId: string,
  type: string,
  recipientEmail: string,
  subject: string,
  status: "sent" | "failed"
) {
  await prisma.notificationLog.create({
    data: {
      appointmentId,
      type,
      recipientEmail,
      subject,
      status,
      createdAt: new Date().toISOString()
    }
  });
}
