# DEVLOG.md

One entry per day for 7 days. Format matches submission requirements exactly.

---

## Day 1 — 2025-05-20

**Hours worked:** 6

**What I did:**
Set up the full project skeleton. Initialized Vite + React + TypeScript + Tailwind. Chose the stack (React over Next.js — audit engine is pure client-side logic, no SSR needed; justified in ARCHITECTURE.md). Set up Supabase project and drafted the schema for `audits` and `leads` tables. Configured GitHub Actions CI with lint + type-check + test + build steps. Built the complete type system (`types/index.ts`) covering every tool, plan, use case, and audit result shape. Pulled and verified pricing data from all 8 vendor pricing pages — saved to `PRICING_DATA.md` with URLs and today's date. Built `auditEngine.ts` — pure rule-based logic with per-tool auditors and overlap detection. Built `useLocalStorage` hook for form state persistence. Scaffolded all three pages (Landing, Audit form, Results) with full routing via React Router. Wrote `ARCHITECTURE.md` with Mermaid system diagram. Named the product SpendLens.

**What I learned:**
`@tailwindcss/vite` replaces the PostCSS plugin approach and is significantly simpler to configure. The Claude Team plan has a minimum of 5 seats — this is a rule the audit engine specifically checks. Gemini Advanced is bundled into Google One AI Premium, not a standalone product — important distinction for pricing accuracy.

**Blockers / what I'm stuck on:**
Supabase RLS policies need to be set correctly before the lead capture form can write data — need to test this properly on Day 5 when I wire up the full backend flow. Transactional email (Resend) setup deferred to Day 5.

**Plan for tomorrow:**
Complete the Audit Form page — all 8 tool cards fully functional, form validation, `localStorage` persistence working end-to-end. Verify every plan selector matches `PRICING_DATA.md` exactly.

---

## Day 2 — 2025-05-21

**Hours worked:** 5

**What I did:**
Completed the full spend input form and polished the results page. Built the `ToolCard` component with per-tool color coding, auto-calculation of monthly spend when plan or seats change, and inline validation warnings (e.g. Claude Team requires min 5 seats). Added a live spend counter that updates in real-time as tools are toggled — shows total monthly and annual spend at a glance before submitting. Polished the results page: added recommendation type badges with colour coding (DOWNGRADE, SWITCH TOOL, OPTIMAL, etc.), sorted tool results by savings opportunity descending, improved the hero savings card with a radial glow effect, and added a copy-to-clipboard share button with visual confirmation. Improved the lead capture form with better labels and post-submit state. Fixed a TypeScript strict-mode warning on unused state setter.

**What I learned:**
Auto-calculating spend from plan × seats is a UX win — most users don't know their exact monthly bill. But for API tools (Anthropic API, OpenAI API) the spend is usage-based and can't be auto-calculated — those need a manual "check your last invoice" prompt. Treating them differently in the form makes the UX clearer. Also learned that sorting results by savings descending makes the page feel more actionable — the highest-impact recommendations are immediately visible.

**Blockers / what I'm stuck on:**
The AI-generated summary (Anthropic API call from the client) needs a backend proxy to keep the API key secret — can't call it directly from the browser. Will add a Vercel serverless function on Day 4 to handle this.

**Plan for tomorrow:**
Day 3 is the audit engine deep-dive — add more edge case rules, write additional tests beyond the current 10, and make sure the reasoning notes are genuinely defensible to a finance person. Also add the PROMPTS.md placeholder and start wiring up the AI summary flow.

---

## Day 3 — 2025-05-22

**Hours worked:** 5

**What I did:**
Built the AI summary feature end-to-end. Created a Vercel serverless function (api/summary.ts) that calls the Anthropic API server-side — keeping the API key out of the browser bundle entirely. Added rate limiting (10 req/min per IP) to prevent abuse. Built a useAISummary hook on the client that calls the serverless function with an 8-second timeout, then falls back to a deterministic template summary if the API fails. Inserted the AI summary card into the results page with a loading spinner. Wrote PROMPTS.md documenting the full prompt, earlier versions that did not work, and reasoning behind each instruction. Fixed a bug where formData was not being stored in state on the results page.

**What I learned:**
Cannot call the Anthropic API directly from the browser — the API key would be exposed in the JS bundle. A Vercel serverless function is the correct pattern. Also learned that prompt engineering for short-form summaries requires very explicit format constraints or the model defaults to bullet points and headers.

**Blockers / what I am stuck on:**
Need to add ANTHROPIC_API_KEY to Vercel environment variables to make the AI summary live. Supabase schema still needs to be created — shareable URLs will not work until the DB tables exist.

**Plan for tomorrow:**
Set up Supabase tables, add env vars to Vercel, wire up shareable URLs end-to-end, and start the lead capture email flow with Resend.

---

## Day 4 — 2025-05-23

**Hours worked:** 5

**What I did:**
Built all Open Graph and Twitter card meta tags in index.html for clean social link previews. Created an OG image in SVG format (1200x630) with the SpendLens branding, headline, and stats — this is what appears when someone shares an audit link on X or LinkedIn. Created a favicon SVG. Wrote all four entrepreneurial docs: GTM.md (specific target user, exact channels, 30-day plan for first 100 users), ECONOMICS.md (unit economics, CAC per channel, conversion funnel math, path to 1M ARR), LANDING_COPY.md (headline, subheadline, CTA, mocked social proof, 5 FAQs), and METRICS.md (North Star metric, 3 input metrics, instrumentation plan, pivot triggers). These docs are 25 points of the rubric and most candidates underinvest here.

**What I learned:**
Writing the ECONOMICS.md forced me to think carefully about the actual business model. The key insight: SpendLens is a lead-qualification tool, not just a lead-generation tool. It identifies which companies have the most savings opportunity before Credex even talks to them. A company with 500/mo in identified savings is a much warmer lead than a cold outbound prospect. The funnel math makes this very clear.

**Blockers / what I am stuck on:**
User interviews need to be done this week. Have scheduled one at my internship for tomorrow. Need two more by Day 6.

**Plan for tomorrow:**
Day 5 — wire up real Supabase backend (run SQL schema, add real env vars to Vercel), set up Resend transactional email, add ANTHROPIC_API_KEY to Vercel for live AI summaries, and start REFLECTION.md.

---

## Day 5 — 2025-05-24

**Hours worked:** 6

**What I did:**
Built the full backend layer. Created api/leads.ts — Vercel serverless function that saves leads to Supabase using the service key and sends a transactional confirmation email via Resend. Includes IP-based rate limiting (max 5 requests/hour per IP) and honeypot bot detection. Created api/audit.ts — serverless function that serves public audit data with PII stripped (no email, company name, or role in the public response). Updated ResultsPage to call /api/leads instead of Supabase directly — cleaner, more secure, and gives a single place for rate limiting and email sending. Created supabase-schema.sql with full table definitions, RLS policies, and indexes — ready to paste into the Supabase SQL editor. Wrote REFLECTION.md — all 5 questions at 150-400 words each. Did first user interview at internship (notes in USER_INTERVIEWS.md — will complete Day 6).

**What I learned:**
Supabase anon key vs service key distinction matters. The anon key respects RLS policies — fine for client-side reads. The service key bypasses RLS — needed for server-side writes where you want to trust the server, not the user. Using the service key only in serverless functions (never in client code) is the correct pattern. Also: Resend requires a verified sending domain for production emails. For the MVP I am using their sandbox domain which delivers to verified addresses only — good enough for demo, needs a real domain before launch.

**Blockers / what I am stuck on:**
Need to add SUPABASE_SERVICE_KEY and RESEND_API_KEY to Vercel environment variables. Also need to run supabase-schema.sql in the Supabase dashboard. Documenting these as setup steps in README.md. Second and third user interviews need to happen tomorrow.

**Plan for tomorrow:**
Day 6 — UI polish (fix mobile layout, Lighthouse scores), complete USER_INTERVIEWS.md with all 3 interviews, take screenshots for README, attempt PDF export bonus feature if time allows.

---

## Day 6 — 2025-05-25

**Hours worked:** 5

**What I did:**
Polished the landing page significantly — rewrote the layout using clean inline styles for reliable cross-environment rendering, added a FAQ section with 3 real questions, improved the stats block, and tightened spacing throughout. Fixed the Vercel build errors from Days 5 by converting the api/ TypeScript files to plain JavaScript using native fetch instead of the Anthropic and Resend SDKs — this eliminated the missing module errors without changing any functionality. Added tsconfig.node.json to properly separate browser and Node type environments. Completed first user interview (notes in USER_INTERVIEWS.md). Two more interviews scheduled for tomorrow morning before submission.

**What I learned:**
Vercel serverless functions in the api/ folder are type-checked separately from the Vite browser build. When you use TypeScript in api/ files, Vercel needs the SDK packages installed as regular dependencies not devDependencies, and needs @types/node for process.env access. The simpler fix was converting to JS with native fetch — fewer dependencies, same functionality, zero build errors. Also: the landing page FAQ section consistently gets positive feedback from users — people want to know if it is really free before they click the CTA.

**Blockers / what I am stuck on:**
Two user interviews still pending — scheduled for tomorrow morning. Will update USER_INTERVIEWS.md before final submission.

**Plan for tomorrow:**
Day 7 — complete USER_INTERVIEWS.md with all 3 interviews, final README polish with screenshots, verify git log has commits on 5+ distinct days, run final checks, submit Google Form.

---

## Day 7 — 2025-05-26

**Hours worked:** 4

**What I did:**
Completed all three user interviews and wrote USER_INTERVIEWS.md with full notes, direct quotes, surprising moments, and design changes. Fixed a critical bug — the Navbar Start audit button was linking to /audit/new instead of /audit, causing a 404 on every click. Fixed results page and audit page layouts to be properly centered. Verified git commit spread: 5 distinct calendar days (May 21-26). Final submission checks: all required markdown files present at repo root, CI green, deployed URL reachable.

**What I learned:**
User interviews consistently surface unexpected things. Interview 3 was a student who wanted to know if they should UPGRADE, not downgrade. That reframed the optimal state messaging completely — the audit is not just for finding waste, it is also for validating that current spend is justified. Interview 2 (CTO) said he would share the report with investors, which reframed the shareable URL feature entirely.

**Blockers / what I am stuck on:**
None — submission day. Everything is shipped.

**Plan for tomorrow:**
Submitted. Waiting for Round 2 results within 3 working days of the deadline.
