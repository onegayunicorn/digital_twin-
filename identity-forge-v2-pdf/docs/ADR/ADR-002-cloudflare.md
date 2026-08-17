# ADR-002: Cloudflare Production Edge

## Context

We need a deployment platform that is fast, scalable, cost-effective, and supports static asset hosting for the Identity Forge application.

## Decision

We will use Cloudflare Workers with Static Assets for production deployment.

## Rationale

- **Global edge network**: Cloudflare operates in 300+ cities worldwide, providing low-latency access
- **Fast performance**: Edge deployment ensures content is served from the nearest location
- **Developer experience**: Wrangler CLI provides excellent developer tooling
- **Cost-effective**: Generous free tier and competitive pricing
- **Good ecosystem integration**: Custom domains, SSL certificates, DNS management all in one place
- **Static Assets support**: Modern `assets.directory` configuration replaces deprecated Workers Sites

## Consequences

- **Vendor adaptation**: Uses Cloudflare-specific configuration (wrangler.jsonc)
- **Mitigation**: Application is built as static assets, making it portable to any CDN
- **Learning curve**: Developers need to learn Wrangler and Workers Static Assets
- **Limited runtime environment**: Workers have specific runtime constraints (not applicable for pure static assets)
- **Custom domain support**: First-class support for custom domains with automatic SSL

## Configuration

```jsonc
{
  "assets": {
    "directory": "./apps/web/dist"
  },
  "routes": [
    {
      "pattern": "identity-forge.sovereign.ai",
      "custom_domain": true
    }
  ]
}
```
