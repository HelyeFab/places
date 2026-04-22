import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { getAdminFirestore } from '@/lib/firebase-admin';

const UNSUBSCRIBE_SECRET = process.env.EMAIL_UNSUBSCRIBE_SECRET || 'places-japan-2026-unsub';

function verifyToken(email: string, token: string): boolean {
  const expected = createHmac('sha256', UNSUBSCRIBE_SECRET)
    .update(email.toLowerCase())
    .digest('hex');
  return token === expected;
}

function htmlPage(title: string, message: string, linkText?: string, linkUrl?: string) {
  return new NextResponse(
    `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} — Places Japan 2026</title>
<style>
  body{font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:#f5f5f7;color:#1a1a2e}
  .card{background:#fff;border-radius:16px;padding:40px;max-width:420px;text-align:center;box-shadow:0 2px 12px rgba(0,0,0,.08)}
  h1{font-size:1.4rem;margin-bottom:8px}
  p{color:#666;line-height:1.6}
  a.btn{display:inline-block;margin-top:16px;padding:10px 24px;background:#4f46e5;color:#fff;border-radius:8px;text-decoration:none;font-weight:600}
  a.btn:hover{background:#4338ca}
</style></head><body>
<div class="card">
  <h1>${title}</h1>
  <p>${message}</p>
  ${linkText && linkUrl ? `<a class="btn" href="${linkUrl}">${linkText}</a>` : ''}
</div>
</body></html>`,
    { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  const token = searchParams.get('token');
  const action = searchParams.get('action') || 'unsubscribe';

  if (!email || !token) {
    return htmlPage('Invalid Link', 'This unsubscribe link is missing required parameters.');
  }

  if (!verifyToken(email, token)) {
    return htmlPage('Invalid Link', 'This unsubscribe link is invalid or has been tampered with.');
  }

  const db = getAdminFirestore();
  const docRef = db.collection('email_preferences').doc(email.toLowerCase());

  if (action === 'resubscribe') {
    await docRef.set({ optedOut: false, updatedAt: new Date().toISOString() }, { merge: true });
    return htmlPage(
      'Welcome back!',
      `<strong>${email}</strong> has been resubscribed to daily photo updates.`,
      'View Photos',
      '/gallery'
    );
  }

  // Default: unsubscribe
  await docRef.set({ optedOut: true, updatedAt: new Date().toISOString() }, { merge: true });

  const resubUrl = `/api/email/unsubscribe?email=${encodeURIComponent(email)}&token=${token}&action=resubscribe`;
  return htmlPage(
    'Unsubscribed',
    `<strong>${email}</strong> will no longer receive daily photo updates.`,
    'Changed your mind? Resubscribe',
    resubUrl
  );
}
