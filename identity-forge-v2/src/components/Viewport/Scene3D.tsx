import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { LatticePoint, MorphWeights } from '../../core/types';

interface Scene3DProps {
  morphWeights?: MorphWeights;
  reflectionIntensity?: number;
  animationFrame?: number;
  yeeLattice?: LatticePoint[];
  slideFrames?: any[];
  modelUrl?: string;
}

/**
 * Scene3D — Main 3D viewport component
 * Renders the character model with morph targets, reflection grid, and slide transitions
 */
export const Scene3D: React.FC<Scene3DProps> = ({
  morphWeights = {},
  reflectionIntensity = 1.0,
  animationFrame = 0,
  yeeLattice = [],
  slideFrames = [],
  modelUrl = '/models/base-character.glb',
}) => {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      style={{ width: '100%', height: '100%' }}
      gl={{
        antialias: true,
        powerPreference: 'high-performance',
      }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} intensity={1.0} />
      <directionalLight position={[-10, -10, -10]} intensity={0.5} />
      <pointLight position={[0, 5, 0]} intensity={0.8} color="#a78bfa" />

      <CharacterModel
        morphWeights={morphWeights}
        reflectionIntensity={reflectionIntensity}
        modelUrl={modelUrl}
      />

      <ReflectionGrid
        lattice={yeeLattice}
        intensity={reflectionIntensity}
        frame={animationFrame}
      />

      {slideFrames.length > 0 && (
        <SlideTransitionLayer
          frames={slideFrames}
          currentFrame={animationFrame}
          intensity={reflectionIntensity}
        />
      )}

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        autoRotate={true}
        autoRotateSpeed={0.5}
      />
    </Canvas>
  );
};

// ─── Character Model ─────────────────────────────────────────────────────────

interface CharacterModelProps {
  morphWeights: MorphWeights;
  reflectionIntensity: number;
  modelUrl: string;
}

const CharacterModel: React.FC<CharacterModelProps> = ({
  morphWeights,
  reflectionIntensity,
  modelUrl,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [model, setModel] = useState<THREE.Group | null>(null);
  const [morphTargetNames, setMorphTargetNames] = useState<string[]>([]);

  useEffect(() => {
    const loader = new THREE.GLTFLoader();
    loader.load(
      modelUrl,
      (gltf) => {
        setModel(gltf.scene);
        // Extract morph target names from first mesh
        gltf.scene.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            if (mesh.morphTargetDictionary) {
              setMorphTargetNames(Object.keys(mesh.morphTargetDictionary));
            }
          }
        });
      },
      undefined,
      (error) => {
        console.warn('Could not load model, using placeholder:', error);
      }
    );
  }, [modelUrl]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001 * reflectionIntensity;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }

    // Apply morph target influences
    if (model) {
      model.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.morphTargetDictionary && mesh.morphTargetInfluences) {
            Object.entries(morphWeights).forEach(([key, value]) => {
              const index = mesh.morphTargetDictionary![key];
              if (index !== undefined) {
                mesh.morphTargetInfluences![index] = value * reflectionIntensity;
              }
            });
          }
        }
      });
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {model ? (
        <primitive object={model} scale={1.5} />
      ) : (
        <PlaceholderCharacter />
      )}
    </group>
  );
};

const PlaceholderCharacter: React.FC = () => {
  return (
    <group>
      {/* Head */}
      <mesh position={[0, 0.5, 0]}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial color="#e8d5c0" roughness={0.5} metalness={0.1} />
      </mesh>
      {/* Body */}
      <mesh position={[0, -0.8, 0]}>
        <capsuleGeometry args={[0.5, 1.2, 8, 16]} />
        <meshStandardMaterial color="#4a5568" roughness={0.7} />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.25, 0.6, 0.7]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#1a202c" />
      </mesh>
      <mesh position={[0.25, 0.6, 0.7]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#1a202c" />
      </mesh>
    </group>
  );
};

// ─── Reflection Grid ─────────────────────────────────────────────────────────

interface ReflectionGridProps {
  lattice: LatticePoint[];
  intensity: number;
  frame: number;
}

const ReflectionGrid: React.FC<ReflectionGridProps> = ({ lattice, intensity, frame }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.15 * intensity;
      (meshRef.current.geometry as THREE.PlaneGeometry).rotateZ(0.001);
    }
  });

  return (
    <group position={[0, 0, -1]}>
      {/* Main grid plane */}
      <mesh ref={meshRef}>
        <planeGeometry args={[10, 10, 32, 32]} />
        <meshBasicMaterial
          wireframe={true}
          color="#00e5ff"
          transparent={true}
          opacity={0.15 * intensity}
        />
      </mesh>

      {/* Secondary grid at offset */}
      <mesh position={[0, 0, -0.5]} rotation={[0.1, 0.05, 0]}>
        <planeGeometry args={[8, 8, 16, 16]} />
        <meshBasicMaterial
          wireframe={true}
          color="#a78bfa"
          transparent={true}
          opacity={0.08 * intensity}
        />
      </mesh>

      {/* Lattice points visualization */}
      {lattice.length > 0 && lattice.slice(0, 500).map((point, i) => (
        <mesh
          key={i}
          position={[
            point.position[0] * 3,
            point.position[1] * 3,
            point.position[2] * 0.5 - 2,
          ]}
        >
          <sphereGeometry args={[0.02 + point.intensity * 0.02, 8, 8]} />
          <meshBasicMaterial
            color={point.morphId === 'eyes' ? '#00e5ff' : '#a78bfa'}
            transparent={true}
            opacity={0.3 + point.weight * 0.4}
          />
        </mesh>
      ))}
    </group>
  );
};

// ─── Slide Transition Layer ─────────────────────────────────────────────────

interface SlideTransitionProps {
  frames: any[];
  currentFrame: number;
  intensity: number;
}

const SlideTransitionLayer: React.FC<SlideTransitionProps> = ({
  frames,
  currentFrame,
  intensity,
}) => {
  const frameIndex = currentFrame % Math.max(1, frames.length);
  const frame = frames[frameIndex] || {};
  const color = frame.color || '#00e5ff';

  return (
    <mesh position={[0, 0, -0.5]}>
      <planeGeometry args={[8, 6]} />
      <meshBasicMaterial
        color={color}
        transparent={true}
        opacity={0.15 * intensity}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

export default Scene3D;
