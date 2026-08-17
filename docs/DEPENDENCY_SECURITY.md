# Multi-Worker Dependency Security Runbook

The supplied deployment report claims nine vulnerabilities for both the Alchemical and KCD2-AI workers and zero for Genesis Cure Foundation. These counts are not authoritative until the source repositories and lockfiles are audited in the current environment.

## Required audit procedure

Run the audit from each worker’s source root:

```bash
pnpm install --frozen-lockfile
pnpm audit --json > vulnerabilities.json
pnpm audit
```

Review the advisory path, affected package, fixed version, runtime exposure, and whether the package is a development-only dependency. Do not run `npm audit fix --force` as an unattended step. Make explicit package changes, regenerate the lockfile, and repeat `pnpm check`, tests, `pnpm build:verified`, and `pnpm exec wrangler deploy --dry-run`.

| Reported item | Repository treatment |
| --- | --- |
| Five high vulnerabilities | Requires source lockfile and advisory paths; no automatic forced fix |
| One moderate vulnerability | Requires package ownership and runtime exposure review |
| Three low vulnerabilities | Record and triage; do not assume non-exploitability without context |
| Ignored install scripts | Review pnpm approval policy per package; never approve scripts solely to silence a warning |
| `url.parse()` warning | Upgrade the responsible dependency when a compatible release is available |

## Secrets and deployment safety

Do not commit Cloudflare API tokens, GitHub tokens, wallet keys, exchange keys, or webhook secrets. Use the provider’s secret store or CI environment. The previously exposed GitHub token in this conversation must remain revoked and must not be reused.

A vulnerability report, HTTP 200 response, or successful Wrangler dry run does not prove application security. Production promotion requires dependency review, secret review, asset validation, and an authorized deployment approval.
