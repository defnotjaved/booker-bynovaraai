# IconBook — Skills & Capabilities

## System Overview
IconBook is a multi-barber booking and shop management system for Icon Barbers. It is built on Next.js 15 with React 19, TypeScript, and an in-memory data store.

---

## Core Skills

### Booking Management
- Accept online bookings via `/book` or `/book/[barberSlug]`
- Accept walk-in bookings directly from the dashboard
- Assign bookings to specific barbers or auto-assign to next available chair
- 30-minute time slot generation based on each barber's schedule
- Conflict detection — no double-bookings
- Status lifecycle: `booked → arrived → completed` (or `cancelled` / `no_show`)

### Calendar & Scheduling
- Per-barber weekly schedule rules (working hours, days off)
- One-off schedule exceptions (sick days, holidays)
- Shared calendar grid view: all barbers across all time slots
- Date navigation for past and future bookings

### Role-Based Access Control
- **Owner (Anil)** — full dashboard access: all barbers, analytics, settings, financials
- **Barbers (Shivam, Shastri)** — personal view only: own calendar, own appointments
- Auth enforced at middleware level (route protection) and API level (server-side checks)

### Analytics & Finance
- Today / yesterday / 7-day revenue snapshots
- Per-barber cut counts and revenue
- Commission split: owner takes 40% of non-owner barber revenue
- Product upsell tracking (add-on amounts per appointment)
- Attendance rate (completed vs no-show/cancel)

### Notifications
- Email notification log for booking confirmations, reschedules, and cancellations
- Per-appointment tracking of who was notified and when

### Settings Management (Owner Only)
- Toggle team performance visibility for barbers
- Configure shop open/close hours and overflow time
- Adjust per-barber weekly availability

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| UI | React 19, custom CSS (no Tailwind) |
| Language | TypeScript 5 |
| Icons | lucide-react |
| Auth | NextAuth v5 (Auth.js) with Credentials provider |
| Data | In-memory global store (no database) |
| API | Next.js Route Handlers |

---

## Public Booking URLs
- `/book` — book with any available barber
- `/book/anil` — book specifically with Anil
- `/book/shivam` — book specifically with Shivam
- `/book/shastri` — book specifically with Shastri

## Dashboard URLs (login required)
- `/dashboard` — today's view with walk-in form
- `/dashboard/calendar` — full calendar grid
- `/dashboard/analytics` — revenue and performance
- `/dashboard/settings` — shop settings (owner only)
