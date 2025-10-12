import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Environment
  environment: process.env.NODE_ENV,

  // Disable verbose debugging (set SENTRY_LOG_LEVEL=debug to enable)
  debug: false,

  // Filter out sensitive information
  beforeSend(event, hint) {
    // Don't send events if no DSN is configured
    if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
      return null;
    }

    // Remove sensitive data
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers;
    }

    return event;
  },

  // Ignore common non-critical errors
  ignoreErrors: [
    'FirebaseError',
    'NetworkError',
    'Network request failed',
  ],
});
