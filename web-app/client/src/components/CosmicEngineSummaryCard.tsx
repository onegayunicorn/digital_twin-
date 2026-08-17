import { useState } from "react";
import { Sparkles, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CosmicEngine } from "../../../engines/cosmic/src/index";

export function CosmicEngineSummaryCard() {
  const [engine] = useState(() => new CosmicEngine({ seed: 441, latticeResolution: 15 }));
  const [snapshot, setSnapshot] = useState(() => engine.step());

  const handleStep = () => {
    setSnapshot(engine.step());
  };

  return (
    <div className="cosmic-engine-panel">
      <div className="cosmic-engine-heading">
        <div className="section-kicker">
          <Sparkles />
          <span>COSMIC ENGINE / FIELD SUMMARY SPECIMEN</span>
        </div>
        <span className="cosmic-engine-id">SPEC-TRI-STRUCTURE-01</span>
      </div>

      <div className="cosmic-engine-title-row">
        <div>
          <h3>Tri-Structure Field Summary (Mesh · Grid · Lattice)</h3>
          <p>
            Equilibrium fluid lattice displacement D_lat, 5D reflection growth spacing Δx = {snapshot.lightGrid.delta_x.toFixed(3)} AU, sub-atomic resonance mesh, and void pressure.
          </p>
        </div>
        <div className="cosmic-engine-status">
          <Activity />
          <span>STATUS / {snapshot.status} ({snapshot.safety})</span>
        </div>
      </div>

      <div className="cosmic-engine-records">
        <div className="cosmic-engine-record">
          <div>
            <span>LATTICE STATE</span>
            <small>{snapshot.lattice.pushPullState}</small>
          </div>
          <i style={{ width: `${Math.round(snapshot.lattice.displacement * 100)}%`, background: "#38bdf8" }} />
        </div>

        <div className="cosmic-engine-record">
          <div>
            <span>GROWTH SPACING (Δx)</span>
            <small>{snapshot.lightGrid.delta_x.toFixed(3)} AU</small>
          </div>
          <i style={{ width: `${Math.round(snapshot.lightGrid.photonDensity * 100)}%`, background: "#fbbf24" }} />
        </div>

        <div className="cosmic-engine-record">
          <div>
            <span>RESONANCE MESH</span>
            <small>{snapshot.resonanceMesh.activeNodes}/{snapshot.resonanceMesh.totalNodes} NODES</small>
          </div>
          <i style={{ width: `${Math.round(snapshot.resonanceMesh.propagationSpeed * 100)}%`, background: "#a78bfa" }} />
        </div>

        <div className="cosmic-engine-record">
          <div>
            <span>CONDUIT CERTAINTY</span>
            <small>{Math.round(snapshot.asteroidSystem.deterministicCertaintyIndex * 100)}%</small>
          </div>
          <i style={{ width: `${Math.round(snapshot.asteroidSystem.deterministicCertaintyIndex * 100)}%`, background: "#2dd4bf" }} />
        </div>
      </div>

      <div className="cosmic-engine-footer">
        <Button size="sm" variant="outline" className="cosmic-engine-run" onClick={handleStep}>
          Step Visual Field (Tick {snapshot.tick})
        </Button>
      </div>

      <small className="cosmic-engine-boundary">
        {snapshot.boundary}
      </small>
    </div>
  );
}
