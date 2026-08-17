import type { BciSignalSample } from "../../../cores/types/src/index";

export type BciDeviceStatus = {
  deviceId: string;
  connected: boolean;
  source: "simulated";
  readOnly: true;
  stimulation: false;
  consent: boolean;
};

export class SimulatedBciDevice {
  private connected = false;
  private consent = false;
  private cursor = 0;

  constructor(public readonly deviceId = "mock-halo-01") {}

  grantSimulationConsent(): void {
    this.consent = true;
  }

  connect(): BciDeviceStatus {
    if (!this.consent) {
      throw new Error("Simulation consent is required before connecting the mock device.");
    }
    this.connected = true;
    return this.status();
  }

  disconnect(): BciDeviceStatus {
    this.connected = false;
    return this.status();
  }

  status(): BciDeviceStatus {
    return {
      deviceId: this.deviceId,
      connected: this.connected,
      source: "simulated",
      readOnly: true,
      stimulation: false,
      consent: this.consent,
    };
  }

  readSample(): BciSignalSample {
    if (!this.connected) {
      throw new Error("The mock BCI device is not connected.");
    }
    const t = this.cursor++ / 7.83;
    const alpha = 0.52 + Math.sin(t * 0.8) * 0.08;
    const beta = 0.31 + Math.sin(t * 1.7 + 1.2) * 0.06;
    const theta = 0.24 + Math.cos(t * 0.5) * 0.05;
    const gamma = 0.12 + Math.sin(t * 2.7) * 0.025;
    const entropy = Math.min(1, Math.max(0, 0.48 + Math.sin(t * 0.33) * 0.12));
    const coherence = Math.min(1, Math.max(0, 0.68 + alpha * 0.18 - entropy * 0.1));
    return {
      t,
      alpha,
      beta,
      theta,
      gamma,
      coherence,
      entropy,
      source: "simulated",
    };
  }
}
