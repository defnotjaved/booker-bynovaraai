---
description: Analyze diff and write commit message in Conventional Commits format. Subject under 50 chars. Body explains the why, not the what.
---

# /commit

Run `git status` and `git diff --staged`.
Identify the *why*, not the *what*.

## Format
```
type(scope): subject under 50 chars

Why this change was needed. What problem it solves.
What was wrong before, and why this approach was chosen.
```

## Types
- feat: new user-visible feature
- fix: bug fix
- refactor: no behavior change
- style: CSS/visual only
- chore: tooling, deps, config

## Scopes for IconBook
- landing, booking, dashboard, auth, store, api, schedule, email, db

## Never
- Push without asking
- Use --no-verify
- Commit .env.local or secrets
- Write "updated files" as a commit message
