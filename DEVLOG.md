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

<!-- Day 4-7 entries will be added each day -->
