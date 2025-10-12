# Theming Architecture - Australia 2026 Places App

**Document Version**: 1.0
**Created**: 2025-10-12
**Status**: APPROVED FOR IMPLEMENTATION

---

## Overview

This document defines the comprehensive theming system for the Australia 2026 Places app, providing users with:
1. **Dark/Light Mode Toggle** - System-level appearance preference
2. **6 Color Palettes** - Accent colors for buttons, links, underlines, and UI highlights

---

## Design Principles

### Industry Standards
- Follow Material Design 3 / Tailwind CSS best practices
- Support `prefers-color-scheme` media query
- Persist user preferences (localStorage + cookie)
- Smooth transitions between themes
- WCAG 2.1 AA contrast compliance

### User Experience Goals
- Instant theme switching (no page reload)
- Consistent theming across all pages
- Accessible color contrasts in all combinations
- Visual feedback for active theme/palette

---

## Architecture

### Theme Structure

```typescript
// Theme modes (2 options)
type ThemeMode = 'light' | 'dark';

// Color palettes (6 options)
type ColorPalette = 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'teal';

// Theme state
interface ThemeState {
  mode: ThemeMode;
  palette: ColorPalette;
}
```

### Color Palette Definitions

Each palette defines accent colors for:
- Primary buttons
- Links and underlines
- Active states
- Borders and dividers
- Hover effects
- Selection highlights

**Palette Colors** (Tailwind CSS utilities):

1. **Blue** (Default)
   - Light: `blue-50, blue-100, blue-500, blue-600, blue-700`
   - Dark: `blue-900, blue-800, blue-400, blue-500, blue-600`

2. **Green** (Nature)
   - Light: `green-50, green-100, green-500, green-600, green-700`
   - Dark: `green-900, green-800, green-400, green-500, green-600`

3. **Purple** (Creative)
   - Light: `purple-50, purple-100, purple-500, purple-600, purple-700`
   - Dark: `purple-900, purple-800, purple-400, purple-500, purple-600`

4. **Orange** (Energetic)
   - Light: `orange-50, orange-100, orange-500, orange-600, orange-700`
   - Dark: `orange-900, orange-800, orange-400, orange-500, orange-600`

5. **Pink** (Vibrant)
   - Light: `pink-50, pink-100, pink-500, pink-600, pink-700`
   - Dark: `pink-900, pink-800, pink-400, pink-500, pink-600`

6. **Teal** (Modern)
   - Light: `teal-50, teal-100, teal-500, teal-600, teal-700`
   - Dark: `teal-900, teal-800, teal-400, teal-500, teal-600`

---

## Implementation Strategy

### 1. Theme Provider Context

**File**: `lib/theme-context.tsx`

```typescript
'use client';

import { createContext, useContext, useState, useEffect } from 'react';

type ThemeMode = 'light' | 'dark';
type ColorPalette = 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'teal';

interface ThemeContextType {
  mode: ThemeMode;
  palette: ColorPalette;
  setMode: (mode: ThemeMode) => void;
  setPalette: (palette: ColorPalette) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Implementation details...
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
```

### 2. CSS Variables Approach

Use CSS custom properties for dynamic theming:

```css
:root {
  /* Light mode (default) */
  --bg-primary: 255 255 255; /* white */
  --bg-secondary: 249 250 251; /* gray-50 */
  --text-primary: 17 24 39; /* gray-900 */
  --text-secondary: 107 114 128; /* gray-500 */

  /* Accent colors (blue palette default) */
  --accent-50: 239 246 255;
  --accent-100: 219 234 254;
  --accent-500: 59 130 246;
  --accent-600: 37 99 235;
  --accent-700: 29 78 216;
}

[data-theme="dark"] {
  /* Dark mode */
  --bg-primary: 17 24 39; /* gray-900 */
  --bg-secondary: 31 41 55; /* gray-800 */
  --text-primary: 243 244 246; /* gray-100 */
  --text-secondary: 156 163 175; /* gray-400 */

  /* Accent colors adjust for dark mode */
  --accent-500: 96 165 250; /* lighter blue */
  --accent-600: 59 130 246;
}
```

### 3. Tailwind CSS Configuration

**File**: `tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'theme-bg-primary': 'rgb(var(--bg-primary) / <alpha-value>)',
        'theme-bg-secondary': 'rgb(var(--bg-secondary) / <alpha-value>)',
        'theme-text-primary': 'rgb(var(--text-primary) / <alpha-value>)',
        'theme-text-secondary': 'rgb(var(--text-secondary) / <alpha-value>)',
        'theme-accent': {
          50: 'rgb(var(--accent-50) / <alpha-value>)',
          100: 'rgb(var(--accent-100) / <alpha-value>)',
          500: 'rgb(var(--accent-500) / <alpha-value>)',
          600: 'rgb(var(--accent-600) / <alpha-value>)',
          700: 'rgb(var(--accent-700) / <alpha-value>)',
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

### 4. Theme Switcher Components

**Theme Mode Toggle**:
- Icon-based toggle (Sun ☀️ / Moon 🌙)
- Positioned in navigation bar
- Smooth transition animation

**Color Palette Selector**:
- 6 color swatches
- Click to change palette
- Visual indicator for active palette
- Dropdown or modal interface

### 5. Persistence Strategy

```typescript
// localStorage for client-side persistence
localStorage.setItem('theme-mode', mode);
localStorage.setItem('theme-palette', palette);

// Cookie for SSR (optional - can default to light mode)
document.cookie = `theme-mode=${mode}; path=/; max-age=31536000`;
document.cookie = `theme-palette=${palette}; path=/; max-age=31536000`;

// Respect system preference on first visit
const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches
  ? 'dark'
  : 'light';
```

---

## Component Updates Required

### Global Components
- `app/layout.tsx` - Wrap with ThemeProvider, add theme attributes
- `app/globals.css` - Add CSS variables and theme classes
- `components/Navigation.tsx` - Add ThemeToggle and PaletteSelector
- `components/Footer.tsx` - Update colors to use theme variables

### UI Components
- All buttons → Use `theme-accent` colors
- All links → Use `theme-accent` colors for hover/active
- All forms → Use `theme-accent` for focus rings
- All cards → Use `theme-bg-secondary` for backgrounds
- All text → Use `theme-text-primary` and `theme-text-secondary`

### Page Updates
Each page needs background and text colors updated:
- `app/page.tsx` (Landing)
- `app/auth/page.tsx` (Authentication)
- `app/upload/page.tsx` (Upload)
- `app/gallery/page.tsx` (Gallery)
- `app/albums/*` (Albums)
- `app/map/page.tsx` (Map)
- `app/timeline/page.tsx` (Timeline)
- `app/photos/[id]/page.tsx` (Photo Detail)

---

## Translation Keys

### New file: `i18n/locales/en/theme.json`

```json
{
  "mode": "Theme Mode",
  "light": "Light",
  "dark": "Dark",
  "toggleMode": "Toggle theme mode",
  "palette": "Color Palette",
  "selectPalette": "Select color palette",
  "palettes": {
    "blue": "Blue (Ocean)",
    "green": "Green (Nature)",
    "purple": "Purple (Creative)",
    "orange": "Orange (Energetic)",
    "pink": "Pink (Vibrant)",
    "teal": "Teal (Modern)"
  }
}
```

### Italian: `i18n/locales/it/theme.json`

```json
{
  "mode": "Modalità Tema",
  "light": "Chiaro",
  "dark": "Scuro",
  "toggleMode": "Cambia modalità tema",
  "palette": "Tavolozza Colori",
  "selectPalette": "Seleziona tavolozza colori",
  "palettes": {
    "blue": "Blu (Oceano)",
    "green": "Verde (Natura)",
    "purple": "Viola (Creativo)",
    "orange": "Arancione (Energetico)",
    "pink": "Rosa (Vibrante)",
    "teal": "Turchese (Moderno)"
  }
}
```

---

## Accessibility Considerations

### Color Contrast
- All palette + mode combinations MUST pass WCAG 2.1 AA (4.5:1 for normal text, 3:1 for large text)
- Test each palette in both light and dark modes
- Use tools: WebAIM Contrast Checker, Chrome DevTools

### Keyboard Navigation
- Theme toggle accessible via keyboard (Space/Enter)
- Palette selector accessible via keyboard (Arrow keys, Enter)
- Focus indicators visible in all themes

### Screen Readers
- Proper ARIA labels on theme controls
- Announce theme changes to screen readers
- Use semantic HTML

---

## Testing Requirements

### Functional Tests
- [ ] Theme mode toggle works (light ↔ dark)
- [ ] Each of 6 palettes applies correctly
- [ ] Preferences persist across sessions
- [ ] System preference detection works on first visit
- [ ] All combinations (2 modes × 6 palettes = 12) render correctly
- [ ] Smooth transitions (no flash of unstyled content)

### Visual Regression Tests
- [ ] All pages render correctly in light mode
- [ ] All pages render correctly in dark mode
- [ ] All 6 palettes render correctly in both modes
- [ ] No broken layouts
- [ ] No illegible text

### Browser Tests
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

### Accessibility Tests
- [ ] Color contrast passes WCAG 2.1 AA in all themes
- [ ] Keyboard navigation works
- [ ] Screen reader announcements work

---

## Performance Considerations

- CSS variables update in <50ms (no perceptible lag)
- Theme persistence via localStorage (synchronous)
- No flash of unstyled content (FOUC)
- Transitions use CSS transforms (GPU-accelerated)

---

## Migration Strategy

### Phase 1: Foundation (3-4 hours)
1. Create theme context and provider
2. Add CSS variables to globals.css
3. Update Tailwind config
4. Wrap app in ThemeProvider
5. Create ThemeToggle component
6. Create PaletteSelector component
7. Add translation keys

### Phase 2: Component Updates (4-6 hours)
1. Update Navigation and Footer
2. Update all buttons to use theme-accent
3. Update all forms to use theme colors
4. Update all cards to use theme backgrounds
5. Update all text to use theme colors

### Phase 3: Page Updates (3-4 hours)
1. Update landing page
2. Update auth page
3. Update gallery and albums
4. Update map and timeline
5. Update photo detail page
6. Update upload page

### Phase 4: Testing & Polish (2-3 hours)
1. Test all theme combinations
2. Fix contrast issues
3. Smooth transitions
4. Browser testing
5. Accessibility audit
6. Documentation

**Total Estimated Time**: 12-17 hours

---

## Acceptance Criteria

### Must Pass All (15/15)
- [ ] Theme mode toggle works in navigation
- [ ] 6 color palettes selectable
- [ ] All combinations (12 total) render correctly
- [ ] Preferences persist across sessions
- [ ] System preference detected on first visit
- [ ] All pages updated with theme colors
- [ ] All components use theme variables
- [ ] Smooth transitions (no FOUC)
- [ ] WCAG 2.1 AA contrast compliance
- [ ] Keyboard accessible
- [ ] Screen reader accessible
- [ ] All translation keys added (EN + IT)
- [ ] Zero TypeScript errors
- [ ] Zero build errors
- [ ] Documented in user guide

---

## Future Enhancements (Post-MVP)

1. **Custom Palette Creator** - Let users define custom colors
2. **High Contrast Mode** - For enhanced accessibility
3. **Auto Mode** - Follow system time (dark at night)
4. **Per-Page Themes** - Different themes for different sections
5. **Theme Animations** - More elaborate transition effects

---

## References

- Material Design 3: Color System
- Tailwind CSS: Dark Mode Documentation
- WCAG 2.1: Contrast Guidelines
- Josh Comeau: CSS Variables Guide
- Next.js: App Router Theming Patterns

---

**Document Status**: APPROVED FOR IMPLEMENTATION
**Approver**: Scrum Master (Claude Code)
**Next Step**: Create agent deployment brief
