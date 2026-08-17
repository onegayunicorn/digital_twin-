import type { BciSignalSample, CoherenceNodeState } from "../../../cores/types/src/index";

export class CoherenceNode {
  private state: CoherenceNodeState = {
    status: "SIMULATED",
    mode: "idle",
    coherence: 0,
    entropy: 0,
    focus: 0,
    consent: "not-granted",
    outputs: { ledPreview: "off", audioPreview: false, hardwareActuation: false },
  };

  setConsent(granted: boolean): void {
    this.state = { ...this.state, consent: granted ? "granted-for-simulation" : "not-granted" };
  }

  start(): CoherenceNodeState {
    if (this.state.consent !== "granted-for-simulation") {
      throw new Error("Coherence Node simulation requires explicit simulation consent.");
    }
    this.state = { ...this.state, mode: "listening" };
    return this.state;
  }

  pause(): CoherenceNodeState {
    this.state = { ...this.state, mode: "paused" };
    return this.state;
  }

  ingest(sample: BciSignalSample): CoherenceNodeState {
    if (this.state.mode !== "listening" && this.state.mode !== "mapping") {
      return this.state;
    }
    const focus = Math.min(1, Math.max(0, sample.beta * 0.8 + sample.alpha * 0.25));
    const ledPreview = sample.coherence > 0.82 ? "cyan" : sample.coherence > 0.62 ? "mint" : "amber";
    this.state = {
      ...this.state,
      mode: "mapping",
      coherence: sample.coherence,
      entropy: sample.entropy,
      focus,
      outputs: {
        ledPreview,
        audioPreview: false,
        hardwareActuation: false,
      },
    };
    return this.state;
  }

  snapshot(): CoherenceNodeState {
    return this.state;
  }
}
