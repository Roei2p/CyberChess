export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type PieceColor = 'w' | 'b';

export type GameMode = 'vs-ai' | 'pass-and-play';
export type AIDifficulty = 'novice' | 'tactical' | 'overlord';

export interface MoveScene {
  id: string;
  moveIndex: number;
  san: string;
  from: string;
  to: string;
  piece: PieceType;
  pieceNameHebrew: string;
  pieceNameEnglish: string;
  color: PieceColor;
  isCapture: boolean;
  capturedPiece?: PieceType;
  capturedPieceNameHebrew?: string;
  isCheck: boolean;
  isCheckmate: boolean;
  isCastling?: 'kingside' | 'queenside';
  isPromotion?: boolean;
  promotedTo?: PieceType;
  titleHebrew: string;
  titleEnglish: string;
  narrativeHebrew: string;
  narrativeEnglish: string;
  intensity: 'standard' | 'high' | 'critical' | 'lethal';
  sceneTheme: 'advance' | 'quantum_leap' | 'laser_beam' | 'heavy_cannon' | 'command_override' | 'phase_teleport' | 'core_meltdown' | 'ambush';
  gridCoordinates: {
    fromCol: number;
    fromRow: number;
    toCol: number;
    toRow: number;
  };
  timestamp: string;
}

export interface GameStats {
  whiteCaptures: PieceType[];
  blackCaptures: PieceType[];
  whiteMaterialScore: number;
  blackMaterialScore: number;
}
