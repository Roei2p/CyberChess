import { PieceType, PieceColor, MoveScene } from '../types/chess';

const PIECE_NAMES_HEBREW: Record<PieceType, string> = {
  p: 'חייל חלוץ',
  n: 'פרש קוונטי',
  b: 'רץ פלזמה',
  r: 'צריח טקטי',
  q: 'מלכת סייבר',
  k: 'מלך הליבה',
};

const PIECE_NAMES_ENGLISH: Record<PieceType, string> = {
  p: 'Vanguard Pawn',
  n: 'Quantum Knight',
  b: 'Plasma Bishop',
  r: 'Tactical Rook',
  q: 'Cyber Queen',
  k: 'Core King',
};

// Tactical scene generator based on chess move parameters
export function generateMoveScene(
  moveIndex: number,
  san: string,
  from: string,
  to: string,
  piece: PieceType,
  color: PieceColor,
  isCapture: boolean,
  capturedPiece: PieceType | undefined,
  isCheck: boolean,
  isCheckmate: boolean,
  flags: string
): MoveScene {
  const isCastling = flags.includes('k') ? 'kingside' : flags.includes('q') ? 'queenside' : undefined;
  const isPromotion = flags.includes('p');
  
  const fromCol = from.charCodeAt(0) - 97;
  const fromRow = parseInt(from[1], 10) - 1;
  const toCol = to.charCodeAt(0) - 97;
  const toRow = parseInt(to[1], 10) - 1;

  const pieceNameHebrew = PIECE_NAMES_HEBREW[piece];
  const pieceNameEnglish = PIECE_NAMES_ENGLISH[piece];
  const capturedPieceNameHebrew = capturedPiece ? PIECE_NAMES_HEBREW[capturedPiece] : undefined;

  let intensity: 'standard' | 'high' | 'critical' | 'lethal' = 'standard';
  let sceneTheme: MoveScene['sceneTheme'] = 'advance';
  let titleHebrew = '';
  let titleEnglish = '';
  let narrativeHebrew = '';
  let narrativeEnglish = '';

  const colorHebrew = color === 'w' ? 'הניאון הלבן' : 'הצל השחור';
  const colorEnglish = color === 'w' ? 'White Neon' : 'Obsidian Shadow';

  if (isCheckmate) {
    intensity = 'lethal';
    sceneTheme = 'core_meltdown';
    titleHebrew = `קריסת מט סופית: השמדת ליבת היריב ב-${to.toUpperCase()}`;
    titleEnglish = `Neural Singularity: Checkmate on Node ${to.toUpperCase()}`;
    narrativeHebrew = `${pieceNameHebrew} של ${colorHebrew} מבצע תמרון הכרעה סופי על ${to.toUpperCase()}. מערכות ההגנה של מלך היריב קורסות לחלוטין - לוח השחמט ננעל בניצחון מוחלט.`;
    narrativeEnglish = `${pieceNameEnglish} delivers the lethal singularity on sector ${to.toUpperCase()}. Hostile King matrix collapsed. Victory registered.`;
  } else if (isCheck) {
    intensity = 'critical';
    sceneTheme = 'command_override';
    titleHebrew = `שח טקטי: איום ישיר על ליבת הפיקוד ב-${to.toUpperCase()}`;
    titleEnglish = `Tactical Check: Direct Threat on Sector ${to.toUpperCase()}`;
    narrativeHebrew = `${pieceNameHebrew} שובר את קווי האבטחה וחודר אל משבצת ${to.toUpperCase()}, ומכוון קרן אנרגיה ממוקדת ישירות אל עבר מלך היריב. סירנות החירום מופעלות!`;
    narrativeEnglish = `${pieceNameEnglish} breaches the perimeter into ${to.toUpperCase()}, locking targeting lasers directly onto the hostile Core King. Emergency protocols engaged.`;
  } else if (isCastling) {
    intensity = 'high';
    sceneTheme = 'phase_teleport';
    const side = isCastling === 'kingside' ? 'אגף המלך (קצר)' : 'אגף המלכה (ארוך)';
    titleHebrew = `הצרחה קוונטית: מעבר פאזה ב${side}`;
    titleEnglish = `Quantum Castling: Trans-Dimensional Phase Shift`;
    narrativeHebrew = `המלך והצריח מבצעים שיגור קוונטי מתואם על גבי סיבי הנתונים. עמדת הפיקוד מאובטחת במקלט אנרגיה מבוצר, והצריח נפרס לחזית.`;
    narrativeEnglish = `Coordinated quantum shift between Core King and Tactical Rook. Command nexus fortified behind harmonic particle shields.`;
  } else if (isPromotion) {
    intensity = 'high';
    sceneTheme = 'command_override';
    titleHebrew = `שדרוג ננו-טכנולוגי: חייל הופך למלכת סייבר ב-${to.toUpperCase()}`;
    titleEnglish = `Nanotech Overclock: Promotion on Node ${to.toUpperCase()}`;
    narrativeHebrew = `חייל החלוץ השלים את חדירת המטריקס עד לעומק שטח האויב (${to.toUpperCase()}), וסופג אנרגיית ליבה שהופכת אותו לכוח התקפי קטלני.`;
    narrativeEnglish = `Vanguard Pawn penetrates the enemy deep sector at ${to.toUpperCase()}, downloading super-tier protocols and mutating into a high-order Cyber unit.`;
  } else if (isCapture) {
    intensity = 'high';
    if (piece === 'n') {
      sceneTheme = 'quantum_leap';
      titleHebrew = `מארב קוונטי: חיסול ${capturedPieceNameHebrew} ב-${to.toUpperCase()}`;
      titleEnglish = `Quantum Ambush: Eliminated ${capturedPiece ? PIECE_NAMES_ENGLISH[capturedPiece] : 'Unit'}`;
      narrativeHebrew = `הפרש הקוונטי דילג מעל חומות האש של היריב והנחית מכת ברק על ${capturedPieceNameHebrew} ב-${to.toUpperCase()}. המטרה פורקה לרסיסי קוד.`;
      narrativeEnglish = `Quantum Knight bypassed sector firewall conduits, unleashing EMP discharge to vaporize hostile ${capturedPiece ? PIECE_NAMES_ENGLISH[capturedPiece] : 'target'}.`;
    } else if (piece === 'b') {
      sceneTheme = 'laser_beam';
      titleHebrew = `פגיעת קרן פלזמה אלכסונית ב-${to.toUpperCase()}`;
      titleEnglish = `Diagonal Plasma Strike on Node ${to.toUpperCase()}`;
      narrativeHebrew = `רץ הפלזמה ירה קרן לייזר ממוקדת לאורך מסדרון הולוגרפי אלכסוני, ומחק את ${capturedPieceNameHebrew} שחסם את הנתיב.`;
      narrativeEnglish = `Plasma Bishop emitted a focused particle beam through the diagonal corridor, disintegrating the defender occupying node ${to.toUpperCase()}.`;
    } else if (piece === 'r') {
      sceneTheme = 'heavy_cannon';
      titleHebrew = `הפגזת תותח כבד של הצריח ב-${to.toUpperCase()}`;
      titleEnglish = `Heavy Railgun Bombardment on Sector ${to.toUpperCase()}`;
      narrativeHebrew = `הצריח הטקטי טען קבלי פלזמה וירה מטח שובר-שריון בקו ישר אל ${to.toUpperCase()}, מחריב את ${capturedPieceNameHebrew} עד היסוד.`;
      narrativeEnglish = `Tactical Rook unleashed straight-line railgun fire onto ${to.toUpperCase()}, obliterating the hostile node presence.`;
    } else if (piece === 'q') {
      sceneTheme = 'command_override';
      titleHebrew = `מתקפת עליונות של מלכת הסייבר ב-${to.toUpperCase()}`;
      titleEnglish = `Cyber Queen Dominance Strike on ${to.toUpperCase()}`;
      narrativeHebrew = `מלכת הסייבר פשטה על צומת ${to.toUpperCase()} במהירות על-קולית, הפילה את מגני ה-${capturedPieceNameHebrew} והשתלטה על הזירה.`;
      narrativeEnglish = `Cyber Queen swept into sector ${to.toUpperCase()}, overwhelming defender defensive shields with omni-directional pulse energy.`;
    } else {
      sceneTheme = 'ambush';
      titleHebrew = `חייל חלוץ מפרק את ${capturedPieceNameHebrew} ב-${to.toUpperCase()}`;
      titleEnglish = `Vanguard Skirmish: Core Extraction on ${to.toUpperCase()}`;
      narrativeHebrew = `חייל החלוץ פתח במגע ישיר ושלף את ליבת הנתונים של ה-${capturedPieceNameHebrew} בקרב מגע הייטקי קטלני.`;
      narrativeEnglish = `Vanguard Pawn engaged in close-quarters cyber skirmish, extracting hostile node cores at ${to.toUpperCase()}.`;
    }
  } else {
    // Non-capture tactical positioning
    intensity = 'standard';
    if (piece === 'n') {
      sceneTheme = 'quantum_leap';
      titleHebrew = `תמרון דילוג קוונטי: ${from.toUpperCase()} ⟵ ${to.toUpperCase()}`;
      titleEnglish = `Phase Leap Trajectory: ${from.toUpperCase()} ➔ ${to.toUpperCase()}`;
      narrativeHebrew = `הפרש הקוונטי דילג במרחב הסייבר מעמדת ${from.toUpperCase()} אל צומת ${to.toUpperCase()}, ומאיים בו-זמנית על מספר מוקדים אסטרטגיים.`;
      narrativeEnglish = `Quantum Knight hopped sub-grid lines from ${from.toUpperCase()} to ${to.toUpperCase()}, casting multi-directional tactical vectors across hostile lines.`;
    } else if (piece === 'b') {
      sceneTheme = 'laser_beam';
      titleHebrew = `יישור כוונות פלזמה: מעבר אלכסוני ל-${to.toUpperCase()}`;
      titleEnglish = `Diagonal Vector Calibration to ${to.toUpperCase()}`;
      narrativeHebrew = `רץ הפלזמה נע בקו אלכסוני חלק מ-${from.toUpperCase()} ומציב קו ראייה ארוך-טווח עד לירכתי מערך היריב.`;
      narrativeEnglish = `Plasma Bishop calibrated a long-range diagonal firing arc through node ${to.toUpperCase()}, controlling critical sightlines.`;
    } else if (piece === 'r') {
      sceneTheme = 'heavy_cannon';
      titleHebrew = `פריסת טור צריח טקטי בציר ${to[0].toUpperCase()}`;
      titleEnglish = `Tactical Rook Deployment on Column ${to[0].toUpperCase()}`;
      narrativeHebrew = `הצריח התמקם על משבצת ${to.toUpperCase()}, נועל את כל טור ${to[0].toUpperCase()} תחת אש רתק ממוחשבת.`;
      narrativeEnglish = `Tactical Rook anchored at node ${to.toUpperCase()}, establishing heavy perimeter lockdown along file ${to[0].toUpperCase()}.`;
    } else if (piece === 'q') {
      sceneTheme = 'command_override';
      titleHebrew = `הקרנת כוח מלכותית אל מוקד ${to.toUpperCase()}`;
      titleEnglish = `Queen Power Projection onto ${to.toUpperCase()}`;
      narrativeHebrew = `מלכת הסייבר עברה ל-${to.toUpperCase()}, מקרינה נוכחות דומיננטית המכתיבה את קצב המשחק ב-360 מעלות.`;
      narrativeEnglish = `Cyber Queen relocated to command node ${to.toUpperCase()}, exercising omni-directional tactical control over the matrix.`;
    } else if (piece === 'k') {
      sceneTheme = 'advance';
      titleHebrew = `עמדת הגנה למלך הליבה ב-${to.toUpperCase()}`;
      titleEnglish = `Core King Positional Adjustment to ${to.toUpperCase()}`;
      narrativeHebrew = `מלך הליבה נע צעד טקטי אל משבצת ${to.toUpperCase()}, משיג כיסוי מגנים אופטימלי ומונע חדירות אויב.`;
      narrativeEnglish = `Core King shifted coordinates to ${to.toUpperCase()}, reinforcing defensive perimeter shields.`;
    } else {
      sceneTheme = 'advance';
      titleHebrew = `קידום חייל חלוץ: ביסוס אחיזה ב-${to.toUpperCase()}`;
      titleEnglish = `Vanguard Node Claim at ${to.toUpperCase()}`;
      narrativeHebrew = `חייל החלוץ צועד מ-${from.toUpperCase()} אל עבר ${to.toUpperCase()}, כובש שטח במרכז הזירה ומקים מחסום אנרגיה מקומי.`;
      narrativeEnglish = `Vanguard Pawn claimed forward relay post ${to.toUpperCase()}, securing node control and expanding defensive mesh.`;
    }
  }

  const now = new Date();
  const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

  return {
    id: `scene_${moveIndex}_${from}_${to}_${Date.now()}`,
    moveIndex,
    san,
    from,
    to,
    piece,
    pieceNameHebrew,
    pieceNameEnglish,
    color,
    isCapture,
    capturedPiece,
    capturedPieceNameHebrew,
    isCheck,
    isCheckmate,
    isCastling,
    isPromotion,
    titleHebrew,
    titleEnglish,
    narrativeHebrew,
    narrativeEnglish,
    intensity,
    sceneTheme,
    gridCoordinates: {
      fromCol,
      fromRow,
      toCol,
      toRow,
    },
    timestamp,
  };
}
