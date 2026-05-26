---
name: IconBook Core
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#dec1b1'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#a68b7d'
  outline-variant: '#574237'
  surface-tint: '#ffb68b'
  primary: '#ffb68b'
  on-primary: '#522300'
  primary-container: '#f47b20'
  on-primary-container: '#582600'
  inverse-primary: '#994700'
  secondary: '#c8c6c5'
  on-secondary: '#303030'
  secondary-container: '#474746'
  on-secondary-container: '#b7b5b4'
  tertiary: '#c8c6c5'
  on-tertiary: '#313030'
  tertiary-container: '#9e9c9c'
  on-tertiary-container: '#343434'
  error: '#EF4444'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdbc8'
  primary-fixed-dim: '#ffb68b'
  on-primary-fixed: '#321200'
  on-primary-fixed-variant: '#753400'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1b1b1b'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#e5e2e1'
  tertiary-fixed-dim: '#c8c6c5'
  on-tertiary-fixed: '#1c1b1b'
  on-tertiary-fixed-variant: '#474646'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
  accent-hover: '#D96212'
  text-primary: '#F5F1EA'
  text-secondary: '#B8AEA2'
  text-subtle: '#8E857A'
  border-low-contrast: '#2B2B2B'
  success: '#22C55E'
  warning: '#F59E0B'
  info: '#3B82F6'
  accent-glow: rgba(244, 123, 32, 0.12)
typography:
  hero-h1:
    fontFamily: Sora
    fontSize: 84px
    fontWeight: '900'
    lineHeight: 110%
    letterSpacing: -0.02em
  hero-h1-mobile:
    fontFamily: Sora
    fontSize: 48px
    fontWeight: '900'
    lineHeight: 110%
  section-h2:
    fontFamily: Sora
    fontSize: 44px
    fontWeight: '800'
    lineHeight: 120%
  card-title:
    fontFamily: Sora
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 140%
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 160%
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 150%
  ui-label:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 100%
  data-display:
    fontFamily: JetBrains Mono
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 140%
  data-price:
    fontFamily: JetBrains Mono
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 100%
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 140%
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
  touch-target: 44px
---

## Brand & Style

The design system is engineered for a premium, masculine aesthetic that balances cinematic drama with high-performance utility. It evokes the atmosphere of a luxury barbershop—precise, artisanal, and high-contrast. 

The visual direction is **Modern High-Contrast**, leaning into deep charcoal foundations and vibrant metallic accents. It prioritizes clarity for administrative tasks while maintaining a "destination" feel for customers. The style avoids generic softness in favor of sharp, bold typography and purposeful "glow" states that highlight key conversion paths.

## Colors

The palette is anchored by **Charcoal Black** (#090909) to create a sophisticated, dark-mode-first environment. 

### Palette Application
- **Backgrounds:** Use `#090909` for the deepest page level. 
- **Surfaces:** Use Deep Graphite (`#141414`) for layout panels and Soft Graphite (`#1D1D1D`) for interactive cards and secondary buttons.
- **Accents:** Copper Orange (`#F47B20`) is strictly reserved for primary actions, focus indicators, and critical brand moments.
- **Typography:** Avoid pure white. Use Warm White (`#F5F1EA`) for high-readability headings and Muted Sand (`#B8AEA2`) for secondary information to maintain the premium, low-glare aesthetic.
- **Status:** Semantics (Success, Warning, Error) follow industry standards but are slightly desaturated to sit naturally against the dark charcoal base.

## Typography

The system utilizes a three-font hierarchy to communicate brand, utility, and data.

- **Brand (Sora):** Used for headlines and card titles. The heavy weight (800-900) provides a sturdy, masculine foundation.
- **UI & Reading (Inter):** The primary workhorse for descriptions, inputs, and standard UI components. It ensures high legibility in dense administrative layouts.
- **Data (JetBrains Mono):** Used exclusively for prices, booking times, and IDs. The monospaced nature helps align numerical data in tables and scheduling grids, providing a technical, "engineered" feel.

**Scaling:** On mobile devices, H1 and H2 headers should scale down aggressively to maintain the high-contrast impact without forcing excessive scrolling.

## Layout & Spacing

The layout follows an **8px base grid** to ensure mathematical consistency across all components.

### Grid & Responsiveness
- **Desktop:** 12-column fluid grid with a maximum content width of 1280px. Gutters are fixed at 24px to maintain breathability between high-contrast cards.
- **Tablet:** 8-column grid with 24px margins.
- **Mobile:** 4-column grid with 16px margins. 

### Spacing Rhythm
Interactive elements must adhere to a 44px minimum height touch target. Layout sections (e.g., Hero vs. Features) should utilize large vertical padding (80px–120px) to emphasize the premium minimalist aesthetic and allow the "orange glow" effects to bleed naturally into the dark background.

## Elevation & Depth

Hierarchy is established through **Tonal Layering** rather than traditional heavy shadows. Depth is perceived by the lightness of the surface:

1.  **Level 0 (Floor):** `#090909` — Main background.
2.  **Level 1 (Base):** `#141414` — Main navigation bars and page sections.
3.  **Level 2 (Raised):** `#1D1D1D` — Standard service cards and interactive surfaces.
4.  **Level 3 (Overlay):** `#2B2B2B` — Modals and dropdown menus.

**Shadows & Glows:**
- **Ambient Shadow:** For Level 2 and 3 surfaces, use a soft, large-radius shadow: `0 16px 50px rgba(0, 0, 0, 0.40)`.
- **Accent Glow:** For Hero cards or Primary CTAs, apply a subtle Copper Orange glow: `0 0 50px rgba(244, 123, 32, 0.16)`.
- **Interaction:** Cards should lift -2px on hover, accompanied by a subtle increase in the orange glow intensity.

## Shapes

The design system uses "Rounded" geometry to soften the high-contrast color palette, making the interface feel modern and approachable.

- **Components (Buttons/Inputs):** Use `12px` (`rounded-md`) to balance structure with comfort.
- **Standard Cards:** Use `18px` (`rounded-lg`) for service listings and dashboard widgets.
- **Container/Hero Cards:** Use `24px` (`rounded-xl`) for large media containers and primary booking wizards.
- **Status Badges:** Always use full "Pill" rounding for quick visual distinction from buttons.

All borders should be `1px` wide using the Soft Charcoal Line (`#2B2B2B`) unless the element is focused, in which case the border transitions to Copper Orange.

## Components

### Buttons
- **Primary:** Background `#F47B20`, Text `#F5F1EA` (Bold Inter). On hover, background shifts to `#D96212`.
- **Secondary:** Background `#1D1D1D`, Border `1px solid #2B2B2B`. High-contrast text.
- **Visuals:** 12px corner radius; 44px-52px height.

### Input Fields
- **Default:** Background `#141414`, Border `1px solid #2B2B2B`, Placeholder `#8E857A`.
- **Focus:** Border shifts to `#F47B20` with a subtle outer glow.
- **Labels:** Use `ui-label` typography (Inter Bold, Uppercase).

### Cards
- **Service Cards:** Background `#1D1D1D`, 18px radius. Hover state adds a `1px` border of `rgba(244, 123, 32, 0.32)`.
- **Media Cards:** Hero images or videos should include a subtle `accent-glow` behind the container.

### Status Badges
- **Style:** Rounded pill shape with `body-sm` typography. 
- **Implementation:** Always pair the color (e.g., `#22C55E` for Success) with a clear text label (e.g., "CONFIRMED") for accessibility.

### Pricing & Scheduling
- **Format:** All prices and time slots must use **JetBrains Mono**. This ensures that numbers align perfectly in vertical stacks, essential for comparing service durations or costs.