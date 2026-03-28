# 💰 Personal Finance Tracker

A full-stack personal finance web application built with Next.js, Prisma, SQLite, and Tailwind CSS. Track your income and expenses, view dashboards with charts, and manage transaction categories.

This is a demo video presenting my task:

https://github.com/user-attachments/assets/8f37567c-638e-47b6-8d2d-0b223c42c90c


## 🏗 Architecture Overview

This project is a **Turborepo monorepo** with the following structure:

```
├── apps/
│   └── web/                  # Next.js 15 App Router application
│       ├── src/
│       │   ├── app/
│       │   │   ├── (auth)/        # Auth pages (sign-in, sign-up)
│       │   │   ├── (dashboard)/   # Protected pages (dashboard, transactions, categories)
│       │   │   └── api/           # REST API routes
│       │   ├── components/        # Reusable UI components (shadcn/ui style)
│       │   └── lib/               # Utilities (auth, helpers)
│       └── ...
├── packages/
│   ├── db/                   # Prisma schema, client, migrations, seed
│   └── validators/           # Zod validation schemas (shared)
├── turbo.json                # Turborepo task configuration
├── .github/workflows/ci.yml  # GitHub Actions CI pipeline
└── ...
```

### Tech Stack

| Layer              | Technology              |
| ------------------ | ----------------------- |
| Framework          | Next.js 15 (App Router) |
| Monorepo           | Turborepo + npm workspaces |
| ORM & Migrations   | Prisma                  |
| Database           | SQLite (zero infra)     |
| Styling            | Tailwind CSS + shadcn/ui components |
| Validation         | Zod                     |
| Language           | TypeScript (strict, no `any`) |
| Charts             | Recharts                |

## 🚀 How to Run Locally

### Prerequisites

- **Node.js** >= 20
- **npm** >= 9

### Step-by-step

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd finance-tracker
   ```

2. **Copy environment variables**
   ```bash
   cp .env.example .env
   cp .env.example packages/db/.env
   cp .env.example apps/web/.env
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Generate Prisma Client**
   ```bash
   npm run db:generate
   ```

5. **Run database migrations**
   ```bash
   npm run db:migrate
   ```

6. **Seed the database** (creates demo data)
   ```bash
   npm run db:seed
   ```

7. **Start the dev server**
   ```bash
   npm run dev
   ```

8. **Open the app**  
   Navigate to [http://localhost:3000](http://localhost:3000)

### Demo Credentials

After seeding, you can sign in with:
- **Email:** `demo@example.com`
- **Password:** `password123`

## 📋 Features

### Authentication
- Email + password signup/login
- Secure session-based auth with httpOnly cookies
- Server-side redirect for unauthenticated users (middleware)
- Session scoping — users only see their own data

### Transactions
- Full CRUD (create, read, update, delete)
- Paginated listing with configurable page size
- Filter by type (income/expense) and category
- Sort by date or amount (ascending/descending)
- Search by note text

### Dashboard
- Summary cards: total income, total expenses, current balance
- Income vs. Expenses bar chart (Recharts)
- Recent transactions list
- Fully responsive / mobile-friendly

### Categories (Bonus)
- CRUD for transaction categories
- Seeded defaults: Salary, Food, Rent, Transport, Entertainment, Other
- Protection against deleting categories with linked transactions

### Database
- 2 Prisma migrations checked in:
  1. `init_auth` — User and Session tables
  2. `add_categories_and_transactions` — Category and Transaction tables
- Proper indexes on foreign keys and common query patterns
- Seed script with realistic demo data

## ⚖️ Trade-offs & Decisions

- **SQLite** was chosen for zero-infra local development. For production, you'd swap to PostgreSQL by changing the Prisma datasource.
- **Session-based auth** with cookie + DB lookup was chosen over JWT for simplicity and the ability to revoke sessions. In production, consider adding CSRF protection.
- **shadcn/ui components built manually** rather than using the CLI installer, to keep things minimal and avoid extra dependencies.
- **No Docker** — excluded by choice; the SQLite setup requires zero infrastructure.
- **No external auth library** (e.g., NextAuth) — hand-rolled auth keeps things transparent and avoids unnecessary complexity for this scope.
- **Tailwind v3** used instead of v4 for broader compatibility with current Node.js versions.

## 🔮 What I'd Do With More Time

- **Testing**: Add unit tests for API routes, integration tests for auth flows, and E2E tests with Playwright
- **Rate limiting**: Protect auth endpoints against brute force
- **CSRF protection**: Add CSRF tokens for form submissions
- **Date range filters**: Filter transactions by date range on the dashboard
- **Export**: CSV/PDF export of transactions
- **Dark mode**: Toggle between light and dark themes
- **Docker**: Add `docker-compose.yml` with optional PostgreSQL
- **Live deployment**: Deploy to Vercel with a persistent database

## 🔧 Available Scripts

| Script              | Description                       |
| ------------------- | --------------------------------- |
| `npm run dev`       | Start all apps in dev mode        |
| `npm run build`     | Build all apps                    |
| `npm run lint`      | Lint all packages                 |
| `npm run format`    | Format code with Prettier         |
| `npm run format:check` | Check formatting              |
| `npm run type-check`| TypeScript type checking          |
| `npm run db:generate`| Generate Prisma client           |
| `npm run db:migrate` | Run database migrations          |
| `npm run db:seed`   | Seed database with demo data      |
| `npm run db:studio` | Open Prisma Studio                |
