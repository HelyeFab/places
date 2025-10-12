# Production Deployment Checklist

Use this checklist to ensure a smooth production deployment.

---

## Pre-Deployment Tasks

### 1. Firebase Configuration
- [ ] Firebase project created
- [ ] Firebase Authentication enabled (Google, Email/Password, Email Link)
- [ ] Firestore database created
- [ ] Firebase Storage configured
- [ ] **Deploy Firebase rules**:
  ```bash
  firebase deploy --only firestore:rules
  firebase deploy --only storage:rules
  ```
- [ ] Verify rules deployment in Firebase Console

### 2. Environment Variables
- [ ] Copy `.env.local.example` to `.env.local`
- [ ] Fill in all Firebase credentials:
  - `NEXT_PUBLIC_FIREBASE_API_KEY`
  - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
  - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
  - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
  - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
  - `NEXT_PUBLIC_FIREBASE_APP_ID`
- [ ] Set production URL: `NEXT_PUBLIC_APP_URL`
- [ ] (Optional) Set up Sentry:
  - `NEXT_PUBLIC_SENTRY_DSN`
  - `SENTRY_ORG`
  - `SENTRY_PROJECT`
  - `SENTRY_AUTH_TOKEN`

### 3. Code Preparation
- [ ] All code committed to Git
- [ ] Latest code pushed to repository
- [ ] Branch ready for deployment (main/master)
- [ ] No uncommitted changes

### 4. Local Testing
- [ ] Run `npm install` to ensure dependencies are correct
- [ ] Run `npm run build` to verify production build works
- [ ] Test locally with `npm run dev`
- [ ] Verify all features working

---

## Deployment Tasks

### Option A: Vercel Deployment (Recommended)

#### Initial Setup
- [ ] Create Vercel account at [vercel.com](https://vercel.com)
- [ ] Click "Add New" > "Project"
- [ ] Import Git repository
- [ ] Select repository

#### Configuration
- [ ] Framework: Next.js (auto-detected)
- [ ] Build Command: `npm run build` (default)
- [ ] Output Directory: `.next` (default)
- [ ] Root Directory: `./` (default)

#### Environment Variables
- [ ] Add all environment variables from `.env.local`
- [ ] Set for: Production (minimum)
- [ ] Optionally set for Preview and Development

#### Deploy
- [ ] Click "Deploy"
- [ ] Wait for build to complete (usually 2-3 minutes)
- [ ] Note the deployment URL

#### Custom Domain (Optional)
- [ ] Go to Project Settings > Domains
- [ ] Add custom domain
- [ ] Configure DNS records (provided by Vercel)
- [ ] Wait for DNS propagation (up to 48 hours)
- [ ] Verify SSL certificate provisioned

### Option B: Firebase Hosting

#### Setup
- [ ] Install Firebase CLI: `npm install -g firebase-tools`
- [ ] Login: `firebase login`
- [ ] Initialize: `firebase init hosting`
- [ ] Public directory: `out`
- [ ] Single-page app: Yes

#### Build and Deploy
- [ ] Build: `npm run build`
- [ ] Deploy: `firebase deploy --only hosting`
- [ ] Note the hosting URL

---

## Post-Deployment Verification

### Functional Testing
- [ ] Visit production URL
- [ ] Test authentication:
  - [ ] Google Sign-In
  - [ ] Email/Password Sign-Up
  - [ ] Email Link Sign-In
  - [ ] Guest/Anonymous Sign-In
- [ ] Test photo upload
- [ ] Verify photo appears in gallery
- [ ] Test photo visibility controls (public/friends/hidden)
- [ ] Create an album
- [ ] Add photos to album
- [ ] Test comments on photos
- [ ] Test reactions on photos
- [ ] Test upvoting system
- [ ] View map with photo markers
- [ ] View timeline
- [ ] Switch language (EN/IT)

### Mobile Testing
- [ ] Test on iOS Safari
- [ ] Test on Android Chrome
- [ ] Verify responsive design
- [ ] Test all major features on mobile

### Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### SEO Verification
- [ ] Visit `/robots.txt` - should load correctly
- [ ] Visit `/sitemap.xml` - should load correctly
- [ ] View page source - verify meta tags present
- [ ] Test Open Graph tags: [Facebook Debugger](https://developers.facebook.com/tools/debug/)
- [ ] Test Twitter cards: [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [ ] Run Lighthouse audit (target: 80+ score)

### Security Verification
- [ ] HTTPS enabled (URL shows padlock)
- [ ] Security headers present (check with browser dev tools)
- [ ] Try accessing hidden photos (should be denied)
- [ ] Try uploading non-image file (should be denied)
- [ ] Try uploading >10MB file (should be denied)
- [ ] Verify Firebase rules working correctly

### Performance Verification
- [ ] Run Lighthouse performance audit
- [ ] Check page load times (target: <3 seconds)
- [ ] Verify images loading correctly
- [ ] Check for console errors (should be none)
- [ ] Verify no 404 errors

### Monitoring Setup
- [ ] Verify Sentry receiving events (if configured)
- [ ] Check Firebase Console for usage
- [ ] Set up Firebase usage alerts (optional)
- [ ] Set up Sentry alerts (optional)

---

## Post-Deployment Tasks

### Immediate (Day 1)
- [ ] Monitor Sentry for errors (first 24 hours)
- [ ] Check Firebase quotas and usage
- [ ] Verify all features working
- [ ] Test from different networks/locations
- [ ] Gather initial user feedback

### Week 1
- [ ] Review Sentry error logs
- [ ] Check Firebase usage patterns
- [ ] Monitor application performance
- [ ] Review Lighthouse scores
- [ ] Address any critical issues

### Month 1
- [ ] Review security logs
- [ ] Check for unusual access patterns
- [ ] Review Firebase costs
- [ ] Plan optimization improvements
- [ ] Gather user feedback for enhancements

---

## Rollback Plan

If critical issues are found after deployment:

### Vercel Rollback
1. Go to Vercel Dashboard > Deployments
2. Find last stable deployment
3. Click "..." menu > "Promote to Production"
4. Verify rollback successful

### Firebase Hosting Rollback
1. Go to Firebase Console > Hosting
2. View release history
3. Click "..." on stable release > "Rollback"
4. Verify rollback successful

### Code Rollback
```bash
# If platform rollback doesn't work
git revert HEAD
git push origin main
# Trigger new deployment
```

---

## Emergency Contacts

### Platform Support
- Firebase: https://firebase.google.com/support
- Vercel: https://vercel.com/support
- Sentry: https://sentry.io/support

### Documentation
- Deployment Guide: `PRODUCTION_DEPLOYMENT.md`
- Security Audit: `SECURITY_AUDIT.md`
- Quick Start: `QUICK_START_DEPLOYMENT.md`
- README: `README.md`

---

## Success Criteria

Deployment is considered successful when:

- [x] Application accessible at production URL
- [x] All authentication methods working
- [x] Photos can be uploaded and viewed
- [x] All features functioning correctly
- [x] No critical errors in Sentry
- [x] SEO files accessible (robots.txt, sitemap.xml)
- [x] HTTPS enabled with valid certificate
- [x] Mobile responsive design working
- [x] Both languages (EN/IT) working
- [x] Performance metrics acceptable (Lighthouse >80)

---

## Notes

- Keep this checklist handy during deployment
- Check off items as you complete them
- If you encounter issues, refer to `PRODUCTION_DEPLOYMENT.md`
- For security questions, refer to `SECURITY_AUDIT.md`
- Document any deployment issues for future reference

---

**Good luck with your deployment!** 🚀

**Last Updated**: 2025-10-12
**Version**: 1.0.0
