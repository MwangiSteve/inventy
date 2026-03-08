# Monitoring & Alerts Guide

## Error Tracking

- **Sentry integration** (optional – see setup below)
- Error logs written to: `/logs/error.log` (production)
- Console errors available in development only
- Structured JSON logs for easy parsing

## Performance Monitoring

- Response time tracking via middleware
- Database query monitoring (slow query logging)
- API endpoint metrics (request count, latency p50/p95/p99)
- Error rate monitoring per endpoint

## Setting Up Alerts

### For Vercel

1. Go to your **Project Settings** in the Vercel dashboard
2. Navigate to **Integrations → Error Tracking**
3. Enable error tracking (built-in or Sentry)
4. Configure email/Slack notifications
5. Set error rate thresholds (recommended: alert at >0.5% error rate)

### For Self-Hosted (Sentry)

1. Create a new project at [sentry.io](https://sentry.io)
2. Install the Sentry SDK:
   ```bash
   npm install @sentry/nextjs
   ```
3. Run the Sentry wizard:
   ```bash
   npx @sentry/wizard@latest -i nextjs
   ```
4. Add your DSN to `.env.local`:
   ```env
   NEXT_PUBLIC_SENTRY_DSN="https://your-dsn@sentry.io/project-id"
   ```
5. Verify with a test error:
   ```typescript
   // pages/api/sentry-test.ts
   export default function handler(req, res) {
     throw new Error('Sentry test error');
   }
   ```

## Key Metrics to Monitor

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Error rate | < 0.1% | > 0.5% |
| p95 response time | < 200ms | > 500ms |
| CPU usage | < 70% | > 85% |
| Memory usage | < 500MB | > 800MB |
| Database connections | < 10 | > 20 |
| Rate limit hits | < 1% | > 5% |

## Log Levels

| Level | When to Use |
|-------|-------------|
| `error` | Unhandled exceptions, data loss risk |
| `warn` | Recoverable issues, deprecated usage |
| `info` | Key business events (login, export) |
| `debug` | Detailed trace info (dev only) |

Set `LOG_LEVEL` in your environment variables to control verbosity.

## Health Check Endpoint

The application exposes a health check at `/api/health`:

```bash
curl https://your-app.vercel.app/api/health
# {"status":"ok","timestamp":"2026-03-08T14:15:00.000Z"}
```

Use this endpoint with your uptime monitoring service (e.g., UptimeRobot, Better Uptime).

## Database Monitoring

Monitor these Prisma-level metrics:

```typescript
// lib/prisma.ts (example instrumentation)
prisma.$on('query', (e) => {
  if (e.duration > 1000) {
    logger.warn('Slow query detected', { query: e.query, duration: e.duration });
  }
});
```

## Alerting Checklist

- [ ] Uptime monitoring configured (UptimeRobot / Better Uptime)
- [ ] Error tracking enabled (Sentry or Vercel)
- [ ] Slack/email notifications set up for alerts
- [ ] Database backup monitoring enabled
- [ ] SSL certificate expiry monitoring enabled
- [ ] Rate limit alert configured (notify if >5% of requests are rate-limited)
