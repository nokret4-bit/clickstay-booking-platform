# Deploying ClickStay to Vercel

This guide will help you deploy the ClickStay Manuel Resort Online Booking Platform to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Account**: Your code should be pushed to a GitHub repository
3. **PostgreSQL Database**: You'll need a production database (recommended: [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Railway](https://railway.app))

## Step 1: Prepare Your Database

### Option A: Using Neon (Recommended - Free Tier Available)

1. Go to [neon.tech](https://neon.tech) and create an account
2. Create a new project
3. Copy the connection string (it will look like: `postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`)
4. Keep this connection string for later

### Option B: Using Supabase

1. Go to [supabase.com](https://supabase.com) and create an account
2. Create a new project
3. Go to Settings > Database
4. Copy the "Connection string" under "Connection pooling" (use Transaction mode)
5. Replace `[YOUR-PASSWORD]` with your actual database password

### Option C: Using Railway

1. Go to [railway.app](https://railway.app) and create an account
2. Create a new project and add PostgreSQL
3. Copy the DATABASE_URL from the PostgreSQL service variables

## Step 2: Push Your Code to GitHub

If you haven't already:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

## Step 3: Deploy to Vercel

### Via Vercel Dashboard (Recommended)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Vercel will auto-detect Next.js
4. Configure your project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `Online Booking` (if your Next.js app is in a subdirectory)
   - **Build Command**: Leave as default or use `prisma generate && next build`
   - **Output Directory**: Leave as default (`.next`)

### Via Vercel CLI

```bash
npm i -g vercel
cd "Online Booking"
vercel
```

## Step 4: Configure Environment Variables

In your Vercel project dashboard, go to **Settings > Environment Variables** and add the following:

### Required Variables

| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | Your PostgreSQL connection string | From Step 1 |
| `NEXTAUTH_SECRET` | Generate with: `openssl rand -base64 32` | Keep this secret! |
| `NEXTAUTH_URL` | `https://your-project.vercel.app` | Your Vercel deployment URL |
| `NEXT_PUBLIC_APP_URL` | `https://your-project.vercel.app` | Same as NEXTAUTH_URL |
| `NODE_ENV` | `production` | Set to production |

### Email Configuration (Required for booking confirmations)

| Variable | Value | Notes |
|----------|-------|-------|
| `SMTP_HOST` | `smtp.gmail.com` | Or your email provider's SMTP host |
| `SMTP_PORT` | `587` | Standard SMTP port |
| `SMTP_USER` | `your-email@gmail.com` | Your email address |
| `SMTP_PASSWORD` | Your Gmail App Password | [Generate here](https://myaccount.google.com/apppasswords) |
| `SMTP_FROM` | `Manuel Resort <noreply@manuelresort.com>` | Display name and email |

### PayMongo Configuration (Required for GCash payments)

| Variable | Value | Notes |
|----------|-------|-------|
| `PAYMONGO_SECRET_KEY` | `sk_live_...` or `sk_test_...` | From [PayMongo Dashboard](https://dashboard.paymongo.com/developers) |
| `PAYMONGO_PUBLIC_KEY` | `pk_live_...` or `pk_test_...` | From PayMongo Dashboard |
| `PAYMONGO_WEBHOOK_SECRET` | `whsec_...` | From PayMongo Webhook settings |

**Important**: Make sure to add these variables to **all environments** (Production, Preview, Development) or at least Production.

## Step 5: Run Database Migrations

After your first deployment, you need to run the database migrations:

### Option A: Using Vercel CLI

```bash
vercel env pull .env.production
npm run build
```

The build command includes `prisma migrate deploy` which will run migrations automatically.

### Option B: Manually via Prisma

```bash
# Set your production DATABASE_URL
export DATABASE_URL="your-production-database-url"

# Run migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

## Step 6: Seed Initial Data (Optional)

If you want to seed your production database with initial data:

```bash
# Set your production DATABASE_URL
export DATABASE_URL="your-production-database-url"

# Run seed
npm run db:seed
```

Or create admin users:

```bash
npm run create-admin
npm run create-cashier
```

## Step 7: Configure PayMongo Webhook

1. Go to [PayMongo Dashboard](https://dashboard.paymongo.com/developers/webhooks)
2. Create a new webhook
3. Set the URL to: `https://your-project.vercel.app/api/webhooks/paymongo`
4. Select events: `payment.paid`, `payment.failed`
5. Copy the webhook secret and add it to your Vercel environment variables as `PAYMONGO_WEBHOOK_SECRET`

## Step 8: Test Your Deployment

1. Visit your Vercel URL: `https://your-project.vercel.app`
2. Test the booking flow
3. Test email notifications
4. Test GCash payment (use PayMongo test mode first)

## Troubleshooting

### Build Fails

- Check the build logs in Vercel dashboard
- Ensure all environment variables are set correctly
- Verify your database connection string is correct

### Database Connection Issues

- Make sure your DATABASE_URL includes SSL parameters: `?sslmode=require`
- Check if your database provider allows connections from Vercel's IP ranges
- For Neon: Connection pooling is enabled by default
- For Supabase: Use the "Connection pooling" URL, not the direct connection

### Email Not Sending

- Verify SMTP credentials are correct
- For Gmail: Make sure you're using an App Password, not your regular password
- Check Vercel function logs for email errors

### PayMongo Webhook Not Working

- Verify the webhook URL is correct: `https://your-domain.vercel.app/api/webhooks/paymongo`
- Check that `PAYMONGO_WEBHOOK_SECRET` matches the secret from PayMongo dashboard
- Test webhook using PayMongo's webhook testing tool

## Environment-Specific Configurations

### Production
- Use live PayMongo keys (`sk_live_...`, `pk_live_...`)
- Use production database
- Set `NODE_ENV=production`

### Preview/Staging
- Use test PayMongo keys (`sk_test_...`, `pk_test_...`)
- Can use the same database or a separate staging database
- Set `NODE_ENV=production`

## Updating Your Deployment

Vercel automatically deploys when you push to your main branch:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

## Custom Domain (Optional)

1. Go to your Vercel project settings
2. Navigate to **Domains**
3. Add your custom domain
4. Update DNS records as instructed
5. Update `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to use your custom domain

## Performance Optimization

Your deployment is already optimized with:
- ✅ Next.js 15 with App Router
- ✅ Automatic code splitting
- ✅ Image optimization
- ✅ Edge caching
- ✅ Serverless functions

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PayMongo Documentation](https://developers.paymongo.com/docs)

---

**Note**: The first deployment might take a few minutes. Subsequent deployments are faster due to caching.
