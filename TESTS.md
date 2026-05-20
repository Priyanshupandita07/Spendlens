# TESTS.md

All automated tests. Run with: `npm test`

---

## Test File: `src/test/auditEngine.test.ts`

**How to run:**
```bash
npm test
# or watch mode:
npm run test:watch
```

**Framework:** Vitest

---

### Test Coverage

| # | Test Name | What It Covers | File |
|---|-----------|----------------|------|
| 1 | Cursor Business → downgrade for <5 seats | `auditCursor()` recommends downgrade from Business ($40) to Pro ($20) when team is small; validates $40/mo savings at 2 seats | `auditEngine.test.ts` |
| 2 | Cursor Pro → already optimal | `auditCursor()` returns `already_optimal` and zero savings for correct plan | `auditEngine.test.ts` |
| 3 | Claude Max → downgrade to Pro | `auditClaude()` flags Max ($100) as over-provisioned vs Pro ($20); validates $160/mo savings at 2 seats | `auditEngine.test.ts` |
| 4 | Claude Team → no flag for 5+ seats | `auditClaude()` does not flag Team plan when seat count meets minimum | `auditEngine.test.ts` |
| 5 | High Anthropic API spend → Credex opportunity | `auditAPITool()` sets `credexOpportunity: true` and `consider_credits` for $800/mo spend | `auditEngine.test.ts` |
| 6 | Low OpenAI API spend → no action | `auditAPITool()` returns `already_optimal` for $50/mo spend | `auditEngine.test.ts` |
| 7 | Cursor + Windsurf overlap detection | `detectOverlaps()` flags Windsurf as redundant when both Cursor and Windsurf are enabled | `auditEngine.test.ts` |
| 8 | Total savings summation | `runAudit()` correctly sums monthly and annual savings across multiple tools | `auditEngine.test.ts` |
| 9 | Savings category classification | `runAudit()` correctly classifies high/optimal categories based on total savings | `auditEngine.test.ts` |
| 10 | Windsurf wrong use case | `auditWindsurf()` flags Windsurf as wrong tool for writing use case | `auditEngine.test.ts` |

---

## Notes

- All tests cover the audit engine specifically (requirement: minimum 5)
- Tests use pure input/output — no mocking needed since `runAudit` has no side effects
- Tests will be expanded in Day 3 to cover all tool auditors and edge cases
