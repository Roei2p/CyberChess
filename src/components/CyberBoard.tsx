import React, { useState } from 'react';
import { Chess, Square, Move } from 'chess.js';
import { PieceType, PieceColor } from '../types/chess';
import { CyberPiece } from './CyberPiece';
import { cyberAudio } from '../utils/audio';

interface CyberBoardProps {
  game: Chess;
  onMakeMove: (move: { from: string; to: string; promotion?: PieceType }) => boolean;
  lastMove: { from: string; to: string } | null;
  boardOrientation: 'w' | 'b';
  isInteractive: boolean;
  inCheckSquare: string | null;
}

export const CyberBoard: React.FC<CyberBoardProps> = ({
  game,
  onMakeMove,
  lastMove,
  boardOrientation,
  isInteractive,
  inCheckSquare,
}) => {
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: string; to: string } | null>(null);

  const board = game.board();

  // Compute legal moves for the selected square
  const legalMovesForSelected: Move[] = selectedSquare
    ? game.moves({ square: selectedSquare as Square, verbose: true })
    : [];

  const legalTargetSquares = new Set<string>(legalMovesForSelected.map(m => m.to));

  const handleSquareClick = (squareStr: string) => {
    if (!isInteractive) return;

    // If clicking the currently selected square, deselect
    if (selectedSquare === squareStr) {
      setSelectedSquare(null);
      return;
    }

    // If already selected and clicked a legal move destination
    if (selectedSquare && legalTargetSquares.has(squareStr)) {
      const piece = game.get(selectedSquare as Square);
      const isPawn = piece?.type === 'p';
      const targetRank = squareStr[1];
      const isPromotion = isPawn && (targetRank === '8' || targetRank === '1');

      if (isPromotion) {
        setPendingPromotion({ from: selectedSquare, to: squareStr });
        return;
      }

      const success = onMakeMove({ from: selectedSquare, to: squareStr });
      if (success) {
        setSelectedSquare(null);
      }
      return;
    }

    // Otherwise, check if user clicked their own piece to select it
    const piece = game.get(squareStr as Square);
    if (piece && piece.color === game.turn()) {
      setSelectedSquare(squareStr);
      cyberAudio.playSelect();
    } else {
      setSelectedSquare(null);
    }
  };

  const handlePromotionSelect = (promotedType: PieceType) => {
    if (pendingPromotion) {
      onMakeMove({
        from: pendingPromotion.from,
        to: pendingPromotion.to,
        promotion: promotedType,
      });
      setPendingPromotion(null);
      setSelectedSquare(null);
    }
  };

  // Files and Ranks ordering based on boardOrientation
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

  const displayFiles = boardOrientation === 'w' ? files : [...files].reverse();
  const displayRanks = boardOrientation === 'w' ? ranks : [...ranks].reverse();

  return (
    <div className="relative w-full max-w-[560px] aspect-square select-none">
      {/* Outer Holographic Glass Bezel */}
      <div className="w-full h-full p-2.5 sm:p-3.5 rounded-2xl glass-panel relative overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.15)] border border-cyan-500/30 flex flex-col justify-between">
        {/* Subtle corner high-tech brackets */}
        <div className="absolute top-1 left-1 w-4 h-4 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
        <div className="absolute top-1 right-1 w-4 h-4 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
        <div className="absolute bottom-1 left-1 w-4 h-4 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />
        <div className="absolute bottom-1 right-1 w-4 h-4 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />

        {/* 8x8 Chess Grid Container */}
        <div className="w-full h-full grid grid-cols-8 grid-rows-8 rounded-xl overflow-hidden border border-cyan-500/20 relative shadow-inner">
          {displayRanks.map((rank, rowIdx) =>
            displayFiles.map((file, colIdx) => {
              const squareStr = `${file}${rank}`;
              const piece = game.get(squareStr as Square);

              const isLight = (file.charCodeAt(0) - 97 + parseInt(rank, 10)) % 2 !== 0;
              const isSelected = selectedSquare === squareStr;
              const isLegalTarget = legalTargetSquares.has(squareStr);
              const isLastMoveFrom = lastMove?.from === squareStr;
              const isLastMoveTo = lastMove?.to === squareStr;
              const isInCheck = inCheckSquare === squareStr;

              // Check if legal target is a capture
              const isCaptureTarget = isLegalTarget && piece !== null;

              return (
                <div
                  key={squareStr}
                  onClick={() => handleSquareClick(squareStr)}
                  className={`relative flex items-center justify-center transition-colors cursor-pointer ${
                    isLight ? 'bg-cyan-950/20' : 'bg-slate-950/70'
                  } ${
                    isSelected ? 'bg-cyan-500/30 shadow-[inset_0_0_15px_rgba(6,182,212,0.6)]' : ''
                  } ${
                    isLastMoveFrom || isLastMoveTo ? 'bg-amber-500/20 shadow-[inset_0_0_12px_rgba(245,158,11,0.3)]' : ''
                  } hover:bg-cyan-900/30`}
                >
                  {/* Grid wireframe border */}
                  <div className="absolute inset-0 border border-cyan-500/10 pointer-events-none" />

                  {/* King Check Red Pulsing Ring */}
                  {isInCheck && (
                    <div className="absolute inset-0 border-2 border-rose-500 bg-rose-500/25 animate-pulse rounded pointer-events-none shadow-[0_0_20px_rgba(244,63,94,0.7)]" />
                  )}

                  {/* Selected Square Accent Lines */}
                  {isSelected && (
                    <div className="absolute inset-0 border-2 border-cyan-400 pointer-events-none rounded shadow-[0_0_15px_rgba(6,182,212,0.8)]" />
                  )}

                  {/* Legal Move Indicators */}
                  {isLegalTarget && !isCaptureTarget && (
                    <div className="absolute w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-cyan-400/80 shadow-[0_0_10px_rgba(6,182,212,1)] pointer-events-none animate-pulse" />
                  )}

                  {/* Capture Target Reticle */}
                  {isCaptureTarget && (
                    <div className="absolute inset-1 pointer-events-none">
                      <div className="w-full h-full border-2 border-rose-500/90 rounded bg-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.8)] animate-pulse" />
                      {/* Targeting Corner marks */}
                      <span className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-white" />
                      <span className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-white" />
                      <span className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-white" />
                      <span className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-white" />
                    </div>
                  )}

                  {/* Render Chess Piece */}
                  {piece && (
                    <div className="w-full h-full p-1 sm:p-1.5 z-10">
                      <CyberPiece
                        type={piece.type as PieceType}
                        color={piece.color as PieceColor}
                        isThreatened={isInCheck}
                      />
                    </div>
                  )}

                  {/* Coordinate labels in edge cells */}
                  {colIdx === 0 && (
                    <span className="absolute top-1 left-1.5 text-[9px] sm:text-[10px] font-mono-code font-bold text-cyan-400/50 pointer-events-none">
                      {rank}
                    </span>
                  )}
                  {rowIdx === 7 && (
                    <span className="absolute bottom-0.5 right-1 text-[9px] sm:text-[10px] font-mono-code font-bold text-cyan-400/50 pointer-events-none">
                      {file}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Pawn Promotion Modal Dialogue */}
      {pendingPromotion && (
        <div className="absolute inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 rounded-2xl border border-cyan-400/50 animate-fade-in">
          <div className="text-center mb-4">
            <h4 className="font-cyber text-lg font-bold text-cyan-300">
              שדרוג ננו-טכנולוגי (הכתרה)
            </h4>
            <p className="text-xs text-slate-300 mt-1">בחר מודול שדרוג לחייל החלוץ שהגיע ליעד</p>
          </div>

          <div className="grid grid-cols-4 gap-3 w-full max-w-xs">
            {(['q', 'n', 'r', 'b'] as PieceType[]).map(ptype => {
              const names: Record<PieceType, string> = {
                q: 'מלכה',
                n: 'פרש',
                r: 'צריח',
                b: 'רץ',
                p: 'חייל',
                k: 'מלך',
              };

              return (
                <button
                  key={ptype}
                  onClick={() => handlePromotionSelect(ptype)}
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-cyan-950/60 border border-cyan-400/40 hover:bg-cyan-500/30 hover:border-cyan-300 transition-all group"
                >
                  <div className="w-12 h-12 mb-1">
                    <CyberPiece type={ptype} color={game.turn() as PieceColor} />
                  </div>
                  <span className="text-xs font-cyber font-medium text-cyan-200 group-hover:text-white">
                    {names[ptype]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
