import React from 'react';
import { GameMode, AIDifficulty, PieceType } from '../types/chess';
import { CyberPiece } from './CyberPiece';
import { Volume2, VolumeX, RotateCcw, Cpu, Users, Award, Play } from 'lucide-react';

interface CyberControlsProps {
  gameMode: GameMode;
  aiDifficulty: AIDifficulty;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onNewGameClick: () => void;
  onUndoMove: () => void;
  canUndo: boolean;
  whiteCaptured: PieceType[];
  blackCaptured: PieceType[];
  materialBalance: number; // positive = white ahead, negative = black ahead
  currentTurn: 'w' | 'b';
  isAiThinking: boolean;
  whiteTime: number;
  blackTime: number;
  hasTimer: boolean;
}

export const CyberControls: React.FC<CyberControlsProps> = ({
  gameMode,
  aiDifficulty,
  soundEnabled,
  onToggleSound,
  onNewGameClick,
  onUndoMove,
  canUndo,
  whiteCaptured,
  blackCaptured,
  materialBalance,
  currentTurn,
  isAiThinking,
  whiteTime,
  blackTime,
  hasTimer,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyName = (diff: AIDifficulty) => {
    switch (diff) {
      case 'novice':
        return 'רחפן סיור (קל)';
      case 'tactical':
        return 'זקיף טקטי (בינוני)';
      case 'overlord':
        return 'שליט עצבי (קשה)';
    }
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* 1. Turn & Timers Status Card */}
      <div className="glass-panel rounded-xl p-3.5 flex items-center justify-between border border-cyan-500/20">
        {/* White Player Status */}
        <div
          className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
            currentTurn === 'w'
              ? 'bg-cyan-950/50 border border-cyan-400/40 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
              : 'opacity-65'
          }`}
        >
          <div className="w-9 h-9 rounded-full bg-cyan-950/70 border border-cyan-400/60 flex items-center justify-center p-1">
            <CyberPiece type="k" color="w" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-cyber text-xs font-bold text-cyan-200">ניאון לבן</span>
              {materialBalance > 0 && (
                <span className="text-[10px] font-mono-code font-bold text-cyan-400">
                  +{materialBalance}
                </span>
              )}
            </div>
            {hasTimer && (
              <span className="font-mono-code text-sm font-bold text-slate-100 tabular-nums">
                {formatTime(whiteTime)}
              </span>
            )}
          </div>
        </div>

        {/* Center Versus / Turn indicator */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-cyan-500/30 text-xs font-cyber">
            <span
              className={`w-2 h-2 rounded-full ${
                currentTurn === 'w' ? 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]' : 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'
              } ${isAiThinking ? 'animate-ping' : ''}`}
            />
            <span className="text-slate-200">
              {isAiThinking ? 'AI מחשב...' : currentTurn === 'w' ? 'תור לבן' : 'תור שחור'}
            </span>
          </div>
          <span className="text-[10px] font-mono-code text-slate-400 mt-1">
            {gameMode === 'vs-ai' ? `קרב נגד ${getDifficultyName(aiDifficulty)}` : 'שחקן נגד שחקן'}
          </span>
        </div>

        {/* Black Player Status */}
        <div
          className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
            currentTurn === 'b'
              ? 'bg-rose-950/50 border border-rose-400/40 shadow-[0_0_15px_rgba(244,63,94,0.25)]'
              : 'opacity-65'
          }`}
        >
          <div className="text-left">
            <div className="flex items-center gap-1.5 justify-end">
              {materialBalance < 0 && (
                <span className="text-[10px] font-mono-code font-bold text-rose-400">
                  +{Math.abs(materialBalance)}
                </span>
              )}
              <span className="font-cyber text-xs font-bold text-rose-200">מטריקס שחור</span>
            </div>
            {hasTimer && (
              <span className="font-mono-code text-sm font-bold text-slate-100 tabular-nums">
                {formatTime(blackTime)}
              </span>
            )}
          </div>
          <div className="w-9 h-9 rounded-full bg-rose-950/70 border border-rose-400/60 flex items-center justify-center p-1">
            <CyberPiece type="k" color="b" />
          </div>
        </div>
      </div>

      {/* 2. Captured Pieces Telemetry Bar */}
      <div className="grid grid-cols-2 gap-2 text-xs font-mono-code">
        {/* White's captured loot (Black pieces defeated) */}
        <div className="glass-panel p-2.5 rounded-lg flex items-center justify-between border border-cyan-500/15">
          <span className="text-[11px] text-slate-400 font-cyber">שלל לבן:</span>
          <div className="flex items-center gap-0.5 overflow-x-auto max-w-[140px] h-6">
            {whiteCaptured.length === 0 ? (
              <span className="text-[10px] text-slate-600">-</span>
            ) : (
              whiteCaptured.map((p, idx) => (
                <div key={idx} className="w-5 h-5 shrink-0 opacity-85">
                  <CyberPiece type={p} color="b" />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Black's captured loot (White pieces defeated) */}
        <div className="glass-panel p-2.5 rounded-lg flex items-center justify-between border border-rose-500/15">
          <span className="text-[11px] text-slate-400 font-cyber">שלל שחור:</span>
          <div className="flex items-center gap-0.5 overflow-x-auto max-w-[140px] h-6">
            {blackCaptured.length === 0 ? (
              <span className="text-[10px] text-slate-600">-</span>
            ) : (
              blackCaptured.map((p, idx) => (
                <div key={idx} className="w-5 h-5 shrink-0 opacity-85">
                  <CyberPiece type={p} color="w" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 3. Action Buttons & Quick Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={onNewGameClick}
          className="flex-1 py-2 px-3 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-200 hover:text-white font-cyber text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>משחק חדש / הגדרות</span>
        </button>

        <button
          onClick={onUndoMove}
          disabled={!canUndo}
          className="py-2 px-3 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 disabled:opacity-40 disabled:pointer-events-none font-cyber text-xs font-medium transition-all flex items-center gap-1.5"
          title="בטל מהלך אחרון"
        >
          <span>בטל מהלך</span>
        </button>

        <button
          onClick={onToggleSound}
          className={`p-2 rounded-lg border transition-all ${
            soundEnabled
              ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-400 hover:bg-cyan-900/50'
              : 'bg-slate-900 border-slate-700 text-slate-500 hover:text-slate-300'
          }`}
          title={soundEnabled ? 'השתק צלילים' : 'הפעל צלילים'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
