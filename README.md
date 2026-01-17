# FlexPay

A modern SaaS application for automating recurring PayPal payments to your team, contractors, and vendors.

## Features

- **Recurring Payments**: Set up one-time, weekly, bi-weekly, monthly, or custom payment schedules
- **Recipient Management**: Add and manage payment recipients with default amounts
- **PayPal Integration**: Connect your PayPal Business account using API credentials
- **Transaction History**: Track all payments with status updates
- **Dashboard**: Overview of upcoming payments, recent activity, and quick stats
- **Vercel Cron**: Automated payment processing on schedule

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: SQLite (local) / Vercel Postgres (production)
- **ORM**: Prisma
- **Auth**: NextAuth.js v4
- **Styling**: Tailwind CSS + Shadcn/UI
- **Payments**: PayPal Payouts API
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- PayPal Business Account with API credentials

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/graphcs/FlexPay.git
   cd FlexPay
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your settings:
   ```
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_URL="http://localhost:3001"
   NEXTAUTH_SECRET="your-secret-key"
   ```

4. Set up the database:
   ```bash
   npx prisma db push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3001](http://localhost:3001)

## Usage

### 1. Create an Account
Register with your email and password on the signup page.

### 2. Connect PayPal
Navigate to "Connect" in the dashboard and enter your PayPal API credentials:
- Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/applications/sandbox)
- Create or select an app
- Copy your **Client ID** and **Secret**
- Choose **Sandbox** for testing or **Live** for production

### 3. Add Recipients
Go to "Recipients" and add the people you want to pay with their PayPal email addresses.

### 4. Create Schedules
Navigate to "Schedules" and create a new payment schedule:
- Select recipients and amounts
- Choose frequency (one-time, weekly, bi-weekly, monthly, custom)
- Set start date

### 5. Monitor Transactions
View payment history and status in the "Transactions" section.

## Project Structure

```
flexpay/
├── app/
│   ├── (marketing)/        # Public pages (landing, pricing)
│   ├── (auth)/             # Auth pages (login, register)
│   ├── (dashboard)/        # Protected dashboard pages
│   └── api/                # API routes
│       ├── auth/           # NextAuth endpoints
│       ├── paypal/         # PayPal connect/disconnect
│       ├── recipients/     # Recipients CRUD
│       ├── schedules/      # Schedules CRUD
│       ├── transactions/   # Transactions
│       └── cron/           # Vercel Cron endpoint
├── components/
│   ├── ui/                 # Shadcn/UI components
│   └── dashboard/          # Dashboard components
├── lib/
│   ├── auth.ts             # NextAuth configuration
│   ├── db.ts               # Prisma client
│   ├── paypal.ts           # PayPal API client
│   └── utils.ts            # Utility functions
├── prisma/
│   └── schema.prisma       # Database schema
└── vercel.json             # Vercel Cron configuration
```

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/*` | - | NextAuth endpoints |
| `/api/paypal/connect` | POST | Connect PayPal credentials |
| `/api/paypal/disconnect` | POST | Disconnect PayPal |
| `/api/recipients` | GET, POST | List/create recipients |
| `/api/recipients/[id]` | GET, PUT, DELETE | Manage recipient |
| `/api/schedules` | GET, POST | List/create schedules |
| `/api/schedules/[id]` | GET, PUT, DELETE | Manage schedule |
| `/api/transactions` | GET | List transactions |
| `/api/cron/process-payments` | GET | Process due payments |

## Deployment

### Vercel

1. Push to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `DATABASE_URL` (Vercel Postgres connection string)
   - `NEXTAUTH_URL` (your production URL)
   - `NEXTAUTH_SECRET` (secure random string)
   - `CRON_SECRET` (optional, for cron security)

4. Deploy

The cron job is configured in `vercel.json` to run every hour.

## PayPal Setup

### Sandbox Testing
1. Create a [PayPal Developer Account](https://developer.paypal.com/)
2. Create sandbox business and personal accounts
3. Create an app and get sandbox credentials
4. Use sandbox mode in FlexPay

### Production
1. Upgrade to PayPal Business account
2. Enable PayPal Payouts
3. Create a live app in PayPal Developer Dashboard
4. Use live credentials with "Live" mode in FlexPay

## License

MIT
