# IconBook — Agent Roles & Responsibilities

## Agent Architecture Overview

This document defines the conceptual agents (roles) within the IconBook system and how they interact with the booking platform. Agents represent both human roles and potential AI/automation integrations.

---

## Human Agents

### Owner Agent — Anil
**Email:** `anil@iconbook.local`  
**Login:** `admin123`  
**Role:** `owner`

**Permissions:**
- View all barbers' calendars and appointment histories
- Create, edit, reschedule, and cancel any appointment
- View full analytics: revenue, cuts, commissions, product sales
- Edit weekly schedules for all barbers
- Toggle performance visibility for the team
- Configure shop hours and overflow times

**Dashboard access:** Full (`/dashboard`, `/dashboard/calendar`, `/dashboard/analytics`, `/dashboard/settings`)

---

### Barber Agent — Shivam
**Email:** `shivam@iconbook.local`  
**Login:** `barber123`  
**Role:** `barber`

**Permissions:**
- View own calendar and appointments only
- Mark own appointments as arrived, completed, or cancelled
- View own performance metrics (if owner enables it)
- Cannot edit settings, schedules, or other barbers' data

**Dashboard access:** Personal view only

---

### Barber Agent — Shastri
**Email:** `shastri@iconbook.local`  
**Login:** `barber123`  
**Role:** `barber`

**Permissions:** Same as Shivam — personal view only.

---

### Customer Agent (Public, Unauthenticated)
**No login required.**

**Permissions:**
- Browse available time slots via `/book` or `/book/[barberSlug]`
- Create a booking (online source)
- Receive confirmation email (logged in the notification log)
- Cannot access dashboard or view any barber data

---

## Automation Agents (Future Integrations)

### Booking Confirmation Bot
**Trigger:** `POST /api/appointments`  
**Action:** Sends confirmation email to customer and barber  
**Current state:** Logged in `notifications[]` (email sending not yet wired)

### No-Show Monitor
**Trigger:** End of day cron  
**Action:** Scan `booked` or `arrived` appointments past their end time and mark as `no_show`  
**Current state:** Manual (staff updates status manually)

### Availability Sync Bot
**Trigger:** Schedule rule change via `PATCH /api/schedule`  
**Action:** Invalidate cached slot availability  
**Current state:** Already handled — slots are computed fresh on each `/api/slots` request

---

## API Endpoints by Agent Access Level

| Endpoint | Customer | Barber | Owner |
|----------|---------|--------|-------|
| `GET /api/slots` | ✅ | ✅ | ✅ |
| `POST /api/appointments` | ✅ | ✅ | ✅ |
| `PATCH /api/appointments/[id]` | ❌ | Own only | ✅ |
| `GET /api/bootstrap` | ❌ | Filtered | Full |
| `PATCH /api/settings` | ❌ | ❌ | ✅ |
| `PATCH /api/schedule` | ❌ | ❌ | ✅ |

---

## Integration Flow

```
Customer books online
       │
       ▼
POST /api/appointments
       │
       ▼
In-memory store saves appointment
       │
       ├──► Notification log: customer email
       └──► Notification log: barber email
                     │
                     ▼
           Dashboard calendar updates
           (owner sees all, barbers see own)
```
