/**
 * Design: Graphite Specimen Ledger — visual correlations stay precise, quiet, and explicitly non-operational.
 * The chamber is a browser-only analogy renderer; it has no physical-device controls.
 */
import { Canvas, useFrame } from "@react-three/fiber";
import { Line, OrbitControls, Stars } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

type ParticleChamberProps = {
  time: number;
  correlation: number;
  fieldPattern: number;
  environment: number;
  particleCount: number;
};

function FieldCore({ time, correlation, fieldPattern, environment, particleCount }: ParticleChamberProps) {
  const particles = useRef<THREE.InstancedMesh>(null);
  const halo = useRef<THREE.Mesh>(null);
  const matrix = useMemo(() => new THREE.Matrix4(), []);
  const temp = useMemo(() => new THREE.Object3D(), []);
  const seeds = useMemo(() => {
    const count = Math.min(particleCount, 120);
    return Array.from({ length: count }, (_, index) => {
      const theta = index * 2.39996323;
      const radius = 0.38 + 2.2 * Math.sqrt((index + 1) / count);
      return { theta, radius, z: ((index * 17) % 37) / 37 - 0.5, offset: index * 0.41 };
    });
  }, [particleCount]);

  useFrame((state) => {
    const elapsed = state.clock.elapsedTime;
    const active = time / 100;
    if (particles.current) {
      seeds.forEach((seed, index) => {
        const oscillation = Math.sin(elapsed * (0.8 + fieldPattern * 1.1) + seed.offset) * (0.06 + active * 0.13);
        const drift = active > 0.56 ? (active - 0.56) * 0.55 * correlation : 0;
        temp.position.set(
          Math.cos(seed.theta + elapsed * 0.06) * (seed.radius - drift + oscillation),
          Math.sin(seed.theta + elapsed * 0.06) * (seed.radius - drift + oscillation),
          seed.z * (1.7 - environment * 0.35) + Math.cos(elapsed + seed.offset) * 0.1,
        );
        temp.scale.setScalar(0.023 + correlation * 0.02 + (index % 5) * 0.002);
        temp.updateMatrix();
        particles.current?.setMatrixAt(index, temp.matrix);
      });
      particles.current.instanceMatrix.needsUpdate = true;
    }
    if (halo.current) {
      halo.current.rotation.z = elapsed * (0.1 + fieldPattern * 0.2);
      halo.current.scale.setScalar(0.9 + active * 0.25 + Math.sin(elapsed * 2) * 0.02);
    }
  });

  const pairLines = useMemo(() => {
    const count = Math.min(10, Math.floor(seeds.length / 9));
    return Array.from({ length: count }, (_, index) => {
      const a = seeds[index * 3];
      const b = seeds[seeds.length - 1 - index * 4];
      return [
        [Math.cos(a.theta) * a.radius, Math.sin(a.theta) * a.radius, a.z],
        [Math.cos(b.theta) * b.radius, Math.sin(b.theta) * b.radius, b.z],
      ] as [number, number, number][];
    });
  }, [seeds]);

  return (
    <group>
      <mesh ref={halo} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.15, 0.018, 12, 96]} />
        <meshStandardMaterial color="#d47b3a" emissive="#d47b3a" emissiveIntensity={0.65} transparent opacity={0.78} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.38, 0.012, 12, 96]} />
        <meshStandardMaterial color="#79d7e6" emissive="#79d7e6" emissiveIntensity={0.72} transparent opacity={0.72} />
      </mesh>
      {pairLines.map((points, index) => (
        <Line key={index} points={points} color="#79d7e6" transparent opacity={0.14 + correlation * 0.38} lineWidth={0.75} dashed dashSize={0.12} gapSize={0.18} />
      ))}
      <instancedMesh ref={particles} args={[undefined, undefined, seeds.length]}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshStandardMaterial color="#79d7e6" emissive="#16737c" emissiveIntensity={0.65} roughness={0.28} />
      </instancedMesh>
      <mesh>
        <icosahedronGeometry args={[0.22, 2]} />
        <meshStandardMaterial color="#e3a15f" emissive="#c76f2e" emissiveIntensity={1.2} roughness={0.22} metalness={0.42} />
      </mesh>
    </group>
  );
}

export function ParticleChamber(props: ParticleChamberProps) {
  return (
    <div className="chamber-canvas" aria-label="3D particle correlation visual model">
      <Canvas camera={{ position: [0, 0, 7.6], fov: 38 }} dpr={[1, 1.5]}>
        <color attach="background" args={["#0a0d0d"]} />
        <ambientLight intensity={0.35} />
        <pointLight position={[2, 3, 3]} intensity={2.2} color="#79d7e6" />
        <pointLight position={[-3, -1, 2]} intensity={1.25} color="#d47b3a" />
        <Stars radius={15} depth={8} count={420} factor={2} saturation={0} fade speed={0.5} />
        <FieldCore {...props} />
        <OrbitControls enablePan={false} minDistance={6.7} maxDistance={9.4} autoRotate autoRotateSpeed={0.3} />
      </Canvas>
      <div className="chamber-overlay chamber-overlay-left"><span className="eyebrow">VISUAL MODEL</span><strong>Particle ensemble</strong><small>Dimensionless motion</small></div>
      <div className="chamber-overlay chamber-overlay-right"><span>NO DEVICE CONNECTED</span><i /></div>
    </div>
  );
}
