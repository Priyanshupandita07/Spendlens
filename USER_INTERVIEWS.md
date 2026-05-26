# USER_INTERVIEWS.md

Notes from three real conversations with potential users.
Each interview was 10–15 minutes. Conducted during the week of May 20–26, 2025.

---

## Interview 1 — R.D., Digital & AI Consultant

**Name:** R.D. (anonymous on request)
**Role:** Digital & AI Consultant, Group Digital Team
**Company:** Large manufacturing conglomerate (undisclosed)
**Company stage:** Enterprise — multinational, manufacturing + corporate functions
**Date:** 2025-05-25
**How contacted:** Personal network — colleague connection

**Context:**
R.D. manages AI tool adoption and spend across a large enterprise Group Digital Team. Their current stack includes Microsoft Copilot Enterprise, Databricks AI Stack for their Data & AI Platform, plus free tools like Figma Make, ChatGPT, and Google AI Studio. They are actively evaluating an enterprise AI subscription for Microsoft Copilot at approximately Rs. 40,000/month.

**Direct quotes:**
- "We use many free AI tools such as Figma Make, ChatGPT, Google AI Studio, but we are planning to take enterprise AI subscription for Microsoft Copilot which will cost 40K per month."
- "I would benchmark it on the basis of the complex structure of services and use cases we are catering to across manufacturing and corporate functions."
- "If it tells us exactly where to spend and invest on, and tell us more on probable strategies and alternate tools we could use in place of our as-is tools — that would be most useful."
- "Architecture and training of the AI tool — the biasness, rules and ethics — that is what I would want to understand before trusting any recommendation."

**The most surprising thing they said:**
The 40K/month Microsoft Copilot enterprise budget was surprising — not because it is large, but because it sits alongside a full suite of free tools they actively use daily. The team has not yet consolidated or audited whether the paid tool actually displaces the free ones or just adds to the stack. This is exactly the overlap problem SpendLens is built to catch, but at enterprise scale it is a much larger conversation involving procurement, compliance, and multi-department sign-off. I had assumed the typical user would be a 5–15 person startup. This interview showed the problem exists at every scale.

**What it changed about your design:**
Two things. First, I added "alternate tools" language to the audit recommendations — R.D. explicitly said they want to know what they could use *instead* of their current tools, not just whether they are on the right plan. The audit engine already does this (switch_tool recommendations) but the UI language was too focused on savings numbers. Second, it made me think harder about the benchmark mode — R.D. said they would evaluate the tool based on whether it accounts for complexity of use cases across functions. A simple "you could save X" is not enough for enterprise buyers; they want strategic context. This validated the benchmark mode as a high-priority Week 2 feature.

---

## Interview 2 — A.P., CTO at BitePay

**Name:** Alok Pandita
**Role:** CTO
**Company:** BitePay (startup)
**Company stage:** Early-stage startup
**Date:** 2025-05-26
**How contacted:** Personal network

**Context:**
Alok has worked across multiple startup environments including BitePay and an internship at StapuBox. His team uses ChatGPT, Claude, GitHub Copilot, Firebase AI integrations, and productivity AI tools across debugging, code generation, documentation, UI improvements, and research workflows.

**Direct quotes:**
- "AI spending is fragmented across subscriptions, API usage, and different team members. You know you are spending money, but you rarely know whether the ROI is actually justified."
- "Why are we paying for both Claude and ChatGPT? Are developers actually using all these tools? Can free alternatives handle some tasks?"
- "Right now I probably could not benchmark our AI spend accurately. I would rely on Reddit discussions, founder communities, Twitter/X conversations, or asking other developers directly. There is no clean benchmark dashboard for this."
- "If it actually helps reduce costs without slowing productivity, people would keep using it."

**The most surprising thing they said:**
Alok said he would share the audit report with investors. I had assumed the primary sharing use case was team-internal. But he immediately framed it as an investor conversation — startups present cost optimization as a signal of operational maturity. This reframed who the shareable URL is actually for. It is not just for internal team decisions, it is a document you could put in a board update to show you are running a tight ship.

**What it changed about your design:**
Two things. First, the share button copy is neutral enough to work for both internal and investor sharing. Second, it validated PDF export as a high-priority Week 2 feature — a clean PDF is far more appropriate for investor sharing than a web link. Alok also specifically said trust depends on transparency of reasoning, which confirmed the decision to show full reasoning notes per tool rather than just savings numbers.

---

## Interview 3 — S.K. (anonymous), Student & Developer

**Name:** Initials withheld on request
**Role:** Student / independent developer
**Company stage:** Individual — uses AI tools for personal projects and studies
**Date:** 2025-05-26
**How contacted:** Personal network — friend who uses Claude daily

**Context:**
This person is a student who uses Claude Pro ($20/mo) daily for studying, building personal projects, and general productivity. They represent the individual developer segment — not a startup, but a real paying user who thinks carefully about whether their subscription is worth it.

**Direct quotes:**
- "I pay for Claude and I spend $20 per month."
- "I don't think I am overpaying because it helps me a lot — studying, making projects, and many more things."
- "It will be very useful to know if I am overspending or not — maybe I can switch to the Max Claude version."

**The most surprising thing they said:**
They mentioned potentially upgrading to Claude Max, not downgrading. Every other interview was about finding waste and cutting costs. This user was thinking about whether they were getting enough value — whether to spend more, not less. This flipped my assumption that all users come to SpendLens wanting to save money. Some users come wanting to know if they should invest more in a tool they already love. The audit engine handles this — it marks Claude Pro as already optimal for individual users — but the results page copy was too focused on savings. Users who are already optimal need validation, not just a "you're spending well" message.

**What it changed about your design:**
I updated the optimal state message to be more affirming — "Your stack is well-optimised" with a note about when to re-run the audit (team growth, new tools). I also added context about when upgrading makes sense, not just when to downgrade. This interview also confirmed that individual developers are a real user segment worth targeting in the GTM plan, not just startup CTOs and engineering managers.
