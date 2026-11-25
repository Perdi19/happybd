export interface LetterTile {
  id: string;
  char: string;
  originalIndex: number;
  isDecoy?: boolean;
}

export interface ProgressiveHint {
  level: number;
  requiredAttempts: number;
  title: string;
  text: string;
  highlightLetter?: string;
}

export type AttemptStatus = 'incomplete' | 'solved' | 'incorrect';

export const PUZZLE_TARGET_WORD = 'JASMINE';
export const PUZZLE_DECOY_LETTERS = ['R', 'L', 'O'] as const;

export const PROGRESSIVE_HINTS: ProgressiveHint[] = [
  {
    level: 1,
    requiredAttempts: 0,
    title: 'تلميحٌ أوّل',
    text: 'إنها زهرةٌ بيضاء رقيقة، عُرفت بعطرها الذي لا يُنسى... واسمٌ يليق بسحر هذه الليلة.',
  },
  {
    level: 2,
    requiredAttempts: 3,
    title: 'تلميحٌ إضافي',
    text: 'الكلمة مكونة من ٧ حروف إنجليزية وتبدأ بالحرف «J».',
    highlightLetter: 'J',
  },
  {
    level: 3,
    requiredAttempts: 5,
    title: 'تلميحٌ متقدّم',
    text: 'من بين البطاقات العشر، هناك ٣ حروف مُضلِّلة، والكلمة تنتهي بالحرف «E».',
    highlightLetter: 'E',
  },
  {
    level: 4,
    requiredAttempts: 7,
    title: 'تلميحٌ أخير',
    text: 'الحرف الرابع في منتصف الاسم هو «M» — فكّري بالزهرة التي تحمل اسمكِ.',
    highlightLetter: 'M',
  },
];

/**
 * Scrambles the target word along with optional decoy letters,
 * ensuring the leading tiles do not start in the solved order.
 */
export function createScrambledTiles(
  word: string,
  decoyLetters: readonly string[] = []
): LetterTile[] {
  const upper = word.toUpperCase().trim();
  const targetTiles: LetterTile[] = upper.split('').map((char, index) => ({
    id: `tile-${index}-${char}`,
    char,
    originalIndex: index,
    isDecoy: false,
  }));

  const decoyTiles: LetterTile[] = decoyLetters.map((rawChar, index) => {
    const char = rawChar.toUpperCase().trim();
    return {
      id: `decoy-${index}-${char}`,
      char,
      originalIndex: upper.length + index,
      isDecoy: true,
    };
  });

  const tiles = [...targetTiles, ...decoyTiles];
  if (tiles.length <= 1) return tiles;

  let scrambled = [...tiles];
  let attempts = 0;
  while (attempts < 30) {
    // Fisher-Yates shuffle
    for (let i = scrambled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [scrambled[i], scrambled[j]] = [scrambled[j], scrambled[i]];
    }

    const prefix = scrambled
      .slice(0, upper.length)
      .map((t) => t.char)
      .join('');
    if (prefix !== upper) {
      break;
    }
    attempts++;
  }

  // Fallback reversal if random shuffles happened to leave prefix solved
  if (
    scrambled
      .slice(0, upper.length)
      .map((t) => t.char)
      .join('') === upper
  ) {
    scrambled = [...tiles].reverse();
  }

  return scrambled;
}

/**
 * Validates whether the placed tiles in slots match the target word.
 */
export function isWordComplete(
  placedTiles: (LetterTile | null)[],
  targetWord: string
): boolean {
  const upper = targetWord.toUpperCase().trim();
  if (placedTiles.length !== upper.length) return false;
  if (placedTiles.some((t) => t === null)) return false;

  const currentString = placedTiles.map((t) => t?.char ?? '').join('').toUpperCase();
  return currentString === upper;
}

/**
 * Evaluates the current 7-slot board state as incomplete, solved, or incorrect.
 */
export function evaluateAttempt(
  placedTiles: (LetterTile | null)[],
  targetWord: string
): AttemptStatus {
  const upper = targetWord.toUpperCase().trim();
  if (placedTiles.length !== upper.length || placedTiles.some((t) => t === null)) {
    return 'incomplete';
  }
  return isWordComplete(placedTiles, upper) ? 'solved' : 'incorrect';
}

/**
 * Returns all progressive hints unlocked for the given number of incorrect attempts.
 */
export function getUnlockedHints(
  incorrectAttempts: number,
  hints: readonly ProgressiveHint[] = PROGRESSIVE_HINTS
): ProgressiveHint[] {
  const safeAttempts = Math.max(0, incorrectAttempts);
  return hints.filter((hint) => safeAttempts >= hint.requiredAttempts);
}

/**
 * Returns how many more incorrect attempts are needed for the next hint, or null if all are unlocked.
 */
export function getRemainingAttemptsForNextHint(
  incorrectAttempts: number,
  hints: readonly ProgressiveHint[] = PROGRESSIVE_HINTS
): number | null {
  const safeAttempts = Math.max(0, incorrectAttempts);
  const nextLocked = hints.find((hint) => hint.requiredAttempts > safeAttempts);
  if (!nextLocked) return null;
  return nextLocked.requiredAttempts - safeAttempts;
}
