# Quantum Avatar Simulation Lab

**Quantum Avatar Simulation Lab** is a browser-based 3D visual workspace that pairs a neutral avatar-maquette customizer with clearly bounded visual models inspired by quantum optics, particle ensembles, and transformation-optics analogies. It is designed for exploration, interaction design, and scientific-literacy communication—not for hardware control, experimental planning, or real-world portal construction.

> **Non-negotiable boundary:** A completed run is a successful execution of the software’s normalized visual model. It is not a physical measurement, device instruction, spacetime claim, molecular process, or experimental result.

## What is included

| Area | Implementation |
| --- | --- |
| 3D chamber | A Three.js particle ensemble with correlation threads, contour rings, time-sequenced stages, and a bounded **optical analogy index**. |
| 3D avatar study | A neutral, wireframe-overlaid maquette with abstract form blending and four normalized face-vector controls. |
| Scenario catalogue | Correlation lattice, resonant ensemble, dynamic-boundary reference, transformation-optics tunnel, and coupled-avatar-field metaphor. |
| Scientific boundary | Persistent interface notice, evidence ledger, model limits, source links, and documentation that reject physical portal claims. |
| Visual system | **Graphite Specimen Ledger**: graphite chambers beside mineral-paper evidence records, calibration motifs, and restrained signal cyan / amber accents. |
| Deterministic validation | A Node validator that checks normalized output ranges for all tracks and confirms increased environmental weight lowers the visual analogy index. |

## Architecture

| Location | Responsibility |
| --- | --- |
| `client/src/pages/Home.tsx` | Application state, five-stage sequence, scenario selection, normalized telemetry, avatar controls, and evidence-ledger content. |
| `client/src/components/ParticleChamber.tsx` | Deferred React Three Fiber particle chamber and non-operational correlation visual. |
| `client/src/components/AvatarViewport.tsx` | Deferred React Three Fiber neutral maquette, material cues, and abstract deformation responses. |
| `client/src/components/FeatureGrid.tsx` | Pointer-accessible normalized 2D vector controls. |
| `client/src/index.css` | Graphite Specimen Ledger layout, responsiveness, motion limits, archival mineral-paper surfaces, and calibration motifs. |
| `scripts/verify-simulation.mjs` | Deterministic visual-model verifier. |
| `docs/SCIENTIFIC_SCOPE.md` | Evidence-backed scope statement and prohibited interpretations. |
| `docs/SIMULATION_PROTOCOL.md` | Scenario, protocol, acceptance-test, and validation specification. |

## Run locally

The application is a static React/Vite project. Install the project dependencies, then use the commands below.

```bash
pnpm dev
pnpm check
pnpm build
node scripts/verify-simulation.mjs
```

The 3D renderer is deferred into separate chunks to reduce the initial interface payload. The build configuration disables Vite’s compressed-size reporting because the three-dimensional controls package otherwise stalls during bundle reporting in this sandbox.

## Interaction flow

Start at **Workbench**, select a visual track from the mineral-paper model index, then choose **Run visual model**. The sequence progresses through baseline, correlation, field pattern, evaluation, and cool-down. The normalized telemetry ledger updates in real time, and the completed result is labelled as a simulation-only record.

In the avatar section, adjust resemblance and tone scalars, then drag the face-vector crosshairs. These controls update a neutral 3D maquette and are explicitly visual-deformation inputs; they do not represent a person, ancestry, genetics, identity, or medical information.

## Source materials and attribution

The interface takes its character-customization interaction inspiration from the user-supplied reference document, but it does not ship GTA assets, names, branding, meshes, textures, or game data. The science-facing documentation differentiates supported concepts from unsupported interpretations using the following public sources:

1. [NIST — Sources of Nonclassical Light for Quantum Networks](https://www.nist.gov/pml/productsservices/quantum-networks-nist/technologies-quantum-networks/sources-nonclassical-light)
2. [RIKEN — Dynamical Casimir effect within reach of optomechanics](https://www.riken.jp/en/news_pubs/research_news/rr/20180511_FY20180005)
3. [Song et al. — Photonic analogies of parallel spaces, wormholes and multiple realities](https://pmc.ncbi.nlm.nih.gov/articles/PMC12504751/)

## Limits and exclusions

This project deliberately contains no calibrated frequency, field-amplitude, energy, material, molecular, charging, optical-source, antenna, or apparatus controls. It has no backend, hardware API, serial link, camera access, equipment integration, or real-world execution pathway. See [`docs/SCIENTIFIC_SCOPE.md`](docs/SCIENTIFIC_SCOPE.md) for the complete boundary statement and [`docs/SIMULATION_PROTOCOL.md`](docs/SIMULATION_PROTOCOL.md) for the visual-model protocol and test results.

## Export run records

After starting or completing a visual run, the **Run Archive** controls expose two local downloads. **JSON** saves the full machine-readable record, including the entire normalized telemetry series, while **PDF** saves a human-readable report with the selected track, configuration, peak and final values, sampled telemetry, and validation status. A no-run state keeps both buttons disabled so an empty record cannot be mistaken for a result.

The export contract is documented in [`docs/EXPORT_SCHEMA.md`](docs/EXPORT_SCHEMA.md). The default optical-metric run produces a peak analogy index of **0.512**, a final cool-down index of **0.158**, and a final noise state of **0.278**. These are dimensionless software outputs, not physical observations.


## Neon Borough Archive extension

This repository now includes an original urban digital-twin game slice layered onto the simulation lab. The new `game/` modules define districts, missions, avatar profiles, and stat shifts. The `engines/coherence-node/` and `devices/bci-simulator/` modules provide a consent-gated, deterministic mock signal path for visual feedback. The browser exposes a mission board, district index, and Coherence Node preview under **Build a twin. Read the borough.**

The supplied `update.zip` contained an Epic Games Store APK extraction rather than source code. The binary, native libraries, fonts, images, and proprietary resources are intentionally excluded from this repository. High-level architectural ideas from the supplied documentation were rewritten as original modules. The game is not a Saints Row or Epic Games Store build and does not ship their names, characters, logos, code, or assets.

### BCI boundary

The BCI layer is a simulation-only, read-only visualization. It has no stimulation path, no diagnostic or treatment logic, no arbitrary hardware commands, and no vehicle, weapon, access-control, or financial-control integration. See [`docs/BCI_SAFETY.md`](docs/BCI_SAFETY.md) and [`docs/SUPPLIED_MATERIALS_REVIEW.md`](docs/SUPPLIED_MATERIALS_REVIEW.md).

### Run the deterministic node simulation

```bash
pnpm sim:coherence-node
```

The command writes `simulations/coherence-node/output/coherence-node-report.json` with 64 synthetic samples, average and peak coherence, average entropy, average focus, the mock-device status, and the explicit safety boundary. Outputs are synthetic and must not be interpreted as recordings from a person.


## New PDF integration: Yee-grid-lite telemetry

The latest supplied reference is now represented by a bounded `engines/telemetry/src/yee-grid-lite.ts` module. It uses a flattened structure-of-arrays layout and dimensionless micro-cell channels—fidelity, coherence, intensity, decoherence, amplitude, velocity, and phase—to create a deterministic visual telemetry record. A software-only energy cap resets the normalized state if the aggregate visual energy exceeds its configured limit.

Run both reproducible reports with:

```bash
pnpm sim:all
```

The new report is written to `simulations/coherence-node/output/yee-grid-lite-report.json`. The default run uses an `8 × 8 × 4` grid, 24 steps, seed `783`, and energy cap `0.88`; the validated run completes with peak normalized energy `0.23274` and zero software-interlock resets. These values are software outputs and are not measurements of fields, molecules, dust, portals, brains, or hardware.

The PDF’s proposed portal-field, GHz/molecular, dust, Maxwell/FDTD, and physical EEG-hardware claims remain excluded from operational behavior. The UI exposes a **Yee-grid-lite field record** and a **Run normalized grid** action only as an educational visual model. See [`docs/NEW_PDF_REVIEW.md`](docs/NEW_PDF_REVIEW.md) for the complete compatibility and provenance mapping.


## Documentation index

The complete project documentation is organized as follows:

| Document | Purpose |
| --- | --- |
| [`docs/TECHNICAL_OVERVIEW.md`](docs/TECHNICAL_OVERVIEW.md) | Repository locations, runtime architecture, data flow, modules, validation, and provenance. |
| [`docs/PRODUCT_PITCH.md`](docs/PRODUCT_PITCH.md) | Product position, audiences, differentiation, demonstration script, and expansion path. |
| [`docs/OPERATIONS_MANUAL.md`](docs/OPERATIONS_MANUAL.md) | Setup, daily operation, run archives, deterministic reports, troubleshooting, safety, and release procedures. |
| [`docs/EXPORT_SCHEMA.md`](docs/EXPORT_SCHEMA.md) | JSON/PDF run-record contract and telemetry fields. |
| [`docs/SIMULATION_PROTOCOL.md`](docs/SIMULATION_PROTOCOL.md) | Five-stage visual sequence, scenario catalogue, acceptance tests, and Yee-grid-lite validation. |
| [`docs/BCI_SAFETY.md`](docs/BCI_SAFETY.md) | Consent, mock-device behavior, prohibited operations, and future connector requirements. |
| [`docs/NEW_PDF_REVIEW.md`](docs/NEW_PDF_REVIEW.md) | Compatibility mapping for the latest GTA/simulation/Coherence Node/Yee-grid PDF. |
| [`docs/SUPPLIED_MATERIALS_REVIEW.md`](docs/SUPPLIED_MATERIALS_REVIEW.md) | Archive/PDF provenance, reuse decisions, and exclusions. |


## Cosmic Engine extension

The project now includes an original `engines/cosmic/src` workspace with four bounded visual systems: `lattice.ts`, `light-grid.ts`, `resonance-mesh.ts`, and `void-field.ts`, composed by `cosmic-engine.ts`. The in-app **Cosmic Engine / normalized systems** card is available in the urban archive.

Run its deterministic report with:

```bash
pnpm sim:cosmic
```

Run all reports with:

```bash
pnpm sim:all
```

The Cosmic Engine output is written to `simulations/cosmic/output/cosmic-engine-report.json` and is labelled `SIMULATED`. The supplied archive and PDFs were used as design references only. Their trading, wealth, wallet, NFT, blockchain, ownership, hyperfusion, portal, and physical-engine claims are not implemented.

See [`docs/COSMIC_ENGINE_REVIEW.md`](docs/COSMIC_ENGINE_REVIEW.md) for the source inventory, compatibility map, and exclusions.
