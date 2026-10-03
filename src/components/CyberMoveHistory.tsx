import React, { useRef, useEffect } from 'react';
import { MoveScene } from '../types/chess';
import { ScrollText, Film, Eye, Sparkles } from 'lucide-react';

interface CyberMoveHistoryProps {
  scenes: MoveScene[];
  currentSelectedSceneId: string | null;
  onSelectScene: (scene: MoveScene) => void;
}

export const CyberMoveHistory: React.FC<CyberMoveHistoryProps> = ({
  scenes,
  currentSelectedSceneId,
  onSelectScene,
}) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to latest move
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [scenes.length]);

  // Group moves into pairs (White move, Black move)
  const pairedMoves: { moveNumber: number; whiteScene?: MoveScene; blackScene?: MoveScene }[] = [];

  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    const moveNumber = Math.floor(i / 2) + 1;
    if (i % 2 === 0) {
      pairedMoves.push({ moveNumber, whiteScene: scene });
    } else {
      pairedMoves[pairedMoves.length - 1].blackScene = scene;
    }
  }

  return (
    <div className="glass-panel rounded-2xl p-4 flex flex-col h-[320px] lg:h-[380px] border border-cyan-500/20">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
        <div className="flex items-center gap-2">
          <Film className="w-4 h-4 text-cyan-400" />
          <h3 className="font-cyber text-sm font-bold text-cyan-200">
            יומן סצנות ותמרונים טקטיים
          </h3>
        </div>
        <span className="text-xs font-mono-code text-slate-400">
          {scenes.length} מהלכים
        </span>
      </div>

      {/* Move log list */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto mt-2 space-y-1.5 pr-1 text-xs font-mono-code custom-scrollbar"
      >
        {pairedMoves.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center p-4">
            <ScrollText className="w-8 h-8 opacity-40 mb-2" />
            <p className="font-cyber text-xs">טרם בוצעו מהלכים במטריקס</p>
            <p className="text-[11px] text-slate-600 mt-1">כל מהלך יתועד כאן וייצור סצנה מיוחדת</p>
          </div>
        ) : (
          pairedMoves.map(({ moveNumber, whiteScene, blackScene }) => (
            <div
              key={moveNumber}
              className="grid grid-cols-12 items-center gap-1.5 py-1 px-2 rounded-lg bg-slate-950/40 hover:bg-slate-900/60 border border-slate-800/40 transition-colors"
            >
              {/* Turn Number */}
              <div className="col-span-2 text-slate-500 font-bold text-[11px]">
                {moveNumber}.
              </div>

              {/* White Move */}
              <div className="col-span-5">
                {whiteScene ? (
                  <button
                    onClick={() => onSelectScene(whiteScene)}
                    className={`w-full flex items-center justify-between px-2 py-1 rounded text-right transition-all group ${
                      currentSelectedSceneId === whiteScene.id
                        ? 'bg-cyan-500/25 border border-cyan-400/50 text-cyan-200 shadow-sm'
                        : 'text-slate-200 hover:bg-cyan-950/40 hover:text-cyan-300'
                    }`}
                  >
                    <span className="font-bold flex items-center gap-1">
                      {whiteScene.san}
                      {whiteScene.isCapture && (
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 inline-block" />
                      )}
                      {whiteScene.isCheck && (
                        <span className="text-[10px] text-amber-400 font-bold">+</span>
                      )}
                    </span>
                    <Eye className="w-3 h-3 opacity-0 group-hover:opacity-100 text-cyan-400 transition-opacity" />
                  </button>
                ) : null}
              </div>

              {/* Black Move */}
              <div className="col-span-5">
                {blackScene ? (
                  <button
                    onClick={() => onSelectScene(blackScene)}
                    className={`w-full flex items-center justify-between px-2 py-1 rounded text-right transition-all group ${
                      currentSelectedSceneId === blackScene.id
                        ? 'bg-rose-500/25 border border-rose-400/50 text-rose-200 shadow-sm'
                        : 'text-slate-200 hover:bg-rose-950/40 hover:text-rose-300'
                    }`}
                  >
                    <span className="font-bold flex items-center gap-1">
                      {blackScene.san}
                      {blackScene.isCapture && (
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 inline-block" />
                      )}
                      {blackScene.isCheck && (
                        <span className="text-[10px] text-amber-400 font-bold">+</span>
                      )}
                    </span>
                    <Eye className="w-3 h-3 opacity-0 group-hover:opacity-100 text-rose-400 transition-opacity" />
                  </button>
                ) : (
                  <span className="text-slate-600 block px-2 py-1">...</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer hint */}
      <div className="pt-2 border-t border-cyan-500/15 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>לחץ על מהלך לצפייה בסצנה</span>
        </span>
        <span className="text-cyan-400/80 font-mono-code font-bold">CYBER LOG</span>
      </div>
    </div>
  );
};
