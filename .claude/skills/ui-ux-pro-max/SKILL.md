---
name: ui-ux-pro-max
description: Design intelligence on tap. Generates polished, production-grade UI using the project's black/orange theme, inline styles (no Tailwind), and framer-motion animations. 50 design patterns, 21 palettes, 50 font pairs encoded. Auto-activates when building any UI component, page, or dashboard section for IconBook.
---

# UI/UX Pro Max — IconBook Edition

Use this skill when building any UI for the IconBook barbershop system.

## When to invoke
- User says "design", "build a UI", "redesign", "make it look better"
- File is .tsx, .css
- Building landing page sections, booking modal, dashboard panels
- Any component that renders to the browser

## Design System
**Theme:** Black (#0a0a0a) + Orange (#f47920)
**No Tailwind** — inline styles + CSS vars only
**Icons:** lucide-react only
**Animation:** framer-motion (already installed)

## CSS Variables to use
```
--bg: #0a0a0a          background
--panel: #141414       card/panel surface
--panel-strong: #1e1e1e elevated surface
--ink: #f0f0f0         primary text
--muted: #888888       secondary text
--line: #2a2a2a        borders/dividers
--accent: #f47920      Icon Barbers orange (CTAs, highlights)
--accent-2: #ff6600    orange hover states
--danger: #e63946      errors/destructive
--success: #2dc653     success states
```

## Design Patterns (Top 10 for this project)
1. **Hero with video bg** — `<video autoPlay muted loop playsInline>` behind overlay
2. **Scroll fade-in** — `motion.div` with `initial={{ opacity:0, y:30 }}` + `whileInView={{ opacity:1, y:0 }}`
3. **Card hover** — `border-color` transition to `--accent` on hover
4. **Orange glow** — `box-shadow: 0 0 40px rgba(244,121,32,0.15)`
5. **Stat bar** — horizontal flex, each stat separated by `1px solid var(--line)`
6. **Stagger grid** — `motion.div` children with `delay: index * 0.1`
7. **Pill badge** — `border-radius:100`, `rgba(244,121,32,0.12)` bg, accent text
8. **Section label** — 13px uppercase, `letter-spacing: 0.12em`, accent color
9. **Ghost button** — transparent bg, `1px solid var(--accent)`, hover fills orange
10. **Full-bleed section** — alternate `--bg` and `--panel` backgrounds

## Motion Defaults
```ts
const fadeUp = { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } }
const stagger = { animate: { transition: { staggerChildren: 0.1 } } }
```

## Reference
- lucide.dev for icon names
- Use `whileInView` not `useEffect` for scroll animations
- Always `viewport={{ once: true }}` to avoid re-triggering
