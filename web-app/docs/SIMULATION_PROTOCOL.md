# Simulation Protocol and Scenario Catalogue

**Author:** Manus AI  
**Purpose:** Implementation specification for a browser-only visual model

## 1. Simulation state

The simulation advances over a normalized **0–100 visual-time axis**. It uses a deterministic pseudo-random seed for particle placement so that a selected scenario can be replayed. Each update produces a record containing `visualTime`, `fidelity`, `coherence`, `noise`, `analogyIndex`, `phase`, and `modelId`.

The application deliberately uses no real-world operating units. The user-facing controls are **Correlation**, **Field Pattern**, **Environment**, and **Particle Count**. Their values are visual-model weights, not settings for lasers, GHz emitters, electromagnetic fields, or physical materials.

## 2. Five-stage visual sequence

| Stage | Visual-time range | Model action | User-facing interpretation |
| --- | ---: | --- | --- |
| Establish baseline | 0–16 | Resets links, scatters particles, initializes avatar feature anchors | The model records its initial conditions |
| Trace correlation | 16–34 | Correlation links emerge and fidelity increases toward the selected track ceiling | A visual correlation pattern is being illustrated |
| Introduce field pattern | 34–58 | Contour field begins to modulate particle motion | A dimensionless field analogy is active |
| Evaluate analogy | 58–82 | Coherence, noise, and optical-ray mapping are combined into the analogy index | The model compares its own visual assumptions |
| Archive and cool-down | 82–100 | Field contours fade, links reduce, and a result record is produced | The run is retained as a visual result only |

## 3. Scenario catalogue

| Scenario | Basis for the visual model | Primary comparison | Confidence label |
| --- | --- | --- | --- |
| Correlation lattice | Entangled-pair concepts rendered as paired particle links | Fidelity versus environmental noise | Established concept, simplified visualization |
| Resonant ensemble | Coherent oscillator motifs represented by grouped particle phase | Coherence versus particle count | Qualitative analogy |
| Dynamic boundary | A contextual representation of a time-varying optical boundary | Field pattern versus noise | Educational reference, not an implementation |
| Transformation-optics tunnel | Effective optical-path remapping in a field mesh | Analogy index versus field pattern | Established optical analogy, not spacetime physics |
| Coupled avatar field | The avatar’s abstract feature vectors modulate display geometry and colour | Avatar state versus visual telemetry | Original interface metaphor |

## 4. Character-customization model

The avatar customizer follows the supplied reference’s interaction logic without copying proprietary game assets or branding. It provides a neutral base mesh, two parent-inspired structural presets, a resemblance scalar, a skin-tone scalar, eight 2D face-vector grids, appearance tone presets, and a constrained 24-hour lifestyle budget. The avatar changes are a **visual deformation model**; they are not a biological or genetic simulation.

## 5. Acceptance tests

| Test | Expected result |
| --- | --- |
| Run baseline scenario | All five stages appear in order, end at visual-time 100, and archive a result |
| Switch scenario | The stated assumption and confidence label update before the run starts |
| Adjust avatar resemblance | The avatar head geometry changes smoothly without affecting scientific claims |
| Move a 2D face-vector control | The associated visual marker and avatar deformation update in range -1 to 1 |
| Increase environmental weight | The rendered fidelity and analogy index decrease relative to a lower-environment run |
| Reset | Returns metrics, particles, and archived run preview to baseline without page reload |

## 6. Documentation output

Each completed scenario generates an in-app result card listing the selected track, final normalized values, peak analogy index, interpretation, and the statement **“simulation-only visual model — no physical claim.”**

## 7. Deterministic validation record

The validator at `scripts/verify-simulation.mjs` was executed against the five supplied visual tracks using the default dimensionless state weights. The following results are **software outputs only**. They are included to document the test run and must not be interpreted as measured physics, a device result, or a prediction.

| Track | Peak optical analogy index | Final analogy index after cool-down | Final environment/noise state |
| --- | ---: | ---: | ---: |
| Correlation lattice | 0.535 | 0.165 | 0.278 |
| Resonant ensemble | 0.482 | 0.150 | 0.278 |
| Dynamic boundary | 0.438 | 0.137 | 0.278 |
| Transformation-optics tunnel | 0.512 | 0.158 | 0.278 |
| Coupled avatar field | 0.464 | 0.145 | 0.278 |

The validator also compared the transformation-optics track at two environment weights. The lower-environment state produced an analogy index of **0.544**, while the higher-environment state produced **0.319**, satisfying the specified directional check that increased environment/noise reduces the visual-model index.

| Validation check | Result |
| --- | --- |
| All calculated telemetry states remain finite and normalized to 0–1 | Pass |
| All five scenario tracks advance through the deterministic series | Pass |
| Increasing the environment weight reduces the analogy index | Pass |
| Type checking (`pnpm check`) | Pass |
| Production compilation (`pnpm build`) | Pass |


## 8. PDF integration: bounded Yee-grid-lite track

The new reference’s micro-cell vocabulary is implemented as a normalized visual track rather than a physical field solver. `YeeGridLite` uses an `8 × 8 × 4` flattened array with deterministic seed `783`, 24 fixed steps, and a software-only normalized energy cap of `0.88`.

| Acceptance check | Result |
| --- | --- |
| Fixed-seed repeatability | Pass; the report is deterministic for seed `783`. |
| Channel normalization | Pass; fidelity, coherence, intensity, decoherence, amplitude, velocity, and phase remain in `[0, 1]`. |
| Safety interlock | Pass; aggregate normalized energy remained `0.23274`, below the cap, with `0` resets. |
| Hardware boundary | Pass; no device, frequency, field-amplitude, stimulation, or actuation path exists. |
| Report provenance | Pass; the JSON output is labelled `SIMULATED` and includes an explicit boundary statement. |

The implementation does not claim to solve Maxwell’s equations, model molecules or dust, create portals, or reproduce a physical Yee/FDTD solver. It is an educational visualization of normalized state channels.
