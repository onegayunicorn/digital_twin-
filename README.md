# Digital Twin Character Customiser Monorepo

This public monorepo contains the original character-customisation research structure together with the **Quantum Avatar Simulation Lab** web application. The web application is a browser-only, simulation-only visual workbench: it combines a neutral 3D avatar maquette, bounded quantum-optics-inspired visual tracks, normalized telemetry, and downloadable JSON/PDF run records.

> **Scientific boundary:** The application records software-generated normalized visual-model outputs. It does not control equipment, provide operating parameters, measure entanglement, separate molecules, alter spacetime, create portals, or establish a physical mechanism.

## Workspaces

| Workspace | Purpose |
| --- | --- |
| `web-app/` | React/Vite static application with Three.js visualizations, avatar controls, run archive, JSON export, PDF export, and technical documentation. |
| `documentation/` | 3D asset, software integration, compatibility, and licensing references retained from the supplied monorepo. |
| `3d/` | 3D asset workspace retained from the supplied project. |
| `engines/` | Processing-engine workspace retained from the supplied project. |
| `matrix/` | State and transformation workspace retained from the supplied project. |
| `transitions/` | Animation and state-transition workspace retained from the supplied project. |

## Run the web application

```bash
cd web-app
pnpm install
pnpm dev
```

For validation and production compilation:

```bash
cd web-app
pnpm check
pnpm build
node scripts/verify-simulation.mjs
node scripts/generate-sample-record.mjs
```

## Run records and telemetry exports

Complete or start a visual run in the workbench, then use **Run Archive → JSON** or **Run Archive → PDF**. JSON includes schema version, model configuration, the complete normalized telemetry series, peak/final points, and validation flags. PDF includes the same record in a human-readable report format. Both files are created locally in the browser and are labelled as simulation-only.

The reproducible sample record is available at [`web-app/samples/default-optics-run.json`](web-app/samples/default-optics-run.json). The export contract and default run result are documented in [`web-app/docs/EXPORT_SCHEMA.md`](web-app/docs/EXPORT_SCHEMA.md).

## Scientific references

The web-app evidence ledger links to public references from NIST, RIKEN, and Nature Communications. Those references are used to distinguish established quantum-optics or optical-analogy concepts from unsupported claims about real-world portals. See [`web-app/docs/SCIENTIFIC_SCOPE.md`](web-app/docs/SCIENTIFIC_SCOPE.md) and [`web-app/docs/SIMULATION_PROTOCOL.md`](web-app/docs/SIMULATION_PROTOCOL.md).

## Public-repository hygiene

Dependencies are intentionally excluded from the public working tree. The application uses external Manus-managed asset URLs rather than storing large media files in the repository. No credentials, environment secrets, device interfaces, or hardware-control pathways are included.

## Safe Cosmic Engine update

The `web-app/` workspace now includes an original, simulation-only Cosmic Engine extension synchronized from the Quantum Avatar Simulation Lab. It provides bounded lattice, light-grid, resonance-mesh, and void-field visual modules; a deterministic report command; and an in-app read-only telemetry panel.

This public repository intentionally excludes trading, wealth activation, wallet, NFT, blockchain, ownership-transfer, portal-generation, physical-field, and hardware-control behavior. Supplied archives and PDFs are treated as untrusted design references, not executable authority or proof of physical capability.

Run the web app from `web-app/` with `pnpm check`, `pnpm build`, and `pnpm sim:all`. The Cosmic Engine report is generated with `pnpm sim:cosmic`.
