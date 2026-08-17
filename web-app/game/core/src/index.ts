import type { AvatarProfile, District, Mission } from "../../../cores/types/src/index";

export const districts: District[] = [
  { id: "switchyard", name: "Switchyard Ward", mood: "electric", danger: 0.34, coherence: 0.72, landmarks: ["Signal House", "Underpass 9", "Market Steps"] },
  { id: "paper-lantern", name: "Paper Lantern Row", mood: "quiet", danger: 0.18, coherence: 0.84, landmarks: ["Archive Cafe", "Blue Court", "Canal Walk"] },
  { id: "cinderline", name: "Cinderline", mood: "restless", danger: 0.58, coherence: 0.49, landmarks: ["Freight Loop", "Old Foundry", "Skybridge"] },
];

export const missions: Mission[] = [
  { id: "signal-run", title: "Signal Run", briefing: "Carry a sealed recorder from Signal House to the Archive Cafe without losing the route trace.", districtId: "switchyard", objective: "deliver", reward: 120, status: "available" },
  { id: "quiet-survey", title: "Quiet Survey", briefing: "Map the calmest corners of Paper Lantern Row for the next avatar rehearsal.", districtId: "paper-lantern", objective: "survey", reward: 80, status: "available" },
  { id: "foundry-rehearsal", title: "Foundry Rehearsal", briefing: "Rehearse a route through Cinderline while the Coherence Node records synthetic telemetry.", districtId: "cinderline", objective: "rehearse", reward: 160, status: "available" },
];

export const defaultAvatar: AvatarProfile = {
  id: "twin-001",
  name: "Mara Vale",
  archetype: "courier",
  style: "utility",
  energy: 74,
  empathy: 61,
  focus: 82,
  mobility: 76,
};

export function applyAvatarShift(avatar: AvatarProfile, axis: "focus" | "mobility" | "empathy", delta: number): AvatarProfile {
  return { ...avatar, [axis]: Math.min(100, Math.max(0, avatar[axis] + delta)) };
}
