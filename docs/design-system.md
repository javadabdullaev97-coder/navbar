---
name: Luxe Booking Narrative
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#404944'
  inverse-surface: '#313030'
  inverse-on-surface: '#f3f0ef'
  outline: '#707974'
  outline-variant: '#bfc9c3'
  surface-tint: '#2b6954'
  primary: '#003527'
  on-primary: '#ffffff'
  primary-container: '#064e3b'
  on-primary-container: '#80bea6'
  inverse-primary: '#95d3ba'
  secondary: '#5e5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e0dfdf'
  on-secondary-container: '#626362'
  tertiary: '#735c00'
  on-tertiary: '#ffffff'
  tertiary-container: '#cca72f'
  on-tertiary-container: '#4e3d00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b0f0d6'
  primary-fixed-dim: '#95d3ba'
  on-primary-fixed: '#002117'
  on-primary-fixed-variant: '#0b513d'
  secondary-fixed: '#e3e2e1'
  secondary-fixed-dim: '#c7c6c5'
  on-secondary-fixed: '#1a1c1c'
  on-secondary-fixed-variant: '#464746'
  tertiary-fixed: '#ffe088'
  tertiary-fixed-dim: '#e9c349'
  on-tertiary-fixed: '#241a00'
  on-tertiary-fixed-variant: '#574500'
  background: '#fcf9f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
typography:
  display-lg:
    fontFamily: Libre Caslon Text
    fontSize: 40px
    fontWeight: '400'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Libre Caslon Text
    fontSize: 32px
    fontWeight: '400'
    lineHeight: 38px
  headline-md:
    fontFamily: Libre Caslon Text
    fontSize: 24px
    fontWeight: '400'
    lineHeight: 32px
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  container-margin: 20px
  gutter: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

The design system is engineered for a premium beauty services marketplace, balancing the precision of a high-end booking tool with the editorial elegance of a lifestyle magazine. The target audience includes discerning clients seeking quality beauty treatments and professional masters who require a sophisticated platform to showcase their craft.

The aesthetic follows a **Modern Editorial** direction:
- **Minimalism:** Use expansive whitespace ("air") to separate concerns rather than heavy dividers.
- **Refinement:** High-contrast typography pairs a timeless serif with a functional sans-serif to create a "boutique" feel.
- **Trust:** A "rich" color palette and subtle depth suggest stability and premium service.
- **Cultural Context:** Optimized for Russian-language interfaces, ensuring long strings are handled with grace.

## Colors

The palette is anchored by **Deep Forest Green**, a color that evokes luxury, organic beauty, and stability. This is supported by **Warm White** backgrounds to avoid the clinical feel of pure hex-white.

### Light Mode
- **Surface:** #FDFCFB (Warm White) for the main background.
- **Surface-Elevated:** #FFFFFF for cards and modals.
- **Primary:** #064E3B (Deep Forest) for key actions and branding.
- **Text-Primary:** #1A1A1A for maximum legibility.
- **Text-Secondary:** #6B7280 for metadata and labels.

### Dark Mode
- **Surface:** #0F172A (Deep Navy-Black).
- **Surface-Elevated:** #1E293B.
- **Primary:** #10B981 (A slightly more vibrant green for contrast).
- **Text-Primary:** #F9FAFB.

## Typography

This design system utilizes a dual-type system. **Libre Caslon Text** is used for headlines and high-level accents to provide a literary, upscale feel. **Manrope** is used for all functional UI elements, inputs, and body text due to its modern proportions and excellent legibility at small sizes.

For Russian text, ensure line-height is slightly increased (1.5x minimum for body) to accommodate the vertical height of Cyrillic characters. Price displays (UZS) should use the medium weight of the sans-serif font to maintain prominence.

## Layout & Spacing

The layout philosophy relies on a **Fluid Grid** with generous inner padding to maintain the "editorial" feel.

- **Mobile:** 4-column grid, 20px side margins, 16px gutters.
- **Desktop:** 12-column centered grid, max-width 1200px.
- **Rhythm:** All vertical spacing should be multiples of 4px. Use `stack-lg` (32px) to separate major sections like "Popular Services" and "Top Masters" to ensure the interface never feels crowded.

## Elevation & Depth

To maintain a clean and modern look, the design system uses **Ambient Shadows** and **Fine Lines** rather than heavy borders.

- **Level 1 (Cards):** 0px 4px 20px rgba(0, 0, 0, 0.04). A very soft, diffused shadow that barely lifts the element.
- **Level 2 (Modals/Popovers):** 0px 10px 30px rgba(0, 0, 0, 0.08).
- **Dividers:** 1px solid #F3F4F6 (Light mode) or #1E293B (Dark mode). Use sparingly; prefer whitespace for separation.

## Shapes

The shape language is "Softly Geometric." A default radius of **12px** is used for primary containers and buttons, striking a balance between approachable and professional.

- **Standard (Cards/Inputs):** 12px
- **Large (Modals/Large Banners):** 24px
- **Full (Pills/Badges):** 9999px for status indicators and the Role Toggle.

## Components

### Buttons
- **Primary:** Deep Forest Green (#064E3B) background, White text. High-contrast, 12px radius.
- **Secondary:** Warm White background with a 1px border of the primary color.
- **Ghost:** No background or border, primary color text. Used for less critical actions like "Cancel" or "Show More."

### Master Cards
- **Structure:** 1:1 Aspect ratio for the avatar (with 12px radius). 
- **Content:** Name in `label-md`, Rating with a single Gold star (#D4AF37), and "от [Price] UZS" in the bottom right using `label-md`.

### Status Badges
- Small, pill-shaped (`label-sm`).
- **Confirmed:** Soft Green background (#ECFDF5) with Dark Green text (#065F46).
- **Pending:** Soft Amber background (#FFFBEB) with Dark Amber text (#92400E).
- **Cancelled:** Soft Grey background (#F3F4F6) with Dark Grey text (#374151).

### Form Fields & OTP
- **Phone Input:** Include a simplified Uzbekistan flag icon, "+998" prefix as a fixed label, and placeholder "XX XXX-XX-XX".
- **OTP Cells:** 4 or 6 individual boxes, 48x56px, with a 2px primary color border-bottom when focused.

### Role Toggle (Client vs. Master)
- A pill-shaped segmented control. The active state should have a subtle lift (Level 1 shadow) and the background of the inactive state should match the surface-alt color.

### Navigation
- **Top Bar:** Transparent background on scroll-start, transitioning to Warm White with a fine bottom-border. Headline in `headline-md` centered.
- **Bottom Nav:** High-clarity icons with `label-sm` text. Active state uses the Primary color.