import test from 'node:test';
import assert from 'node:assert/strict';
import { createScrambledTiles, isWordComplete, LetterTile } from './puzzleLogic';

test('createScrambledTiles preserves all Arabic characters and scrambles the word', () => {
  const word = 'ياسمين';
  const tiles = createScrambledTiles(word);

  assert.equal(tiles.length, 6);
  const chars = tiles.map(t => t.char).sort().join('');
  assert.equal(chars, 'ياسمين'.split('').sort().join(''));

  // Should not be in exact solved order
  const scrambledStr = tiles.map(t => t.char).join('');
  assert.notEqual(scrambledStr, word);
});

test('isWordComplete correctly checks full Arabic spelling and slots', () => {
  const word = 'ياسمين';
  const solvedTiles: (LetterTile | null)[] = [
    { id: '1', char: 'ي', originalIndex: 0 },
    { id: '2', char: 'ا', originalIndex: 1 },
    { id: '3', char: 'س', originalIndex: 2 },
    { id: '4', char: 'م', originalIndex: 3 },
    { id: '5', char: 'ي', originalIndex: 4 },
    { id: '6', char: 'ن', originalIndex: 5 },
  ];

  assert.equal(isWordComplete(solvedTiles, word), true);

  // Incomplete with null slot
  const incompleteTiles: (LetterTile | null)[] = [...solvedTiles];
  incompleteTiles[2] = null;
  assert.equal(isWordComplete(incompleteTiles, word), false);

  // Wrong spelling
  const wrongTiles: (LetterTile | null)[] = [
    { id: '1', char: 'ي', originalIndex: 0 },
    { id: '2', char: 'ا', originalIndex: 1 },
    { id: '3', char: 'م', originalIndex: 3 },
    { id: '4', char: 'س', originalIndex: 2 },
    { id: '5', char: 'ي', originalIndex: 4 },
    { id: '6', char: 'ن', originalIndex: 5 },
  ];
  assert.equal(isWordComplete(wrongTiles, word), false);
});
