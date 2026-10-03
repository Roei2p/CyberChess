/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chess, Square, Move } from 'chess.js';
import { GameMode, AIDifficulty, PieceColor, PieceType, MoveScene } from './types/chess';
import { computeAIMove, calculateMaterial } from './utils/chessEngine';
import { generateMoveScene } from './utils/sceneGenerator';
import { cyberAudio } from './utils/audio';
import { CyberBoard } from './components/CyberBoard';
import { CyberSceneViewer } from './components/CyberSceneViewer';
import { CyberControls } from './components/CyberControls';
import { CyberMoveHistory } from './components/CyberMoveHistory';
import { NewGameModal, GameOverModal } from './components/CyberModals';
import { ASSETS } from './assets/images';
import { Shield, Sparkles, Volume2, VolumeX, RotateCcw, Info, X } from 'lucide-react';

export default function App() {
  // Chess game state
  const [game, setGame] = useState<Chess>(() => new Chess());
  const [boardOrientation, setBoardOrientation] = useState<PieceColor>('w');
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [inCheckSquare, setInCheckSquare] = useState<string | null>(null);

  // Configuration state
  const [gameMode, setGameMode] = useState<GameMode>('vs-ai');
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>('tactical');
  const [playerSide, setPlayerSide] = useState<PieceColor>('w');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);

  // Scene state ("כל מהלך מאופיין בסצנה")
  const [scenes, setScenes] = useState<MoveScene[]>([]);
  const [activeScene, setActiveScene] = useState<MoveScene | null>(null);
  const [isSceneExpanded, setIsSceneExpanded] = useState<boolean>(false);

  // Modals state
  const [isNewGameModalOpen, setIsNewGameModalOpen] = useState<boolean>(false);
  const [isGameOverModalOpen, setIsGameOverModalOpen] = useState<boolean>(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState<boolean>(false);
  const [gameOverInfo, setGameOverInfo] = useState<{ winner: 'w' | 'b' | 'draw' | null; reason: string }>({
    winner: null,
    reason: '',
  });

  // Clocks / Timers
  const [timerMinutes, setTimerMinutes] = useState<number>(10);
  const [whiteTime, setWhiteTime] = useState<number>(600);
  const [blackTime, setBlackTime] = useState<number>(600);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync sound engine enabled flag
  useEffect(() => {
    cyberAudio.enabled = soundEnabled;
  }, [soundEnabled]);

  // Check king in check
  const updateCheckState = useCallback((currentGame: Chess) => {
    if (currentGame.inCheck()) {
      const turn = currentGame.turn();
      const board = currentGame.board();
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const piece = board[r][c];
          if (piece && piece.type === 'k' && piece.color === turn) {
            const col = String.fromCharCode(97 + c);
            const row = (8 - r).toString();
            setInCheckSquare(`${col}${row}`);
            return;
          }
        }
      }
    } else {
      setInCheckSquare(null);
    }
  }, []);

  // Material evaluation
  const materialData = calculateMaterial(game);
  const materialBalance = materialData.whiteMaterialScore - materialData.blackMaterialScore;

  // Execute a chess move and generate its scene
  const makeMove = useCallback(
    (moveArgs: { from: string; to: string; promotion?: PieceType }) => {
      try {
        const moveIndex = game.history().length + 1;
        const pieceBefore = game.get(moveArgs.from as Square);
        if (!pieceBefore) return false;

        // Perform move on clone to avoid mutation bug
        const newGame = new Chess(game.fen());
        const moveResult = newGame.move({
          from: moveArgs.from,
          to: moveArgs.to,
          promotion: moveArgs.promotion || 'q',
        });

        if (!moveResult) return false;

        // Generate dynamic tactical scene for this move
        const scene = generateMoveScene(
          moveIndex,
          moveResult.san,
          moveResult.from,
          moveResult.to,
          pieceBefore.type as PieceType,
          pieceBefore.color as PieceColor,
          !!moveResult.captured,
          moveResult.captured as PieceType | undefined,
          newGame.inCheck(),
          newGame.isCheckmate(),
          moveResult.flags
        );

        setGame(newGame);
        setLastMove({ from: moveResult.from, to: moveResult.to });
        setScenes(prev => [...prev, scene]);
        setActiveScene(scene);
        updateCheckState(newGame);

        // Check Game Over conditions
        if (newGame.isGameOver()) {
          let winner: 'w' | 'b' | 'draw' | null = null;
          let reason = '';

          if (newGame.isCheckmate()) {
            winner = pieceBefore.color as PieceColor;
            reason = winner === 'w' ? 'הניאון הלבן הכריע במט מוחלט!' : 'המטריקס השחור הנחית מט מכריע!';
          } else if (newGame.isStalemate()) {
            winner = 'draw';
            reason = 'פט (Stalemate) - אין מהלכים חוקיים, הקרב מסתיים בשוויון';
          } else if (newGame.isThreefoldRepetition()) {
            winner = 'draw';
            reason = 'תיקו עקב חזרה משולשת על אותה עמדה';
          } else if (newGame.isDraw()) {
            winner = 'draw';
            reason = 'תיקו טקטי (חוסר כלים או חוק 50 המהלכים)';
          }

          setGameOverInfo({ winner, reason });
          setIsGameOverModalOpen(true);
        }

        return true;
      } catch (err) {
        return false;
      }
    },
    [game, updateCheckState]
  );

  // AI response trigger
  useEffect(() => {
    if (gameMode !== 'vs-ai' || game.isGameOver()) return;

    const currentTurn = game.turn();
    const isAiTurn = currentTurn !== playerSide;

    if (isAiTurn) {
      setIsAiThinking(true);
      const timer = setTimeout(() => {
        const aiMove = computeAIMove(game, aiDifficulty);
        if (aiMove) {
          makeMove({
            from: aiMove.from,
            to: aiMove.to,
            promotion: (aiMove.promotion as PieceType) || 'q',
          });
        }
        setIsAiThinking(false);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [game, gameMode, playerSide, aiDifficulty, makeMove]);

  // Turn clocks timer loop
  useEffect(() => {
    if (timerMinutes === 0 || game.isGameOver()) return;

    timerRef.current = setInterval(() => {
      const turn = game.turn();
      if (turn === 'w') {
        setWhiteTime(prev => {
          if (prev <= 1) {
            setGameOverInfo({ winner: 'b', reason: 'הזמן של הניאון הלבן אזל!' });
            setIsGameOverModalOpen(true);
            return 0;
          }
          return prev - 1;
        });
      } else {
        setBlackTime(prev => {
          if (prev <= 1) {
            setGameOverInfo({ winner: 'w', reason: 'הזמן של המטריקס השחור אזל!' });
            setIsGameOverModalOpen(true);
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [game, timerMinutes]);

  // Start new game handler
  const handleStartNewGame = (config: {
    mode: GameMode;
    difficulty: AIDifficulty;
    playerSide: PieceColor;
    timerMinutes: number;
  }) => {
    const newG = new Chess();
    setGame(newG);
    setGameMode(config.mode);
    setAiDifficulty(config.difficulty);
    setPlayerSide(config.playerSide);
    setBoardOrientation(config.mode === 'vs-ai' ? config.playerSide : 'w');
    setTimerMinutes(config.timerMinutes);
    setWhiteTime(config.timerMinutes * 60);
    setBlackTime(config.timerMinutes * 60);
    setScenes([]);
    setActiveScene(null);
    setLastMove(null);
    setInCheckSquare(null);
    setIsGameOverModalOpen(false);

    // If player is black in vs-ai, AI plays white first!
    if (config.mode === 'vs-ai' && config.playerSide === 'b') {
      setIsAiThinking(true);
      setTimeout(() => {
        const firstMove = computeAIMove(newG, config.difficulty);
        if (firstMove) {
          const moveResult = newG.move(firstMove);
          if (moveResult) {
            const sc = generateMoveScene(
              1,
              moveResult.san,
              moveResult.from,
              moveResult.to,
              'p',
              'w',
              false,
              undefined,
              newG.inCheck(),
              false,
              moveResult.flags
            );
            setGame(new Chess(newG.fen()));
            setLastMove({ from: moveResult.from, to: moveResult.to });
            setScenes([sc]);
            setActiveScene(sc);
          }
        }
        setIsAiThinking(false);
      }, 500);
    }
  };

  // Undo move handler
  const handleUndoMove = () => {
    if (game.history().length === 0) return;

    const newGame = new Chess();
    const history = game.history();

    // In vs AI mode, undo 2 moves (AI + player), unless AI hasn't moved yet
    const stepsToUndo = gameMode === 'vs-ai' && history.length >= 2 ? 2 : 1;
    const remainingMoves = history.slice(0, history.length - stepsToUndo);

    for (const move of remainingMoves) {
      newGame.move(move);
    }

    setGame(newGame);
    const newScenes = scenes.slice(0, remainingMoves.length);
    setScenes(newScenes);
    setActiveScene(newScenes.length > 0 ? newScenes[newScenes.length - 1] : null);

    const newHistoryVerbose = newGame.history({ verbose: true });
    if (newHistoryVerbose.length > 0) {
      const last = newHistoryVerbose[newHistoryVerbose.length - 1];
      setLastMove({ from: last.from, to: last.to });
    } else {
      setLastMove(null);
    }

    updateCheckState(newGame);
  };

  const isInteractive =
    !isAiThinking &&
    !game.isGameOver() &&
    (gameMode === 'pass-and-play' || game.turn() === playerSide);

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between cyber-grid-bg bg-[#040711] text-slate-100 font-sans overflow-x-hidden">
      {/* Background Graphic Scrim & Wallpaper */}
      <div
        className="fixed inset-0 bg-cover bg-center pointer-events-none opacity-25 mix-blend-luminosity filter blur-sm"
        style={{ backgroundImage: `url(${ASSETS.cyberBackdrop})` }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-[#040711]/90 via-[#040711]/85 to-[#02040a]/95 pointer-events-none" />

      {/* ========================================================================= */}
      {/* SECTION 2: TOP BAR CONTRACT                                              */}
      {/* Exactly 3 zones: [Brand title] - [4-6 Nav links] - [1-2 Primary actions] */}
      {/* ========================================================================= */}
      <header className="relative z-20 w-full border-b border-cyan-500/20 bg-slate-950/70 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <span className="font-cyber text-lg sm:text-xl font-bold tracking-wider text-cyan-300 drop-shadow-[0_0_10px_rgba(6,182,212,0.6)]">
          CYBERCHESS NEON
        </span>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-medium text-slate-300">
          <button
            onClick={() => setIsNewGameModalOpen(true)}
            className="hover:text-cyan-300 transition-colors whitespace-nowrap cursor-pointer"
          >
            משחק חדש
          </button>
          <a
            href="#battlefield"
            className="hover:text-cyan-300 transition-colors whitespace-nowrap"
          >
            לוח טקטי
          </a>
          <a
            href="#scenes"
            className="hover:text-cyan-300 transition-colors whitespace-nowrap"
          >
            זירת סצנות
          </a>
          <button
            onClick={() => setIsInfoModalOpen(true)}
            className="hover:text-cyan-300 transition-colors whitespace-nowrap cursor-pointer"
          >
            חוקי סייבר
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setSoundEnabled(prev => !prev)}
            title={soundEnabled ? 'השתק' : 'הפעל סאונד'}
            className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-cyan-500/30 text-cyan-300 transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setIsNewGameModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-cyber font-bold text-xs transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] whitespace-nowrap flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>אתחל זירה</span>
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MAIN GAME ARENA: Cyber Glass Board & Holographic Combat Theater           */}
      {/* ========================================================================= */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        {/* Game Title Kicker */}
        <div className="text-center md:text-right flex flex-col md:flex-row md:items-center md:justify-between gap-2 border-b border-cyan-500/15 pb-4">
          <div>
            <h1 className="font-cyber text-2xl sm:text-3xl font-extrabold text-white tracking-wide">
              שחמט סייבר עתידני: <span className="text-cyan-400">זירת סצנות חיות</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              לוח שחמט שקוף ומודרני שבו כל מהלך מלווה בסיפור טקטי וסצנת פעולה הולוגרפית.
            </p>
          </div>

          <div className="flex items-center justify-center md:justify-end gap-2 text-xs font-mono-code text-cyan-300/80">
            <span className="px-2.5 py-1 rounded bg-cyan-950/50 border border-cyan-500/25">
              פרוטוקול: {gameMode === 'vs-ai' ? `AI ${aiDifficulty.toUpperCase()}` : '2 PLAYERS'}
            </span>
            <span className="px-2.5 py-1 rounded bg-slate-900/60 border border-slate-700/40">
              צד שחקן: {playerSide === 'w' ? 'WHITE' : 'BLACK'}
            </span>
          </div>
        </div>

        {/* Core Layout Grid: Left (Board & Controls), Right (Scene Viewer & Move Log) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Cyber Chessboard & Controls (7 Cols on desktop) */}
          <div id="battlefield" className="lg:col-span-7 flex flex-col items-center gap-4">
            <CyberControls
              gameMode={gameMode}
              aiDifficulty={aiDifficulty}
              soundEnabled={soundEnabled}
              onToggleSound={() => setSoundEnabled(prev => !prev)}
              onNewGameClick={() => setIsNewGameModalOpen(true)}
              onUndoMove={handleUndoMove}
              canUndo={game.history().length > 0 && !isAiThinking}
              whiteCaptured={materialData.whiteCaptures}
              blackCaptured={materialData.blackCaptures}
              materialBalance={materialBalance}
              currentTurn={game.turn()}
              isAiThinking={isAiThinking}
              whiteTime={whiteTime}
              blackTime={blackTime}
              hasTimer={timerMinutes > 0}
            />

            {/* The Translucent Cyber Chessboard */}
            <CyberBoard
              game={game}
              onMakeMove={makeMove}
              lastMove={lastMove}
              boardOrientation={boardOrientation}
              isInteractive={isInteractive}
              inCheckSquare={inCheckSquare}
            />
          </div>

          {/* Right Column: Holographic Scene Viewer & Move History (5 Cols on desktop) */}
          <div id="scenes" className="lg:col-span-5 flex flex-col gap-4">
            {/* The Signature Feature: Move Scene & Action Theater */}
            <CyberSceneViewer
              currentScene={activeScene}
              historyScenes={scenes}
              onSelectScene={scene => setActiveScene(scene)}
              isExpanded={isSceneExpanded}
              onToggleExpand={() => setIsSceneExpanded(prev => !prev)}
            />

            {/* Tactical Move History Log */}
            <CyberMoveHistory
              scenes={scenes}
              currentSelectedSceneId={activeScene?.id || null}
              onSelectScene={scene => setActiveScene(scene)}
            />
          </div>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* FOOTER                                                                    */}
      {/* ========================================================================= */}
      <footer className="relative z-10 w-full border-t border-cyan-500/15 bg-slate-950/80 backdrop-blur-md px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center gap-2">
          <span className="font-cyber font-bold text-cyan-400">CyberChess Neon</span>
          <span>·</span>
          <span>שחמט עתידני בסגנון סייבר עם מנוע שחמט מלא וסצנות פעולה</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsInfoModalOpen(true)}
            className="hover:text-cyan-300 transition-colors"
          >
            מדריך וחוקי משחק
          </button>
          <span>·</span>
          <button
            onClick={() => setIsNewGameModalOpen(true)}
            className="hover:text-cyan-300 transition-colors"
          >
            הגדרות קרב
          </button>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* MODALS                                                                    */}
      {/* ========================================================================= */}
      <NewGameModal
        isOpen={isNewGameModalOpen}
        onClose={() => setIsNewGameModalOpen(false)}
        onStartGame={handleStartNewGame}
        currentMode={gameMode}
        currentDifficulty={aiDifficulty}
        currentPlayerSide={playerSide}
        currentTimerMinutes={timerMinutes}
      />

      <GameOverModal
        isOpen={isGameOverModalOpen}
        winner={gameOverInfo.winner}
        reason={gameOverInfo.reason}
        onPlayAgain={() => setIsNewGameModalOpen(true)}
        totalMoves={game.history().length}
      />

      {/* Cyber Rules & Info Modal */}
      {isInfoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="glass-panel w-full max-w-lg rounded-2xl p-6 border border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.3)] relative">
            <button
              onClick={() => setIsInfoModalOpen(false)}
              className="absolute top-4 left-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-cyan-400" />
              <h3 className="font-cyber text-lg font-bold text-white">
                מדריך שחמט סייבר עתידני
              </h3>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-cyan-500/20">
                <h4 className="font-cyber font-bold text-cyan-300 mb-1">
                  1. מנוע שחמט חוקי ומלא
                </h4>
                <p>
                  המשחק פועל על פי חוקי השחמט הרשמיים המלאים: תנועות חוקיות, שח, מט, פט, הצרחה קוונטית (קצרה וארוכה), הכאה דרך הילוכו (en passant), ושדרוג חייל בהגעה לשורה האחרונה.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-cyan-500/20">
                <h4 className="font-cyber font-bold text-cyan-300 mb-1">
                  2. סצנות פעולה לכל מהלך
                </h4>
                <p>
                  כל תמרון של כלי שחמט מייצר בזמן אמת סצנת קרב הולוגרפית הכוללת נרטיב טקטי, אנימציית לייזר/התנגשות, והדמיה של הכוחות הנלחמים על לוח המטריקס. ניתן ללחוץ על כל מהלך ביומן ההיסטוריה כדי לשחזר את הסצנה שלו.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-cyan-500/20">
                <h4 className="font-cyber font-bold text-cyan-300 mb-1">
                  3. בינה מלאכותית בשלוש רמות
                </h4>
                <p>
                  רחפן סיור (קל) מתאים לתרגול ראשוני; זקיף טקטי (בינוני) מזהה איומים ולכידות; שליט עצבי (קשה) משתמש בחישוב Minimax עם גיזום אלפא-בטא והערכת עמדות מתקדמת.
                </p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-cyan-500/20 flex justify-end">
              <button
                onClick={() => setIsInfoModalOpen(false)}
                className="py-2 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-cyber font-bold text-xs transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              >
                הבנתי, חזרה לזירה
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
