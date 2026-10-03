import React from 'react';
import { GameMode, AIDifficulty, PieceColor } from '../types/chess';
import { Bot, User, Clock, ShieldCheck, Trophy, Sparkles, X, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface NewGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartGame: (config: {
    mode: GameMode;
    difficulty: AIDifficulty;
    playerSide: PieceColor;
    timerMinutes: number; // 0 for unlimited
  }) => void;
  currentMode: GameMode;
  currentDifficulty: AIDifficulty;
  currentPlayerSide: PieceColor;
  currentTimerMinutes: number;
}

export const NewGameModal: React.FC<NewGameModalProps> = ({
  isOpen,
  onClose,
  onStartGame,
  currentMode,
  currentDifficulty,
  currentPlayerSide,
  currentTimerMinutes,
}) => {
  const [mode, setMode] = React.useState<GameMode>(currentMode);
  const [difficulty, setDifficulty] = React.useState<AIDifficulty>(currentDifficulty);
  const [playerSide, setPlayerSide] = React.useState<PieceColor>(currentPlayerSide);
  const [timerMinutes, setTimerMinutes] = React.useState<number>(currentTimerMinutes);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartGame({
      mode,
      difficulty,
      playerSide,
      timerMinutes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-md rounded-2xl p-6 border border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.25)] relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-cyan-950/60 border border-cyan-400/50 flex items-center justify-center mx-auto mb-2 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-cyber text-xl font-bold text-white tracking-wide">
            אתחול משחק שחמט סייבר
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            הגדר את פרמטרי הזירה והחלפת פרוטוקול הקרב
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mode Selector */}
          <div>
            <label className="block text-xs font-cyber text-cyan-300 font-bold mb-2">
              מצב משחק
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMode('vs-ai')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-cyber flex items-center justify-center gap-2 transition-all ${
                  mode === 'vs-ai'
                    ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Bot className="w-4 h-4 text-cyan-400" />
                <span>נגד בינה מלאכותית</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('pass-and-play')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-cyber flex items-center justify-center gap-2 transition-all ${
                  mode === 'pass-and-play'
                    ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <User className="w-4 h-4 text-cyan-400" />
                <span>שני שחקנים מקומי</span>
              </button>
            </div>
          </div>

          {/* AI Difficulty (if vs-ai) */}
          {mode === 'vs-ai' && (
            <div>
              <label className="block text-xs font-cyber text-cyan-300 font-bold mb-2">
                פרוטוקול בינה מלאכותית (רמת קושי)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'novice', name: 'רחפן סיור', desc: 'קל' },
                  { id: 'tactical', name: 'זקיף טקטי', desc: 'בינוני' },
                  { id: 'overlord', name: 'שליט עצבי', desc: 'מומחה' },
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setDifficulty(item.id as AIDifficulty)}
                    className={`py-2 px-2 rounded-xl border text-center transition-all ${
                      difficulty === item.id
                        ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-cyber font-bold text-xs">{item.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Selection (if vs-ai) */}
          {mode === 'vs-ai' && (
            <div>
              <label className="block text-xs font-cyber text-cyan-300 font-bold mb-2">
                בחר צד קרב
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPlayerSide('w')}
                  className={`py-2 px-3 rounded-xl border text-xs font-cyber flex items-center justify-center gap-2 transition-all ${
                    playerSide === 'w'
                      ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                  <span>ניאון לבן (מהלך ראשון)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPlayerSide('b')}
                  className={`py-2 px-3 rounded-xl border text-xs font-cyber flex items-center justify-center gap-2 transition-all ${
                    playerSide === 'b'
                      ? 'bg-rose-500/25 border-rose-400 text-rose-200'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
                  <span>מטריקס שחור (מהלך שני)</span>
                </button>
              </div>
            </div>
          )}

          {/* Timer Clock Selector */}
          <div>
            <label className="block text-xs font-cyber text-cyan-300 font-bold mb-2">
              שעון תחרות
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { min: 5, label: 'בליץ (5 דק\')' },
                { min: 10, label: 'מהיר (10 דק\')' },
                { min: 0, label: 'טקטי ללא הגבלה' },
              ].map(opt => (
                <button
                  key={opt.min}
                  type="button"
                  onClick={() => setTimerMinutes(opt.min)}
                  className={`py-2 px-2 rounded-xl border text-xs font-cyber text-center transition-all ${
                    timerMinutes === opt.min
                      ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 flex gap-2">
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-cyber font-bold text-sm transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>התחל משחק חדש</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Game Over Summary Modal
interface GameOverModalProps {
  isOpen: boolean;
  winner: 'w' | 'b' | 'draw' | null;
  reason: string;
  onPlayAgain: () => void;
  totalMoves: number;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  winner,
  reason,
  onPlayAgain,
  totalMoves,
}) => {
  React.useEffect(() => {
    if (isOpen && winner !== 'draw') {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00f0ff', '#ec4899', '#ffffff', '#38bdf8'],
        });
      } catch {
        // Fallback
      }
    }
  }, [isOpen, winner]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-md rounded-2xl p-6 border border-cyan-500/40 shadow-[0_0_60px_rgba(6,182,212,0.35)] text-center relative">
        <div className="w-16 h-16 rounded-2xl bg-cyan-950/60 border border-cyan-400/60 flex items-center justify-center mx-auto mb-3 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.4)]">
          <Trophy className="w-8 h-8" />
        </div>

        <h3 className="font-cyber text-2xl font-bold text-white tracking-wide">
          {winner === 'w'
            ? 'ניצחון לניאון הלבן!'
            : winner === 'b'
            ? 'ניצחון למטריקס השחור!'
            : 'קרב השחמט הסתיים בתיקו!'}
        </h3>

        <p className="text-sm text-cyan-300 font-cyber font-medium mt-1">
          {reason}
        </p>

        <div className="my-5 p-3 rounded-xl bg-slate-900/60 border border-cyan-500/20 grid grid-cols-2 gap-4 text-xs font-mono-code">
          <div>
            <div className="text-slate-400">סך מהלכים בזירה</div>
            <div className="text-base font-bold text-slate-100 mt-0.5">{totalMoves}</div>
          </div>
          <div>
            <div className="text-slate-400">סטטוס מטריקס</div>
            <div className="text-base font-bold text-emerald-400 mt-0.5">זירה נעולה</div>
          </div>
        </div>

        <button
          onClick={onPlayAgain}
          className="w-full py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-cyber font-bold text-sm transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>שחק שוב (אתחול זירה)</span>
        </button>
      </div>
    </div>
  );
};
