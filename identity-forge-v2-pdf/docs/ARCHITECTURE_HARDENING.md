# Identity Forge Architecture Hardening

## Deployment contract

The repository is a pnpm workspace with the deployable Vite application in `web-app/`. The release contract is intentionally explicit: install with the frozen lockfile, run type checking, run tests, build the application, verify `web-app/dist/public/index.html`, perform a Wrangler dry run, and only then publish.

Cloudflare dashboard settings should use repository root `/`, build command `pnpm build`, deploy command `pnpm exec wrangler deploy`, Node `24.18.0`, pnpm `10.11.1`, and output directory `web-app/dist/public`. The repository scripts provide a stronger local and CI path through `pnpm build:verified` and `pnpm deploy`.

## Simulation boundary

The No Gap Theory and Yee Lattice material is preserved as an experimental conceptual model. It is not a validated finite-difference time-domain solver. The current mapping is useful for visual instrumentation and product exploration, but it must not be described as experimentally correlated physics or as a production electromagnetic solver.

The intended architecture separates four concerns:

| Layer | Responsibility | Current status |
| --- | --- | --- |
| Identity and character | Avatar profile, appearance, facial parameters, lifestyle | Implemented in the browser |
| Digital twin | 3D GLTF preview, morph targets, profile portability | Implemented as a browser feature |
| Conceptual simulation | No Gap and lattice-inspired status instrumentation | Experimental scaffold |
| Validated simulation | Staggered fields, numerical verification, convergence tests | Future research work |

## State and memory boundary

Character state should remain small and serialisable: identity, appearance, facial parameters, lifestyle, simulation configuration, and a simulation session identifier. Large lattice buffers must not be persisted in Zustand or localStorage. A future research solver should run in a Web Worker with TypedArrays or GPU buffers and publish compact metrics back to the UI.

The recommended progression for a real solver is to define staggered `Ex`, `Ey`, `Ez`, `Hx`, `Hy`, and `Hz` arrays; implement spatial derivatives over a bounded grid; calculate the general three-dimensional CFL limit using `dx`, `dy`, `dz`, material epsilon, material mu, and wave velocity; and add convergence, energy, and boundary-condition tests before presenting numerical results.

## Financial and external-system boundary

The pasted Hyperfusion Wealth Bridge snippets are treated as conceptual examples only. Live exchange trading, wallet operations, NFT minting, blockchain transactions, and claims of returns remain disabled. Any future implementation would require a backend, authentication, secret management, idempotent transaction handling, audit logging, rate limits, risk controls, and a separate compliance review.
