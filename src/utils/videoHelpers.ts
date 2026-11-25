export type VideoSourceType = 'youtube' | 'direct' | 'none';

export interface ParsedVideoSource {
  type: VideoSourceType;
  src: string;
}

/**
 * Resolves a public asset path against Vite's configured base URL (e.g. "/happybd/").
 * Falls back safely to "/" when executed in Node unit tests outside Vite.
 */
export function withBaseUrl(assetPath: string, baseUrl?: string): string {
  let viteBase = '/';
  try {
    if (typeof import.meta.env.BASE_URL === 'string' && import.meta.env.BASE_URL.length > 0) {
      viteBase = import.meta.env.BASE_URL;
    }
  } catch {
    viteBase = '/';
  }
  const rawBase = baseUrl ?? viteBase;
  const cleanBase = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;
  const cleanPath = assetPath.replace(/^\/+/, '');
  return `${cleanBase}${cleanPath}`;
}

/**
 * Parses a configured or user-provided video URL/path into an embeddable YouTube URL
 * or direct HTML5 video source.
 */
export function parseVideoSource(input: string): ParsedVideoSource {
  const trimmed = input.trim();
  if (!trimmed) {
    return { type: 'none', src: '' };
  }

  // Local blob URLs or relative public paths
  if (trimmed.startsWith('blob:') || trimmed.startsWith('/') || trimmed.startsWith('./')) {
    return { type: 'direct', src: trimmed };
  }

  try {
    const url = new URL(trimmed);
    const host = url.hostname.replace(/^www\./, '').toLowerCase();

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const vParam = url.searchParams.get('v');
      if (vParam && /^[a-zA-Z0-9_-]{6,20}$/.test(vParam)) {
        return {
          type: 'youtube',
          src: `https://www.youtube.com/embed/${vParam}?rel=0`,
        };
      }
      const shortsMatch = url.pathname.match(/^\/shorts\/([a-zA-Z0-9_-]{6,20})/);
      if (shortsMatch) {
        return {
          type: 'youtube',
          src: `https://www.youtube.com/embed/${shortsMatch[1]}?rel=0`,
        };
      }
      const embedMatch = url.pathname.match(/^\/embed\/([a-zA-Z0-9_-]{6,20})/);
      if (embedMatch) {
        return {
          type: 'youtube',
          src: `https://www.youtube.com/embed/${embedMatch[1]}?rel=0`,
        };
      }
    }

    if (host === 'youtu.be') {
      const id = url.pathname.replace(/^\//, '').split('/')[0];
      if (id && /^[a-zA-Z0-9_-]{6,20}$/.test(id)) {
        return {
          type: 'youtube',
          src: `https://www.youtube.com/embed/${id}?rel=0`,
        };
      }
    }

    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return { type: 'direct', src: trimmed };
    }
  } catch {
    return { type: 'none', src: '' };
  }

  return { type: 'none', src: '' };
}

export function formatVideoTime(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export interface SongNote {
  freq: number;
  start: number; // seconds
  duration: number; // seconds
  verseIndex: number;
}

// Classic Happy Birthday melody in F Major (C4=261.63 .. F5=698.46)
export const BIRTHDAY_SONG_NOTES: SongNote[] = [
  // Verse 0: "سنة حلوة يا جميل..." (C4 C4 D4 C4 F4 E4)
  { freq: 261.63, start: 0.2, duration: 0.38, verseIndex: 0 },
  { freq: 261.63, start: 0.62, duration: 0.26, verseIndex: 0 },
  { freq: 293.66, start: 0.92, duration: 0.58, verseIndex: 0 },
  { freq: 261.63, start: 1.54, duration: 0.58, verseIndex: 0 },
  { freq: 349.23, start: 2.16, duration: 0.58, verseIndex: 0 },
  { freq: 329.63, start: 2.78, duration: 1.1, verseIndex: 0 },

  // Verse 1: "سنة حلوة يا جميل..." (C4 C4 D4 C4 G4 F4)
  { freq: 261.63, start: 4.1, duration: 0.38, verseIndex: 1 },
  { freq: 261.63, start: 4.52, duration: 0.26, verseIndex: 1 },
  { freq: 293.66, start: 4.82, duration: 0.58, verseIndex: 1 },
  { freq: 261.63, start: 5.44, duration: 0.58, verseIndex: 1 },
  { freq: 392.0, start: 6.06, duration: 0.58, verseIndex: 1 },
  { freq: 349.23, start: 6.68, duration: 1.1, verseIndex: 1 },

  // Verse 2: "سنة حلوة يا أغلى ياسمين..." (C4 C4 C5 A4 F4 E4 D4)
  { freq: 261.63, start: 8.0, duration: 0.38, verseIndex: 2 },
  { freq: 261.63, start: 8.42, duration: 0.26, verseIndex: 2 },
  { freq: 523.25, start: 8.72, duration: 0.58, verseIndex: 2 },
  { freq: 440.0, start: 9.34, duration: 0.58, verseIndex: 2 },
  { freq: 349.23, start: 9.96, duration: 0.55, verseIndex: 2 },
  { freq: 329.63, start: 10.55, duration: 0.55, verseIndex: 2 },
  { freq: 293.66, start: 11.14, duration: 1.0, verseIndex: 2 },

  // Verse 3: "سنة حلوة يا ياسمين ✨" (Bb4 Bb4 A4 F4 G4 F4)
  { freq: 466.16, start: 12.35, duration: 0.38, verseIndex: 3 },
  { freq: 466.16, start: 12.77, duration: 0.26, verseIndex: 3 },
  { freq: 440.0, start: 13.07, duration: 0.58, verseIndex: 3 },
  { freq: 349.23, start: 13.69, duration: 0.58, verseIndex: 3 },
  { freq: 392.0, start: 14.31, duration: 0.58, verseIndex: 3 },
  { freq: 349.23, start: 14.93, duration: 1.8, verseIndex: 3 },
];

export const BIRTHDAY_SONG_TOTAL_DURATION = 17.5;

export function getBirthdaySongVerses(recipientName: string): string[] {
  return [
    'سنةٌ حلوةٌ يا جميل... ✨',
    'سنةٌ حلوةٌ يا جميل... 🌙',
    `سنةٌ حلوةٌ يا أغلى ${recipientName}... 🌸`,
    `عيد ميلاد سعيد يا ${recipientName} 🤍🎂`,
  ];
}
