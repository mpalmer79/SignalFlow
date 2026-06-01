# Deployment

How to deploy SignalFlow to Vercel with a production PostgreSQL database. This
is a deterministic demo platform: no live AI, voice, SMS, or email is sent, and
no provider SDKs are installed. A database is still required at runtime because
the pages read seeded demo data.

## Overview

```text
1. Create a Postgres database
2. Add DATABASE_URL to Vercel environment variables
3. Add DATABASE_URL to GitHub Actions secrets
4. Run the manual Production DB Setup workflow
5. Redeploy Vercel
6. Set ALLOW_DEMO_MODE=true if using the demo fallback without Clerk
```

## 1. Create a Postgres database

Create a PostgreSQL database with any provider (for example Vercel Postgres,
Neon, Supabase, or RDS). Copy its connection string. It looks like:

```text
postgresql://USER:PASSWORD@HOST:5432/DBNAME?schema=public&sslmode=require
```

This string is a secret. Do not commit it. It is never hardcoded in the repo.

## 2. Add DATABASE_URL to Vercel environment variables

In the Vercel project, open Settings, Environment Variables, and add
`DATABASE_URL` with the connection string for the Production environment (and
Preview if you want preview deployments to read the database). The application
reads the database at request time, so the runtime needs this value. The build
itself does not connect to the database.

## 3. Add DATABASE_URL to GitHub Actions secrets

In the GitHub repository, open Settings, Secrets and variables, Actions, and add
a repository secret named `DATABASE_URL` with the same connection string. The
manual setup workflow reads it from there. It is never stored in the repo.

## 4. Run the manual Production DB Setup workflow

Open the Actions tab, select Production DB Setup, and run it with the Run
workflow button. The workflow is manual only: it never runs on push or pull
request. It will:

```text
verify the DATABASE_URL secret is present, and fail clearly if it is missing
npm ci
npx prisma generate
npx prisma migrate deploy   (applies committed migrations, non-destructive)
npm run db:seed             (loads demo data)
```

Important. The seed loads the demo data set and refreshes it: it clears the
existing demo rows before inserting the current ones. Run this workflow for the
initial setup of a fresh database or to refresh a demo database. Do not run it
against a database that holds data you want to keep. The workflow never runs
`prisma migrate reset` and never drops the database or its schema.

## 5. Redeploy Vercel

Trigger a new Vercel deployment (push to the deployment branch or use Redeploy
in the Vercel dashboard) so the running application picks up the configured
`DATABASE_URL` and the now-migrated and seeded database. The build generates the
Prisma client through the `postinstall` and `build` scripts, so no extra build
configuration is needed.

## 6. Set ALLOW_DEMO_MODE if using the demo fallback without Clerk

Authentication is optional. If you do not configure Clerk, the application uses
a clearly labeled demo owner context. As a safety measure the demo fallback is
refused in production unless you opt in. To run the demo experience in
production without Clerk, add a Vercel environment variable
`ALLOW_DEMO_MODE=true`. To use real authentication instead, set
`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` and leave
`ALLOW_DEMO_MODE` unset. See AUTHORIZATION.md for the rule.

## Notes

- The build does not require a database connection. Only the running
  application and the setup workflow do.
- `DATABASE_URL` is never committed, never hardcoded, and is read only from
  Vercel environment variables at runtime and from GitHub Actions secrets in the
  setup workflow.
- The setup workflow uses `prisma migrate deploy`, which applies only the
  migrations committed to the repository and does not generate or reset them.
