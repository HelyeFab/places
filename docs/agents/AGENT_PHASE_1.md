# AI Agent Work Assignment: Phase 1 - Core Infrastructure

## Agent Role
**Infrastructure Setup Specialist**

You are an expert Next.js and Firebase developer responsible for establishing the foundational architecture of the Australia 2026 shared album application. Your role focuses on project initialization, configuration, and basic authentication implementation.

---

## Agent Prompt

```
You are tasked with implementing Phase 1 of the Australia 2026 Shared Album MVP.
This phase establishes the core infrastructure using Next.js 15, Firebase, and TypeScript.

PROJECT CONTEXT:
- Application: Collaborative photo-sharing platform for friends traveling to Australia in 2026
- Tech Stack: Next.js 15, TypeScript, Tailwind CSS, Firebase (Auth, Firestore, Storage)
- Target: Web application (mobile and desktop responsive)

YOUR OBJECTIVES:
1. Initialize Next.js 15 project with App Router, TypeScript, and Tailwind CSS
2. Configure Firebase services (Authentication, Firestore, Storage)
3. Implement Google OAuth authentication flow
4. Create global layout with navigation
5. Build landing page with authentication

DELIVERABLES:

1. PROJECT INITIALIZATION
   - Create Next.js app using: npx create-next-app@latest australia-2026 --typescript --tailwind --app --no-src-dir --import-alias "@/*"
   - Verify TypeScript configuration
   - Test development server startup
   - Create .gitignore excluding: node_modules, .env.local, .next

2. FIREBASE CONFIGURATION
   - Create file: lib/firebase.ts
   - Initialize Firebase SDK with configuration from environment variables
   - Export: auth, db, storage instances
   - Create .env.local with Firebase credentials (template provided)
   - Install dependencies: npm install firebase react-firebase-hooks

3. AUTHENTICATION SYSTEM
   - Create component: components/AuthButton.tsx
   - Implement Google sign-in with popup flow
   - Implement sign-out functionality
   - Display user avatar and display name when authenticated
   - Show "Sign in with Google" button when not authenticated

4. GLOBAL LAYOUT
   - Create file: app/layout.tsx
   - Implement sticky navbar with links: Gallery, Map, Timeline, New Album, Upload
   - Add app branding: "🇦🇺 Australia 2026"
   - Include AuthButton in navbar
   - Add footer with project attribution
   - Apply gradient background: from-blue-50 to-white

5. LANDING PAGE
   - Create file: app/page.tsx
   - Hero section with title and description
   - CTA buttons linking to: /gallery, /timeline, /map
   - Integrate AuthButton component
   - Responsive design (mobile-first)

TECHNICAL REQUIREMENTS:
- All components must be TypeScript with proper typing
- Use Tailwind CSS for all styling (no custom CSS)
- Follow Next.js 15 App Router conventions
- Use "use client" directive for client-side components
- Implement proper error handling
- Ensure responsive design (mobile and desktop)

ENVIRONMENT VARIABLES (.env.local):
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

TESTING CHECKLIST:
- [ ] npm run dev starts without errors
- [ ] TypeScript compiles with no errors
- [ ] User can sign in with Google
- [ ] User can sign out
- [ ] User avatar and name display correctly
- [ ] All navigation links render
- [ ] Layout is responsive on mobile and desktop
- [ ] No Firebase connection errors in console

FILE STRUCTURE TO CREATE:
/australia-2026
├── app/
│   ├── page.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/
│   └── AuthButton.tsx
├── lib/
│   └── firebase.ts
├── .env.local
├── .gitignore
└── package.json

ACCEPTANCE CRITERIA:
✅ Development server runs successfully
✅ User can authenticate with Google
✅ Firebase services connected
✅ Landing page displays with navigation
✅ Layout is responsive
✅ No console errors
✅ Code follows TypeScript best practices
✅ All files properly organized

REFERENCE DOCUMENTATION:
- Milestone document: docs/milestones/PHASE_1_CORE_INFRASTRUCTURE.md
- MVP Overview: docs/MVP_OVERVIEW.md

COMPLETION REPORT:
When finished, provide:
1. List of all files created
2. Confirmation of testing checklist completion
3. Screenshot or description of running application
4. Any issues encountered and solutions applied
5. Recommendations for Phase 2
```

---

## Success Metrics

- **Functionality**: 100% of acceptance criteria met
- **Code Quality**: TypeScript strict mode with no errors
- **Performance**: Development server starts in <5 seconds
- **UX**: Authentication flow completes in <3 clicks

## Common Pitfalls to Avoid

1. **Environment Variables**: Forgetting `NEXT_PUBLIC_` prefix causes client-side errors
2. **Firebase Initialization**: Initializing Firebase multiple times causes conflicts
3. **Auth State**: Not handling loading state during authentication check
4. **Mobile Responsiveness**: Navbar breaks on small screens if not tested
5. **TypeScript**: Using `any` type instead of proper interfaces

## Handoff to Phase 2

Before proceeding to Phase 2, ensure:
- ✅ All Phase 1 acceptance criteria met
- ✅ Firebase Authentication working reliably
- ✅ No TypeScript compilation errors
- ✅ No console warnings or errors
- ✅ Code committed to version control

**Next Agent**: Upload & Albums Specialist (see `AGENT_PHASE_2.md`)

---

**Estimated Duration**: 4-6 hours
**Complexity Level**: Low
**Dependencies**: None
