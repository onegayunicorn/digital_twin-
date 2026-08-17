/**
 * Design: Graphite Specimen Ledger extended into an original urban archive.
 * This panel is game fiction and simulated telemetry only; it has no hardware-control path.
 */
import { useState } from "react";
import { Activity, MapPin, Radio, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { defaultAvatar, districts, missions } from "../../../game/core/src/index";
import { CoherenceNode } from "../../../engines/coherence-node/src/index";
import { SimulatedBciDevice } from "../../../devices/bci-simulator/src/index";
import { YeeGridPanel } from "@/components/YeeGridPanel";
import { CosmicEngineSummaryCard } from "@/components/CosmicEngineSummaryCard";

export function UrbanArchivePanel() {
  const [districtId, setDistrictId] = useState(districts[0].id);
  const [missionId, setMissionId] = useState(missions[0].id);
  const [deviceConnected, setDeviceConnected] = useState(false);
  const [nodeState, setNodeState] = useState(new CoherenceNode().snapshot());
  const district = districts.find((item) => item.id === districtId) ?? districts[0];
  const mission = missions.find((item) => item.id === missionId) ?? missions[0];
  const toggleSimulation = () => {
    if (deviceConnected) {
      setDeviceConnected(false);
      setNodeState(new CoherenceNode().snapshot());
      return;
    }
    const device = new SimulatedBciDevice("mock-halo-01");
    device.grantSimulationConsent();
    device.connect();
    const node = new CoherenceNode();
    node.setConsent(true);
    node.start();
    setNodeState(node.ingest(device.readSample()));
    setDeviceConnected(true);
  };

  return (
    <section className="urban-archive" id="urban-archive" aria-labelledby="urban-archive-title">
      <div className="urban-heading">
        <div>
          <span className="eyebrow">GAME SYSTEMS / ORIGINAL URBAN ARCHIVE</span>
          <h2 id="urban-archive-title">Build a twin. Read the borough.</h2>
          <p>A playable systems slice for an original city, avatar, mission board, and consent-gated synthetic signal stream.</p>
        </div>
        <div className="safety-stamp"><ShieldCheck /><span>READ-ONLY SIMULATION</span><small>No stimulation · no diagnosis · no actuation</small></div>
      </div>

      <div className="urban-grid">
        <div className="district-card urban-paper">
          <div className="section-kicker"><MapPin /><span>DISTRICT INDEX</span></div>
          {districts.map((item) => (
            <button key={item.id} className={`district-row ${district.id === item.id ? "selected" : ""}`} onClick={() => setDistrictId(item.id)}>
              <span>{item.name}</span><small>{item.mood} · {Math.round(item.coherence * 100)}% coherence</small>
            </button>
          ))}
          <div className="district-detail"><span>ACTIVE DISTRICT</span><strong>{district.name}</strong><p>{district.landmarks.join(" · ")}</p><small>Route risk {Math.round(district.danger * 100)} / 100</small></div>
        </div>

        <div className="mission-card urban-paper">
          <div className="section-kicker"><Sparkles /><span>MISSION BOARD</span></div>
          {missions.map((item) => (
            <button key={item.id} className={`mission-row ${mission.id === item.id ? "selected" : ""}`} onClick={() => setMissionId(item.id)}>
              <span>{item.title}</span><small>{item.objective} · +{item.reward} archive credits</small>
            </button>
          ))}
          <div className="mission-detail"><span>BRIEFING / {mission.districtId.toUpperCase()}</span><strong>{mission.title}</strong><p>{mission.briefing}</p><Button size="sm" variant="outline">Mark rehearsal ready</Button></div>
        </div>

        <div className="node-card urban-paper">
          <div className="section-kicker"><Radio /><span>COHERENCE NODE / MOCK HALO</span></div>
          <p className="node-boundary">Synthetic samples drive visual feedback only. The adapter is read-only and hard-coded with <code>hardwareActuation: false</code>.</p>
          <div className="node-metric"><span>COHERENCE</span><strong>{Math.round((nodeState.coherence || 0) * 100)}%</strong><i style={{ width: `${(nodeState.coherence || 0) * 100}%` }} /></div>
          <div className="node-metric"><span>FOCUS INDEX</span><strong>{Math.round((nodeState.focus || 0) * 100)}%</strong><i style={{ width: `${(nodeState.focus || 0) * 100}%` }} /></div>
          <div className="node-status"><Activity /><span>{deviceConnected ? `STREAMING / ${nodeState.outputs.ledPreview.toUpperCase()} PREVIEW` : "DISCONNECTED / SIMULATION READY"}</span></div>
          <Button className="node-toggle" onClick={toggleSimulation}>{deviceConnected ? "Pause mock stream" : "Start mock stream"}</Button>
        </div>
      </div>

      <YeeGridPanel />
      <CosmicEngineSummaryCard />

      <div className="avatar-brief"><span>ACTIVE DIGITAL TWIN</span><strong>{defaultAvatar.name}</strong><small>{defaultAvatar.archetype} / {defaultAvatar.style} / focus {defaultAvatar.focus}</small><em>Game representation only · not a biometric identity model</em></div>
    </section>
  );
}
