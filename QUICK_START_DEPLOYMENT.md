# Quick Start - Production Deployment

**Ready to deploy?** Follow these steps to get your application live in production.

---

## Prerequisites Checklist

- [ ] Firebase project created
- [ ] Vercel account created (or Firebase CLI installed)
- [ ] All environment variables ready
- [ ] Custom domain ready (optional)

---

## Step 1: Deploy Firebase Rules

```bash
# Deploy Firestore security rules
firebase deploy --only firestore:rules

# Deploy Storage security rules
firebase deploy --only storage:rules

# Verify deployment
firebase deploy:list
```

---

## Step 2: Set Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
# Required
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Optional (for error monitoring)
NEXT_PUBLIC_SENTRY_DSN=...
SENTRY_ORG=...
SENTRY_PROJECT=...
SENTRY_AUTH_TOKEN=...
```

---

## Step 3: Deploy to Vercel (Recommended)

### Option A: Via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" > "Project"
3. Import your Git repository
4. Configure build settings:
   - Framework: **Next.js** (auto-detected)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
5. Add environment variables (from Step 2)
6. Click **Deploy**
7. Wait for deployment to complete
8. Visit your production URL

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy to production
vercel --prod

# Follow prompts to configure
```

---

## Step 4: Configure Custom Domain (Optional)

### On Vercel:
1. Go to Project Settings > Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for DNS propagation (up to 48 hours)
5. SSL certificate will be auto-provisioned

---

## Step 5: Post-Deployment Verification

### Test Critical Features:
- [ ] Visit production URL
- [ ] Test authentication (Google, Email, Guest)
- [ ] Upload a photo
- [ ] View gallery
- [ ] Check map view
- [ ] Check timeline
- [ ] Create an album
- [ ] Add a comment and reaction
- [ ] Switch language (EN/IT)
- [ ] Test on mobile device

### Verify SEO:
- [ ] Visit `https://your-domain.com/robots.txt`
- [ ] Visit `https://your-domain.com/sitemap.xml`
- [ ] Check meta tags (view page source)
- [ ] Test with [Facebook Debugger](https://developers.facebook.com/tools/debug/)

### Monitor:
- [ ] Check Sentry for errors (if configured)
- [ ] Check Firebase Console for usage
- [ ] Run Lighthouse audit (target: 80+ score)

---

## Alternative: Deploy to Firebase Hosting

### Step 1: Install Firebase CLI
```bash
npm install -g firebase-tools
firebase login
```

### Step 2: Initialize Hosting
```bash
firebase init hosting
# Select: Use existing project
# Public directory: out
# Single-page app: Yes
# GitHub deploys: No (for now)
```

### Step 3: Build and Deploy
```bash
# Build static export
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting

# Visit your Firebase Hosting URL
```

---

## Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf node_modules .next package-lock.json
npm install
npm run build
```

### Environment Variables Not Working
- Ensure all NEXT_PUBLIC_* variables are set
- Restart build after adding variables
- Check for typos in variable names

### Firebase Rules Errors
```bash
# Redeploy rules
firebase deploy --only firestore:rules
firebase deploy --only storage:rules

# Test rules in Firebase Console
```

### SSL Not Working
- Wait for DNS propagation (up to 48 hours)
- Verify DNS records are correct
- Remove and re-add domain in Vercel

---

## Quick Reference

### Important URLs

**Documentation**:
- Full Deployment Guide: `PRODUCTION_DEPLOYMENT.md`
- Security Audit: `SECURITY_AUDIT.md`
- Completion Report: `PHASE_4_COMPLETION_REPORT.md`

**Monitoring**:
- Firebase Console: https://console.firebase.google.com/
- Vercel Dashboard: https://vercel.com/dashboard
- Sentry Dashboard: https://sentry.io/

### Support

**Having issues?** Check the full documentation:
- `PRODUCTION_DEPLOYMENT.md` - Comprehensive deployment guide
- `SECURITY_AUDIT.md` - Security review and best practices
- `README.md` - Project overview and features

---

## Success Checklist

- [ ] Firebase rules deployed
- [ ] Application deployed to Vercel/Firebase
- [ ] Custom domain configured (optional)
- [ ] All features tested and working
- [ ] SEO files accessible (robots.txt, sitemap.xml)
- [ ] Error monitoring active (Sentry)
- [ ] Performance verified (Lighthouse)
- [ ] Mobile responsive confirmed

---

## Congratulations!

Your Australia 2026 Places application is now live in production! 🎉

**Next Steps**:
1. Monitor Sentry for errors
2. Check Firebase usage quotas
3. Gather user feedback
4. Plan future enhancements

**Application is production-ready and secure.** Enjoy! 🚀

---

**Last Updated**: 2025-10-12
**Version**: 1.0.0
