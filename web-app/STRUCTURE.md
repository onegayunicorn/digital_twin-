# Neon Borough Archive — structure

## Product boundary

Neon Borough Archive is an original urban-sandbox digital-twin game prototype. It borrows only high-level genres and interaction patterns from the supplied references: an avatar builder, a mission-driven city, telemetry experiments, and a library-like archive. It does not ship or depend on Epic Games Store binaries, Saints Row assets, names, characters, logos, or extracted proprietary code.

## Workspaces

| Workspace | Responsibility |
| --- | --- |
| `cores/types` | Shared avatar, district, mission, telemetry, and node-state types. |
| `game/core` | Original districts, mission catalog, default avatar, and stat shifts. |
| `devices/bci-simulator` | Consent-gated deterministic mock device; read-only synthetic samples only. |
| `engines/coherence-node` | Maps synthetic signal samples into visual node state. Hardware actuation is a literal `false` capability. |
| `simulations/coherence-node` | Reproducible report generator and validation fixture. |
| `client/src` | Existing WebDev interface, extended with the urban archive surface. |

## Runtime flow

```text
mock BCI samples -> Coherence Node -> normalized telemetry -> avatar/game UI
       |                  |
       |                  +--> visual LED preview only
       +--> no stimulation, no diagnosis, no arbitrary hardware commands
```

## Future extension rule

A real device connector is out of scope for this build. If later added, it must be a separate package with explicit consent, a vendor-approved SDK, read-only defaults, no stimulation path, and an auditable permission boundary.
