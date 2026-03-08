# Environment Variables Reference

## Required Variables

| Variable | Description | Example | Validation |
|----------|-------------|---------|-----------|
| `DATABASE_URL` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/inventy` | Must be valid URI |
| `JWT_SECRET` | Secret for JWT signing | `your-random-32-character-secret-here` | Min 32 characters |
| `NODE_ENV` | Environment name | `development` / `production` / `test` | One of specified values |

## Optional Variables

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `LOG_LEVEL` | Logging verbosity | `info` | `debug` / `info` / `warn` / `error` |
| `RATE_LIMIT_WINDOW` | Rate limit window in ms | `900000` | `900000` (15 min) |
| `RATE_LIMIT_MAX` | Max requests per window | `100` | `100` |
| `RATE_LIMIT_AUTH_MAX` | Max auth requests per window | `5` | `5` |
| `NEXTAUTH_URL` | Application base URL | — | `https://your-app.vercel.app` |
| `NEXTAUTH_SECRET` | NextAuth secret | — | `another-random-secret` |

## Example `.env.local`

```env
# Database
DATABASE_URL="mongodb+srv://username:password@cluster0.abcde.mongodb.net/inventy?retryWrites=true&w=majority"

# Authentication
JWT_SECRET="your-super-secure-random-secret-at-least-32-characters-long"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="another-random-secret-for-nextauth"

# Environment
NODE_ENV="development"

# Rate Limiting (optional)
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
RATE_LIMIT_AUTH_MAX=5

# Logging (optional)
LOG_LEVEL="debug"
```

## Production Checklist

- [ ] `DATABASE_URL` points to production database
- [ ] `JWT_SECRET` is at least 32 random characters (use `openssl rand -base64 32`)
- [ ] `NODE_ENV` is set to `production`
- [ ] `NEXTAUTH_URL` matches the deployed application URL
- [ ] No `.env` files committed to source control
- [ ] Secrets stored in your hosting provider's secret manager (e.g., Vercel Environment Variables)

## Generating Secure Secrets

```bash
# Generate a JWT_SECRET
openssl rand -base64 32

# Generate a NEXTAUTH_SECRET
openssl rand -base64 32
```

## Validation Behavior

The application validates required environment variables on startup. If any required variable is missing or invalid, the server will refuse to start and log a descriptive error message identifying the missing variable.
