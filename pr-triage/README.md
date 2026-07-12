# pr-triage

**Risk-rank a diff so humans review the 20% that actually matters.**

```bash
git diff main | npx pr-triage        # rank what you're about to merge
npx pr-triage change.patch           # rank a saved PR patch
npx pr-triage --ref main --top 10    # let it run git diff itself
```

Read-only. Offline. Zero dependencies.

---

## Why

Developers now spend more time reviewing AI-generated code than writing their
own — and "almost right, but not quite" is the top frustration. When a PR is
bigger than you can meaningfully read, the question isn't *whether* to skim,
it's *what not to skim*. pr-triage answers that: every hunk gets a risk score,
worst first.

## What raises a hunk's score

| Signal | Why it matters |
|--------|----------------|
| auth / crypto / payment / session paths | highest blast radius per wrong line |
| schema & migration files, dependency manifests, config/infra | breaks everyone downstream |
| **error handling or validation removed** | the classic silent regression |
| no matching test change for the file | nothing will catch the mistake |
| placeholder/`TODO`/"implement this" left in additions | unfinished AI output |
| credential-shaped strings in additions | secrets don't belong in diffs |
| dense new branching, regex changes, async/concurrency | where reviewers miss bugs |
| very large hunks | review fatigue hides defects |

Documentation-only hunks are damped toward zero — a README can't crash prod.

## Output

```
pr-triage — 4 files · 6 hunks · +212/-38

  REVIEW FIRST  72  src/auth/login.ts:10
        -try {
        auth/crypto/payment path · error handling removed · no test change for this file
  SKIM          10  src/utils/format.ts:88
  LOW            1  README.md:1
```

`--json` for machines; `--min-score <n>` exits 1 when the top hunk scores ≥ n —
an attention gate for CI ("this PR needs a real review, not a rubber stamp").

## Honest limits

Heuristic, path/content-based — it ranks *where to look*, it does not judge
correctness. A low score is not an approval; pair it with tests and a brain.

## Sibling tools (AI dev hygiene suite)

[`ai-instruct-sync`](https://www.npmjs.com/package/ai-instruct-sync) · [`ai-setup-doctor`](https://www.npmjs.com/package/ai-setup-doctor) · [`mcp-config-sync`](https://www.npmjs.com/package/mcp-config-sync) · `agent-skill-scan` · `agent-spend-guard`

## License

MIT
