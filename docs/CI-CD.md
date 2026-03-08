# CI/CD Documentation

## Overview

Stockly uses GitHub Actions for continuous integration, security scanning, and deployment.

## Workflows

### 1. CI (`ci.yml`)

**Triggers**: Push or PR to `main` or `develop`

**Jobs**:
1. **Lint & Type Check**
   - Runs ESLint
   - Runs TypeScript type checker (`tsc --noEmit`)
   
2. **Tests**
   - Runs unit tests with coverage
   - Uploads coverage to Codecov (if configured)

3. **Build**
   - Runs `npm run build` to verify the application builds successfully
   - Requires lint/type-check to pass first

### 2. Security Audit (`security-audit.yml`)

**Triggers**: Push to `main`, weekly schedule (Mondays 08:00 UTC), or manual dispatch

**Jobs**:
1. Runs `npm audit --audit-level=high`
2. Generates a JSON security report artifact
3. Fails the pipeline if high or critical vulnerabilities are found

### 3. Deploy (`deploy.yml`)

**Triggers**: GitHub release creation or manual workflow dispatch

**Jobs**:
1. Runs unit tests before deploying
2. Deploys to Vercel using the `amondnet/vercel-action`
3. Notifies on success or failure

### 4. CodeQL (`codeql.yml`)

**Triggers**: Push or PR to `main`/`develop`, weekly schedule (Sundays)

**Jobs**:
1. Runs GitHub CodeQL static analysis on JavaScript/TypeScript
2. Reports security vulnerabilities to the GitHub Security tab

## Required Secrets

Configure these in GitHub → Settings → Secrets and variables → Actions:

| Secret | Description | Required By |
|--------|-------------|-------------|
| `JWT_SECRET` | JWT signing secret | ci.yml, deploy.yml |
| `DATABASE_URL` | MongoDB connection string | ci.yml (build), deploy.yml |
| `VERCEL_TOKEN` | Vercel API token | deploy.yml |
| `VERCEL_ORG_ID` | Vercel organization ID | deploy.yml |
| `VERCEL_PROJECT_ID` | Vercel project ID | deploy.yml |
| `CODECOV_TOKEN` | Codecov upload token | ci.yml (optional) |

## Environment Variables for Deployment

All environment variables from `.env.example` should be configured in Vercel:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add each variable from `.env.example` with production values

## Release Process

1. Merge feature branches to `develop`
2. When ready to release, merge `develop` to `main`
3. Create a GitHub Release with a version tag (e.g., `v1.0.0`)
4. The deploy workflow automatically triggers on release creation

## Local Development

```bash
# Run all CI checks locally before pushing
npm run lint        # ESLint
npx tsc --noEmit    # TypeScript check
npm test            # Jest tests
npm run build       # Build check
```

## Viewing CI Results

- **GitHub Actions** tab in the repository shows all workflow runs
- **Security** tab shows CodeQL alerts
- **Codecov** (if configured) shows coverage trends
