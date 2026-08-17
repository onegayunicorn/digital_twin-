# Identity Forge Trigger and Webhook Release Checklist

## Full Content Release

- [x] Create the additional Wealth Bridge simulation files and folders represented in the supplied content.
- [x] Keep wealth, trading, wallet, NFT, blockchain, and quantum examples simulation-only.
- [x] Run the complete web, Python, webhook, artifact, and Wrangler validation suite.
- [x] Commit and push the tested full-content release.


- [x] Create the requested platform folders and README boundaries.
- [x] Add authoritative Cloudflare deployment and SPA fallback settings.
- [x] Add idempotent trigger and webhook handler modules.
- [x] Add signed webhook verification, replay protection, and audit logging boundaries.
- [x] Add GitHub, Cloudflare, research, infrastructure, and integration documentation.
- [x] Add webhook and trigger tests without external side effects.
- [x] Validate web checks, build, artifact preflight, tests, and Wrangler dry run.
- [x] Commit and push the completed trigger/webhook release.
- [ ] Revoke exposed credentials after use; user action required.

## Safety boundary

Triggers and webhooks remain local or explicitly gated. No live trading, wallet transfers, NFT minting, or financial automation is enabled.

## Multi-Worker Content Release

- [x] Preserve both supplied content files under `docs/source/`.
- [x] Create the three standalone Wrangler configuration templates under `infra/cloudflare/workers/`.
- [x] Create the read-only multi-worker HTTP verification script.
- [x] Add the Oneness Architecture and dependency-security runbooks.
- [x] Run typecheck, tests, webhook tests, build, Python tests, artifact preflight, Wrangler dry run, and worker URL checks.
- [x] Commit and push this multi-worker content release.

## Cloudflare Asset Directory Repair

- [x] Inspect the active Wrangler manifest, build script, and Cloudflare dashboard root/build settings.
- [x] Align the build output directory with `assets.directory` and make the deploy command run after the build.
- [x] Run build, preflight, Wrangler dry run, and repository hygiene checks.
- [ ] Push the correction and provide the exact Cloudflare settings.

## Webhook and Activation Release

- [x] Create webhook, pipeline, module, and gated activation boundaries.
- [x] Correct Cloudflare sequencing so the build creates `web-app/dist/public` before Wrangler runs.
- [x] Run typecheck, tests, webhook tests, Python tests, verified build, preflight, Wrangler dry run, and activation-gate checks.
- [x] Push the validated activation release and provide dashboard settings.
