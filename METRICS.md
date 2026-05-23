# METRICS.md

## North Star Metric

**Audits completed per week**

Why: An audit completed means a user got value — they filled in their stack and
saw their results. It's the moment the product delivers on its promise. Every
downstream metric (email captures, Credex leads, consultations) is a function
of audits completed. DAU would be wrong because this is a tool people use once
a quarter, not daily. Revenue would be premature — the tool is free and Credex
conversion happens offline. Audits completed is the one number that tells us
if the product is working.

Target for Week 1: 50 audits completed.
Target for Month 1: 500 audits completed.

---

## 3 Input Metrics

**1. Audit start rate (visitors → click "Audit my AI spend")**
Target: >35%
Why it matters: If people land and don't start, the landing page is failing.
Low start rate = fix the headline, the social proof, or the above-the-fold CTA.

**2. Audit completion rate (started → submitted)**
Target: >55%
Why it matters: If people start but don't finish, the form is too long or
confusing. Specific drop-off tracking (which tool card causes abandonment) tells
us what to fix. This is the biggest lever on audits completed.

**3. Email capture rate (completed audit → entered email)**
Target: >20%
Why it matters: Email = a lead. Below 20% means the results page isn't
delivering enough value to earn the ask, or the CTA copy is wrong.
Above 30% means we should push harder on the Credex consultation CTA.

---

## What to Instrument First

In priority order:

1. **Audit completed event** — fire when user lands on `/results/:id`. This is
   the North Star. Without it, we're flying blind.

2. **Audit started event** — fire when user clicks "Audit my AI spend" CTA.
   Needed to calculate start rate.

3. **Tool toggle events** — which tools get enabled most. Tells us which tools
   to prioritise adding more audit rules for.

4. **Email captured event** — fire on successful lead form submission. Needed
   for email capture rate.

5. **Share link clicked** — fire when user clicks "Share this audit." The viral
   coefficient depends entirely on this number.

6. **Credex CTA clicked** — fire when high-savings user clicks "Book a Credex
   consultation." This is the direct revenue signal.

Tool: Plausible Analytics (privacy-friendly, $9/mo) or Posthog free tier for
session recordings to see where users drop off.

---

## Pivot Trigger

**If audit completion rate drops below 30% for 2 consecutive weeks, run a
full UX audit of the form.**

Specifically:
- Add per-step drop-off tracking (which tool card causes exits)
- Run 3 user interviews focused on the form experience
- Consider reducing the form to 3 tools (most popular) with an "add more" option

**If email capture rate stays below 10% for 4 weeks, rethink the results page.**

Either the audit quality is too low (users don't believe the savings numbers)
or the ask is too early. Try: show the full results immediately with the email
gate only for PDF export or sharing.

**If 0 Credex consultations are booked in the first month:**
The high-savings threshold ($500/mo) may be too high for the actual user base.
Lower it to $200/mo and increase Credex CTA prominence. Also check if
high-savings users are actually seeing the CTA (could be a UI issue).
