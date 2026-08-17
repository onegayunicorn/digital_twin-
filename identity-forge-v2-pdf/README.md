# Identity Forge v2 PDF Archive

This directory preserves the source package extracted from the supplied **Identity Forge v2** PDF and ZIP archive. It is an architectural and research package, not a replacement for the validated production app in `web-app/`.

The production Cloudflare entry point remains the repository-root `wrangler.jsonc`, which deploys `web-app/dist/public` using Workers Static Assets and SPA fallback. The PDF-era manifest is preserved as `wrangler.source.jsonc` for provenance only because it uses the older `site.bucket` format and must not be used for the current deployment.

The No Gap Theory and Yee Lattice modules are conceptual simulation scaffolds. They are not a full FDTD solver and should be described accordingly in product, research, and operational documentation.
