# Identity Forge Platform Structure

The repository is organised as a promotion pipeline rather than a single deployment command. The browser application remains in `web-app/`; reusable domain and simulation code belongs under `packages/`; provider adapters belong under `integrations/`; research artifacts belong under `research/`; infrastructure contracts belong under `infrastructure/`; deployment automation belongs under `scripts/`; and product, security, governance, research, and deployment documentation belongs under `docs/`.

| Directory | Purpose | Production status |
| --- | --- | --- |
| `web-app/` | React/Vite Identity Forge client | Deployable |
| `packages/` | Reusable identity, character, appearance, simulation, and interface modules | Experimental unless marked otherwise |
| `integrations/` | GitHub, Cloudflare, Manus, IPFS, and provider adapter boundaries | Disabled by default |
| `research/` | Hypotheses, experiments, datasets, simulations, and results | Not a production data source |
| `contracts/` | Future blockchain contract interfaces | No live deployment |
| `infrastructure/` | Cloudflare, Docker, Kubernetes, and Terraform boundaries | Configuration templates only |
| `scripts/` | Build, test, security, preflight, trigger, and deployment automation | Verified locally |
| `docs/` | Architecture, deployment, governance, security, and research decisions | Source of operational truth |

The promotion gates are concept, architecture, source, build, test, security, simulation, staging, validation, and production. A research component must remain labelled conceptual until it has a documented mathematical model, numerical verification, reproducibility record, and independent validation.
