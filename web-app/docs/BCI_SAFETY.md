# BCI and Coherence Node safety contract

The Coherence Node in this project is a **fictional game system and synthetic telemetry visualizer**. Its purpose is to make the digital twin feel responsive to an optional mock signal stream. It is not a medical device, neurodiagnostic tool, treatment system, or human-performance assessment.

## Allowed behavior

The current implementation generates deterministic synthetic samples for alpha-like, beta-like, theta-like, gamma-like, coherence, entropy, and focus values. The app maps those values to color and animation state. The mock adapter is read-only and reports `stimulation: false` and `hardwareActuation: false` in its status object.

## Prohibited behavior

The project must not deliver electrical, optical, thermal, acoustic, or other stimulation to a person. It must not infer medical conditions, diagnose, recommend treatment, or make claims about brain health. It must not expose arbitrary HID, serial, BLE, USB, GPIO, electrode, or firmware commands from the browser. It must not use signals to control weapons, vehicles, access systems, financial transactions, or other high-impact actions.

## Consent and future devices

Simulation consent is explicit and local to the mock adapter. A future physical-device connector would require a separate package, a vendor-approved SDK, explicit user consent, read-only defaults, a visible connection indicator, logging, and an independent safety review. Any health-related use would additionally require appropriate regulatory and clinical oversight.

## Data handling

Telemetry is synthetic by default and should not be presented as a recording from a person. If imported read-only data is ever supported, the UI must label its provenance, avoid collecting unnecessary personal data, and provide deletion/export controls.
