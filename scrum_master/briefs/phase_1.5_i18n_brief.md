# Phase 1.5 Agent Deployment Brief - i18n System

**Date**: 2025-10-12
**Phase**: 1.5 - Internationalization (i18n) System
**Agent Role**: Internationalization Specialist
**Scrum Master**: Claude Code Agent
**Status**: 🚀 DEPLOYING
**Priority**: 🔴 CRITICAL - BLOCKS ALL FUTURE PHASES

---

## Mission Statement

Implement a comprehensive internationalization (i18n) system for the Australia 2026 shared album application. This is a **critical architectural requirement** that must be completed before any feature development (Phase 2+) continues.

## Context

**CRITICAL ISSUE IDENTIFIED**: The initial MVP specification missed a vital requirement - i18n support. Implementing this AFTER building all features would require massive refactoring. We MUST implement this now.

**Project**: Australia 2026 Shared Album
**Current State**: Phase 1 complete (infrastructure + authentication)
**Your Focus**: Internationalization infrastructure, translation system, language switcher
**Languages**: English (default), Italian

## Why This Can't Wait

1. **Architectural**: i18n affects routing, middleware, and component structure
2. **Code Impact**: Every UI string must be externalized
3. **Future Proof**: All Phase 2-4 features will use translation system
4. **User Experience**: Language toggle needs to be in navigation from day 1
5. **Maintenance**: Retrofitting i18n is 10x harder than building it from start

## Critical Success Factors

1. **Next.js 15 Compatible**: Must use Next.js 15 App Router patterns
2. **Zero Hardcoded Strings**: All UI text must use translation keys
3. **Type Safety**: TypeScript types for all translation keys
4. **Performance**: No bundle size bloat, proper code splitting
5. **Developer Experience**: Easy to add new translations
6. **User Experience**: Seamless language switching with persistence

## Deliverables Checklist

### 1. i18n Library Selection & Installation ✅

**Research and choose the best library for Next.js 15 App Router:**

Options to evaluate:
- `next-intl` (recommended for App Router)
- `next-i18next` (Pages Router, might not be ideal)
- `react-i18next` with custom Next.js integration

**MANDATORY**: Use WebSearch and Context7 to find the **most current** solution for Next.js 15 + App Router + TypeScript.

**Deliverable**:
- [ ] Library selected with justification
- [ ] Dependencies installed
- [ ] Documentation reviewed

### 2. i18n Configuration ✅

**Set up the i18n system:**

- [ ] Create i18n configuration file (e.g., `lib/i18n.ts` or `i18n/config.ts`)
- [ ] Define supported locales: `['en', 'it']`
- [ ] Set default locale: `'en'`
- [ ] Configure Next.js middleware for locale detection
- [ ] Set up routing strategy (subdirectory: `/en`, `/it` OR cookie-based)

**Example structure**:
```typescript
// i18n/config.ts
export const locales = ['en', 'it'] as const;
export const defaultLocale = 'en';
export type Locale = typeof locales[number];
```

### 3. Translation Files Structure ✅

**Create organized translation file structure:**

```
i18n/
├── config.ts
├── locales/
│   ├── en/
│   │   ├── common.json
│   │   ├── auth.json
│   │   ├── navigation.json
│   │   └── landing.json
│   └── it/
│       ├── common.json
│       ├── auth.json
│       ├── navigation.json
│       └── landing.json
└── types.ts (TypeScript types for translations)
```

**Deliverable**:
- [ ] Translation files created for English
- [ ] Translation files created for Italian
- [ ] Logical grouping (common, auth, navigation, landing, etc.)
- [ ] All existing hardcoded strings extracted

### 4. Extract All Hardcoded Strings ✅

**Replace ALL hardcoded text in existing components:**

**Files to update**:
1. `app/layout.tsx` - Navbar links, branding
2. `app/page.tsx` - Hero section, CTA buttons, feature descriptions
3. `components/AuthButton.tsx` - Sign in/out buttons, loading text, error messages
4. `app/gallery/page.tsx` - Placeholder text
5. `app/map/page.tsx` - Placeholder text
6. `app/timeline/page.tsx` - Placeholder text
7. `app/upload/page.tsx` - Placeholder text
8. `app/albums/new/page.tsx` - Placeholder text

**Example translations**:

**English** (`i18n/locales/en/navigation.json`):
```json
{
  "brand": "Australia 2026",
  "gallery": "Gallery",
  "map": "Map",
  "timeline": "Timeline",
  "newAlbum": "New Album",
  "upload": "Upload"
}
```

**Italian** (`i18n/locales/it/navigation.json`):
```json
{
  "brand": "Australia 2026",
  "gallery": "Galleria",
  "map": "Mappa",
  "timeline": "Cronologia",
  "newAlbum": "Nuovo Album",
  "upload": "Carica"
}
```

**Deliverable**:
- [ ] All hardcoded strings identified and documented
- [ ] Translation keys created for all strings
- [ ] English translations written
- [ ] Italian translations provided (ask user if you need help with Italian)
- [ ] Components updated to use translation hooks

### 5. Language Switcher Component ✅

**Create a language toggle component:**

- [ ] Create `components/LanguageSwitcher.tsx`
- [ ] Display current language (flag emoji or text)
- [ ] Dropdown or toggle for EN/IT selection
- [ ] Persist language choice (localStorage + cookie)
- [ ] Update all pages when language changes
- [ ] Integrate into navbar (next to AuthButton)

**Design considerations**:
- Mobile-friendly
- Accessible (ARIA labels)
- Clear visual feedback
- Fast switching (no page reload if possible)

**Example placement**: In navbar, between navigation links and AuthButton

### 6. Next.js Configuration Updates ✅

**Update Next.js config for i18n:**

- [ ] Update `next.config.ts` with i18n settings (if required by library)
- [ ] Create middleware for locale detection (`middleware.ts`)
- [ ] Handle locale routing (subdirectory or cookie-based)
- [ ] Configure proper redirects for default locale

**Example middleware** (if using subdirectory routing):
```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale } from './i18n/config';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if locale is in pathname
  const pathnameHasLocale = locales.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return;

  // Redirect to default locale
  request.nextUrl.pathname = `/${defaultLocale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico).*)'],
};
```

### 7. TypeScript Type Safety ✅

**Implement type-safe translations:**

- [ ] Generate TypeScript types from translation keys
- [ ] Autocomplete for translation keys in IDE
- [ ] Compile-time errors for missing translations
- [ ] Type-safe `t()` function

**Example**:
```typescript
// i18n/types.ts
import type en from './locales/en/common.json';

export type TranslationKeys = keyof typeof en;
```

### 8. Testing & Validation ✅

**Ensure i18n system works correctly:**

- [ ] Test language switching (EN ↔ IT)
- [ ] Verify all strings translated
- [ ] Check persistence (language choice saved)
- [ ] Test on all existing pages
- [ ] Verify no hardcoded strings remain
- [ ] Check mobile responsiveness
- [ ] Test with browser language detection
- [ ] Ensure TypeScript compiles with no errors

### 9. Documentation ✅

**Document the i18n system:**

- [ ] Create `I18N_GUIDE.md` in project root
- [ ] Document how to add new translations
- [ ] Document how to add new languages
- [ ] Document translation key naming conventions
- [ ] Provide examples for Phase 2+ developers

## Technical Requirements

**Mandatory**:
- Next.js 15 App Router compatible
- TypeScript strict mode compliance
- Zero bundle size bloat (<10KB total)
- Works with React Server Components
- Language persistence (cookie + localStorage)
- SEO-friendly (proper `lang` attribute)
- No console warnings or errors

**Prohibited**:
- Hardcoded strings in components
- Using outdated libraries (next-i18next for Pages Router)
- Blocking SSR/SSG
- Poor TypeScript support

## Mandatory Resources (MUST USE)

**When researching or implementing, you MUST:**

1. **Use WebSearch tool** for:
   - "next.js 15 app router i18n best practices 2025"
   - "next-intl vs react-i18next next.js 15"
   - "next.js 15 internationalization typescript"
   - Latest library versions and compatibility

2. **Use MCP Context7 tools** for:
   - Official Next.js documentation on i18n
   - Chosen i18n library documentation
   - TypeScript patterns for translations

**NEVER GUESS - ALWAYS SEARCH FIRST**

## Translation Content

### Strings to Translate

**Navigation**:
- "Australia 2026" (brand - keep as is)
- "Gallery" → "Galleria"
- "Map" → "Mappa"
- "Timeline" → "Cronologia"
- "New Album" → "Nuovo Album"
- "Upload" → "Carica"

**Authentication**:
- "Sign in with Google" → "Accedi con Google"
- "Sign Out" → "Esci"
- "Loading..." → "Caricamento..."
- "Error: {message}" → "Errore: {message}"

**Landing Page**:
- "A privacy-aware shared album..." → "Un album condiviso consapevole della privacy..."
- "Upload, tag, map, and relive moments" → "Carica, tagga, mappa e rivivi i momenti"
- "View Gallery" → "Vedi Galleria"
- "Open Timeline" → "Apri Cronologia"
- "Open Map" → "Apri Mappa"

**Footer**:
- "A collaborative photo-sharing platform..." → "Una piattaforma collaborativa per la condivisione di foto..."

**Placeholders**:
- "Coming soon..." → "Prossimamente..."

**Note**: If you need help with Italian translations, document which strings need translation and I'll get them from the user.

## File Structure Expected

```
/home/helye/DevProject/personal/Next-js/places/
├── i18n/
│   ├── config.ts
│   ├── locales/
│   │   ├── en/
│   │   │   ├── common.json
│   │   │   ├── auth.json
│   │   │   ├── navigation.json
│   │   │   └── landing.json
│   │   └── it/
│   │       ├── common.json
│   │       ├── auth.json
│   │       ├── navigation.json
│   │       └── landing.json
│   └── types.ts
├── components/
│   ├── AuthButton.tsx (updated)
│   └── LanguageSwitcher.tsx (new)
├── app/
│   ├── layout.tsx (updated)
│   ├── page.tsx (updated)
│   └── [all other pages updated]
├── middleware.ts (if needed)
├── next.config.ts (potentially updated)
├── I18N_GUIDE.md
└── package.json (updated dependencies)
```

## Testing Checklist

**Before reporting completion, you MUST verify:**

- [ ] `npm run dev` starts without errors
- [ ] `npm run build` succeeds with no warnings
- [ ] TypeScript compiles: `npx tsc --noEmit` passes
- [ ] Language switcher visible in navbar
- [ ] Clicking EN/IT switches all text
- [ ] Language choice persists after page reload
- [ ] All pages show translated content
- [ ] No hardcoded strings visible in UI
- [ ] Browser language detection works
- [ ] Mobile view works correctly
- [ ] All existing functionality still works
- [ ] No TypeScript errors related to translations

## Acceptance Criteria (Must Pass All)

| # | Criterion | Test Method | Status |
|---|-----------|-------------|---------|
| 1 | i18n library installed and configured | Check package.json | ⚪ |
| 2 | All hardcoded strings removed | Visual inspection | ⚪ |
| 3 | English translations complete | Check locale files | ⚪ |
| 4 | Italian translations complete | Check locale files | ⚪ |
| 5 | Language switcher functional | Manual test | ⚪ |
| 6 | Language persists across sessions | Browser test | ⚪ |
| 7 | TypeScript types for translations | IDE autocomplete | ⚪ |
| 8 | No build errors or warnings | `npm run build` | ⚪ |
| 9 | All pages translated | Visual check | ⚪ |
| 10 | Documentation provided | Check I18N_GUIDE.md | ⚪ |

**Minimum to Pass**: 10/10 (100%)

## Known Challenges

1. **Library Choice**: Next.js 15 App Router is relatively new, ensure library compatibility
2. **Route Structure**: Decide between `/[locale]/...` subdirectories or cookie-based
3. **Server Components**: Ensure translations work in both client and server components
4. **Middleware**: Get locale detection working correctly
5. **Type Safety**: Generate proper TypeScript types from JSON
6. **Pluralization**: May need plural rules for Italian (future consideration)

## Success Metrics

Your work will be evaluated on:
- **Functionality**: 30% - Does language switching work perfectly?
- **Code Quality**: 25% - Is the implementation clean and maintainable?
- **Requirements**: 20% - Are all strings translated?
- **Testing**: 15% - Did you test thoroughly?
- **Documentation**: 10% - Is the guide comprehensive?

**Minimum Passing Score**: 80%
**Target Score**: 92%

## Timeline

**Expected Duration**: 3-4 hours
**Maximum Duration**: 6 hours
**Report Back**: Immediately upon completion

## Completion Report Template

When you finish, provide:

```markdown
# Phase 1.5 (i18n) Completion Report

## i18n Library Selected
**Library**: [name]
**Version**: [version]
**Justification**: [why this library for Next.js 15]

## Translation Statistics
- Total translation keys: [number]
- English strings: [number]
- Italian strings: [number]
- Files updated: [number]
- New files created: [number]

## Files Modified
1. [file path] - [changes made]
2. [file path] - [changes made]
...

## Files Created
1. [file path] - [purpose]
2. [file path] - [purpose]
...

## Testing Results
- Development Server: ✅/❌
- Production Build: ✅/❌
- TypeScript: ✅/❌
- Language Switching: ✅/❌
- Persistence: ✅/❌
- All Strings Translated: ✅/❌
- Documentation: ✅/❌

## Translation Coverage
- Navbar: ✅/❌ (X strings)
- Landing Page: ✅/❌ (X strings)
- Auth Component: ✅/❌ (X strings)
- Footer: ✅/❌ (X strings)
- Placeholders: ✅/❌ (X strings)

## Issues Encountered
1. [issue] - [solution]

## Documentation Searches Performed
1. [search query] - [what you learned]
2. [search query] - [what you learned]

## Italian Translations Needed
[List any Italian translations you need help with]

## Recommendations for Future Phases
1. [recommendation]
2. [recommendation]

## Screenshots/Demo
[Describe language switching behavior]
```

## Quality Standards

**Code must be**:
- Production-ready
- Type-safe
- Performant
- Well-documented
- Easy to extend

**Code must NOT have**:
- Hardcoded strings
- Missing translations
- TypeScript errors
- Bundle size bloat
- Poor UX for language switching

## Final Checklist Before Submission

- [ ] All deliverables completed
- [ ] All tests passed
- [ ] I18N_GUIDE.md written
- [ ] No TypeScript errors
- [ ] No build warnings
- [ ] Language switcher works perfectly
- [ ] All UI text translated
- [ ] Documentation searches performed
- [ ] Completion report written

---

## Deployment

**Deployed By**: Scrum Master
**Deployment Time**: 2025-10-12
**Priority**: 🔴 CRITICAL (Blocks Phase 2+)
**Expected Completion**: TBD

---

**This is a critical architectural fix. Take your time to implement it properly! 🌍🇮🇹**
