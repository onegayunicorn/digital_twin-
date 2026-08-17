# Oneness Architecture Deployment Review

## Scope and evidence status

The supplied `pasted_content_2.txt` describes three Cloudflare Workers, their reported URLs, build durations, asset counts, and vulnerability counts. Those values are preserved as **reported claims**, not independently verified deployment facts. The repository now contains read-only verification tooling and configuration templates so the claims can be checked without publishing or mutating external services.

| Worker | Reported status | Verification path |
| --- | --- | --- |
| `genesis-cure-foundation` | Reported HTTP 200 and zero vulnerabilities | `pnpm verify:workers`; run a separate dependency audit in its source repository |
| `alchemical` | Reported HTTP 200 and nine vulnerabilities | `pnpm verify:workers`; inspect its own lockfile and audit report |
| `kcd2-ai` | Reported HTTP 200 and nine vulnerabilities | `pnpm verify:workers`; inspect its own lockfile and audit report |

## Repository additions

The worker templates live under `infra/cloudflare/workers/`. Each template sets an explicit worker name, compatibility date, `workers_dev`, `preview_urls`, and `assets.directory: ./dist` with SPA fallback. The Identity Forge production application remains a separate root contract with `web-app/dist/public`.

The `scripts/cloudflare/verify-workers.mjs` utility performs read-only GET requests. It does not deploy, mutate DNS, change bindings, or infer vulnerability status from an HTTP response. Use `--strict` in CI only after the worker URLs are confirmed as the intended environments.

## Safe interpretation of the supplied report

The report’s statement that workers are “live” may be accurate, but it is not a substitute for current checks. Build IDs, asset counts, package counts, and vulnerability counts become stale. The repository therefore does not copy those values into an authoritative release manifest. It records the source file and uses reproducible commands to obtain current results.

The recommendation to run `npm audit fix --force` is intentionally not automated. Forced dependency upgrades can introduce breaking changes, silently alter lockfiles, or move a vulnerable transitive package into an incompatible range. The safer sequence is: generate a JSON audit report, inspect advisories and dependency paths, update direct dependencies intentionally, run type checks/tests/builds, and then deploy a dry run.

## Release contract

The main application uses:

```text
Root directory: /
Install: pnpm install --frozen-lockfile
Build: pnpm build:verified
Preflight: pnpm preflight
Deploy: pnpm exec wrangler deploy
```

Standalone workers should use their own application directory and the matching `./dist` configuration template. Do not combine multiple unrelated Worker outputs into the Identity Forge asset directory.

## Recommended next steps

First, run `pnpm verify:workers` from a network-enabled environment and save the output as a timestamped operational record. Second, obtain the source repositories and lockfiles for `alchemical` and `kcd2-ai`; vulnerability remediation cannot be accurately performed from a deployment summary alone. Third, apply dependency updates one worker at a time, repeat the build and dry run, and only then request a public deployment. Finally, enable Cloudflare observability and alerting after the correct account, zones, and environment names have been confirmed.
