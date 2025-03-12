"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Dynamically import the 3D component with no SSR to prevent hydration issues
const Car3DScene = dynamic(() => import("@/components/3d/car-3d-component"), {
  ssr: false,
  loading: () => (
    <div className="h-96 w-full flex items-center justify-center bg-slate-100 rounded-lg">
      <p className="text-slate-500">Loading 3D model...</p>
    </div>
  )
});

interface Car3DWrapperProps {
  height?: string;
  className?: string;
}

export default function Car3DWrapper({ height = "400px", className = "" }: Car3DWrapperProps) {
  const [mounted, setMounted] = useState(false);

  // Handle mounting to prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Only render the 3D scene on the client to avoid hydration mismatches
  if (!mounted) {
    return (
      <div 
        className={`flex items-center justify-center bg-slate-100 rounded-lg ${className}`} 
        style={{ height }}
      >
        <p className="text-slate-500">Loading 3D viewer...</p>
      </div>
    );
  }

  return <Car3DScene height={height} className={className} />;
}