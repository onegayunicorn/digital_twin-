import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";
import type { CosmicSnapshot } from "../../../engines/cosmic/src";
import { useAspectScale } from "@/contexts/AspectScalingContext";

export type LayerVisibility = {
  lattice: boolean;
  lightGrid: boolean;
  shadowGrid: boolean;
  resonanceMesh: boolean;
  voidBoundary: boolean;
  asteroids: boolean;
  conduitPipes: boolean;
  forceVectors: boolean;
  labels: boolean;
};

type CosmicSimulation3DProps = {
  snapshot: CosmicSnapshot | null;
  layers: LayerVisibility;
  selectedBodyId: string | null;
  onSelectBody: (id: string | null) => void;
  cameraView: "isometric" | "topDown" | "ecliptic" | "solarFocus" | "asteroidPOV";
};

// 1. Fluid Space Equilibrium Lattice Mesh Component
function DeformedLatticeMesh({
  heightGrid,
  harmonicPhase,
  visible,
}: {
  heightGrid?: number[][];
  harmonicPhase: number;
  visible: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const gridResolution = heightGrid?.length ?? 21;
  const span = 36;

  const geometry = useMemo(() => {
    return new THREE.PlaneGeometry(span, span, gridResolution - 1, gridResolution - 1);
  }, [gridResolution, span]);

  useFrame(() => {
    if (!meshRef.current || !heightGrid) return;
    const pos = meshRef.current.geometry.attributes.position;
    if (!pos) return;
    let idx = 0;
    for (let i = 0; i < gridResolution; i++) {
      for (let j = 0; j < gridResolution; j++) {
        const height = heightGrid[i]?.[j] ?? 0;
        pos.setZ(idx, height * 1.6);
        idx++;
      }
    }
    pos.needsUpdate = true;
    meshRef.current.geometry.computeVertexNormals();
  });

  if (!visible) return null;

  return (
    <group rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6, 0]}>
      <mesh ref={meshRef} geometry={geometry as any}>
        <meshStandardMaterial
          color="#0f2622"
          wireframe
          transparent
          opacity={0.45}
          roughness={0.8}
        />
      </mesh>
      {/* Harmonic Push-Pull Center Ripple Ring */}
      <mesh position={[0, 0, 0.05]} rotation={[0, 0, harmonicPhase]}>
        <ringGeometry args={[1.8, 1.88 + 0.3 * Math.sin(harmonicPhase * 2), 48]} />
        <meshBasicMaterial color="#79d7e6" transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

// 2. 5D Reflection Grid Component (Solar Illumination Vectors & Growth Spacing Lines)
function SolarReflectionGrid({
  delta_x,
  celestialBodies,
  solarFlareActive,
  visible,
}: {
  delta_x: number;
  celestialBodies: CosmicSnapshot["lattice"]["celestialBodies"];
  solarFlareActive: boolean;
  visible: boolean;
}) {
  // Generate 5D Growth Spacing Orthogonal Grid Lines based on calculated delta_x
  const gridLinesGeo = useMemo(() => {
    const points: number[] = [];
    const spacing = Math.max(1.2, Math.min(6.0, delta_x * 0.45));
    const range = 24;

    for (let x = -range; x <= range; x += spacing) {
      points.push(x, 0, -range, x, 0, range);
    }
    for (let z = -range; z <= range; z += spacing) {
      points.push(-range, 0, z, range, 0, z);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
    return geo;
  }, [delta_x]);

  const lightRays = useMemo(() => {
    return celestialBodies
      .filter((b) => b.id !== "sun")
      .map((body) => {
        const start = new THREE.Vector3(0, 0, 0);
        const end = new THREE.Vector3(...body.position);
        const lineGeo = new THREE.BufferGeometry().setFromPoints([start, end]);
        const lineMat = new THREE.LineBasicMaterial({
          color: solarFlareActive ? 0xfbbf24 : 0xeab308,
          transparent: true,
          opacity: 0.55,
        });
        const lineObj = new THREE.Line(lineGeo, lineMat);
        const midPos = [body.position[0] * 0.5, body.position[1] * 0.5, body.position[2] * 0.5] as [number, number, number];
        return { id: body.id, lineObj, midPos };
      });
  }, [celestialBodies, solarFlareActive]);

  if (!visible) return null;

  return (
    <group>
      {/* Photosynthetic Growth Spacing Grid Floor */}
      <lineSegments geometry={gridLinesGeo as any}>
        <lineBasicMaterial
          color={solarFlareActive ? "#f59e0b" : "#79d7e6"}
          transparent
          opacity={solarFlareActive ? 0.4 : 0.18}
        />
      </lineSegments>

      {/* Primary Optical Vectors V_light from Solar Core to Planets */}
      {lightRays.map((ray) => (
        <group key={`light-ray-${ray.id}`}>
          <primitive object={ray.lineObj} />
          {/* Photon wave pulse along light vector */}
          <mesh position={ray.midPos}>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshBasicMaterial color="#fef08a" transparent opacity={0.7} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// 3. Shadow Umbral Grid Component (Anti-Vectors -V_light)
function ShadowUmbralGrid({
  umbralCones,
  visible,
}: {
  umbralCones: CosmicSnapshot["lightGrid"]["umbralCones"];
  visible: boolean;
}) {
  const coneObjects = useMemo(() => {
    if (!umbralCones) return [];
    return umbralCones.map((cone) => {
      const [ox, oy, oz] = cone.origin;
      const [dx, dy, dz] = cone.direction;
      const dir = new THREE.Vector3(dx, dy, dz).normalize();
      const endPos = new THREE.Vector3(ox, oy, oz).add(dir.clone().multiplyScalar(cone.length));
      const midPos = new THREE.Vector3(ox, oy, oz).add(dir.clone().multiplyScalar(cone.length * 0.5));

      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(ox, oy, oz),
        endPos,
      ]);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x818cf8,
        transparent: true,
        opacity: 0.4,
      });
      const lineObj = new THREE.Line(lineGeo, lineMat);

      const orientation = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        dir
      );

      return {
        lineObj,
        midPos: [midPos.x, midPos.y, midPos.z] as [number, number, number],
        orientation,
        radius: cone.radius * 1.6,
        length: cone.length,
      };
    });
  }, [umbralCones]);

  if (!visible || !umbralCones) return null;

  return (
    <group>
      {coneObjects.map((cone, idx) => (
        <group key={`umbral-${idx}`}>
          <primitive object={cone.lineObj} />
          {/* Cold non-resonant shadow cone volume */}
          <mesh
            position={cone.midPos}
            quaternion={cone.orientation as any}
          >
            <coneGeometry args={[cone.radius, cone.length, 16, 1, true]} />
            <meshStandardMaterial
              color="#312e81"
              emissive="#1e1b4b"
              transparent
              opacity={0.28}
              side={THREE.DoubleSide}
              wireframe
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// 4. Photonic Resonance Mesh Component (Quantum Drum-Skin Nodes & Wave Ripples)
function PhotonicResonanceMesh({
  nodes,
  visible,
}: {
  nodes?: CosmicSnapshot["resonanceMesh"]["nodes"];
  visible: boolean;
}) {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    if (!nodes || nodes.length === 0) return { positions: new Float32Array(0), colors: new Float32Array(0) };
    const pos = new Float32Array(nodes.length * 3);
    const col = new Float32Array(nodes.length * 3);
    const baseColor = new THREE.Color("#a78bfa");
    const activeColor = new THREE.Color("#38bdf8");

    nodes.forEach((node, i) => {
      pos[i * 3] = node.x;
      pos[i * 3 + 1] = node.y + 0.15;
      pos[i * 3 + 2] = node.z;

      const c = baseColor.clone().lerp(activeColor, node.energyPulse);
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    });

    return { positions: pos, colors: col };
  }, [nodes]);

  useFrame(() => {
    if (!pointsRef.current || !nodes) return;
    const posAttr = pointsRef.current.geometry.attributes.position;
    if (!posAttr) return;

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      posAttr.setY(i, node.y + 0.15);
    }
    posAttr.needsUpdate = true;
  });

  if (!visible || !nodes) return null;

  return (
    <group>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.22}
          vertexColors
          transparent
          opacity={0.85}
        />
      </points>
    </group>
  );
}

// 5. Void Field & Cosmic Inversion Containment Boundary
function CosmicInversionBoundary({
  containmentRadius,
  pressureIndex,
  visible,
}: {
  containmentRadius: number;
  pressureIndex: number;
  visible: boolean;
}) {
  const boundaryRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!boundaryRef.current) return;
    boundaryRef.current.rotation.y = state.clock.elapsedTime * 0.03;
    boundaryRef.current.rotation.x = state.clock.elapsedTime * 0.015;
  });

  if (!visible) return null;

  return (
    <group>
      {/* Outer spherical containment shell */}
      <mesh ref={boundaryRef}>
        <sphereGeometry args={[containmentRadius, 32, 24]} />
        <meshBasicMaterial
          color="#1e1b4b"
          wireframe
          transparent
          opacity={0.12 + pressureIndex * 0.08}
        />
      </mesh>
      {/* Inward compression vectors indicator ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[containmentRadius - 0.2, containmentRadius, 64]} />
        <meshBasicMaterial color="#6366f1" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

// 6. Deterministic Asteroid System & Equilibrium Conduit Pipes
function DeterministicAsteroids({
  asteroids,
  conduitRadius,
  showPipes,
  showForces,
  visible,
  onSelectAsteroid,
}: {
  asteroids?: CosmicSnapshot["asteroidSystem"]["asteroids"];
  conduitRadius: number;
  showPipes: boolean;
  showForces: boolean;
  visible: boolean;
  onSelectAsteroid: (id: string) => void;
}) {
  if (!visible || !asteroids) return null;

  return (
    <group>
      {/* Deterministic Conduit "Pipe" Ring (F_net = 0 Channel) */}
      {showPipes && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <ringGeometry args={[conduitRadius - 0.4, conduitRadius + 0.4, 96]} />
          <meshBasicMaterial
            color="#2dd4bf"
            transparent
            opacity={0.22}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Asteroids Particles */}
      {asteroids.map((ast) => {
        const [px, py, pz] = ast.position;
        const [fx, fy, fz] = ast.F_net;
        const forceLine = showForces
          ? new THREE.Line(
              new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(fx * 1.8, fy * 1.8, fz * 1.8),
              ]),
              new THREE.LineBasicMaterial({ color: 0xf43f5e })
            )
          : null;

        return (
          <group key={`ast-${ast.id}`} position={[px, py, pz]}>
            <mesh
              onClick={(e) => {
                e.stopPropagation();
                onSelectAsteroid(`asteroid-${ast.id}`);
              }}
            >
              <dodecahedronGeometry args={[0.12, 0]} />
              <meshStandardMaterial
                color={ast.isInConduit ? "#2dd4bf" : "#f43f5e"}
                roughness={0.7}
                metalness={0.3}
              />
            </mesh>

            {/* In-Conduit Force Vector Display */}
            {forceLine && <primitive object={forceLine} />}
          </group>
        );
      })}
    </group>
  );
}

// 7. Celestial Bodies (Sun & Orbiting Planets)
function CelestialSystem({
  bodies,
  solarFlareActive,
  selectedBodyId,
  showLabels,
  onSelectBody,
}: {
  bodies: CosmicSnapshot["lattice"]["celestialBodies"];
  solarFlareActive: boolean;
  selectedBodyId: string | null;
  showLabels: boolean;
  onSelectBody: (id: string) => void;
}) {
  const sunRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!sunRef.current) return;
    sunRef.current.rotation.y = state.clock.elapsedTime * 0.1;
  });

  return (
    <group>
      {bodies.map((body) => {
        const isSun = body.id === "sun";
        const isSelected = selectedBodyId === body.id;
        const [bx, by, bz] = body.position;

        return (
          <group key={body.id} position={[bx, by, bz]}>
            {/* Orbital path ring for planets */}
            {!isSun && (
              <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[-bx, 0, -bz]}
              >
                <ringGeometry args={[body.distance - 0.02, body.distance + 0.02, 64]} />
                <meshBasicMaterial color="#334155" transparent opacity={0.35} />
              </mesh>
            )}

            {/* The Celestial Body Sphere */}
            <mesh
              ref={isSun ? sunRef : undefined}
              onClick={(e) => {
                e.stopPropagation();
                onSelectBody(body.id);
              }}
            >
              <sphereGeometry args={[body.radius, 32, 24]} />
              {isSun ? (
                <meshStandardMaterial
                  color={solarFlareActive ? "#fbbf24" : "#f59e0b"}
                  emissive={solarFlareActive ? "#f59e0b" : "#d97706"}
                  emissiveIntensity={solarFlareActive ? 3.5 : 2.0}
                  roughness={0.2}
                />
              ) : (
                <meshStandardMaterial
                  color={body.color}
                  emissive={body.emissive ?? "#000000"}
                  emissiveIntensity={0.2}
                  roughness={0.6}
                  metalness={0.1}
                />
              )}
            </mesh>

            {/* Solar Corona Glow / Flare Shockwave */}
            {isSun && (
              <mesh scale={[1.25 + (solarFlareActive ? 0.35 : 0), 1.25 + (solarFlareActive ? 0.35 : 0), 1.25 + (solarFlareActive ? 0.35 : 0)]}>
                <sphereGeometry args={[body.radius, 24, 18]} />
                <meshBasicMaterial
                  color={solarFlareActive ? "#ef4444" : "#fbbf24"}
                  transparent
                  opacity={solarFlareActive ? 0.45 : 0.22}
                  wireframe
                />
              </mesh>
            )}

            {/* Saturn's Planetary Rings */}
            {body.hasRings && (
              <mesh rotation={[Math.PI / 3, 0, 0]}>
                <ringGeometry args={[body.radius * 1.4, body.radius * 2.3, 32]} />
                <meshStandardMaterial
                  color="#cbd5e1"
                  transparent
                  opacity={0.65}
                  side={THREE.DoubleSide}
                />
              </mesh>
            )}

            {/* Selection Highlight */}
            {isSelected && (
              <mesh scale={[1.4, 1.4, 1.4]}>
                <sphereGeometry args={[body.radius, 16, 12]} />
                <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.8} />
              </mesh>
            )}

            {/* Specimen Label */}
            {showLabels && (
              <Text
                position={[0, body.radius + 0.45, 0]}
                fontSize={0.35}
                color="#e2e8f0"
                anchorX="center"
                anchorY="bottom"
              >
                {body.name}
              </Text>
            )}
          </group>
        );
      })}
    </group>
  );
}

// Camera View Controller
function CameraController({
  view,
}: {
  view: "isometric" | "topDown" | "ecliptic" | "solarFocus" | "asteroidPOV";
}) {
  const controlsRef = useRef<any>(null);
  const { camera, size } = useThree();
  const aspect = size.width / Math.max(1, size.height);

  // Smoothly adapt FOV when aspect ratio changes (e.g. mobile 9:16 vs ultrawide 21:9)
  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      const baseFov = 45;
      // When aspect is portrait (< 1.0), expand FOV so wide celestial orbits aren't clipped
      const adaptedFov = aspect < 1.0 ? Math.min(75, baseFov / Math.max(0.55, aspect * 0.95)) : baseFov;
      camera.fov = adaptedFov;
      camera.updateProjectionMatrix();
    }
  }, [aspect, camera]);

  useFrame(() => {
    if (!controlsRef.current) return;
    const targetPos = new THREE.Vector3();
    const cameraPos = new THREE.Vector3();

    switch (view) {
      case "topDown":
        cameraPos.set(0, 36, 0.01);
        targetPos.set(0, 0, 0);
        break;
      case "ecliptic":
        cameraPos.set(24, 2.5, 24);
        targetPos.set(0, 0, 0);
        break;
      case "solarFocus":
        cameraPos.set(4.5, 3.2, 5.0);
        targetPos.set(0, 0, 0);
        break;
      case "asteroidPOV":
        cameraPos.set(10.2, 2.0, 10.2);
        targetPos.set(0, 0, 0);
        break;
      case "isometric":
      default:
        cameraPos.set(18, 16, 22);
        targetPos.set(0, 0, 0);
        break;
    }

    camera.position.lerp(cameraPos as any, 0.05);
    controlsRef.current.target.lerp(targetPos as any, 0.05);
    controlsRef.current.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.06}
      minDistance={3}
      maxDistance={60}
    />
  );
}

export function CosmicSimulation3D({
  snapshot,
  layers,
  selectedBodyId,
  onSelectBody,
  cameraView,
}: CosmicSimulation3DProps) {
  const { effectiveDpr } = useAspectScale();

  if (!snapshot) {
    return (
      <div className="canvas-fallback">
        <span>INITIALIZING 3D COSMIC ENGINE STAGE…</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[460px] bg-[#070a09] overflow-hidden">
      <Canvas
        camera={{ position: [18, 16, 22], fov: 45 }}
        dpr={effectiveDpr}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#060908"]} />
        <ambientLight intensity={0.4} />
        <pointLight position={[0, 0, 0]} intensity={3.5} color="#fbbf24" distance={50} decay={1.2} />
        <directionalLight position={[10, 20, 15]} intensity={0.6} />

        <CameraController view={cameraView} />

        {/* 1. Equilibrium Fluid Lattice Sheet */}
        <DeformedLatticeMesh
          heightGrid={snapshot.lattice.heightGrid}
          harmonicPhase={snapshot.lattice.harmonicPhase}
          visible={layers.lattice}
        />

        {/* 2. 5D Reflection Light Grid */}
        <SolarReflectionGrid
          delta_x={snapshot.lightGrid.delta_x}
          celestialBodies={snapshot.lattice.celestialBodies}
          solarFlareActive={snapshot.lightGrid.solarFlareActive}
          visible={layers.lightGrid}
        />

        {/* 3. Shadow Umbral Grid Cones */}
        <ShadowUmbralGrid
          umbralCones={snapshot.lightGrid.umbralCones}
          visible={layers.shadowGrid}
        />

        {/* 4. Photonic Resonance Mesh */}
        <PhotonicResonanceMesh
          nodes={snapshot.resonanceMesh.nodes}
          visible={layers.resonanceMesh}
        />

        {/* 5. Cosmic Inversion Void Boundary */}
        <CosmicInversionBoundary
          containmentRadius={snapshot.voidField.containmentRadius}
          pressureIndex={snapshot.voidField.pressureIndex}
          visible={layers.voidBoundary}
        />

        {/* 6. Deterministic Asteroid Belt & Conduit Pipes */}
        <DeterministicAsteroids
          asteroids={snapshot.asteroidSystem.asteroids}
          conduitRadius={snapshot.asteroidSystem.equilibriumPipeRadius}
          showPipes={layers.conduitPipes}
          showForces={layers.forceVectors}
          visible={layers.asteroids}
          onSelectAsteroid={(id) => onSelectBody(id)}
        />

        {/* 7. Celestial Sun & Planets */}
        <CelestialSystem
          bodies={snapshot.lattice.celestialBodies}
          solarFlareActive={snapshot.lightGrid.solarFlareActive}
          selectedBodyId={selectedBodyId}
          showLabels={layers.labels}
          onSelectBody={onSelectBody}
        />
      </Canvas>

      {/* Viewport Overlay Badges */}
      <div className="absolute top-3 left-4 pointer-events-none flex flex-col gap-1 font-mono text-[10px] text-[#a4afa5]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#79d7e6] animate-pulse" />
          <strong className="text-[#f4eee4] text-xs">TRI-STRUCTURE COSMIC FIELD</strong>
        </div>
        <span>TICK: {snapshot.tick} · TIME: {snapshot.time.toFixed(1)}s</span>
        <span className="text-[#d9ad7a]">Δx: {snapshot.lightGrid.delta_x.toFixed(3)} AU (GROWTH SPACING)</span>
      </div>

      <div className="absolute top-3 right-4 pointer-events-none flex flex-col items-end gap-1 font-mono text-[10px] text-[#a4afa5]">
        <span className="text-[#79d7e6]">OSCILLATOR: {snapshot.lattice.pushPullState}</span>
        <span>NET FORCE BALANCE: {snapshot.asteroidSystem.averageNetForce < 0.8 ? "EQUILIBRIUM (F_net ≈ 0)" : "DYNAMIC TRANSIENT"}</span>
        <span>CERTAINTY INDEX: {(snapshot.asteroidSystem.deterministicCertaintyIndex * 100).toFixed(1)}%</span>
      </div>
    </div>
  );
}
