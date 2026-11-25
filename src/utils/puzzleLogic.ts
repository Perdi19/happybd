export interface LetterTile {
  id: string;
  char: string;
  originalIndex: number;
}

/**
 * Scrambles the target word ensuring the result is not already solved.
 */
export function createScrambledTiles(word: string): LetterTile[] {
  const upper = word.toUpperCase().trim();
  const tiles: LetterTile[] = upper.split('').map((char, index) => ({
    id: `tile-${index}-${char}`,
    char,
    originalIndex: index,
  }));

  if (tiles.length <= 1) return tiles;

  // Predictable, non-matching shuffle
  let scrambled = [...tiles];
  let attempts = 0;
  while (attempts < 20) {
    // Fisher-Yates shuffle
    for (let i = scrambled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [scrambled[i], scrambled[j]] = [scrambled[j], scrambled[i]];
    }

    const currentWord = scrambled.map(t => t.char).join('');
    if (currentWord !== upper) {
      break;
    }
    attempts++;
  }

  // If still matching by coincidence, reverse it
  if (scrambled.map(t => t.char).join('') === upper) {
    scrambled = [...tiles].reverse();
  }

  return scrambled;
}

/**
 * Validates whether the placed tiles in slots match the target word.
 */
export function isWordComplete(placedTiles: (LetterTile | null)[], targetWord: string): boolean {
  const upper = targetWord.toUpperCase().trim();
  if (placedTiles.length !== upper.length) return false;
  if (placedTiles.some(t => t === null)) return false;

  const currentString = placedTiles.map(t => t?.char ?? '').join('');
  return currentString === upper;
}
