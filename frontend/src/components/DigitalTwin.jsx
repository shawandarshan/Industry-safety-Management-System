import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Sphere, Text } from '@react-three/drei';

function Worker({ position, id, hasViolation }) {
  const meshRef = useRef();

  // Simple floating animation
  useFrame((state) => {
    meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + id) * 0.1;
  });

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.3, 16, 16]}>
        <meshStandardMaterial color={hasViolation ? '#ef4444' : '#3b82f6'} />
      </Sphere>
      <Text position={[0, 0.7, 0]} fontSize={0.2} color="white">
        {`Worker ${id}`}
      </Text>
    </group>
  );
}

function Machine({ position, label, isOverheating }) {
  return (
    <group position={position}>
      <Box args={[1.5, 1.5, 1.5]} position={[0, 0.75, 0]}>
        <meshStandardMaterial color={isOverheating ? '#f97316' : '#6b7280'} />
      </Box>
      <Text position={[0, 2, 0]} fontSize={0.3} color="white">
        {label}
      </Text>
    </group>
  );
}

function DangerZone({ position, size }) {
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={size} />
      <meshBasicMaterial color="#ef4444" opacity={0.2} transparent={true} />
    </mesh>
  );
}

export default function DigitalTwin({ workers = [], machines = [] }) {
  return (
    <div style={{ height: '500px', width: '100%', borderRadius: '12px', overflow: 'hidden' }}>
      <Canvas camera={{ position: [0, 8, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        
        {/* Factory Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#374151" />
        </mesh>

        <gridHelper args={[20, 20, '#4b5563', '#1f2937']} />

        {/* Static Elements */}
        <Machine position={[-4, 0, -4]} label="Assembly A" isOverheating={false} />
        <Machine position={[4, 0, -4]} label="Conveyor B" isOverheating={true} />
        
        <DangerZone position={[4, 0.01, -4]} size={[4, 4]} />

        {/* Dynamic Workers */}
        {workers.map((worker) => (
          <Worker 
            key={worker.id} 
            id={worker.id} 
            position={worker.position || [0, 0.3, 0]} 
            hasViolation={worker.hasViolation} 
          />
        ))}

        {/* Example Mock Worker if none provided */}
        {workers.length === 0 && (
          <>
            <Worker id="1" position={[-2, 0.3, 2]} hasViolation={false} />
            <Worker id="2" position={[3, 0.3, -3]} hasViolation={true} />
          </>
        )}

        <OrbitControls />
      </Canvas>
    </div>
  );
}
