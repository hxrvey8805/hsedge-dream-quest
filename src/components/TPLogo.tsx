import React from 'react';

interface TPLogoProps {
  className?: string;
  size?: number;
  variant?: 'full' | 'icon';
}

export const TPLogo: React.FC<TPLogoProps> = ({ className = '', size = 40, variant = 'icon' }) => {
  if (variant === 'icon') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className={className}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Glow effect */}
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <linearGradient id="tpGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
        
        {/* TP Letters with 3D effect */}
        <g filter="url(#glow)">
          {/* T Letter */}
          <rect x="25" y="20" width="50" height="8" rx="2" fill="url(#tpGradient)" />
          <rect x="45" y="28" width="10" height="40" rx="2" fill="url(#tpGradient)" />
          {/* P Letter */}
          <rect x="25" y="75" width="8" height="35" rx="2" fill="url(#tpGradient)" />
          <rect x="25" y="75" width="25" height="8" rx="2" fill="url(#tpGradient)" />
          <rect x="45" y="83" width="8" height="12" rx="2" fill="url(#tpGradient)" />
          <rect x="33" y="95" width="20" height="8" rx="2" fill="url(#tpGradient)" />
        </g>
      </svg>
    );
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <svg
        width={size * 1.5}
        height={size * 1.5}
        viewBox="0 0 200 200"
        className="mb-2"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="glowFull">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <linearGradient id="tpGradientFull" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
        
        <g filter="url(#glowFull)">
          {/* T Letter - larger */}
          <rect x="40" y="30" width="80" height="12" rx="3" fill="url(#tpGradientFull)" />
          <rect x="80" y="42" width="20" height="60" rx="3" fill="url(#tpGradientFull)" />
          {/* P Letter - larger */}
          <rect x="40" y="130" width="12" height="60" rx="3" fill="url(#tpGradientFull)" />
          <rect x="40" y="130" width="50" height="12" rx="3" fill="url(#tpGradientFull)" />
          <rect x="80" y="142" width="12" height="20" rx="3" fill="url(#tpGradientFull)" />
          <rect x="52" y="162" width="40" height="12" rx="3" fill="url(#tpGradientFull)" />
        </g>
      </svg>
      <span className="text-xs font-semibold text-cyan-400 tracking-wider">TRADEPEAKS</span>
    </div>
  );
};
