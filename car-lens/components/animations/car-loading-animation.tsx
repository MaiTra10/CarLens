"use client";

import React from "react";

const CarLoadingAnimation = () => {
  return (
    <div className="w-full my-6 flex flex-col items-center">
      <div className="mb-3 text-center">
        <p className="text-lg font-medium text-slate-700">
          Analyzing car data...
        </p>
        <p className="text-sm text-slate-500">
          Our AI is processing your request
        </p>
      </div>

      <div className="relative w-full h-12 bg-slate-100 rounded-md overflow-hidden">
        {/* Progress bar track */}
        <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-slate-100 via-blue-50 to-slate-100 animate-pulse" />

        {/* Road markings */}
        <div className="absolute bottom-4 left-0 w-full h-1">
          <div className="w-full h-full flex items-center">
            <div className="flex w-full">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="w-8 h-[2px] bg-slate-300 mx-2"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Car animation */}
        <div className="car absolute bottom-1 left-0">
          {/* Car body similar to your logo car */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="20"
            viewBox="0 0 40 20"
          >
            {/* Wheels */}
            <circle cx="10" cy="15" r="3" fill="#1E293B" />
            <circle cx="10" cy="15" r="1.5" fill="#94A3B8" />
            <circle cx="10" cy="15" r="0.75" fill="#1E293B" />

            <circle cx="25" cy="15" r="3" fill="#1E293B" />
            <circle cx="25" cy="15" r="1.5" fill="#94A3B8" />
            <circle cx="25" cy="15" r="0.75" fill="#1E293B" />

            {/* Car Body - Formula 1 Style */}
            <path
              d="M5 8 L15 8 L20 5 L25 5 L30 8 L35 8 L35 13 L33 13 C33 13 30 15 28 15 L22 15 C20 15 17 13 17 13 L13 13 C11 13 8 15 8 15 L7 15 C5 15 2 13 2 13 L5 13 Z"
              fill="#3B82F6"
            />

            {/* Cockpit */}
            <path d="M18 8 L20 3 L25 3 L27 8" fill="#93C5FD" />

            {/* Racing Stripes */}
            <rect x="10" y="8" width="3" height="5" fill="#FBBF24" />
            <rect x="25" y="8" width="3" height="5" fill="#FBBF24" />

            {/* Wings */}
            <rect x="5" y="6" width="2" height="2" fill="#1E293B" />
            <rect x="4" y="4" width="4" height="2" fill="#1E293B" />
            <rect x="35" y="10" width="3" height="2" fill="#1E293B" />

            {/* Exhaust flames - with animation */}
            <g className="exhaust-flames">
              <path d="M2 10 L0 10 L-2 9.5 L0 10.5 L-3 10.5" fill="#F59E0B" />
            </g>
          </svg>
        </div>
      </div>

      <style jsx>{`
        .car {
          animation: driveCar 6s linear infinite;
        }

        .exhaust-flames {
          animation: flicker 0.6s ease-in-out infinite alternate;
        }

        @keyframes driveCar {
          0% {
            transform: translateX(-50px); /* Start just outside the left edge */
          }
          100% {
            transform: translateX(
              calc(100vw + 50px)
            ); /* Move fully across the screen */
          }
        }

        @keyframes flicker {
          0% {
            opacity: 0.7;
            transform: scaleX(0.8);
          }
          100% {
            opacity: 1;
            transform: scaleX(1.2);
          }
        }
      `}</style>
    </div>
  );
};

export default CarLoadingAnimation;
