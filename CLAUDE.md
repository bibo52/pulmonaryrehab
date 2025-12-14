# Pulmonary Rehab Tracker

## Tech Stack
- Next.js 16 (App Router)
- Prisma 7 with Neon PostgreSQL
- TypeScript
- Deployed on Vercel

## Database: Neon PostgreSQL

**CRITICAL DATABASE WORKFLOW**: When modifying the Prisma schema, you MUST:

1. Update `prisma/schema.prisma` with your changes
2. Create a migration SQL file manually in a new migrations folder:
   ```bash
   mkdir -p prisma/migrations/$(date +%Y%m%d%H%M%S)_description
   # Write the ALTER TABLE statements to migration.sql in that folder
   ```
3. Test the migration locally if possible, or run directly on production:
   ```bash
   # Pull DATABASE_URL from Vercel if not already linked
   cd /home/philip/Documents/Code/pulmonaryrehab
   vercel link --yes  # if not already linked
   vercel env pull .env.local

   # Run migration on production database
   psql "$(grep DATABASE_URL .env.local | cut -d= -f2-)" -f your_migration.sql
   ```
4. Regenerate Prisma client:
   ```bash
   npx prisma generate
   ```
5. Commit everything including the migration file
6. Push to trigger Vercel redeploy

**Why this matters**:
- Vercel build runs `prisma generate` (creates client) but NOT `prisma migrate deploy`
- Production database must be migrated manually before deploying schema changes
- Schema changes without migrations = runtime errors in production

## Database Connection

- Production DB: Neon PostgreSQL (serverless)
- Connection string stored in Vercel environment variable `DATABASE_URL`
- Uses `@prisma/adapter-neon` for Edge Runtime compatibility
- Pull env vars with: `vercel env pull .env.local`

## Prisma Configuration

- Schema: `prisma/schema.prisma`
- Generator: `prisma-client-js` (NOT `prisma-client` - causes Edge Runtime errors)
- Output: `src/generated/prisma` (custom location)
- Config: `prisma.config.ts` handles env var fallback for `prisma generate`

## Deployment

- Platform: Vercel
- Auto-deploys on push to main branch
- Build command includes `prisma generate` in package.json
- **Database migrations must be run manually before pushing schema changes**

## Common Issues

### "Column does not exist" errors
- Means Prisma schema is ahead of database schema
- Run migration SQL directly on production database (see workflow above)

### "Invalid prisma client" or Node.js module errors
- Check that `prisma/schema.prisma` uses `provider = "prisma-client-js"`
- Regenerate client: `npx prisma generate`

### Can't connect to database locally
- This app uses Neon (cloud database), not local PostgreSQL
- Always pull `.env.local` from Vercel to get DATABASE_URL
- Never commit `.env.local` to git (it's in .gitignore)

## Project Structure

- `/src/app` - Next.js app router pages
  - `/api/auth` - Simple password auth
  - `/api/logs` - CRUD for daily logs
  - `/dashboard` - Main tracking interface
  - `/log` - Exercise logging form
  - `/progress` - Charts and analytics
- `/src/lib/db.ts` - Prisma client singleton
- `/src/lib/auth.ts` - Simple cookie-based auth
