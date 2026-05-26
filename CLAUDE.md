# IconBook — Claude Project Instructions

## Project Identity
- **Name:** IconBook
- **Purpose:** Booking and shop dashboard for Icon Barbers (Icon Plaza, Aranguez)
- **Stack:** Next.js 15, React 19, TypeScript, NextAuth v5, Prisma 7 + PostgreSQL, Resend, framer-motion
- **Theme:** Black (#0a0a0a) and orange (#f47920) — matches ICON BARBERS branding

## Phase Status
| Phase | Status | Description |
|-------|--------|-------------|
| 1 | ✅ Done | Landing page, booking modal, TopBar split, public /api/services |
| 2 | ✅ Done | Customer profiles + auto-fill, follow-up scheduling, service management |
| 3A | ✅ Done | Calendar bug fix (7-day week), framer-motion, storefront image, .claude setup |
| 3B | ✅ Done | Resend email receipts (sendBookingConfirmation, sendBarberNotification, NotificationLog) |
| 3C | ✅ Done | Prisma 7 + PostgreSQL migration (adapter-pg, seed, all store functions async) |
| 3D | 🔜 Next | Full dashboard UI redesign (Recharts analytics, sidebar, Today view) |

## Key Users
| Name | Email | Role | Password |
|------|-------|------|----------|
| Anil | anil@iconbook.local | owner | admin123 |
| Shivam | shivam@iconbook.local | barber | barber123 |
| Shastri | shastri@iconbook.local | barber | barber123 |

## Architecture Rules
- **Database** — Prisma 7 + PostgreSQL via `@prisma/adapter-pg`. Client singleton in `src/lib/db.ts`. Schema in `prisma/schema.prisma`. Generated client at `src/generated/prisma/client`.
- **No Tailwind** — custom CSS only, all in `src/app/globals.css`; inline styles in components
- **No component library** — lucide-react for icons, framer-motion for animation only
- **Auth** — NextAuth v5 with Credentials provider. Session stored in JWT cookie.
- **API routes** in `src/app/api/` — must check auth session for protected endpoints
- Owner-only endpoints: `PATCH /api/settings`, `PATCH /api/schedule`
- Barber-filtered endpoint: `GET /api/bootstrap` (barbers only see own appointments)

## File Map
```
src/auth.ts               — NextAuth config + credential verification
src/middleware.ts         — Route protection for /dashboard/*
src/components/
  Providers.tsx           — SessionProvider client wrapper
  TopBar.tsx              — Nav header (variant: "public" | "dashboard")
  DashboardApp.tsx        — Main dashboard (uses useSession)
  landing-page.tsx        — Public landing page (framer-motion, video hero, storefront photo)
  api.ts                  — API client utilities
  ui/
    booking-modal.tsx     — Booking modal wrapper
    barber-scheduling-card.tsx — Booking calendar + slot picker
src/lib/
  store.ts                — Async Prisma data layer + business logic
  db.ts                   — Prisma 7 client singleton (PrismaPg adapter)
  email.ts                — Resend transactional email (booking confirmation, barber notification)
  types.ts                — TypeScript type definitions
  time.ts                 — Date/time utilities
prisma/
  schema.prisma           — 9 models (User, BarberProfile, Service, Customer, Appointment, ScheduleRule, ScheduleException, NotificationLog, Settings)
  seed.ts                 — Demo data seeder (run: npm run db:seed)
src/app/
  layout.tsx              — Root layout with Providers
  page.tsx                — Home (public booking)
  login/page.tsx          — Login page
  dashboard/              — Protected dashboard pages
  api/                    — API route handlers
public/
  assets/
    iconbarber1.jpeg      — Storefront photo (used in About section)
    iconbarbers.mp4       — Barbershop video (used in Hero background)
```

## CSS Variables (Black & Orange Theme)
```css
--bg: #0a0a0a
--panel: #141414
--panel-strong: #1e1e1e
--ink: #f0f0f0
--muted: #888888
--line: #2a2a2a
--accent: #f47920   /* Icon Barbers orange */
--accent-2: #ff6600
--danger: #e63946
--success: #2dc653
```

## .claude/ Folder (AI Tooling)
```
.claude/
  skills/ui-ux-pro-max/SKILL.md   — Design intelligence, auto-loads for UI work
  agents/code-reviewer.md         — Senior reviewer for API/auth issues
  agents/debugger.md              — Root-cause tracer
  agents/security-auditor.md      — Auth + secret exposure checklist
  commands/commit.md              — /commit slash command
  rules/api.md                    — Auto-loads for src/app/api/** files
  output-styles/terse.md          — Code-only mode
```

## Development
```bash
# First-time setup (after cloning)
cp .env.example .env.local        # fill DATABASE_URL, RESEND_API_KEY, etc.
npx prisma migrate dev            # run migrations
npm run db:seed                   # seed demo data

# Daily dev
npm run dev                       # http://localhost:3000
npm run db:studio                 # Prisma Studio at http://localhost:5555
```

## Next Phase — 3D: Dashboard UI Redesign
- Recharts analytics (revenue chart, cut count trend)
- Persistent sidebar navigation
- Today view (live appointment queue, chair status)
- Barber performance cards (owner-only)

## Role Enforcement
- Middleware: `/dashboard/*` requires valid session
- Frontend: `currentUser.role === "owner"` gates analytics, settings, all-barber calendar
- Backend: `auth()` called in `/api/settings` and `/api/schedule` to verify owner role
- Bootstrap: appointments filtered by `barberId` for barber role users

## DO NOT
- Add Tailwind or any CSS framework
- Store passwords in plaintext in commits (auth.ts uses bcryptjs)
- Expose passwords in API responses — User type returned to client has no password field
- Mutate `globalThis.__iconBookStore` — that in-memory store has been removed
- Use WiPay/FAC payment gateway (deferred to future phase)
