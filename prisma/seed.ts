import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const BARBER_ANIL = "barber-anil";
const BARBER_SHIVAM = "barber-shivam";
const BARBER_SHASTRI = "barber-shastri";

function todayISO() {
  return new Date().toISOString().split("T")[0];
}
function addDays(d: string, n: number) {
  const dt = new Date(d);
  dt.setDate(dt.getDate() + n);
  return dt.toISOString().split("T")[0];
}

async function main() {
  console.log("🌱 Seeding IconBook database…");

  // ── Users ──────────────────────────────────────────────────────────────────
  await prisma.user.upsert({
    where: { email: "anil@iconbook.local" },
    update: {},
    create: {
      id: "user-anil",
      name: "Anil",
      email: "anil@iconbook.local",
      role: "owner",
      passwordHash: bcrypt.hashSync("admin123", 10),
      barberId: BARBER_ANIL
    }
  });

  await prisma.user.upsert({
    where: { email: "shivam@iconbook.local" },
    update: {},
    create: {
      id: "user-shivam",
      name: "Shivam",
      email: "shivam@iconbook.local",
      role: "barber",
      passwordHash: bcrypt.hashSync("barber123", 10),
      barberId: BARBER_SHIVAM
    }
  });

  await prisma.user.upsert({
    where: { email: "shastri@iconbook.local" },
    update: {},
    create: {
      id: "user-shastri",
      name: "Shastri",
      email: "shastri@iconbook.local",
      role: "barber",
      passwordHash: bcrypt.hashSync("barber123", 10),
      barberId: BARBER_SHASTRI
    }
  });

  // ── Barber profiles ────────────────────────────────────────────────────────
  const barbers = [
    { id: BARBER_ANIL,   slug: "anil",       name: "Anil",    email: "anil@iconbook.local",    active: true,  chair: 1, isOwner: true },
    { id: BARBER_SHIVAM, slug: "shivam",     name: "Shivam",  email: "shivam@iconbook.local",  active: true,  chair: 2, isOwner: false },
    { id: BARBER_SHASTRI,slug: "shastri",    name: "Shastri", email: "shastri@iconbook.local", active: true,  chair: 3, isOwner: false },
    { id: "barber-open", slug: "open-chair", name: "Open Chair", email: "open@iconbook.local", active: false, chair: 4, isOwner: false }
  ];

  for (const b of barbers) {
    await prisma.barberProfile.upsert({ where: { id: b.id }, update: {}, create: b });
  }

  // ── Services ───────────────────────────────────────────────────────────────
  await prisma.service.upsert({
    where: { id: "service-haircut" },
    update: {},
    create: { id: "service-haircut", name: "Haircut", price: 120, durationMinutes: 30, active: true }
  });
  await prisma.service.upsert({
    where: { id: "service-haircut-beard" },
    update: {},
    create: { id: "service-haircut-beard", name: "Haircut + Beard/Touch-up", price: 150, durationMinutes: 30, active: true }
  });

  // ── Settings ───────────────────────────────────────────────────────────────
  await prisma.settings.upsert({
    where: { id: "shop" },
    update: {},
    create: {
      id: "shop",
      performanceVisibleToBarbers: false,
      shopStartTime: "09:00",
      shopEndTime: "19:00",
      overflowEndTime: "20:30"
    }
  });

  // ── Weekly schedule ────────────────────────────────────────────────────────
  const offDays: Record<string, number> = {
    [BARBER_ANIL]: 1,    // Anil off Monday
    [BARBER_SHIVAM]: 2,  // Shivam off Tuesday
    [BARBER_SHASTRI]: 3  // Shastri off Wednesday
  };
  const activeBarbers = [BARBER_ANIL, BARBER_SHIVAM, BARBER_SHASTRI];

  for (const barberId of activeBarbers) {
    for (let day = 0; day <= 6; day++) {
      await prisma.scheduleRule.upsert({
        where: { barberId_dayOfWeek: { barberId, dayOfWeek: day } },
        update: {},
        create: {
          barberId,
          dayOfWeek: day,
          startTime: "09:00",
          endTime: "19:00",
          isWorking: offDays[barberId] !== day
        }
      });
    }
  }

  // ── Demo exception ─────────────────────────────────────────────────────────
  const today = todayISO();
  await prisma.scheduleException.upsert({
    where: { id: "exception-anil-demo" },
    update: {},
    create: {
      id: "exception-anil-demo",
      barberId: BARBER_ANIL,
      date: addDays(today, 2),
      isUnavailable: true,
      reason: "Owner day off"
    }
  });

  // ── Demo appointments ──────────────────────────────────────────────────────
  const yesterday = addDays(today, -1);
  const tomorrow = addDays(today, 1);
  const now = new Date().toISOString();

  const demos = [
    { id: "seed-1", name: "Darren",   phone: "8685551010", email: "darren@example.com",   barberId: BARBER_ANIL,    svc: "service-haircut",       date: today,     time: "09:30", status: "completed", src: "online",  fsa: 120, pa: 0 },
    { id: "seed-2", name: "Marcus",   phone: "8685552020", email: "marcus@example.com",   barberId: BARBER_SHIVAM,  svc: "service-haircut-beard", date: today,     time: "10:30", status: "arrived",   src: "online",  fsa: null, pa: null },
    { id: "seed-3", name: "Kevin",    phone: "8685553030", email: "kevin@example.com",    barberId: BARBER_SHASTRI, svc: "service-haircut",       date: today,     time: "12:00", status: "booked",    src: "walk_in", fsa: null, pa: null },
    { id: "seed-4", name: "Jamal",    phone: "8685554040", email: "jamal@example.com",    barberId: BARBER_SHIVAM,  svc: "service-haircut",       date: yesterday, time: "11:00", status: "completed", src: "online",  fsa: 120, pa: 30 },
    { id: "seed-5", name: "Andre",    phone: "8685555050", email: "andre@example.com",    barberId: BARBER_SHASTRI, svc: "service-haircut-beard", date: yesterday, time: "13:30", status: "completed", src: "online",  fsa: 150, pa: 0 },
    { id: "seed-6", name: "Nicholas", phone: "8685556060", email: "nicholas@example.com", barberId: BARBER_ANIL,    svc: "service-haircut-beard", date: yesterday, time: "15:00", status: "no_show",   src: "online",  fsa: null, pa: null },
    { id: "seed-7", name: "Ravi",     phone: "8685557070", email: "ravi@example.com",     barberId: BARBER_ANIL,    svc: "service-haircut",       date: tomorrow,  time: "10:00", status: "booked",    src: "online",  fsa: null, pa: null }
  ];

  for (const d of demos) {
    const dur = d.svc === "service-haircut" ? 30 : 30;
    const [h, m] = d.time.split(":").map(Number);
    const endMin = h * 60 + m + dur;
    const endTime = `${String(Math.floor(endMin / 60)).padStart(2, "0")}:${String(endMin % 60).padStart(2, "0")}`;

    await prisma.appointment.upsert({
      where: { id: d.id },
      update: {},
      create: {
        id: d.id,
        customerName: d.name,
        customerPhone: d.phone,
        customerEmail: d.email,
        barberId: d.barberId,
        serviceId: d.svc,
        date: d.date,
        startTime: d.time,
        endTime,
        status: d.status,
        source: d.src,
        finalServiceAmount: d.fsa ?? undefined,
        productAmount: d.pa ?? undefined,
        createdAt: now
      }
    });
  }

  console.log("✅ Seed complete.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
