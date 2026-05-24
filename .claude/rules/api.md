---
glob: src/app/api/**
description: Rules that fire for every API route file in IconBook
---

# API Route Rules

Apply these rules to every file matching `src/app/api/**/*.ts`.

## Auth requirements
- Every route that reads user-specific data: call `auth()` and check session
- Every mutation (POST/PATCH/DELETE): call `auth()` — reject with 401 if no session
- Owner-only mutations: also check `session.user.role === "owner"` — reject with 403

## Response shape
- Success: `NextResponse.json({ ...data })` with appropriate 2xx status
- Error: `NextResponse.json({ error: "message" }, { status: NNN })`
- Never return raw store objects that contain `passwordHash`

## Validation
- Validate required body fields at the top of the handler
- Return 400 with `{ error: "fieldName is required" }` for missing fields
- Parse dates as strings (YYYY-MM-DD), times as strings (HH:MM)

## No direct store access
- Use exported functions from `src/lib/store.ts`
- Never mutate `globalThis.__iconBookStore` directly in route handlers
