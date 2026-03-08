# Security Documentation

## Overview

This document outlines the security features implemented in Stockly Inventory Management and provides guidelines for maintaining security standards.

## Security Features Implemented

### 1. Dependency Security (CVE Fixes)

- **Removed**: `xlsx@0.18.5` — had 2 unpatched CVEs (ReDoS, Prototype Pollution)
- **Replaced with**: `exceljs@4.4.0` — no known advisories

Excel export is now handled server-side via `/api/products/export` to avoid shipping vulnerable client-side code.

### 2. Authentication & Session Management

- **JWT tokens** signed with a strong secret (`JWT_SECRET` env var)
- **HttpOnly cookies** — session tokens are not accessible via JavaScript
- **1-hour session expiry** on JWT tokens
- **bcrypt password hashing** with 10 salt rounds

### 3. Rate Limiting

Rate limiting is applied to all API endpoints to prevent brute force and DoS attacks:

| Endpoint Group | Limit | Window |
|----------------|-------|--------|
| `/api/auth/*` | 5 requests | 15 minutes |
| `/api/products*` | 50 requests | 15 minutes |
| `/api/categories*` | 100 requests | 15 minutes |
| `/api/suppliers*` | 100 requests | 15 minutes |

Standard rate limit headers (`RateLimit-*`) are returned in every response.

### 4. Input Validation

All API endpoints validate request bodies using **Zod schemas** defined in `lib/validationSchemas.ts`. Invalid requests receive a `400 Bad Request` with descriptive error messages.

Validated schemas:
- `registerSchema` — name, email, password
- `loginSchema` — email, password
- `productSchema` — all product fields with type and range constraints
- `categorySchema` — category name
- `supplierSchema` — supplier name

### 5. Security Headers

The following HTTP security headers are set on all responses via `next.config.ts`:

| Header | Value | Purpose |
|--------|-------|---------|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Force HTTPS |
| `X-Frame-Options` | `DENY` | Prevent clickjacking |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME sniffing |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limit referrer info |
| `Permissions-Policy` | Deny camera, microphone, geolocation | Limit browser APIs |
| `Content-Security-Policy` | Restrict resource sources | Prevent XSS |

### 6. Centralized Error Handling

- `lib/apiError.ts` — Custom `ApiError` class with typed error codes
- `middleware/errorHandler.ts` — Centralized error handler
- **Production mode**: Error details are never leaked to clients
- **Development mode**: Full error details included for debugging

### 7. Automated Security Scanning

- **GitHub Actions security audit** — runs weekly and on every push to `main`
- **CodeQL analysis** — automated static code analysis for security vulnerabilities
- `npm audit --audit-level=high` — fails the CI pipeline on high/critical vulnerabilities

## Security Best Practices

### For Developers

1. **Never commit secrets** — Use `.env.local` for local development (it's in `.gitignore`)
2. **Keep dependencies updated** — Run `npm audit` regularly
3. **Validate all inputs** — Use the Zod schemas in `lib/validationSchemas.ts`
4. **Use the error handler** — Always use `handleApiError()` in API routes
5. **Apply rate limiting** — Always apply `withRateLimit()` to new API routes

### For Deployment

1. Set a strong `JWT_SECRET` (at least 32 random characters)
2. Use HTTPS in production (HSTS header enforces this)
3. Configure MongoDB connection with least-privilege credentials
4. Review and configure Content-Security-Policy for your specific domain

## Reporting Vulnerabilities

If you discover a security vulnerability, please do **not** open a public GitHub issue. Instead:

1. Email the project maintainers with details of the vulnerability
2. Include steps to reproduce, impact assessment, and any suggested fixes
3. Allow up to 48 hours for an initial response

## Security Checklist for Deployment

- [ ] `JWT_SECRET` is set to a strong, unique value
- [ ] `DATABASE_URL` uses a least-privilege MongoDB user
- [ ] `NODE_ENV` is set to `production`
- [ ] HTTPS is enforced
- [ ] All environment variables are configured in your hosting platform
- [ ] `npm audit` returns no high/critical vulnerabilities
- [ ] Rate limiting is configured and tested
