"use client";

import React from 'react';

const AnimatedLogo = ({ className = "" }) => {
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ height: "60px", width: "220px" }}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 60" className="w-full h-full">
        {/* Logo Text */}
        <text x="50" y="38" fontFamily="Arial" fontWeight="bold" fontSize="28" fill="#000">
          Car<tspan fill="#3B82F6">Lens</tspan>
        </text>
        
        {/* Race Car - Starting position adjusted to be closer to logo */}
        <g className="car-animation">
          {/* Wheels - Now positioned at starting point closer to the logo */}
          <circle cx="10" cy="48" r="4" fill="#1E293B" />
          <circle cx="10" cy="48" r="2" fill="#94A3B8" />
          <circle cx="10" cy="48" r="1" fill="#1E293B" />
          
          <circle cx="25" cy="48" r="4" fill="#1E293B" />
          <circle cx="25" cy="48" r="2" fill="#94A3B8" />
          <circle cx="25" cy="48" r="1" fill="#1E293B" />
          
          {/* Car Body - Formula 1 Style with starting position moved */}
          <path d="M5 40 L15 40 L20 37 L25 37 L30 40 L35 40 L35 46 L33 46 C33 46 30 48 28 48 L22 48 C20 48 17 46 17 46 L13 46 C11 46 8 48 8 48 L7 48 C5 48 2 46 2 46 L5 46 Z" fill="#EF4444" />
          
          {/* Cockpit - adjusted for new position */}
          <path d="M18 40 L20 35 L25 35 L27 40" fill="#60A5FA" />
          
          {/* Racing Stripes - adjusted for new position */}
          <rect x="10" y="40" width="3" height="6" fill="#FBBF24" />
          <rect x="25" y="40" width="3" height="6" fill="#FBBF24" />
          
          {/* Wings - adjusted for new position */}
          <rect x="5" y="38" width="2" height="2" fill="#1E293B" />
          <rect x="4" y="36" width="4" height="2" fill="#1E293B" />
          <rect x="35" y="43" width="3" height="2" fill="#1E293B" />
          
          {/* Exhaust flames */}
          <path d="M5 43 L3 43 L1 42.5 L3 43.5 L0 43.5" fill="#F59E0B" />
        </g>
      </svg>
      
      <style jsx>{`
        .car-animation {
          animation: driveCar 4s linear infinite;
        }
        
        @keyframes driveCar {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(160px);
          }
        }
      `}</style>
    </div>
  );
};

export default AnimatedLogo;