export type Vector2 = { x: number; y: number };

export type AvatarArchetype = "courier" | "maker" | "night_scout";

export type AvatarProfile = {
  id: string;
  name: string;
  archetype: AvatarArchetype;
  style: "utility" | "atelier" | "afterhours";
  energy: number;
  empathy: number;
  focus: number;
  mobility: number;
};

export type District = {
  id: string;
  name: string;
  mood: "electric" | "quiet" | "restless";
  danger: number;
  coherence: number;
  landmarks: string[];
};

export type Mission = {
  id: string;
  title: string;
  briefing: string;
  districtId: string;
  objective: "deliver" | "survey" | "rehearse";
  reward: number;
  status: "available" | "active" | "complete";
};

export type BciSignalSample = {
  t: number;
  alpha: number;
  beta: number;
  theta: number;
  gamma: number;
  coherence: number;
  entropy: number;
  source: "simulated" | "imported-read-only";
};

export type CoherenceNodeState = {
  status: "SIMULATED";
  mode: "idle" | "listening" | "mapping" | "paused";
  coherence: number;
  entropy: number;
  focus: number;
  consent: "not-granted" | "granted-for-simulation";
  outputs: {
    ledPreview: "off" | "amber" | "cyan" | "mint";
    audioPreview: boolean;
    hardwareActuation: false;
  };
};
