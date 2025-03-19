"use client";

import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, useGLTF, Environment } from "@react-three/drei";
import * as THREE from "three";

// Car model component props interface
interface CarModelProps {
  rotate?: boolean;
}

// Car model component
function CarModel({ rotate = true }: CarModelProps) {
  const group = useRef<THREE.Group>(null);
  
  // For demo purposes, we're using a free car model
  // In a real application, you would replace this with an actual car model URL
  // We're wrapping this in a try/catch to gracefully handle missing models
  let scene = null;
  try {
    // You can replace this with the path to your actual car model
    const gltf = useGLTF("/car.glb");
    scene = gltf.scene;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    console.warn("Car model not found, using fallback shape");
    // We'll use the fallback car shape
  }
  
  // Animate the car rotation
  useFrame((state) => {
    if (rotate && group.current) {
      group.current.rotation.y = state.clock.getElapsedTime() * 0.2;
    }
  });

  // Fallback car shape if the model fails to load
  const renderFallbackCar = () => {
    return (
      <group ref={group}>
        {/* Car body */}
        <mesh position={[0, 0.5, 0]} castShadow>
          <boxGeometry args={[4, 1, 2]} />
          <meshStandardMaterial color="#2563eb" />
        </mesh>
        
        {/* Car cabin */}
        <mesh position={[0, 1.2, 0]} castShadow>
          <boxGeometry args={[2, 0.8, 1.8]} />
          <meshStandardMaterial color="#60a5fa" />
        </mesh>
        
        {/* Wheels */}
        <mesh position={[1.5, 0, 1]} castShadow rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 0.3, 32]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        <mesh position={[-1.5, 0, 1]} castShadow rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 0.3, 32]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        <mesh position={[1.5, 0, -1]} castShadow rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 0.3, 32]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        <mesh position={[-1.5, 0, -1]} castShadow rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 0.3, 32]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      </group>
    );
  };

  return (
    <>
      {scene ? (
        <group ref={group}>
          <primitive object={scene} scale={1} position={[0, -1, 0]} />
        </group>
      ) : (
        renderFallbackCar()
      )}
    </>
  );
}

// Main component props interface
interface Car3DSceneProps {
  className?: string;
  height?: string;
}

// Main component that sets up the 3D scene
export default function Car3DScene({ className = "", height = "400px" }: Car3DSceneProps) {
  const [mounted, setMounted] = useState(false);

  // Handle mounting to prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div style={{ height }} className={className} />;
  }

  return (
    <div style={{ height }} className={className}>
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[6, 4, 8]} />
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 4}
        />
        
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <spotLight 
          position={[10, 10, 10]} 
          angle={0.15} 
          penumbra={1} 
          intensity={1} 
          castShadow 
        />
        <directionalLight 
          position={[-10, 10, -5]} 
          intensity={0.5} 
          castShadow 
        />
        
        {/* The car */}
        <CarModel />
        
        {/* Environment and ground */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#f1f5f9" />
        </mesh>
        
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}