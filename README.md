# SpendLens — AI Tool Spend Auditor

SpendLens is a free web app for startup founders and engineering managers to instantly audit their AI tool spend — finding overspend, wrong plans, and redundant tools — and get a shareable report with exact savings figures.

Built as a lead-generation asset for [Credex](https://credex.rocks), which sources discounted AI infrastructure credits.

---

## Live URL

> _Vercel deployment URL — add after first deploy_

---

## Screenshots

> _Add screenshots / Loom link at end of Day 6_

---

## Quick Start

```bash
git clone https://github.com/YOUR_USERNAME/spendlens.git
cd spendlens
npm install
cp .env.example .env.local
# Fill in Supabase + Resend keys
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
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
Audit engine is entirely client-side — no SSR benefit here. Vite is faster for a 7-day sprint. Next.js adds server complexity this project doesn't need.

### 2. Rule-based audit engine, not AI
The assignment says hardcoded rules are correct for audit math. AI-generated recommendations would be untestable and a finance person couldn't trust them. Rules are deterministic and traceable to official pricing pages.

### 3. Supabase over Firebase
Postgres under the hood — relational, SQL-queryable. Better for filtering leads by savings amount or audit date. Better free tier for this use case.

### 4. localStorage for form, sessionStorage for results
Form state persists across browser sessions (localStorage). Audit results are session-scoped — shared links reload from Supabase directly.

### 5. Honeypot over CAPTCHA
hCaptcha adds UX friction that hurts lead conversion. A honeypot catches most bots with zero UX cost. Supabase rate limiting adds a secondary layer.
