# Export schema and run results

## Purpose

A run record is an archival snapshot of the browser-only visual model. It is intended for comparison, reproducibility, and documentation. It is not a physical measurement, an experimental result, an equipment configuration, or evidence of portal creation.

## Download formats

| Format | Contents | Intended use |
| --- | --- | --- |
| JSON | Schema version, record metadata, selected model, normalized configuration, complete telemetry series, peak/final points, and validation flags. | Machine-readable comparison, versioned archives, and downstream analysis. |
| PDF | Human-readable report with record metadata, scientific boundary, configuration summary, peak/final outputs, sampled telemetry, and validation status. | Lab notes, review packets, and offline sharing. |

The browser creates both files locally with a `qasl-<record-id>` filename. No file is uploaded by the export controls.

## JSON contract

The top-level fields are `schemaVersion`, `recordId`, `generatedAt`, `status`, `scientificBoundary`, `model`, `configuration`, `results`, and `validation`.

| Field | Meaning |
| --- | --- |
| `schemaVersion` | Export contract version. Current value: `1.0.0`. |
| `recordId` | Local run identifier. Completed runs use a time-derived identifier; previews use `preview`. |
| `status` | `in-progress` for a preview or `completed` after the five-stage run reaches 100 model-time units. |
| `model` | The selected visual track and its qualitative ceiling. |
| `configuration` | Normalized sliders, particle count, avatar blend values, and face-vector positions. |
| `results.telemetrySeries` | Full series of dimensionless points sampled at 1.25 model-time units, including stage number. |
| `validation` | Software checks that outputs remain normalized and that increased environment weight lowers the visual analogy index. |

Each telemetry point has `time`, `stage`, `fidelity`, `coherence`, `noise`, and `analogyIndex`. All values are dimensionless and bounded by the software’s normalized model.

## Default optics run result

The deterministic validator was executed with the default transformation-optics track and the default control values. The result below is a compact human-readable sample; the downloadable JSON contains the full telemetry series.

| Output | Result |
| --- | ---: |
| Track | Optical-metric tunnel |
| Peak optical analogy index | 0.512 |
| Final analogy index after cool-down | 0.158 |
| Final environment/noise state | 0.278 |
| Lower-environment comparison | 0.544 |
| Higher-environment comparison | 0.319 |
| Normalized-output check | Pass |
| Environment-direction check | Pass |

> **Interpretation:** These values describe the software visualization only. They do not quantify entanglement, coherence, molecular separation, energy, field strength, spacetime curvature, or any physical portal mechanism.

## References

1. [NIST — Sources of Nonclassical Light for Quantum Networks](https://www.nist.gov/pml/productsservices/quantum-networks-nist/technologies-quantum-networks/sources-nonclassical-light)
2. [RIKEN — Dynamical Casimir effect within reach of optomechanics](https://www.riken.jp/en/news_pubs/research_news/rr/20180511_FY20180005)
3. [Nature Communications — Photonic analogies of parallel spaces, wormholes and multiple realities](https://pmc.ncbi.nlm.nih.gov/articles/PMC12504751/)
