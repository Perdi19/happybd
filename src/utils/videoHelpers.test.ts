import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseVideoSource,
  withBaseUrl,
  formatVideoTime,
  BIRTHDAY_SONG_NOTES,
  BIRTHDAY_SONG_TOTAL_DURATION,
  getBirthdaySongVerses,
} from './videoHelpers';
import { SURPRISE_CONFIG } from '../config/surpriseConfig';

test('parseVideoSource handles YouTube watch, short, and direct paths', () => {
  assert.deepEqual(parseVideoSource(''), { type: 'none', src: '' });
  assert.deepEqual(parseVideoSource('/videos/jasmine.mp4'), {
    type: 'direct',
    src: '/videos/jasmine.mp4',
  });
  assert.deepEqual(parseVideoSource('https://www.youtube.com/watch?v=dQw4w9WgXcQ'), {
    type: 'youtube',
    src: 'https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0',
  });
  assert.deepEqual(parseVideoSource('https://youtu.be/abc123XYZ_9'), {
    type: 'youtube',
    src: 'https://www.youtube.com/embed/abc123XYZ_9?rel=0',
  });
  assert.deepEqual(parseVideoSource('https://example.com/birthday.mp4'), {
    type: 'direct',
    src: 'https://example.com/birthday.mp4',
  });
});

test('formatVideoTime formats seconds as m:ss', () => {
  assert.equal(formatVideoTime(0), '0:00');
  assert.equal(formatVideoTime(7), '0:07');
  assert.equal(formatVideoTime(75), '1:15');
});

test('BIRTHDAY_SONG_NOTES and verses cover all 4 phrases within duration', () => {
  assert.equal(BIRTHDAY_SONG_NOTES.length, 25);
  const lastNote = BIRTHDAY_SONG_NOTES[BIRTHDAY_SONG_NOTES.length - 1];
  assert.ok(lastNote.start + lastNote.duration <= BIRTHDAY_SONG_TOTAL_DURATION);
  const verses = getBirthdaySongVerses('ياسمين');
  assert.equal(verses.length, 4);
  assert.ok(verses[2].includes('ياسمين'));
});

test('withBaseUrl resolves public assets cleanly for root and subpath bases', () => {
  assert.equal(withBaseUrl('happybd.mp4', '/'), '/happybd.mp4');
  assert.equal(withBaseUrl('/happybd.mp4', '/happybd/'), '/happybd/happybd.mp4');
  assert.equal(withBaseUrl('happybd.mp4', '/happybd'), '/happybd/happybd.mp4');
});

test('SURPRISE_CONFIG configures happybd.mp4 as direct video source', () => {
  assert.equal(SURPRISE_CONFIG.birthdayVideoUrl, '/happybd.mp4');
  assert.deepEqual(parseVideoSource(SURPRISE_CONFIG.birthdayVideoUrl), {
    type: 'direct',
    src: '/happybd.mp4',
  });
});
