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

<!-- Day 2–7 entries will be added each day -->
