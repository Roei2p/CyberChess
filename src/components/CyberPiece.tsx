import React from 'react';
import { PieceType, PieceColor } from '../types/chess';

interface CyberPieceProps {
  type: PieceType;
  color: PieceColor;
  className?: string;
  isThreatened?: boolean;
}

export const CyberPiece: React.FC<CyberPieceProps> = ({
  type,
  color,
  className = 'w-full h-full',
  isThreatened = false,
}) => {
  const isWhite = color === 'w';

  // Primary colors
  const strokeColor = isWhite ? '#38bdf8' : '#f43f5e';
  const fillColor = isWhite ? 'rgba(14, 165, 233, 0.22)' : 'rgba(244, 63, 94, 0.22)';
  const glowFilter = isWhite ? 'url(#glow-cyan)' : 'url(#glow-magenta)';
  const circuitColor = isWhite ? '#e0f2fe' : '#ffe4e6';

  const renderShape = () => {
    switch (type) {
      case 'p': // Pawn (Vanguard Drone)
        return (
          <g>
            {/* Base platform */}
            <path d="M14 38 L34 38 L31 34 L17 34 Z" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
            {/* Body prism */}
            <path d="M19 34 L21 22 L27 22 L29 34 Z" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
            {/* Tactical head node */}
            <circle cx="24" cy="16" r="6" fill={fillColor} stroke={strokeColor} strokeWidth="1.8" />
            <circle cx="24" cy="16" r="2.5" fill={circuitColor} />
            {/* Front visor line */}
            <line x1="20" y1="16" x2="28" y2="16" stroke={circuitColor} strokeWidth="1.2" />
          </g>
        );

      case 'n': // Knight (Quantum Mech Steed)
        return (
          <g>
            {/* Base */}
            <path d="M13 38 L35 38 L32 34 L16 34 Z" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
            {/* Cyber horse / mech cyber head */}
            <path
              d="M17 34 L16 26 L12 21 L16 13 L24 10 L30 14 L28 20 L32 23 L32 34 Z"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            {/* Cyber ear / horn */}
            <path d="M24 10 L23 6 L27 10 Z" fill={circuitColor} stroke={strokeColor} strokeWidth="1" />
            {/* Cyber optic visor */}
            <path d="M15 17 L21 16 L19 20 Z" fill={circuitColor} />
            {/* Energy vent slots */}
            <line x1="21" y1="24" x2="26" y2="24" stroke={circuitColor} strokeWidth="1.5" />
            <line x1="22" y1="28" x2="28" y2="28" stroke={circuitColor} strokeWidth="1.5" />
          </g>
        );

      case 'b': // Bishop (Plasma Conduit)
        return (
          <g>
            {/* Base */}
            <path d="M13 38 L35 38 L32 34 L16 34 Z" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
            {/* Lower robe node */}
            <path d="M18 34 L20 22 L28 22 L30 34 Z" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
            {/* Mitre crystal head */}
            <path
              d="M24 8 C17 14, 16 23, 20 25 L28 25 C32 23, 31 14, 24 8 Z"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth="1.6"
            />
            {/* Top plasma apex */}
            <circle cx="24" cy="7" r="2" fill={circuitColor} stroke={strokeColor} strokeWidth="1" />
            {/* Plasma slot cut */}
            <line x1="22" y1="14" x2="26" y2="20" stroke={circuitColor} strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="24" cy="18" r="1.5" fill={circuitColor} />
          </g>
        );

      case 'r': // Rook (Fortress Rail Cannon)
        return (
          <g>
            {/* Base */}
            <path d="M12 38 L36 38 L33 34 L15 34 Z" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
            {/* Tower shaft */}
            <path d="M17 34 L18 19 L30 19 L31 34 Z" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
            {/* Battlements / turrets */}
            <path
              d="M14 19 L14 12 L18 12 L18 15 L22 15 L22 12 L26 12 L26 15 L30 15 L30 12 L34 12 L34 19 Z"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            {/* Power reactor core in rook */}
            <rect x="22" y="24" width="4" height="6" rx="1" fill={circuitColor} />
            <line x1="18" y1="27" x2="30" y2="27" stroke={strokeColor} strokeWidth="1" strokeDasharray="1 2" />
          </g>
        );

      case 'q': // Queen (Apex Neural Sovereign)
        return (
          <g>
            {/* Base */}
            <path d="M11 38 L37 38 L33 34 L15 34 Z" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
            {/* Waist */}
            <path d="M17 34 L19 22 L29 22 L31 34 Z" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
            {/* Crown radiant rays */}
            <path
              d="M13 15 L17 23 L24 13 L31 23 L35 15 L32 26 L16 26 Z"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            {/* Crown photon nodes */}
            <circle cx="13" cy="14" r="1.8" fill={circuitColor} />
            <circle cx="24" cy="11" r="2.2" fill={circuitColor} />
            <circle cx="35" cy="14" r="1.8" fill={circuitColor} />
            {/* Sovereign core diamond */}
            <polygon points="24,25 27,29 24,33 21,29" fill={circuitColor} />
          </g>
        );

      case 'k': // King (Core Command Monolith)
        return (
          <g>
            {/* Base */}
            <path d="M11 38 L37 38 L33 34 L15 34 Z" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
            {/* Body */}
            <path d="M16 34 L18 20 L30 20 L32 34 Z" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
            {/* Crown dome */}
            <path
              d="M16 20 C16 14, 21 12, 24 12 C27 12, 32 14, 32 20 Z"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth="1.6"
            />
            {/* Holographic Cross Antenna */}
            <line x1="24" y1="5" x2="24" y2="12" stroke={circuitColor} strokeWidth="2" strokeLinecap="round" />
            <line x1="20" y1="8" x2="28" y2="8" stroke={circuitColor} strokeWidth="2" strokeLinecap="round" />
            {/* Inner reactor nexus */}
            <circle cx="24" cy="23" r="3" fill={circuitColor} />
            <line x1="19" y1="28" x2="29" y2="28" stroke={circuitColor} strokeWidth="1.2" />
          </g>
        );
    }
  };

  return (
    <div
      className={`relative flex items-center justify-center select-none transition-transform duration-150 hover:scale-110 ${
        isThreatened ? 'animate-pulse' : ''
      } ${className}`}
    >
      <svg
        viewBox="0 0 48 48"
        className="w-full h-full drop-shadow-[0_0_8px_rgba(56,189,248,0.35)]"
        style={{
          filter: isThreatened
            ? 'drop-shadow(0 0 12px rgba(239, 68, 68, 0.9))'
            : isWhite
            ? 'drop-shadow(0 0 6px rgba(56, 189, 248, 0.6))'
            : 'drop-shadow(0 0 6px rgba(244, 63, 94, 0.6))',
        }}
      >
        <defs>
          <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glow-magenta" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <g filter={glowFilter}>{renderShape()}</g>
      </svg>
    </div>
  );
};
