# TESTS.md

All automated tests. Run with: `npm test`

---

## Test File: `src/test/auditEngine.test.ts`

**How to run:**
```bash
npm test
# watch mode:
npm run test:watch
```

**Framework:** Vitest  
**Total tests:** 17 passing

---

| # | Test Name | What It Covers |
|---|-----------|----------------|
| 1 | Cursor Business → downgrade for <5 seats | `auditCursor()` recommends downgrade; validates $40/mo savings at 2 seats |
| 2 | Cursor Pro → already optimal | Returns `already_optimal` and zero savings |
| 3 | Claude Max → downgrade to Pro | Flags Max as over-provisioned; validates $160/mo savings at 2 seats |
| 4 | Claude Team → no flag for 5+ seats | Does not flag Team plan at minimum seat count |
| 5 | High Anthropic API spend → Credex opportunity | Sets `credexOpportunity: true` for $800/mo spend |
| 6 | Low OpenAI API spend → no action | Returns `already_optimal` for $50/mo |
| 7 | Cursor + Windsurf overlap | `detectOverlaps()` flags Windsurf as redundant |
| 8 | Total savings summation | Correctly sums monthly and annual savings across tools |
| 9 | Savings category classification | Correctly classifies high/optimal categories |
| 10 | Windsurf wrong use case | Flags Windsurf as wrong tool for writing |
| 11 | Copilot Enterprise → downgrade for <10 seats | $80/mo savings at 4 seats |
| 12 | Copilot flagged for non-coding use case | Returns `switch_tool` for writing use case |
| 13 | ChatGPT Team → downgrade for <=2 users | $20/mo savings at 2 seats |
| 14 | Gemini for coding → suggests Copilot | Returns `switch_tool` with `alternativeTool: 'GitHub Copilot'` |
| 15 | Claude + ChatGPT overlap for research | ChatGPT flagged as redundant when Claude also active |
| 16 | Disabled tools excluded from audit | Only enabled tools appear in `toolResults` |
| 17 | Zero spend edge case | Handles $0 monthly spend without throwing |
