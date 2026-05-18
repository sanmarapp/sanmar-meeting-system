# Sanmar Meeting System — Supplementary Gap Analysis
**Supplement to:** SYSTEM_AUDIT.md (May 18, 2026)  
**New Requirements Scope:** Microcopy / Copywriting System + Brand Logo Architecture  

---

## SECTION A — MICROCOPY / COPYWRITING SYSTEM

### A1. Existing State

| Surface | Current State | Assessment |
|---|---|---|
| Button labels | Generic: "Submit", "Cancel", "Approve", "Reject" | Functional only; no brand tone |
| Empty states | Basic text via `EmptyState` component; generic messages | Component exists; copy not context-aware |
| Notification messages | Hardcoded strings in backend service (e.g., "Booking approved") | Functional; no premium tone |
| Error messages | Raw API error strings piped directly from backend catch blocks | Weak; exposes internal error text to users |
| Confirmation dialogs | Reject modal has a basic "Reason" label; no copy system | Minimal; no tone enforcement |
| Status badges | Status enum values rendered directly (PENDING, CONFIRMED, etc.) | Technical labels, not user-facing copy |
| Form labels & hints | Functional field labels only; no helper text or contextual hints | No micro-guidance layer |
| Toast notifications | Sonner toasts with hardcoded title/description strings scattered across pages | Decentralised; inconsistent tone |

**Root finding:** There is no copywriting layer. All text is written inline, scattered across components, services, and page files. No copy registry, no tone guide enforcement, no context differentiation between modules.

---

### A2. Missing Features

| Missing Feature | Required For | Notes |
|---|---|---|
| Centralised copy registry | All surfaces | Single source of truth for all user-facing strings; prevents scattered inline text |
| Context-aware empty states per module | Corporate, SiteVisit, PropertyFair | Each system needs distinct empty state copy reflecting its purpose |
| Premium button label system | All CTAs | Labels that communicate intent + confidence (not just action verb) |
| Status message copy map | All status badges | Human-readable, tone-consistent status labels mapped from DB enums |
| Error handling copy layer | All API error surfaces | User-safe, non-technical error messages; no raw backend strings to UI |
| Confirmation message system | Approve/Reject/Cancel/Delete actions | Context-specific confirmation copy per action type |
| Notification body copy | All notification events | Per-event copy templates with consistent tone |
| Form helper text layer | New Booking, New Site Visit, Registration forms | Contextual hints that reduce user error without cluttering UI |

---

### A3. Partial Features

| Feature | What Exists | What's Missing |
|---|---|---|
| EmptyState component | `EmptyState.tsx` component accepts title/description props | Copy is hardcoded at call site, not from a registry; not module-aware |
| Toast notifications | Sonner integrated; title+description pattern in place | Strings scattered in page components; no tone consistency across modules |
| Error boundary | `ErrorBoundary.tsx` exists | Generic fallback copy only; no user-friendly error classification |
| Status badges | `Badge.tsx` component with variant support | Status-to-label mapping is inline per page; no shared copy map |

---

### A4. Architectural Recommendation — Microcopy System

**Pattern:** Centralised copy object per module, consumed by components.

**Recommended structure:**
```
apps/frontend/src/
└── copy/
    ├── index.ts                  # Re-exports all copy modules
    ├── global.copy.ts            # Shared: errors, confirmations, generic actions
    ├── corporate.copy.ts         # Corporate Office module copy
    ├── sitevisit.copy.ts         # Site Visit module copy
    ├── propertyfair.copy.ts      # Property Fair module copy
    └── notifications.copy.ts     # All notification titles + bodies
```

**Consumption pattern:**
```ts
// Button label
import { copy } from '@/copy'
<Button>{copy.corporate.booking.submitLabel}</Button>

// Empty state
<EmptyState
  title={copy.corporate.bookings.emptyTitle}
  description={copy.corporate.bookings.emptyDescription}
/>

// Error message
catch (err) {
  toast.error(copy.global.errors.bookingCreateFailed)
}
```

**This is frontend-only.** No backend changes required. Backend notification strings should also be extracted into a `notifications.copy.ts` for consistency, even though backend sends them via NotificationTemplate records in DB.

---

### A5. Gap Classification

| Priority | Item |
|---|---|
| P1 | Create `copy/global.copy.ts` — error messages, confirmation labels, generic action copy |
| P1 | Create status label map for all Booking and SiteVisit enums |
| P1 | Replace raw API error strings in response interceptor with user-safe copy |
| P2 | Create `copy/corporate.copy.ts`, `copy/sitevisit.copy.ts` with module-specific empty states, CTAs, status messages |
| P2 | Create `copy/propertyfair.copy.ts` when Property Fair module is built |
| P2 | Update NotificationTemplate DB records to match copy tone guide |

---

## SECTION B — BRAND LOGO SYSTEM

### B1. Existing State

| Asset | Current State | Location | Assessment |
|---|---|---|---|
| Primary logo PNG | Exists | `apps/frontend/public/` | PNG only; no SVG source; exact filenames from seed session |
| Favicon | Updated (ICO/PNG) | `apps/frontend/public/` (via `index.html`) | Implemented |
| Sidebar logo render | Logo displayed in `Sidebar.tsx` | Hardcoded `<img src>` path | Works; no variant system |
| Login page logo | Logo displayed in `LoginPage.tsx` | Hardcoded `<img src>` path | Works; no variant system |
| PWA manifest | None | — | Not configured; no `manifest.json` |
| Module-specific logo variants | None | — | All modules use same logo |
| Logo component (abstraction) | None | — | Logo is rendered via raw `<img>` tags in individual files |

**Root finding:** Logo implementation is functional at the most basic level (sidebar + login). There is no Logo component abstraction, no multi-variant architecture, no PWA configuration, and no module-specific branding. All renders are hardcoded `<img src>` tags pointing directly to public asset paths.

---

### B2. Missing Features

| Missing Feature | Required Use Case |
|---|---|
| SVG source files for all logo variants | Scalability, retina rendering, inline SVG support |
| `<Logo>` React component with variant prop | Consistent rendering; single change point |
| Corporate module logo variant | Dhaka Tower / Chittagong Tower module UI |
| Site Visit module logo variant | Site Visit system module UI |
| Property Fair logo variant | Property Fair system module UI |
| App icon (PWA) — 192×192 PNG | Install to home screen |
| App icon (PWA) — 512×512 PNG | PWA splash screen |
| `manifest.json` (PWA) | Mobile home screen install; primary usage requirement |
| Organised brand asset folder structure | Prevent asset sprawl as variants grow |

---

### B3. Architectural Recommendation — Logo System

#### File Format Standards

| Use Case | Format | Rationale |
|---|---|---|
| All UI logos (Login, Sidebar, Module headers) | SVG | Scales infinitely; no pixelation on retina/OLED mobile screens; supports theming via CSS |
| PWA app icon (192px, 512px) | PNG | Required by PWA manifest specification; browsers do not accept SVG for manifest icons |
| Favicon | PNG 32×32 + ICO fallback | Maximum browser compatibility |
| Module-specific variants | SVG | Same as UI logos |

**Rule:** Never use PNG for any in-UI logo rendering. PNG is exclusively for PWA manifest icons and favicon. All other logo renders must use SVG.

---

#### Recommended Folder Structure

```
apps/frontend/public/
└── brand/
    ├── logo-full.svg              # Full wordmark — Login, Dashboard, Main nav
    ├── logo-icon.svg              # Icon-only mark — collapsed sidebar, compact contexts
    ├── logo-corporate.svg         # Corporate Office module identity
    ├── logo-sitevisit.svg         # Site Visit module identity
    ├── logo-fair.svg              # Property Fair module identity
    └── icons/
        ├── icon-192.png           # PWA manifest — home screen icon
        ├── icon-512.png           # PWA manifest — splash screen
        └── favicon.png            # Browser tab favicon (32×32)
```

**Note on current state:** The existing logo PNGs in `public/` should be kept as-is for backward compatibility until SVG variants are prepared. They should then be migrated to `public/brand/` and the existing files removed.

---

#### Placement Mapping

| Context | Logo Variant | Component Location | Asset Path |
|---|---|---|---|
| PWA home screen icon | icon-192.png / icon-512.png | `index.html` manifest link | `/brand/icons/icon-192.png` |
| Browser favicon | favicon.png | `index.html` `<link rel="icon">` | `/brand/icons/favicon.png` |
| Login screen | logo-full.svg | `LoginPage.tsx` | `/brand/logo-full.svg` |
| Sidebar (expanded) | logo-full.svg | `Sidebar.tsx` | `/brand/logo-full.svg` |
| Sidebar (collapsed) | logo-icon.svg | `Sidebar.tsx` | `/brand/logo-icon.svg` |
| Corporate module header | logo-corporate.svg | Corporate layout wrapper | `/brand/logo-corporate.svg` |
| Site Visit module header | logo-sitevisit.svg | SiteVisit layout wrapper | `/brand/logo-sitevisit.svg` |
| Property Fair module header | logo-fair.svg | PropertyFair layout wrapper | `/brand/logo-fair.svg` |

---

#### Logo Component Architecture

All logo renders must go through a single `<Logo>` component. No raw `<img>` tags pointing to brand assets anywhere else in the codebase.

```tsx
// apps/frontend/src/components/brand/Logo.tsx

type LogoVariant = 'full' | 'icon' | 'corporate' | 'sitevisit' | 'fair'

interface LogoProps {
  variant?: LogoVariant
  className?: string
  alt?: string
}

export const Logo = ({ variant = 'full', className, alt = 'Sanmar' }: LogoProps) => {
  const src = `/brand/logo-${variant}.svg`
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      draggable={false}
    />
  )
}
```

**Module variant auto-selection (optional enhancement for P2):**
```tsx
// When inside Corporate module routes, Logo auto-resolves to 'corporate'
// Implemented via a ModuleContext provider at route level
const { module } = useModuleContext()
<Logo variant={module ?? 'full'} />
```

---

#### PWA Manifest Configuration

Add to `apps/frontend/index.html`:
```html
<link rel="manifest" href="/manifest.json" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<link rel="apple-touch-icon" href="/brand/icons/icon-192.png" />
```

Create `apps/frontend/public/manifest.json`:
```json
{
  "name": "Sanmar Meeting System",
  "short_name": "Sanmar",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#1a1a2e",
  "icons": [
    { "src": "/brand/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/brand/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

---

#### Consistency Enforcement Strategy

| Enforcement Method | Mechanism |
|---|---|
| Component gate | All logo renders via `<Logo variant="">` — no exceptions |
| ESLint rule (optional) | Add a lint rule flagging any `<img src` containing `/brand/` outside `Logo.tsx` |
| Asset location contract | All brand assets under `public/brand/` only; no logo files in `src/assets/` |
| Module context binding | Logo variant driven by route/module context, not hardcoded per page |
| Design token connection | Logo colours (if SVG uses CSS variables) inherit from design tokens in `tailwind.config.js` |

---

### B4. Risks and Mistakes to Avoid

| Risk | Description | Mitigation |
|---|---|---|
| PNG in UI | PNG logos pixelate on retina and OLED mobile displays (primary usage is mobile-first) | Enforce SVG-only for all in-UI renders |
| Hardcoded img src bypassing Logo component | Developers render logos directly — variant system breaks silently | Code review gate + optional ESLint rule |
| Missing manifest.json | App cannot be installed to home screen; fails mobile-first requirement | Add manifest before any production user testing |
| Module variants visually inconsistent | If each module logo variant is created independently with different proportions | Define a logo grid system: all variants must share same base height and clear space rules |
| SVG with embedded fonts | SVG logos with embedded text + custom fonts may not render correctly across environments | Convert all text in SVG logos to outlines before exporting |
| Conflating favicon with app icon | Favicon (32px) and PWA icon (192px/512px) are different assets with different constraints | Keep as separate files; do not reuse favicon PNG as PWA icon |
| No fallback for missing variants | If `logo-corporate.svg` doesn't exist, broken image appears | `<Logo>` component should have a fallback to `logo-full.svg` on image error |

---

### B5. Gap Classification

| Priority | Item |
|---|---|
| P1 | Prepare SVG source files for: logo-full, logo-icon (minimum viable set) |
| P1 | Create `<Logo>` component; replace all raw `<img>` logo renders in Sidebar.tsx and LoginPage.tsx |
| P1 | Add `manifest.json` + PWA meta tags to `index.html` |
| P1 | Add 192×192 and 512×512 PNG app icons to `public/brand/icons/` |
| P2 | Prepare module-specific SVG variants: logo-corporate, logo-sitevisit |
| P2 | Prepare logo-fair.svg when Property Fair module is built |
| P2 | Implement ModuleContext provider for automatic logo variant resolution |
| P2 | Migrate existing logo PNGs from `public/` root to `public/brand/` |

---

## INTEGRATED PRIORITY UPGRADE LIST (Updated)

This supplements the priority list in SYSTEM_AUDIT.md. Items below are additive.

### P0 (Unchanged from main audit)
See SYSTEM_AUDIT.md — P0 items are permission and approval workflow bugs.

### P1 Additions
| ID | Feature | Component |
|---|---|---|
| P1-11 | Global error copy layer — replace raw API errors with user-safe messages | `copy/global.copy.ts` + API response interceptor |
| P1-12 | Status label copy map for Booking and SiteVisit enums | `copy/global.copy.ts` + Badge component |
| P1-13 | `<Logo>` component + SVG source files (full + icon variants) | `components/brand/Logo.tsx` + `public/brand/` |
| P1-14 | PWA manifest + app icons | `public/manifest.json` + `index.html` |

### P2 Additions
| ID | Feature | Component |
|---|---|---|
| P2-10 | Module copy files (corporate, sitevisit, propertyfair) | `copy/` directory |
| P2-11 | Module-specific logo variants (SVG) | `public/brand/` |
| P2-12 | ModuleContext provider for route-aware logo variant | Context + Layout wrappers |
| P2-13 | NotificationTemplate DB records updated to match copy tone | DB migration / admin update |

---

*End of Supplementary Gap Analysis*  
*Combined audit scope: Enterprise platform requirements + Microcopy system + Brand logo architecture*
