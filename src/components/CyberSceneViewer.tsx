import React, { useEffect, useRef, useState } from 'react';
import { MoveScene } from '../types/chess';
import { CyberPiece } from './CyberPiece';
import { cyberAudio } from '../utils/audio';
import { Play, RotateCcw, ShieldAlert, Zap, Radio, Maximize2, Minimize2, ChevronRight, ChevronLeft } from 'lucide-react';

interface CyberSceneViewerProps {
  currentScene: MoveScene | null;
  historyScenes: MoveScene[];
  onSelectScene: (scene: MoveScene) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export const CyberSceneViewer: React.FC<CyberSceneViewerProps> = ({
  currentScene,
  historyScenes,
  onSelectScene,
  isExpanded = false,
  onToggleExpand,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [animationTick, setAnimationTick] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Trigger sound and restart canvas animation on scene change
  useEffect(() => {
    if (currentScene) {
      setAnimationTick(prev => prev + 1);
      if (currentScene.isCheckmate) {
        cyberAudio.playVictory();
      } else if (currentScene.isCheck) {
        cyberAudio.playCheck();
      } else if (currentScene.isCapture) {
        cyberAudio.playCapture();
      } else if (currentScene.isCastling) {
        cyberAudio.playCastling();
      } else {
        cyberAudio.playMove();
      }
    }
  }, [currentScene]);

  // Particle & laser canvas combat animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentScene) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const width = canvas.width;
    const height = canvas.height;

    const isWhite = currentScene.color === 'w';
    const primaryHex = isWhite ? '#00f0ff' : '#ec4899';
    const accentHex = isWhite ? '#38bdf8' : '#f43f5e';

    let startTime: number | null = null;

    // Particle system
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      size: number;
      color: string;
    }

    const particles: Particle[] = [];
    const particleCount = currentScene.isCapture ? 45 : currentScene.isCheck ? 35 : 20;

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (Math.random() * 2 + 1) * (currentScene.isCapture ? 2.5 : 1);
      particles.push({
        x: currentScene.isCapture ? width * 0.65 : width * 0.5,
        y: height * 0.5,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: Math.random() * 50 + 40,
        size: Math.random() * 3 + 1,
        color: Math.random() > 0.4 ? primaryHex : '#ffffff',
      });
    }

    const render = (currentTime: number) => {
      if (startTime === null) {
        startTime = currentTime;
      }
      const elapsed = Math.max(0, (currentTime - startTime) / 1000);
      ctx.clearRect(0, 0, width, height);

      // 1. Draw cyber grid floor
      ctx.save();
      ctx.strokeStyle = isWhite ? 'rgba(0, 240, 255, 0.12)' : 'rgba(236, 72, 153, 0.12)';
      ctx.lineWidth = 1;

      // Perspective horizon lines
      const horizonY = height * 0.72;
      for (let y = horizonY; y < height; y += 12) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Vertical radiating grid lines
      const centerX = width * 0.5;
      for (let x = -width; x < width * 2; x += 32) {
        ctx.beginPath();
        ctx.moveTo(centerX, horizonY - 20);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      ctx.restore();

      // 2. Trajectory beam or combat clash
      if (currentScene.isCapture) {
        // Laser cannon discharge from left (attacker) to right (defender)
        const beamProgress = Math.min(elapsed * 4, 1);
        const startX = width * 0.28;
        const targetX = width * 0.72;
        const currentX = startX + (targetX - startX) * beamProgress;

        // Core laser
        ctx.save();
        ctx.strokeStyle = primaryHex;
        ctx.lineWidth = 4 + Math.sin(elapsed * 20) * 2;
        ctx.shadowColor = primaryHex;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.moveTo(startX, height * 0.45);
        ctx.lineTo(currentX, height * 0.45);
        ctx.stroke();

        // Secondary high-frequency electric arcs
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(startX, height * 0.45);
        for (let arcX = startX; arcX <= currentX; arcX += 20) {
          ctx.lineTo(arcX, height * 0.45 + (Math.random() - 0.5) * 14);
        }
        ctx.stroke();

        // Impact burst on target
        if (beamProgress > 0.8) {
          const impactRadius = Math.max(1, 18 + Math.sin(elapsed * 25) * 8);
          const radialGrad = ctx.createRadialGradient(targetX, height * 0.45, 2, targetX, height * 0.45, Math.max(3, impactRadius));
          radialGrad.addColorStop(0, '#ffffff');
          radialGrad.addColorStop(0.4, accentHex);
          radialGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = radialGrad;
          ctx.beginPath();
          ctx.arc(targetX, height * 0.45, impactRadius, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      } else if (currentScene.isCheck || currentScene.isCheckmate) {
        // Tactical radar rings pulsing outward
        const pulseCycle = (elapsed % 1.5) / 1.5;
        const pulseTime = Math.max(0, Math.min(1, pulseCycle));
        const radius = Math.max(0.1, pulseTime * (width * 0.45));
        ctx.save();
        ctx.strokeStyle = `rgba(239, 68, 68, ${Math.max(0, 1 - pulseTime)})`;
        ctx.lineWidth = 2;
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.45, radius, 0, Math.PI * 2);
        ctx.stroke();

        // Warning crosshairs
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
        ctx.beginPath();
        ctx.moveTo(width * 0.5 - 30, height * 0.45);
        ctx.lineTo(width * 0.5 + 30, height * 0.45);
        ctx.moveTo(width * 0.5, height * 0.45 - 30);
        ctx.lineTo(width * 0.5, height * 0.45 + 30);
        ctx.stroke();
        ctx.restore();
      } else {
        // Holographic particle trajectory conduit
        const t = (Math.sin(elapsed * 3) + 1) / 2;
        ctx.save();
        ctx.strokeStyle = primaryHex;
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.moveTo(width * 0.25, height * 0.5);
        ctx.bezierCurveTo(width * 0.5, height * 0.15, width * 0.5, height * 0.15, width * 0.75, height * 0.5);
        ctx.stroke();

        // Travelling energy pulse on arc
        const pX = (1 - t) * (1 - t) * (width * 0.25) + 2 * (1 - t) * t * (width * 0.5) + t * t * (width * 0.75);
        const pY = (1 - t) * (1 - t) * (height * 0.5) + 2 * (1 - t) * t * (height * 0.15) + t * t * (height * 0.5);

        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = primaryHex;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(pX, pY, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 3. Render and update particles
      ctx.save();
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        const alpha = Math.max(0, 1 - p.life / p.maxLife);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
      ctx.restore();

      if (isPlaying) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [currentScene, animationTick, isPlaying]);

  if (!currentScene) {
    return (
      <div className="glass-panel rounded-2xl p-6 text-center flex flex-col items-center justify-center min-h-[340px] border border-cyan-500/20">
        <div className="w-14 h-14 rounded-full bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center mb-4 text-cyan-400">
          <Radio className="w-6 h-6 animate-pulse" />
        </div>
        <h3 className="font-cyber text-lg font-bold tracking-wider text-cyan-300">
          זירת סצנות קרב הולוגרפית
        </h3>
        <p className="text-sm text-slate-400 mt-2 max-w-sm">
          בצע מהלך על גבי לוח השחמט כדי להפעיל סצנת פעולה טקטית חיה עם הדמיית קרב מלאה.
        </p>
      </div>
    );
  }

  // Calculate current scene index in history for navigation
  const currentIndex = historyScenes.findIndex(s => s.id === currentScene.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < historyScenes.length - 1 && currentIndex !== -1;

  const replayScene = () => {
    setAnimationTick(prev => prev + 1);
    if (currentScene.isCapture) cyberAudio.playCapture();
    else if (currentScene.isCheck) cyberAudio.playCheck();
    else cyberAudio.playMove();
  };

  const getIntensityBadge = () => {
    switch (currentScene.intensity) {
      case 'lethal':
        return { label: 'הכרעה סופית // SINGULARITY', bg: 'bg-rose-500/20 text-rose-300 border-rose-500/50' };
      case 'critical':
        return { label: 'איום קריטי // CHECK', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/50' };
      case 'high':
        return { label: 'התנגשות טקטית // CLASH', bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50' };
      default:
        return { label: 'תמרון עמדה // POSITION', bg: 'bg-slate-800/60 text-slate-300 border-slate-700/50' };
    }
  };

  const intensityBadge = getIntensityBadge();

  return (
    <div
      className={`glass-panel rounded-2xl overflow-hidden transition-all duration-300 flex flex-col ${
        isExpanded ? 'fixed inset-4 md:inset-10 z-50 shadow-2xl backdrop-blur-2xl' : 'w-full shadow-lg'
      }`}
    >
      {/* 1. Header Bar with Mode and Navigation */}
      <div className="px-5 py-3 border-b border-cyan-500/20 bg-slate-950/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-cyber text-sm font-semibold tracking-wide text-cyan-300">
            סצנה הולוגרפית #{currentScene.moveIndex}
          </span>
          <span className="text-xs text-slate-400 font-mono-code">
            {currentScene.timestamp}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Intensity Badge */}
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full border font-mono-code font-medium ${intensityBadge.bg}`}
          >
            {intensityBadge.label}
          </span>

          {/* Replay Button */}
          <button
            onClick={replayScene}
            title="שחזר סצנה"
            className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-cyan-950/60 text-cyan-400 border border-cyan-500/30 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Expand toggle */}
          {onToggleExpand && (
            <button
              onClick={onToggleExpand}
              title={isExpanded ? 'מזער' : 'מסך מלא'}
              className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-cyan-950/60 text-cyan-400 border border-cyan-500/30 transition-colors"
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* 2. Holographic Battle Stage (Canvas + Piece Avatars) */}
      <div className="relative w-full h-52 sm:h-60 bg-gradient-to-b from-[#02050f] to-[#060c1d] overflow-hidden flex items-center justify-center">
        {/* Animated Cyber Canvas Canvas */}
        <canvas
          ref={canvasRef}
          width={600}
          height={240}
          className="absolute inset-0 w-full h-full pointer-events-none opacity-90"
        />

        {/* Scanline overlay */}
        <div className="absolute inset-0 scanlines pointer-events-none opacity-40" />

        {/* Tactical Nodes Floating HUD */}
        <div className="absolute top-3 left-4 text-xs font-mono-code text-cyan-400/80 flex items-center gap-2 bg-slate-950/60 px-2.5 py-1 rounded border border-cyan-500/20 backdrop-blur-sm">
          <span>FROM: <strong className="text-cyan-200">{currentScene.from.toUpperCase()}</strong></span>
          <span className="text-cyan-500">➜</span>
          <span>TO: <strong className="text-cyan-200">{currentScene.to.toUpperCase()}</strong></span>
        </div>

        {/* SAN notation pill */}
        <div className="absolute top-3 right-4 font-mono-code text-xs px-2.5 py-1 rounded bg-slate-950/60 border border-cyan-500/20 text-cyan-300 backdrop-blur-sm flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>SAN: {currentScene.san}</span>
        </div>

        {/* Active Combat Entities on Stage */}
        <div className="relative z-10 w-full max-w-md px-6 flex items-center justify-between">
          {/* Attacking / Acting Piece */}
          <div className="flex flex-col items-center">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 p-2 rounded-2xl bg-cyan-950/40 border border-cyan-400/40 shadow-[0_0_25px_rgba(6,182,212,0.3)] backdrop-blur-md flex items-center justify-center animate-bounce-slow">
              <CyberPiece type={currentScene.piece} color={currentScene.color} />
              <div className="absolute -bottom-2 px-2 py-0.5 rounded bg-cyan-900/90 border border-cyan-400/50 text-[10px] font-cyber text-cyan-200 uppercase whitespace-nowrap">
                {currentScene.pieceNameHebrew}
              </div>
            </div>
          </div>

          {/* Versus / Trajectory Center Icon */}
          <div className="flex flex-col items-center justify-center">
            {currentScene.isCapture ? (
              <div className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-400 animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.5)]">
                <span className="font-cyber font-black text-sm">VS</span>
              </div>
            ) : currentScene.isCheck ? (
              <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                <ShieldAlert className="w-5 h-5" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
                <span className="font-mono-code font-bold text-xs">➔</span>
              </div>
            )}
          </div>

          {/* Target / Defending Entity */}
          <div className="flex flex-col items-center">
            {currentScene.isCapture && currentScene.capturedPiece ? (
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 p-2 rounded-2xl bg-rose-950/40 border border-rose-500/40 shadow-[0_0_25px_rgba(244,63,94,0.3)] backdrop-blur-md flex items-center justify-center animate-pulse">
                <CyberPiece
                  type={currentScene.capturedPiece}
                  color={currentScene.color === 'w' ? 'b' : 'w'}
                  isThreatened
                />
                <div className="absolute -bottom-2 px-2 py-0.5 rounded bg-rose-900/90 border border-rose-400/50 text-[10px] font-cyber text-rose-200 uppercase whitespace-nowrap">
                  {currentScene.capturedPieceNameHebrew}
                </div>
              </div>
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 border-dashed border-cyan-400/30 bg-cyan-950/20 flex flex-col items-center justify-center text-cyan-400">
                <span className="font-mono-code font-bold text-lg">{currentScene.to.toUpperCase()}</span>
                <span className="text-[10px] font-cyber text-cyan-300/70">צומת יעד</span>
              </div>
            )}
          </div>
        </div>

        {/* Lower Scene Ticker */}
        <div className="absolute bottom-2 left-4 right-4 flex items-center justify-between text-[11px] font-mono-code text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>סוג תמרון: {currentScene.sceneTheme.toUpperCase()}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>קוורדינטות: {currentScene.from} ➔ {currentScene.to}</span>
          </div>
        </div>
      </div>

      {/* 3. Authoritative Combat Briefing (Hebrew Storytelling) */}
      <div className="p-5 flex-1 flex flex-col justify-between bg-slate-950/70">
        <div>
          <div className="flex items-start justify-between gap-4 mb-2">
            <h4 className="font-cyber text-base sm:text-lg font-bold text-cyan-200 flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{currentScene.titleHebrew}</span>
            </h4>
          </div>

          <p className="text-sm text-slate-200 leading-relaxed font-sans mt-1 text-right">
            {currentScene.narrativeHebrew}
          </p>

          <p className="text-xs text-slate-400 font-mono-code mt-2 text-left dir-ltr opacity-80 border-t border-slate-800/80 pt-2">
            // {currentScene.narrativeEnglish}
          </p>
        </div>

        {/* History Replay Timeline Bar */}
        {historyScenes.length > 1 && (
          <div className="mt-4 pt-3 border-t border-cyan-500/15 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                disabled={!hasPrev}
                onClick={() => hasPrev && onSelectScene(historyScenes[currentIndex - 1])}
                className="px-2.5 py-1 rounded bg-slate-900 border border-cyan-500/20 text-xs text-cyan-300 disabled:opacity-30 disabled:pointer-events-none hover:bg-cyan-950/50 flex items-center gap-1 transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
                <span>סצנה קודמת</span>
              </button>

              <button
                disabled={!hasNext}
                onClick={() => hasNext && onSelectScene(historyScenes[currentIndex + 1])}
                className="px-2.5 py-1 rounded bg-slate-900 border border-cyan-500/20 text-xs text-cyan-300 disabled:opacity-30 disabled:pointer-events-none hover:bg-cyan-950/50 flex items-center gap-1 transition-colors"
              >
                <span>סצנה הבאה</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            <span className="text-xs font-mono-code text-slate-400">
              {currentIndex + 1} / {historyScenes.length} סצנות פעולה
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
