'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { scrollState } from './scroll-state';

export const BUILD_SPREAD = {
  terrain: [0, -0.12, 0],
  foundation: [0, -0.45, 0],
  slab: [0, -0.18, 0],
  frame: [0, 0.8, 0],
  walls: [0, 1.5, 0],
  roof: [0, 2.5, 0],
  windows: [0, 0, 1.2],
  doors: [0, 0, 1.35],
  interior: [0, 0.55, -0.55],
  systems: [0.65, 0.8, 0.45],
  solar: [0, 2.9, 0],
  landscape: [0, -0.25, 0],
} as const;

export const BUILD_ROTATION = {
  foundation: [0, 0, -0.04],
  frame: [0.08, -0.03, 0.02],
  walls: [-0.06, 0.04, 0],
  roof: [0.08, 0, -0.04],
  windows: [0, 0.07, 0],
  systems: [0.3, -0.25, 0.2],
} as const;

type Vec3 = readonly [number, number, number];

const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);
const smoothstep = (edge0: number, edge1: number, value: number) => {
  const t = clamp01((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};

function Box({
  position,
  size,
  color,
  opacity = 1,
  emissive,
  emissiveIntensity = 0,
  metalness = 0.1,
  roughness = 0.65,
}: {
  position: Vec3;
  size: Vec3;
  color: string;
  opacity?: number;
  emissive?: string;
  emissiveIntensity?: number;
  metalness?: number;
  roughness?: number;
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
        metalness={metalness}
        roughness={roughness}
        transparent={opacity < 1}
        opacity={opacity}
      />
    </mesh>
  );
}

function Pipe({ position, rotation = [0, 0, 0] as Vec3, color }: { position: Vec3; rotation?: Vec3; color: string }) {
  return (
    <mesh position={position} rotation={rotation}>
      <cylinderGeometry args={[0.045, 0.045, 1.35, 10]} />
      <meshStandardMaterial color={color} metalness={0.55} roughness={0.28} emissive={color} emissiveIntensity={0.12} />
    </mesh>
  );
}

function Tree({ position, scale = 1 }: { position: Vec3; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.055, 0.075, 0.85, 8]} />
        <meshStandardMaterial color="#5f3825" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1, 0]}>
        <sphereGeometry args={[0.36, 12, 8]} />
        <meshStandardMaterial color="#356447" roughness={0.92} />
      </mesh>
    </group>
  );
}

function HouseModel({ reduced }: { reduced: boolean }) {
  const terrain = useRef<THREE.Group>(null);
  const blueprint = useRef<THREE.Group>(null);
  const foundation = useRef<THREE.Group>(null);
  const slab = useRef<THREE.Group>(null);
  const frame = useRef<THREE.Group>(null);
  const walls = useRef<THREE.Group>(null);
  const roof = useRef<THREE.Group>(null);
  const windows = useRef<THREE.Group>(null);
  const doors = useRef<THREE.Group>(null);
  const interior = useRef<THREE.Group>(null);
  const systems = useRef<THREE.Group>(null);
  const solar = useRef<THREE.Group>(null);
  const landscape = useRef<THREE.Group>(null);
  const { camera, size } = useThree();

  /* eslint-disable react-hooks/immutability -- R3F requires imperative camera updates inside the render loop. */
  useFrame((_, delta) => {
    const progress = reduced ? 1 : scrollState.progress;
    const orbitProgress = smoothstep(0, 0.3, progress);
    const finalProgress = smoothstep(0.7, 1, progress);
    const mobile = size.width < 640;
    const radius = mobile ? 10.8 : 8.4;
    const angle = progress < 0.3 ? orbitProgress * Math.PI * 2 : Math.PI * 0.78;
    const cameraTarget = progress < 0.3
      ? { x: Math.sin(angle) * radius, y: 3.7, z: Math.cos(angle) * radius }
      : progress < 0.7
        ? { x: 7.4, y: 6.6, z: 7.4 }
        : { x: 6.6, y: 4.55, z: 7.6 };

    if (reduced) {
      camera.position.set(6.6, 4.55, 7.6);
    } else {
      camera.position.x = THREE.MathUtils.damp(camera.position.x, cameraTarget.x, 3.2, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, cameraTarget.y, 3.2, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, cameraTarget.z, 3.2, delta);
    }
    camera.lookAt(0, 0.95, 0);

    const applyLayer = (
      ref: React.MutableRefObject<THREE.Group | null>,
      start: number,
      end: number,
      spread: Vec3,
      rotation: Vec3,
      scale = 1,
    ) => {
      const group = ref.current;
      if (!group) return;
      const assembly = smoothstep(start, end, progress);
      const exploded = 1 - assembly;
      group.position.x = THREE.MathUtils.damp(group.position.x, spread[0] * exploded, 5.5, delta);
      group.position.y = THREE.MathUtils.damp(group.position.y, spread[1] * exploded, 5.5, delta);
      group.position.z = THREE.MathUtils.damp(group.position.z, spread[2] * exploded, 5.5, delta);
      group.rotation.x = THREE.MathUtils.damp(group.rotation.x, rotation[0] * exploded, 5.5, delta);
      group.rotation.y = THREE.MathUtils.damp(group.rotation.y, rotation[1] * exploded, 5.5, delta);
      group.rotation.z = THREE.MathUtils.damp(group.rotation.z, rotation[2] * exploded, 5.5, delta);
      const targetScale = (0.2 + assembly * 0.8) * scale;
      group.scale.x = THREE.MathUtils.damp(group.scale.x, targetScale, 5.5, delta);
      group.scale.y = THREE.MathUtils.damp(group.scale.y, targetScale, 5.5, delta);
      group.scale.z = THREE.MathUtils.damp(group.scale.z, targetScale, 5.5, delta);
    };

    applyLayer(terrain, 0, 0.2, BUILD_SPREAD.terrain, [0, 0, 0]);
    applyLayer(foundation, 0.28, 0.43, BUILD_SPREAD.foundation, BUILD_ROTATION.foundation);
    applyLayer(slab, 0.32, 0.5, BUILD_SPREAD.slab, [0, 0, 0]);
    applyLayer(frame, 0.39, 0.57, BUILD_SPREAD.frame, BUILD_ROTATION.frame);
    applyLayer(walls, 0.47, 0.67, BUILD_SPREAD.walls, BUILD_ROTATION.walls);
    applyLayer(windows, 0.56, 0.73, BUILD_SPREAD.windows, BUILD_ROTATION.windows);
    applyLayer(doors, 0.59, 0.76, BUILD_SPREAD.doors, [0, 0, 0]);
    applyLayer(systems, 0.45, 0.72, BUILD_SPREAD.systems, BUILD_ROTATION.systems);
    applyLayer(interior, 0.68, 0.86, BUILD_SPREAD.interior, [0, 0, 0]);
    applyLayer(roof, 0.61, 0.79, BUILD_SPREAD.roof, BUILD_ROTATION.roof);
    applyLayer(solar, 0.75, 0.9, BUILD_SPREAD.solar, [0, 0, 0]);
    applyLayer(landscape, 0.82, 1, BUILD_SPREAD.landscape, [0, 0, 0]);

    const blueprintOpacity = 1 - smoothstep(0.04, 0.38, progress);
    blueprint.current?.traverse((object) => {
      const material = (object as THREE.Mesh).material;
      if (!material) return;
      const materials = Array.isArray(material) ? material : [material];
      materials.forEach((item) => {
        item.transparent = true;
        item.opacity = blueprintOpacity * 0.72;
      });
    });

    const warm = 0.15 + finalProgress * 0.9;
    windows.current?.traverse((object) => {
      const material = (object as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined;
      if (material?.emissiveIntensity !== undefined) material.emissiveIntensity = warm;
    });
  });
  /* eslint-enable react-hooks/immutability */

  return (
    <group scale={size.width < 640 ? 0.85 : 1}>
      <group ref={blueprint}>
        <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[16, 16]} />
          <meshBasicMaterial color="#0b7a98" wireframe transparent opacity={0.55} />
        </mesh>
        <mesh position={[0, 1.2, 0]}>
          <boxGeometry args={[5.1, 2.8, 3.5]} />
          <meshBasicMaterial color="#4dd8ff" wireframe transparent opacity={0.7} />
        </mesh>
        <mesh position={[0, 2.85, 0]}>
          <boxGeometry args={[5.35, 0.12, 3.75]} />
          <meshBasicMaterial color="#53e4ff" wireframe transparent opacity={0.8} />
        </mesh>
      </group>

      <group ref={terrain}>
        <mesh position={[0, -0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[18, 18]} />
          <meshStandardMaterial color="#061218" roughness={1} />
        </mesh>
        <gridHelper args={[16, 16, '#0e6375', '#0b2b35']} position={[0, 0, 0]} />
      </group>

      <group ref={foundation}>
        <Box position={[0, 0.04, 0]} size={[5.2, 0.22, 3.7]} color="#58656a" metalness={0.3} roughness={0.82} />
        <Box position={[-1.9, 0.22, -1.1]} size={[0.24, 0.46, 0.24]} color="#879396" />
        <Box position={[1.9, 0.22, -1.1]} size={[0.24, 0.46, 0.24]} color="#879396" />
        <Box position={[-1.9, 0.22, 1.1]} size={[0.24, 0.46, 0.24]} color="#879396" />
        <Box position={[1.9, 0.22, 1.1]} size={[0.24, 0.46, 0.24]} color="#879396" />
      </group>

      <group ref={slab}>
        <Box position={[0, 0.36, 0]} size={[5.25, 0.12, 3.72]} color="#8b989b" roughness={0.6} />
        <Box position={[0, 2.02, 0]} size={[5.25, 0.12, 3.72]} color="#8b989b" roughness={0.6} />
        <Box position={[0, 3.28, 0]} size={[5.35, 0.1, 3.78]} color="#96a2a4" roughness={0.64} />
      </group>

      <group ref={frame}>
        {[-2.15, -0.72, 0.72, 2.15].flatMap((x) => [0.95, 2.63].map((y) => <Box key={`${x}-${y}`} position={[x, y, -1.55]} size={[0.16, 1.55, 0.16]} color="#a9b5b6" metalness={0.6} roughness={0.36} />))}
        {[-2.15, -0.72, 0.72, 2.15].flatMap((x) => [0.95, 2.63].map((y) => <Box key={`front-${x}-${y}`} position={[x, y, 1.55]} size={[0.16, 1.55, 0.16]} color="#a9b5b6" metalness={0.6} roughness={0.36} />))}
        {[-1.55, 1.55].flatMap((z) => [0.95, 2.63].map((y) => <Box key={`side-${z}-${y}`} position={[-2.15, y, z]} size={[0.16, 1.55, 0.16]} color="#a9b5b6" metalness={0.6} roughness={0.36} />))}
        <Box position={[0, 1.72, -1.55]} size={[4.45, 0.16, 0.16]} color="#a9b5b6" metalness={0.65} roughness={0.35} />
        <Box position={[0, 3.34, -1.55]} size={[4.45, 0.16, 0.16]} color="#a9b5b6" metalness={0.65} roughness={0.35} />
      </group>

      <group ref={walls}>
        <Box position={[-2.05, 1.15, -1.43]} size={[0.38, 1.55, 2.55]} color="#b6b6ad" roughness={0.88} />
        <Box position={[2.05, 1.15, -1.43]} size={[0.38, 1.55, 2.55]} color="#b6b6ad" roughness={0.88} />
        <Box position={[0, 1.15, -1.5]} size={[3.65, 1.55, 0.26]} color="#c0bfb3" roughness={0.9} />
        <Box position={[-1.55, 1.15, 1.44]} size={[1.2, 1.55, 0.26]} color="#b6b6ad" roughness={0.88} />
        <Box position={[1.58, 1.15, 1.44]} size={[1.25, 1.55, 0.26]} color="#b6b6ad" roughness={0.88} />
        <Box position={[0, 2.74, -1.5]} size={[4.1, 1.35, 0.26]} color="#c0bfb3" roughness={0.9} />
        <Box position={[-2.05, 2.74, 0]} size={[0.38, 1.35, 2.8]} color="#b6b6ad" roughness={0.88} />
      </group>

      <group ref={windows}>
        {[-1.45, -0.48, 0.52, 1.48].map((x) => <Box key={`window-front-${x}`} position={[x, 2.72, 1.44]} size={[0.8, 1.02, 0.08]} color="#173e52" emissive="#f3a45a" emissiveIntensity={0.15} metalness={0.2} roughness={0.2} opacity={0.82} />)}
        {[-1.45, -0.48, 0.52, 1.48].map((x) => <Box key={`window-back-${x}`} position={[x, 1.12, -1.43]} size={[0.78, 1.15, 0.08]} color="#14384b" emissive="#e89855" emissiveIntensity={0.15} metalness={0.2} roughness={0.2} opacity={0.8} />)}
        <Box position={[-2.02, 2.72, 0.25]} size={[0.08, 1.02, 1.45]} color="#173e52" emissive="#f3a45a" emissiveIntensity={0.15} metalness={0.2} roughness={0.2} opacity={0.82} />
      </group>

      <group ref={doors}>
        <Box position={[0.65, 1.1, 1.48]} size={[0.7, 1.48, 0.09]} color="#18252a" emissive="#e88f4f" emissiveIntensity={0.12} metalness={0.45} roughness={0.32} />
        <Box position={[-0.7, 1.1, 1.48]} size={[0.7, 1.48, 0.09]} color="#243036" emissive="#e88f4f" emissiveIntensity={0.12} metalness={0.45} roughness={0.32} />
      </group>

      <group ref={systems}>
        <Pipe position={[-0.85, 1.1, 0.2]} rotation={[0, 0, Math.PI / 2]} color="#e06d48" />
        <Pipe position={[0.85, 1.05, -0.2]} rotation={[Math.PI / 2, 0, 0]} color="#4ca8c5" />
        <Pipe position={[0, 2.38, -0.6]} color="#e0bf59" />
        <Box position={[1.4, 0.62, 0.65]} size={[0.34, 0.48, 0.34]} color="#d39a4b" metalness={0.6} roughness={0.3} />
      </group>

      <group ref={interior}>
        <Box position={[0, 0.47, 0.15]} size={[2.9, 0.07, 2]} color="#9c795c" roughness={0.7} />
        <Box position={[-1.02, 0.7, 0.35]} size={[0.95, 0.32, 0.52]} color="#30434b" roughness={0.88} />
        <Box position={[-1.02, 0.95, 0.35]} size={[0.95, 0.18, 0.52]} color="#667d7d" roughness={0.78} />
        <Box position={[0.45, 0.68, -0.2]} size={[1.08, 0.22, 0.55]} color="#242c30" metalness={0.2} roughness={0.45} />
        <Box position={[0.45, 0.84, -0.2]} size={[0.98, 0.06, 0.46]} color="#c18d60" roughness={0.65} />
        {[0, 1, 2, 3, 4].map((step) => <Box key={`step-${step}`} position={[1.2, 0.55 + step * 0.18, -0.95 + step * 0.22]} size={[0.6, 0.08, 0.42]} color="#747b78" roughness={0.62} />)}
      </group>

      <group ref={roof}>
        <Box position={[0, 3.52, 0]} size={[5.45, 0.24, 3.88]} color="#899597" metalness={0.4} roughness={0.5} />
        <Box position={[0, 3.78, -0.25]} size={[2.2, 0.44, 1.24]} color="#6d7778" roughness={0.78} />
      </group>

      <group ref={solar}>
        {[-1.25, -0.42, 0.42, 1.25].map((x) => <Box key={`solar-${x}`} position={[x, 3.96, 0.15]} size={[0.66, 0.035, 0.92]} color="#153d59" emissive="#2b93b5" emissiveIntensity={0.2} metalness={0.7} roughness={0.2} />)}
      </group>

      <group ref={landscape}>
        <Box position={[0, 0.01, 3.1]} size={[1.2, 0.04, 3.4]} color="#9da09b" roughness={0.9} />
        <Box position={[0, 0.03, 4.4]} size={[6.8, 0.06, 1.2]} color="#31383a" roughness={0.95} />
        <Tree position={[-3.2, 0, 2.6]} scale={0.8} />
        <Tree position={[3.15, 0, 2.5]} scale={0.9} />
        <Tree position={[-3.1, 0, -2.5]} scale={0.65} />
        <Tree position={[3.1, 0, -2.45]} scale={0.72} />
        {[-2.3, -1.5, 1.5, 2.3].map((x) => <Box key={`light-${x}`} position={[x, 0.28, 2.12]} size={[0.06, 0.44, 0.06]} color="#d4b278" emissive="#ffad5f" emissiveIntensity={1.2} metalness={0.25} roughness={0.4} />)}
      </group>
    </group>
  );
}

export default function HouseScene({ active, reduced }: { active: boolean; reduced: boolean }) {
  return (
    <Canvas
      className="pointer-events-none z-0"
      style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 0 }}
      camera={{ position: [8, 4.8, 8], fov: 34, near: 0.1, far: 80 }}
      dpr={[1, 1.5]}
      frameloop={active ? 'always' : 'never'}
      gl={{ antialias: false, powerPreference: 'high-performance', alpha: true }}
    >
      <color attach="background" args={['#03070b']} />
      <fog attach="fog" args={['#03070b', 12, 34]} />
      <ambientLight intensity={0.75} color="#99d8e3" />
      <directionalLight position={[5, 8, 4]} intensity={2.1} color="#d6edf3" />
      <pointLight position={[0, 2.2, 2.4]} intensity={3.2} distance={9} color="#ff9f56" />
      <HouseModel reduced={reduced} />
    </Canvas>
  );
}
