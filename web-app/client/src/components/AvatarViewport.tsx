/**
 * Design: Graphite Specimen Ledger — a materially grounded 3D avatar study with restrained cyan/amber signals.
 * This is a neutral geometric visualization, never a biometric or genetic model.
 */
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

export type FaceVector = { x: number; y: number };

type AvatarViewportProps = {
  resemblance: number;
  tone: number;
  vectors: Record<string, FaceVector>;
};

function Bust({ resemblance, tone, vectors }: AvatarViewportProps) {
  const group = useRef<THREE.Group>(null);
  const brow = vectors.brow ?? { x: 0, y: 0 };
  const eyes = vectors.eyes ?? { x: 0, y: 0 };
  const nose = vectors.nose ?? { x: 0, y: 0 };
  const jaw = vectors.jaw ?? { x: 0, y: 0 };
  const warm = new THREE.Color().lerpColors(new THREE.Color("#e4d2bd"), new THREE.Color("#a97955"), tone);

  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.32) * 0.08;
    group.current.position.y = Math.sin(state.clock.elapsedTime * 0.55) * 0.05;
  });

  return (
    <group ref={group} position={[0, -0.35, 0]}>
      <mesh position={[0, -1.8, 0]}>
        <cylinderGeometry args={[0.38, 0.5, 1.4, 32]} />
        <meshStandardMaterial color="#17201e" roughness={0.82} metalness={0.08} />
      </mesh>
      <mesh position={[0, -2.8, 0]} scale={[1.7, 0.52, 0.7]}>
        <sphereGeometry args={[1, 36, 24]} />
        <meshStandardMaterial color="#121918" roughness={0.73} metalness={0.14} />
      </mesh>
      <mesh scale={[0.82 + resemblance * 0.12 + jaw.x * 0.08, 1.08 + jaw.y * 0.06, 0.79]}>
        <sphereGeometry args={[1, 48, 36]} />
        <meshStandardMaterial color={`#${warm.getHexString()}`} roughness={0.58} metalness={0.06} />
      </mesh>
      <mesh scale={[0.828 + resemblance * 0.12 + jaw.x * 0.08, 1.088 + jaw.y * 0.06, 0.798]}>
        <sphereGeometry args={[1, 24, 18]} />
        <meshBasicMaterial color="#79d7e6" wireframe transparent opacity={0.12} />
      </mesh>
      <mesh position={[0, 0, 0.81]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.71, 0.008, 8, 48]} />
        <meshBasicMaterial color="#79d7e6" transparent opacity={0.34} />
      </mesh>
      <mesh position={[0, -0.42, 0.82]} scale={[0.68, 0.008, 0.008]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#d9ad7a" transparent opacity={0.52} />
      </mesh>
      <mesh position={[0, 0.16 + brow.y * 0.08, 0.73]} scale={[0.48 + brow.x * 0.06, 0.08, 0.06]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#273534" roughness={0.55} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * (0.31 + eyes.x * 0.06), 0.1 + eyes.y * 0.07, 0.73]}>
          <mesh scale={[0.13, 0.075, 0.055]}>
            <sphereGeometry args={[1, 24, 16]} />
            <meshStandardMaterial color="#253937" emissive="#0f514c" emissiveIntensity={0.12} roughness={0.86} />
          </mesh>
        </group>
      ))}
      <mesh position={[nose.x * 0.08, -0.18 + nose.y * 0.08, 0.85]} scale={[0.15, 0.42, 0.18]}>
        <coneGeometry args={[1, 1, 18]} />
        <meshStandardMaterial color={`#${warm.clone().offsetHSL(0, -0.05, -0.06).getHexString()}`} roughness={0.62} />
      </mesh>
      <mesh position={[0, -0.65, 0.72]} scale={[0.29 + jaw.x * 0.04, 0.018 + jaw.y * 0.006, 0.018]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#d9ad7a" transparent opacity={0.55} />
      </mesh>
      {[[-0.56, 0.02], [0.56, 0.02], [-0.43, -0.62], [0.43, -0.62]].map(([x, y], index) => (
        <mesh key={index} position={[x, y, 0.7]}>
          <sphereGeometry args={[0.026, 12, 12]} />
          <meshStandardMaterial color="#79d7e6" emissive="#79d7e6" emissiveIntensity={1.8} />
        </mesh>
      ))}
    </group>
  );
}

export function AvatarViewport(props: AvatarViewportProps) {
  return (
    <div className="three-stage" aria-label="Interactive 3D neutral avatar study">
      <Canvas camera={{ position: [0, 0.05, 7], fov: 32 }} dpr={[1, 1.6]}>
        <color attach="background" args={["#0e1211"]} />
        <ambientLight intensity={0.82} />
        <directionalLight position={[4, 5, 4]} intensity={1.8} color="#f2dfca" />
        <pointLight position={[-4, 1, 3]} intensity={1.5} color="#79d7e6" />
        <pointLight position={[0, -2, 2]} intensity={0.65} color="#d47b3a" />
        <Float speed={1.15} rotationIntensity={0.05} floatIntensity={0.12}>
          <Bust {...props} />
        </Float>
        <gridHelper args={[10, 16, "#22312e", "#17201e"]} position={[0, -3.2, 0]} />
        <OrbitControls enablePan={false} minDistance={5.8} maxDistance={8.2} maxPolarAngle={Math.PI / 2 + 0.25} />
      </Canvas>
      <div className="stage-scale" aria-hidden="true"><span>FACIAL MORPH STUDY</span><span>AXIS: NORMALIZED</span></div>
    </div>
  );
}
