# SpendLens — AI Tool Spend Auditor

SpendLens is a free web app for startup founders and engineering managers to instantly audit their AI tool spend — finding overspend, wrong plans, and redundant tools — and get a shareable report with exact savings figures.

Built as a lead-generation asset for [Credex](https://credex.rocks), which sources discounted AI infrastructure credits.

---

## Live URL

**https://spendlens-ivory.vercel.app**

---

## Screenshots

### Landing Page
![Landing Page](https://spendlens-ivory.vercel.app/og-image.svg)

> Full screenshots available at the live URL above.

---

## Quick Start

```bash
git clone https://github.com/Priyanshupandita07/Spendlens.git
cd Spendlens
npm install
cp .env.example .env.local
# Fill in Supabase + Anthropic keys
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```

### Run Tests

```bash
npm test
```

### Deploy

```bash
npm install -g vercel
vercel --prod
```

---

## Decisions

### 1. React + Vite over Next.js
The audit engine is entirely client-side logic — no SSR benefit here. Vite is significantly faster to iterate with during a 7-day sprint. Next.js adds server component complexity this project does not need.

### 2. Rule-based audit engine, not AI
The assignment explicitly says hardcoded rules are correct for audit math. AI-generated recommendations would be unpredictable, untestable, and a finance person could not trust them. Every rule is deterministic and traceable to official pricing pages with source URLs.

### 3. Supabase over Firebase
Postgres under the hood — relational, SQL-queryable. Better for filtering leads by savings amount or audit date. Better free tier for this use case. Row-level security keeps lead data safe without a custom auth layer.

### 4. localStorage for form, sessionStorage for results
Form state persists across browser sessions (localStorage). Audit results are session-scoped — shared links reload from Supabase via the /api/audit serverless function.

### 5. Honeypot over CAPTCHA for abuse protection
hCaptcha adds UX friction that hurts lead conversion. A honeypot field catches most bots with zero UX cost. Server-side rate limiting (5 requests/hour per IP) adds a secondary layer in the /api/leads function.
