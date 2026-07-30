/**
 * Build-time feature flags.
 *
 * NEXT_PUBLIC_* values are inlined at build, so these are plain constants — safe
 * to read from client components with no hydration concerns.
 */

/**
 * Hide the sign-in UI (the landing CTAs and the nav's login link).
 *
 * Default is FALSE — auth stays visible, so the home server's existing build is
 * unchanged. It is set only on the Vercel deployment, which exists to show the
 * gallery to someone: browsing needs no account, so a Google sign-in button is
 * just a dead end for a visitor.
 *
 * This hides the UI, it does NOT disable auth. /auth still works if opened
 * directly, and nothing about Firebase's rules changes — so do not treat this as
 * a security control.
 */
export const authUiHidden = process.env.NEXT_PUBLIC_HIDE_AUTH === 'true';
