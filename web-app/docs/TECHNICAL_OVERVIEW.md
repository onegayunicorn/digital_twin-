# Quantum Avatar Simulation Lab
## Technical overview and repository map

**Document status:** Current implementation reference  
**Author:** Manus AI  
**Project version:** 1.0.0  
**Published application:** [quantumlab-cptphplc.manus.space](https://quantumlab-cptphplc.manus.space)

## 1. Executive summary

Quantum Avatar Simulation Lab is a static React/Vite application that combines a 3D neutral avatar study, bounded visual analogies for quantum-optics and transformation-optics concepts, deterministic telemetry, an original urban digital-twin game layer, a simulation-only Coherence Node, and a normalized Yee-grid-lite micro-cell visualizer.

The system is intentionally non-operational. It contains no hardware connector, no stimulation path, no medical inference, no calibrated physics controls, no physical portal claim, and no mechanism for controlling a real device. The BCI layer is a consent-gated mock stream for interface experimentation only.

## 2. Repository map

| Location | Role | Primary entry points |
| --- | --- | --- |
| `client/src/App.tsx` | React application shell and routing | `App()` |
| `client/src/pages/Home.tsx` | Main workbench page, scenario state, run lifecycle, exports | `Home()` |
| `client/src/components/ParticleChamber.tsx` | Deferred React Three Fiber particle visualization | `ParticleChamber` |
| `client/src/components/AvatarViewport.tsx` | Deferred neutral 3D avatar maquette | `AvatarViewport` |
| `client/src/components/UrbanArchivePanel.tsx` | Original district, mission, digital-twin, and Coherence Node UI | `UrbanArchivePanel` |
| `client/src/components/YeeGridPanel.tsx` | Normalized micro-cell telemetry panel | `YeeGridPanel` |
| `client/src/components/FeatureGrid.tsx` | Pointer-accessible 2D vector controls | `FeatureGrid` |
| `client/src/lib/simulation-record.ts` | Run record schema, telemetry helpers, JSON/PDF exports | `buildRunRecord`, `downloadJson`, `downloadPdf` |
| `client/src/index.css` | Graphite Specimen Ledger visual system and responsive layout | global styles |
| `cores/types/src/index.ts` | Shared avatar, game, mission, and telemetry types | exported types |
| `game/core/src/index.ts` | Original districts, missions, avatar profile, and stat shifts | `districts`, `missions`, `defaultAvatar` |
| `devices/bci-simulator/src/index.ts` | Deterministic mock BCI device with consent gate | `SimulatedBciDevice` |
| `engines/coherence-node/src/index.ts` | Synthetic signal mapper and visual node state | `CoherenceNode` |
| `engines/telemetry/src/yee-grid-lite.ts` | Normalized grid and micro-cell state model | `YeeGridLite` |
| `simulations/coherence-node/run.ts` | Deterministic Coherence Node report generator | CLI entry point |
| `simulations/coherence-node/yee-grid-report.ts` | Deterministic Yee-grid-lite report generator | CLI entry point |
| `simulations/coherence-node/output/` | Generated JSON reports | `coherence-node-report.json`, `yee-grid-lite-report.json` |
| `scripts/verify-simulation.mjs` | Original five-track visual-model validator | CLI validator |
| `scripts/generate-sample-record.mjs` | Reproducible export-record fixture generator | CLI generator |
| `docs/` | Scope, safety, export, provenance, review, protocol, and technical documentation | Markdown references |
| `assets/` | Small project asset metadata and local source references | non-runtime originals |
| `server/index.ts` | Static production file server compatibility layer | `startServer()` |

## 3. Runtime architecture

The browser loads `Home.tsx`, which owns the visual run state. The page sends normalized inputs to `calculateTelemetry()` and the deferred 3D components render the current state. When a run reaches visual time 100, `buildRunRecord()` creates a complete archive record containing configuration, telemetry series, summary values, validation flags, and a simulation-only boundary statement.

The urban archive is a separate UI surface. It reads original district and mission data from `game/core`, creates an opt-in `SimulatedBciDevice`, and passes one or more synthetic samples through `CoherenceNode`. The node emits normalized visual state and a LED preview label. The browser never sends those values to a physical device.

`YeeGridLite` is a deterministic normalized grid. Its structure-of-arrays layout stores seven bounded channels per cell. Each step applies a qualitative decay/drive update, computes an average report, and invokes a software-only normalized energy interlock. If the configured cap is exceeded, the grid resets to its seeded baseline and records `reset-after-cap`.

## 4. Data flow

```text
User controls
  -> Home state
  -> calculateTelemetry / buildRunRecord
  -> ParticleChamber + ledger + JSON/PDF export

Mock BCI consent
  -> SimulatedBciDevice.readSample()
  -> CoherenceNode.ingest()
  -> UrbanArchivePanel visual status

Seed + grid dimensions
  -> YeeGridLite.seedGaussian()
  -> YeeGridLite.step()
  -> Yee-grid JSON report + in-app field record
```

## 5. Build and dependency model

The frontend uses React, Vite, TypeScript, React Three Fiber, Three.js, Radix primitives, Lucide icons, and jsPDF. Three-dimensional modules are lazy-loaded so the initial page can render its editorial shell without waiting for the full renderer graph. Production output is generated by `pnpm build`; the server bundle is a static compatibility server and does not expose a hardware or external API route.

The root `package.json` declares the original workspaces `cores/*`, `engines/*`, `game/*`, `devices/*`, and `simulations/*`. The project is also described by `pnpm-workspace.yaml` and `monorepo.package.json` for future extraction into a standalone monorepo.

## 6. Implemented features

The current product includes a five-track visual scenario catalogue, a five-stage run sequence, a live normalized telemetry ledger, a neutral 3D avatar customizer, four face-vector controls, a district and mission archive, a consent-gated mock Coherence Node, a normalized Yee-grid-lite telemetry record, completed-run history, JSON export, PDF export, deterministic CLI reports, and evidence/scope documentation.

## 7. Validation record

| Check | Result |
| --- | --- |
| TypeScript validation | Pass: `pnpm check` |
| Original visual-model validator | Pass: `node scripts/verify-simulation.mjs` |
| Coherence Node report | Pass: 64 synthetic samples; average coherence 0.7172; peak 0.7333 |
| Yee-grid-lite report | Pass: 24 steps; peak normalized energy 0.23274; zero resets |
| Production build | Pass: `pnpm build` |
| Preview verification | Pass: desktop full-page workbench and urban archive surface |
| Hardware path audit | Pass: no hardware connector or actuation path |

## 8. Provenance and exclusions

The supplied archive was an Epic Games Store APK extraction, not source code. Its binaries, native libraries, fonts, images, licenses, game content, and proprietary resources are excluded from the build. High-level structural ideas were rewritten as original modules. The urban game layer is not a Saints Row or Epic Games Store product and does not use their names, characters, logos, meshes, textures, or code.

The supplied PDFs are treated as design references. Portal-field, molecular-oscillator, GHz, dust, Maxwell/FDTD, EEG hardware, electrode, LED, BLE, USB, and compliance claims are not implemented as operational functions. See [`BCI_SAFETY.md`](BCI_SAFETY.md), [`SCIENTIFIC_SCOPE.md`](SCIENTIFIC_SCOPE.md), [`NEW_PDF_REVIEW.md`](NEW_PDF_REVIEW.md), and [`SUPPLIED_MATERIALS_REVIEW.md`](SUPPLIED_MATERIALS_REVIEW.md).

## References

[1]: ./BCI_SAFETY.md "BCI and Coherence Node safety contract"  
[2]: ./EXPORT_SCHEMA.md "Run-record export schema"  
[3]: ./NEW_PDF_REVIEW.md "New PDF compatibility review"  
[4]: ./SIMULATION_PROTOCOL.md "Simulation protocol and validation"  
[5]: ./SUPPLIED_MATERIALS_REVIEW.md "Supplied materials review"


## 9. Cosmic Engine extension

The latest update adds an original `engines/cosmic/src` workspace inspired by the supplied lattice, grid, mesh, and void vocabulary. `EquilibriumLattice`, `LightGrid`, `ResonanceMesh`, and `VoidField` each produce bounded normalized state. `CosmicEngine` composes them into a read-only snapshot with a software-only cap and explicit `SIMULATED` status.

The deterministic report is generated with `pnpm sim:cosmic` and written to `simulations/cosmic/output/cosmic-engine-report.json`. `pnpm sim:all` now runs the Coherence Node, Yee-grid-lite, and Cosmic Engine reports together. The default 32-tick run completed with maximum propagation `0.44551`, maximum photon-density analogue `0.64866`, and zero software safety resets.

The supplied wealth-bridge, trading, wallet, NFT, blockchain, ownership, hyperfusion, and portal material is excluded from runtime behavior. The project contains no trading automation, financial transaction handling, NFT minting, blockchain deployment, wallet integration, legal ownership transfer, physical-field control, or portal-generation claim.
