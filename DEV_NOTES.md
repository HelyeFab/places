# Development Notes

## Expected Development Warnings

### Sentry Initialization
When running `npm run dev`, you may see Sentry messages:
```
Sentry Logger [warn]: No DSN provided, client will not send events.
Sentry Logger [error]: Transport disabled
```

**This is expected and normal in development.**

- Sentry requires a DSN (Data Source Name) to send error reports
- Without a DSN, Sentry runs in "disabled" mode but still tracks spans locally
- To enable Sentry in production, add to `.env.local`:
  ```bash
  NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id
  ```

### Webpack Warnings (Suppressed)
Previously visible warnings about `@prisma/instrumentation` and `@opentelemetry/instrumentation` are now suppressed via `next.config.ts`. These are harmless dependency warnings from Sentry's Prisma integration.

## Environment Variables

### Required (Already Configured)
- `NEXT_PUBLIC_FIREBASE_*` - Firebase configuration (production project)

### Optional (For Production)
- `NEXT_PUBLIC_SENTRY_DSN` - Sentry error tracking
- `SENTRY_AUTH_TOKEN` - For uploading source maps
- `SENTRY_ORG` - Your Sentry organization slug
- `SENTRY_PROJECT` - Your Sentry project slug

### Development Controls
- `SENTRY_LOG_LEVEL=error` - Suppress verbose Sentry logs (default: error)
- Set to `debug` for troubleshooting Sentry issues

## Sentry Debug Mode

To enable verbose Sentry logging for troubleshooting:

1. Update `.env.local`:
   ```bash
   SENTRY_LOG_LEVEL=debug
   ```

2. Update Sentry config files (`sentry.*.config.ts`):
   ```typescript
   debug: true,  // Change from false
   ```

3. Restart dev server

## Clean Development Experience

Current configuration provides:
- ✅ Zero webpack warnings in console
- ✅ Minimal Sentry noise (errors only)
- ✅ Application works perfectly without Sentry DSN
- ✅ Production-ready when DSN is added

## Adding Sentry to Production

See `PRODUCTION_DEPLOYMENT.md` section "Configure Sentry" for step-by-step instructions.

Quick steps:
1. Create Sentry project at https://sentry.io
2. Copy DSN from project settings
3. Add to Vercel environment variables:
   - `NEXT_PUBLIC_SENTRY_DSN`
   - `SENTRY_AUTH_TOKEN` (for source maps)
4. Redeploy application

## Performance Monitoring

Sentry is configured for:
- 10% of production requests (tracesSampleRate: 0.1)
- 100% of errors with session replay
- Filtered sensitive data (cookies, headers removed)

## Common Development Tasks

### Run development server
```bash
npm run dev
```

### Build for production
```bash
npm run build
```

### Test production build locally
```bash
npm run build && npm start
```

### Deploy to Vercel
```bash
npx vercel --prod
```

### Deploy Firebase rules
```bash
firebase deploy --only firestore:rules,storage:rules
```

## Known Issues

None at this time. Application is production-ready.

## Support

For issues or questions:
1. Check `CLAUDE.md` for project patterns
2. Check `PRODUCTION_DEPLOYMENT.md` for deployment guidance
3. Check `SECURITY_AUDIT.md` for security considerations
