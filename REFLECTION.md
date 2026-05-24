# REFLECTION.md

---

## 1. The hardest bug I hit this week, and how I debugged it

The hardest bug was a blank white screen on the Vercel deployment that didn't
reproduce locally at all. Locally everything worked perfectly — full landing
page, routing, animations. On Vercel: complete black screen with no visible
error.

My first hypothesis was a build failure — but Vercel showed the deployment as
"Ready" with a green status. That ruled out a compile error.

Second hypothesis: environment variables. I'd left the Supabase keys blank in
Vercel (intentionally, to test the graceful fallback). But I'd written the
Supabase client as `createClient(supabaseUrl, supabaseAnonKey)` with no guard
— when both values are empty strings, the Supabase SDK throws an uncaught
exception: "Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL." This
crash happened at module initialization, before React even mounted, which is
why nothing rendered at all.

I found it by opening DevTools on the live URL (not localhost) and seeing the
red error in the console. The fix was wrapping the `createClient` call in a
validity check — only instantiate the client if both env vars are present and
the URL starts with "http."

What made this hard: the bug only appeared in production because localhost dev
server handles missing env vars differently than Vite's production build. The
lesson — always test the production build locally with `npm run build && npm
run preview` before pushing, not just `npm run dev`.

Second issue in the same session: the CSS `@import` for Google Fonts was placed
after `@import "tailwindcss"` in index.css. CSS spec requires all `@import`
rules before any other statements. Vite's dev server is lenient about this but
the production PostCSS pipeline enforced it strictly, causing all fonts to fail
silently and the layout to break. Fixed by moving the Google Fonts import to
line 1.

---

## 2. A decision I reversed mid-week, and what made me reverse it

Originally I built the lead capture form to call Supabase directly from the
browser using the anon key. This worked fine in isolation — the anon key is
designed for public access with RLS policies.

I reversed this decision on Day 5 when I built the `/api/leads` serverless
function. The reason: I needed to add Resend email sending, and you cannot call
Resend from the browser without exposing the API key. Rather than have two
separate paths (Supabase direct from browser, Resend from server), I moved
everything server-side into one clean endpoint that handles both in sequence.

The serverless function also gave me a better place to put rate limiting and
honeypot validation — logic that should never run on the client where it can be
bypassed.

The tradeoff I accepted: the app now depends on a serverless function for lead
capture, which adds a network round-trip and a potential point of failure. I
handled this by making the function non-blocking on errors — if it fails, the
user still sees the "success" state, and we just lose that lead. Given that
the core audit value is delivered before the email form even appears, this felt
like the right call.

---

## 3. What I would build in week 2 if I had it

**Priority 1: Benchmark mode.**
"Your AI spend per developer is $X — companies your size average $Y." This
turns a one-time audit into an ongoing reference tool. Right now the audit is
absolute (are you on the wrong plan?). Benchmark mode adds relative context
(are you spending more than your peers?). I'd collect anonymized aggregate data
from completed audits and surface it on the results page. This also gives us a
reason to re-engage users — "benchmark data updated, re-run your audit."

**Priority 2: PDF export.**
The assignment lists this as a bonus. Engineering managers want to share the
audit with their CEO or finance team in a format that feels formal. A PDF with
the SpendLens branding, full tool breakdown, and savings summary would make the
tool feel more like a professional report and less like a web app. I'd use
Puppeteer on a serverless function to screenshot the results page and convert
to PDF.

**Priority 3: Embeddable widget.**
A `<script>` tag that bloggers and newsletter authors could embed in their
content. "Check if you're overpaying" as an inline widget would drive
distribution far beyond what landing page traffic can achieve. The widget would
be a simplified 3-field version (tool, plan, seats) that links to the full
audit on SpendLens.

**Priority 4: Saved audits with history.**
Right now each audit is a one-time snapshot. If a user runs an audit every
quarter, they have no way to compare. A simple "sign in with email" flow that
saves audit history would let users track whether their spend is improving. This
also improves Credex's CRM data significantly.

---

## 4. How I used AI tools

**Claude (claude.ai):** Used heavily throughout. Primarily for: generating
boilerplate (Vitest test setup, Vercel serverless function scaffolding), 
debugging TypeScript type errors, drafting the entrepreneurial docs (GTM.md,
ECONOMICS.md), and reviewing audit engine logic for edge cases I might have
missed.

**What I didn't trust Claude with:** The audit engine pricing rules. I manually
verified every price against the official vendor pricing pages (logged in
PRICING_DATA.md with URLs and dates). Claude's training data has a cutoff and
AI tools change pricing frequently — trusting it for specific dollar amounts
would have been a mistake. I also didn't trust it with the user interview
content — those conversations had to be real.

**What I used Claude for in the prompt design:** I asked Claude to play the
role of a "finance-literate person reading the audit reasoning" and tell me
which recommendations felt defensible vs hand-wavy. This caught two rules that
were too vague — the Gemini workspace overlap check and the ChatGPT coding
use-case redirect. I tightened both based on that feedback.

**One specific time the AI was wrong and I caught it:** When I asked Claude to
help write the Gemini audit rule, it suggested flagging Gemini for all use
cases and recommending switching to Claude. I pushed back — Gemini Advanced
includes 2TB Google One storage, making it a reasonable choice for teams
already in the Google ecosystem even for non-coding tasks. The rule needed to
check for Google Workspace usage context, not just flag Gemini universally.
Claude initially missed this nuance because it was optimizing for "find
savings" rather than "give accurate advice."

---

## 5. Self-ratings

**Discipline: 7/10**
I committed on at least 5 distinct calendar days and wrote a DEVLOG entry every
day. I didn't cram everything into the last 2 days. Lost a point because Day 2
had a deployment debugging session that ate 2 hours I planned to use on the
audit engine edge cases.

**Code quality: 7/10**
The audit engine is clean, testable, and readable — I'm happy with it. The
React components got messier as the week went on, especially ResultsPage which
accumulated too many responsibilities. In week 2 I'd split it into smaller
components. TypeScript is used throughout with proper types, no `any` shortcuts.

**Design sense: 6/10**
The dark theme with green accents is intentional and consistent. The landing
page layout has some alignment issues on mobile. The results page hero savings
card looks good. I underinvested in spacing and typography polish — everything
works but it doesn't feel as premium as it could.

**Problem-solving: 8/10**
Debugged the Vercel blank screen quickly once I looked at the right place
(production DevTools, not localhost). Made good architectural calls: rule-based
audit engine instead of AI, serverless for API key protection, honeypot instead
of CAPTCHA. The decision to move lead capture server-side was the right call
even though it added complexity.

**Entrepreneurial thinking: 7/10**
The GTM and ECONOMICS docs have real specificity — named subreddits, actual
funnel math, a realistic path to $1M ARR with monthly milestones. I did 3 real
user interviews which changed the design in concrete ways (documented in
USER_INTERVIEWS.md). Lost points because I would have invested more in the
landing page copy and social proof if I had another day.
