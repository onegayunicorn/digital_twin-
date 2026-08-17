# Cloudflare Workers Deployment

The repository is a workspace, while the deployable Vite application resides in `web-app`. The prior deployment failed because `npx wrangler deploy` ran in the workspace root without a Worker configuration. The root `wrangler.jsonc` now makes that command deploy `web-app/dist/public` as static Worker assets.

## Correct Cloudflare build settings

| Setting | Value |
| --- | --- |
| Root directory | `/` |
| Build command | `pnpm build` |
| Deploy command | `npx --yes wrangler deploy` |
| Build variables | None required for the current static build |

The root build script runs `pnpm --dir web-app build`. That command produces `web-app/dist/public`, which Wrangler serves with single-page application fallback.

## Local validation

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm build
npx wrangler deploy --dry-run
```

`wrangler deploy` publishes a public Worker release and requires authenticated Cloudflare credentials. Use the Cloudflare dashboard connection or a `CLOUDFLARE_API_TOKEN` with Workers deployment permission; never commit credentials or tokens to this repository.

## Alternative package-scoped configuration

If Cloudflare is later configured with `web-app` as the root directory, use `pnpm build` there and move or reference the root `wrangler.jsonc` accordingly. Do not use the old root `/` configuration with an unscoped Wrangler command unless this repository-level config remains present.
