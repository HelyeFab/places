# Production Deployment Guide - Australia 2026 Places

This guide provides comprehensive instructions for deploying the Australia 2026 Places photo-sharing application to production.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [Pre-Deployment Checklist](#pre-deployment-checklist)
4. [Deployment Options](#deployment-options)
5. [Vercel Deployment (Recommended)](#vercel-deployment-recommended)
6. [Firebase Hosting (Alternative)](#firebase-hosting-alternative)
7. [Post-Deployment Verification](#post-deployment-verification)
8. [Rollback Procedures](#rollback-procedures)
9. [Monitoring and Maintenance](#monitoring-and-maintenance)
10. [Known Limitations](#known-limitations)
11. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying to production, ensure you have:

- [ ] Node.js 18+ installed
- [ ] npm or yarn package manager
- [ ] Git repository set up
- [ ] Firebase project created and configured
- [ ] Vercel account (for Vercel deployment) OR Firebase CLI installed (for Firebase Hosting)
- [ ] Sentry account (optional, for error monitoring)
- [ ] Custom domain ready (optional)

---

## Environment Variables

### Required Environment Variables

All environment variables must be set in your deployment platform:

```bash
# Firebase Configuration (Required)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Application URL (Required for SEO)
NEXT_PUBLIC_APP_URL=https://your-production-domain.com

# Sentry Error Monitoring (Optional)
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
SENTRY_ORG=your_sentry_org
SENTRY_PROJECT=your_sentry_project
SENTRY_AUTH_TOKEN=your_sentry_auth_token

# Node Environment (Automatically set by hosting platforms)
NODE_ENV=production
```

### Getting Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to Project Settings > General
4. Scroll to "Your apps" section
5. Select your web app or create one
6. Copy the configuration values

### Getting Sentry Configuration

1. Go to [Sentry.io](https://sentry.io/)
2. Create a new project or select existing one
3. Navigate to Settings > Projects > [Your Project]
4. Copy the DSN from "Client Keys (DSN)"
5. For source map uploads, create an Auth Token in Settings > Account > API > Auth Tokens

---

## Pre-Deployment Checklist

Complete this checklist before deploying:

### Code Quality
- [ ] All TypeScript errors resolved
- [ ] ESLint warnings addressed
- [ ] Build completes successfully (`npm run build`)
- [ ] No console errors in development mode

### Security
- [ ] Firebase rules deployed (`firestore.rules` and `storage.rules`)
- [ ] Environment variables properly configured
- [ ] No sensitive data in source code
- [ ] `.env` files in `.gitignore`
- [ ] API keys are valid and have proper restrictions

### Functionality
- [ ] Authentication working (Google, Email, Guest)
- [ ] Photo upload working
- [ ] Photo visibility settings working
- [ ] Comments and reactions working
- [ ] Map view loading correctly
- [ ] Timeline displaying correctly
- [ ] Albums functionality working
- [ ] Both languages (EN/IT) working

### Performance
- [ ] Images optimized
- [ ] Bundle size < 300 KB first load
- [ ] No memory leaks detected
- [ ] Lighthouse score > 80

### Content
- [ ] Placeholder content removed
- [ ] Custom error pages created (optional)
- [ ] Favicon and OG images added
- [ ] robots.txt and sitemap.xml updated with production URLs

---

## Deployment Options

### Option 1: Vercel (Recommended)

**Why Vercel?**
- Built for Next.js
- Automatic deployments from Git
- Edge functions and ISR support
- Free SSL certificates
- Easy environment variable management
- Excellent DX

### Option 2: Firebase Hosting

**Why Firebase Hosting?**
- Same ecosystem as Firebase backend
- Good CDN performance
- Simple deployment process
- Free SSL certificates
- Can use same Firebase project

---

## Vercel Deployment (Recommended)

### Initial Setup

1. **Connect Repository to Vercel**
   ```bash
   # Install Vercel CLI (optional)
   npm install -g vercel

   # Login to Vercel
   vercel login
   ```

2. **Import Project on Vercel Dashboard**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New" > "Project"
   - Import your Git repository
   - Select the repository

3. **Configure Build Settings**
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`
   - Root Directory: `./` (unless monorepo)

4. **Add Environment Variables**
   - Go to Project Settings > Environment Variables
   - Add all variables from [Environment Variables](#environment-variables) section
   - Set for: Production, Preview, and Development (as needed)

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Verify deployment at the preview URL

### Configure Custom Domain

1. Go to Project Settings > Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for DNS propagation (can take up to 48 hours)
5. Vercel will automatically provision SSL certificate

### Automatic Deployments

- **Production**: Auto-deploys from `main` or `master` branch
- **Preview**: Auto-deploys from pull requests
- **Custom**: Configure branch deployments in Settings

### Vercel CLI Commands

```bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel

# View logs
vercel logs [deployment-url]

# List deployments
vercel ls

# Remove deployment
vercel rm [deployment-id]
```

---

## Firebase Hosting (Alternative)

### Initial Setup

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools

   # Login to Firebase
   firebase login
   ```

2. **Initialize Firebase Hosting**
   ```bash
   # In project root
   firebase init hosting

   # Select options:
   # - Use existing project: [your-project-id]
   # - Public directory: out
   # - Configure as single-page app: Yes
   # - Set up automatic builds with GitHub: No (manual for now)
   ```

3. **Update next.config.ts for Static Export**
   ```typescript
   // Add to next.config.ts
   const nextConfig: NextConfig = {
     output: 'export',
     // ... rest of config
   };
   ```

4. **Build and Deploy**
   ```bash
   # Build static export
   npm run build

   # Deploy to Firebase Hosting
   firebase deploy --only hosting
   ```

### Configure Custom Domain

1. Go to Firebase Console > Hosting
2. Click "Add custom domain"
3. Enter your domain
4. Follow DNS configuration instructions
5. Verify ownership
6. Wait for SSL certificate provisioning

### CI/CD with GitHub Actions

Create `.github/workflows/firebase-hosting.yml`:

```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_FIREBASE_API_KEY: ${{ secrets.NEXT_PUBLIC_FIREBASE_API_KEY }}
          # Add all other env vars

      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: your-project-id
```

---

## Post-Deployment Verification

Complete this checklist after deployment:

### Functionality Tests
- [ ] Visit production URL
- [ ] Test authentication (all methods)
- [ ] Upload a photo
- [ ] View gallery
- [ ] Check map view
- [ ] Check timeline
- [ ] Create an album
- [ ] Add a comment
- [ ] Add a reaction
- [ ] Test language switcher (EN/IT)
- [ ] Test on mobile device
- [ ] Test in different browsers (Chrome, Firefox, Safari)

### Performance Tests
- [ ] Run Lighthouse audit (target: 80+ score)
- [ ] Check page load times (target: < 3 seconds)
- [ ] Verify images are optimized and loading
- [ ] Check for console errors
- [ ] Verify no 404 errors

### Security Tests
- [ ] SSL certificate active (HTTPS)
- [ ] Security headers present
- [ ] Firebase rules working (try accessing hidden photos)
- [ ] No sensitive data exposed
- [ ] API keys properly restricted

### SEO Tests
- [ ] Meta tags present (view page source)
- [ ] robots.txt accessible
- [ ] sitemap.xml accessible
- [ ] Open Graph tags working (test with [Facebook Debugger](https://developers.facebook.com/tools/debug/))
- [ ] Twitter cards working (test with [Twitter Card Validator](https://cards-dev.twitter.com/validator))

### Monitoring
- [ ] Sentry receiving errors (test by triggering an error)
- [ ] Firebase Console showing usage
- [ ] Deployment logs available
- [ ] Analytics tracking (if configured)

---

## Rollback Procedures

If critical issues are found after deployment:

### Vercel Rollback

1. **Instant Rollback via Dashboard**
   - Go to Vercel Dashboard > Deployments
   - Find the last stable deployment
   - Click "..." menu > "Promote to Production"

2. **Via CLI**
   ```bash
   # List deployments
   vercel ls

   # Promote a previous deployment
   vercel promote [deployment-url]
   ```

### Firebase Hosting Rollback

1. **Via Firebase Console**
   - Go to Firebase Console > Hosting
   - View release history
   - Click "..." on stable release > "Rollback"

2. **Via CLI**
   ```bash
   # View release history
   firebase hosting:channel:list

   # Deploy previous version
   firebase hosting:clone SOURCE_SITE_ID:SOURCE_CHANNEL_ID TARGET_SITE_ID:live
   ```

### Code Rollback

If deployment platform rollback doesn't work:

```bash
# Revert to last stable commit
git revert HEAD

# Or reset to specific commit
git reset --hard [commit-hash]

# Force push (be careful!)
git push origin main --force

# Trigger new deployment
```

---

## Monitoring and Maintenance

### Daily Monitoring

- Check Sentry for new errors
- Monitor Firebase usage/quotas
- Review deployment logs
- Check uptime status

### Weekly Maintenance

- Review performance metrics
- Update dependencies if needed
- Check for security updates
- Review user feedback

### Monthly Tasks

- Full security audit
- Performance optimization review
- Backup Firebase data
- Review and rotate API keys if needed
- Update documentation

### Firebase Quotas

Monitor these Firebase quotas:

- **Firestore**: 50K reads/day (free tier)
- **Storage**: 5GB (free tier)
- **Authentication**: 10K/month (free tier)
- **Bandwidth**: 360MB/day (free tier)

If approaching limits, consider upgrading to Blaze plan.

### Sentry Alerts

Configure alerts in Sentry:

- New issue created
- Issue regression
- Spike in error rate
- Performance degradation

---

## Known Limitations

Document these limitations for users/maintainers:

### Functional Limitations
1. **Friends Visibility**: Currently treated as public. True friend system not implemented.
2. **No Photo Editing**: Once uploaded, metadata cannot be edited (must delete and re-upload).
3. **Single Photo Upload**: No bulk upload feature (future enhancement).
4. **No Image Compression**: Photos uploaded at full resolution (consider adding compression).
5. **Manual Testing Only**: No automated test suite yet (future enhancement).
6. **No Admin Dashboard**: No admin interface for moderation (future enhancement).

### Technical Limitations
1. **Client-Side Rendering**: Most pages are CSR (could benefit from SSR for SEO).
2. **No Offline Support**: Requires internet connection (could add PWA features).
3. **No Real-time Updates**: Manual refresh needed to see new content (could add Firebase listeners).
4. **Geographic Restrictions**: Firebase may have regional limitations.

### Performance Considerations
1. **Large Image Files**: No client-side compression (can slow uploads).
2. **Firestore Query Limits**: May need pagination for large photo counts.
3. **Map Performance**: Many markers can slow map rendering.

---

## Troubleshooting

### Build Failures

**Problem**: Build fails during deployment
```
Error: Cannot find module 'xyz'
```

**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build
```

### Environment Variable Issues

**Problem**: Firebase not initializing
```
Error: Firebase config missing
```

**Solution**:
1. Verify all environment variables are set
2. Check variable names (must start with `NEXT_PUBLIC_`)
3. Restart deployment after adding variables
4. Clear build cache if needed

### Firebase Rules Errors

**Problem**: Users can't upload/access photos
```
Error: Missing or insufficient permissions
```

**Solution**:
```bash
# Deploy updated rules
firebase deploy --only firestore:rules
firebase deploy --only storage:rules

# Test rules in Firebase Console > Firestore > Rules > Simulator
```

### Performance Issues

**Problem**: Slow page loads

**Solution**:
1. Check bundle size: `npm run build`
2. Optimize images (add compression)
3. Implement lazy loading
4. Review Lighthouse report
5. Check CDN cache settings

### SSL Certificate Issues

**Problem**: SSL not working on custom domain

**Solution (Vercel)**:
1. Verify DNS records are correct
2. Wait for DNS propagation (up to 48 hours)
3. Remove and re-add domain in Vercel
4. Contact Vercel support if persistent

**Solution (Firebase)**:
1. Verify domain ownership
2. Check DNS TXT records
3. Wait for SSL provisioning (can take hours)
4. Check Firebase Hosting status page

### Sentry Not Receiving Errors

**Problem**: No errors appearing in Sentry

**Solution**:
1. Verify `NEXT_PUBLIC_SENTRY_DSN` is set
2. Check Sentry project is active
3. Trigger a test error:
   ```javascript
   throw new Error("Sentry test error");
   ```
4. Check browser console for Sentry logs
5. Verify Sentry config files are loaded

---

## Support and Resources

### Official Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Sentry Documentation](https://docs.sentry.io/)

### Project-Specific
- Phase 4 Brief: `scrum_master/briefs/phase_4_security_devops_brief.md`
- Security Audit: `SECURITY_AUDIT.md`
- Main README: `README.md`

### Emergency Contacts
- Firebase Support: https://firebase.google.com/support
- Vercel Support: https://vercel.com/support
- Sentry Support: https://sentry.io/support

---

## Deployment Checklist Summary

Use this quick checklist for each deployment:

```markdown
Pre-Deployment:
- [ ] Code merged to main branch
- [ ] All tests passing
- [ ] Environment variables set
- [ ] Firebase rules deployed
- [ ] Build successful locally

Deployment:
- [ ] Deploy to production
- [ ] Monitor build logs
- [ ] Wait for deployment to complete

Post-Deployment:
- [ ] Visit production URL
- [ ] Test critical features
- [ ] Check for errors in Sentry
- [ ] Run Lighthouse audit
- [ ] Monitor for 30 minutes

Rollback (if issues found):
- [ ] Promote previous deployment
- [ ] Verify stability
- [ ] Investigate issues
- [ ] Fix and redeploy
```

---

**Last Updated**: 2025-10-12
**Version**: 1.0.0
**Maintainer**: M&F

---

**Congratulations! Your application is ready for production.** 🚀
