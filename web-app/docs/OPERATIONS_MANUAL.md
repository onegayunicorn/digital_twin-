# Operations manual
## Quantum Avatar Simulation Lab / Neon Borough Archive

### 1. Purpose and operating posture

This manual describes how to run, demonstrate, validate, and maintain the browser application and its deterministic simulation modules. The system is designed for visual exploration and software review. Operators must keep the interface’s simulation-only language intact and must not present synthetic values as measurements from a person, device, field, molecule, or physical experiment.

### 2. Prerequisites

Use Node.js compatible with the repository’s Vite and TypeScript toolchain, pnpm, and a modern Chromium, Firefox, or Safari browser. The project is frontend-first and does not require a database, account, BLE device, USB device, serial port, camera, microphone, EEG headset, electrode, or external API key.

### 3. Local startup

From the repository root:

```bash
pnpm install
pnpm dev
```

Open the local URL printed by Vite. The production-like check is:

```bash
pnpm check
pnpm build
pnpm preview
```

`pnpm check` runs TypeScript validation. `pnpm build` compiles the Vite frontend and the static compatibility server. `pnpm preview` serves the generated frontend for a final browser check.

### 4. Standard operator walkthrough

First open **Workbench** and select a model track from the left rail. Use **Run visual model** to start the five-stage sequence. The live ledger reports normalized visual state; it does not report physical units. Use **Pause**, **Resume**, or **Reset** to control the run. A completed run is automatically archived in the current browser session.

Next open the avatar section. Adjust the resemblance and tone scalars, then move the vector crosshairs. The result is an abstract deformation of a neutral maquette. Do not describe the output as an identity, ancestry, genetics, health, or biometric inference.

Then open **Build a twin. Read the borough.** Select a district and mission to review the original game layer. Start the mock stream only when demonstrating synthetic signal flow. The visible status must remain `MOCK`, `SIMULATED`, or `READ-ONLY`; a physical device is not connected.

Finally use **Run normalized grid** in the Yee-grid-lite record. The panel reports seven normalized channels and a software-only energy cap. The displayed values are dimensionless state variables.

### 5. Run archives and exports

After a run has started or completed, the Run Archive provides **JSON** and **PDF** actions. JSON is the machine-readable record and includes the schema version, run ID, scenario, configuration, telemetry series, summary values, validation flags, and boundary statement. PDF is the human-readable report and includes run metadata, summary metrics, a telemetry table, validation status, and the same boundary statement.

Use exports for design review, regression fixtures, and reproducibility. Do not use them as laboratory records, medical records, BCI recordings, or evidence of a physical effect. See [`EXPORT_SCHEMA.md`](EXPORT_SCHEMA.md).

### 6. Deterministic simulation procedures

Run the original visual-model validator with:

```bash
node scripts/verify-simulation.mjs
```

Run the Coherence Node report with:

```bash
pnpm sim:coherence-node
```

Run the normalized Yee-grid report with:

```bash
pnpm sim:yee-grid
```

Run both reports in sequence with:

```bash
pnpm sim:all
```

Reports are written to `simulations/coherence-node/output/`. A clean run should preserve the `SIMULATED` status and explicit boundary fields.

### 7. Expected baseline results

| Report | Baseline result |
| --- | --- |
| Coherence Node | 64 synthetic samples; average coherence `0.7172`; peak coherence `0.7333`; average entropy `0.5642`; average focus `0.3823`. |
| Yee-grid-lite | 24 steps on an `8 × 8 × 4` grid; peak normalized energy `0.23274`; zero resets; final safety state `within-cap`. |
| Five-track validator | All outputs normalized and environment-direction check passed. |

Small changes in dependencies, browser rendering, or future code revisions may change presentation details. The deterministic report scripts are the canonical regression surfaces.

### 8. Troubleshooting

| Symptom | Action |
| --- | --- |
| 3D panel shows a loading state | Wait for the deferred renderer chunk; confirm the browser console has no module error; rerun `pnpm build`. |
| Export buttons are disabled | Start a visual run. A no-run state intentionally prevents empty records. |
| Mock stream appears inactive | Click **Start mock stream**; the UI should show a read-only simulated status. Resetting intentionally clears the node state. |
| Yee-grid values are static | Click **Run normalized grid**. The panel is deterministic and advances only when requested. |
| Type errors appear after edits | Run `pnpm check` and address the first reported path before starting Vite again. |
| Build output is stale | Stop the preview process, run `pnpm build`, then start `pnpm preview`. |
| Runtime asset is missing | Verify the managed `/manus-storage/` URL in the relevant component or stylesheet. Do not copy large media into `client/public`. |

### 9. Safety and prohibited operation

Do not connect this browser app to electrodes, BLE, USB, serial, HID, LED, stimulator, vehicle, weapon, access-control, financial, or other high-impact systems. Do not add arbitrary hardware commands to the mock adapter. Do not infer a diagnosis, recommend treatment, claim wellness efficacy, or describe synthetic telemetry as a person’s brain activity. Do not add operating parameters for GHz drives, fields, energy, molecules, dust, spacetime, or portals.

Any future physical-device work must be a separate, explicitly reviewed connector with vendor SDK compliance, explicit consent, read-only defaults, provenance logging, and appropriate clinical or regulatory oversight for health-related use. Read [`BCI_SAFETY.md`](BCI_SAFETY.md) before changing device-related code.

### 10. Release procedure

Before a checkpoint or release, run `pnpm check`, `pnpm sim:all`, `pnpm build`, and the visual preview. Review `git status --short` and confirm that secrets, `.env` files, `node_modules`, `dist`, logs, proprietary APK content, and generated personal data are excluded. Review documentation links and update the version or checkpoint notes. A managed checkpoint is the deployment artifact for this project.

### 11. Maintenance cadence

When adding a new visual track, update `Home.tsx`, the scenario documentation, the validator, and the export schema if the record shape changes. When adding a new game system, place shared types in `cores/types` and original content in `game`. When changing telemetry, update the deterministic report and its expected baseline. When changing device semantics, update `BCI_SAFETY.md`, the provenance review, and the visible UI boundary copy in the same change.

## References

[1]: ./TECHNICAL_OVERVIEW.md "Technical overview and repository map"  
[2]: ./EXPORT_SCHEMA.md "Run-record export schema"  
[3]: ./BCI_SAFETY.md "BCI and Coherence Node safety contract"  
[4]: ./SIMULATION_PROTOCOL.md "Simulation protocol and validation"


### 12. Cosmic Engine procedure

The Cosmic Engine surface appears beneath the Yee-grid record in the urban archive. Use **Run cosmic record** to execute a fixed 32-tick normalized run in the browser. The four record bars represent dimensionless subsystem summaries, not physical measurements. The panel must remain visibly labelled `READ-ONLY`, `SIMULATION ONLY`, or `SIMULATED`.

For a deterministic command-line report, run:

```bash
pnpm sim:cosmic
```

The output is stored at `simulations/cosmic/output/cosmic-engine-report.json`. To run every current report, use `pnpm sim:all`. The baseline Cosmic Engine report has maximum propagation `0.44551`, maximum photon-density analogue `0.64866`, and zero software safety resets.

### 13. Cosmic Engine troubleshooting

If the Cosmic Engine card does not appear, check the browser console and run `pnpm check`; the component imports `engines/cosmic/src/index.ts` directly. If the report command fails, confirm that `tsx` is installed and that the command is run from the repository root. If a snapshot reports `reset-after-cap`, treat it as a successful software interlock event and inspect the report rather than increasing the cap. Do not add physical units, field controls, financial integrations, or hardware adapters to resolve a visual-model result.
