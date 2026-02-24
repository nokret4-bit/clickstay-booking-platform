# ClickStay Resort - Online Booking Platform

A modern resort booking system built with Next.js, PostgreSQL, and Prisma.

## 🚀 Quick Start
- **Auth**: Auth.js (NextAuth v5) with email OTP/magic link
- **Payments**: PayMongo (GCash integration)
- **Email**: Nodemailer with React Email templates
- **Deployment**: Vercel-ready

## Features

- ✅ Browse rooms, cottages, and function halls
- ✅ Real-time availability checking
- ✅ Secure GCash payments via PayMongo
- ✅ Email confirmations with calendar invites (.ics)
- ✅ Admin dashboard for reservations, facilities, and reports
- ✅ Role-based access control (Guest, Staff, Admin)
- ✅ Booking management with status tracking
- ✅ Responsive design with dark mode

## Prerequisites

- Node.js 20.18.0 (use nvm: `nvm use`)
- npm 10.9.0
- PostgreSQL 16 (via Docker or local install)

## Quick Start

### 1. Install Dependencies

```bash
# Use correct Node version
nvm install 20.18.0
nvm use 20.18.0

# Install packages
npm install
```

### 2. Setup Environment

```bash
cp .env.example .env
```

Edit `.env` and configure:
- `DATABASE_URL` - PostgreSQL connection string
- `AUTH_SECRET` - Generate with `openssl rand -base64 32`
- `SMTP_*` - Your SMTP provider OR set `USE_ETHEREAL_DEV=true` for dev
- `PAYMONGO_*` - Your PayMongo API keys
- `NEXT_PUBLIC_APP_URL` - Your app URL

### 3. Start Database

```bash
docker compose up -d
```

### 4. Run Migrations & Seed

```bash
npm run prisma:migrate
npm run prisma:seed
```

This creates:
- 3 rooms, 2 cottages, 1 function hall
- Admin user: `admin@clickstay.local`
- Rate plans and inventory for next 30 days

### 5. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Email Configuration

### Development (Ethereal)

Set `USE_ETHEREAL_DEV=true` in `.env`. The server will auto-create a test account and log preview URLs for all emails.

### Production (SMTP)

Configure your SMTP provider:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@clickstay.com
USE_ETHEREAL_DEV=false
```

## PayMongo Setup

1. Sign up at https://paymongo.com
2. Get your API keys from the dashboard
3. Add to `.env`:

```env
PAYMONGO_PUBLIC_KEY=pk_test_xxx
PAYMONGO_SECRET_KEY=sk_test_xxx
PAYMONGO_WEBHOOK_SECRET=whsec_xxx
```

4. Configure webhook endpoint: `https://your-domain.com/api/webhooks/paymongo`
5. Subscribe to events: `source.chargeable`, `payment.paid`, `payment.failed`

## Admin Access

Promote a user to admin:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your-email@example.com';
```

Or use the seeded admin: `admin@clickstay.local`

## Project Structure

```
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed data
├── src/
│   ├── app/               # Next.js pages & API routes
│   │   ├── api/           # API endpoints
│   │   ├── admin/         # Admin dashboard
│   │   └── ...            # Public pages
│   ├── components/        # React components
│   │   └── ui/            # shadcn/ui components
│   ├── lib/               # Core libraries
│   │   ├── auth.ts        # Auth.js config
│   │   ├── prisma.ts      # Prisma client
│   │   ├── email/         # Email service
│   │   └── payments/      # PayMongo integration
│   ├── schemas/           # Zod validation schemas
│   └── types/             # TypeScript types
├── docker-compose.yml     # PostgreSQL container
└── package.json
```

## API Endpoints

### Public
- `GET /api/facilities` - List facilities with availability
- `POST /api/bookings/quote` - Get price quote
- `POST /api/bookings` - Create booking
- `POST /api/payments/create` - Create payment intent
- `POST /api/webhooks/paymongo` - PayMongo webhook

### Admin (requires Staff/Admin role)
- `GET /api/admin/reservations` - List all bookings
- `GET /api/admin/facilities` - Manage facilities
- `GET /api/admin/rates` - Manage rate plans
- `GET /api/admin/reports` - Generate reports
- `GET /api/admin/export` - Export bookings CSV

## Deployment (Vercel)

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables (all from `.env.example`)
4. Set Node version to `20.x` in project settings
5. Deploy!

### Database

Use a managed PostgreSQL provider:
- **Vercel Postgres** (recommended)
- **Supabase**
- **Neon**
- **Railway**

Update `DATABASE_URL` in Vercel environment variables.

### Post-Deployment

Run migrations:

```bash
npx prisma migrate deploy
npx prisma db seed
```

## Scripts

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run migrations
npm run prisma:seed      # Seed database
npm run db:reset     # Reset database (dev only)
```

## TypeScript Strictness

This project uses strict TypeScript configuration:
- `strict: true`
- `noUncheckedIndexedAccess: true`
- No `any` types allowed
- All code in `.ts`/`.tsx` files

## License

MIT

## Support

For issues or questions, contact: support@clickstay.local
