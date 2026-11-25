import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Upload,
  Link2,
  Download,
  Film,
  Music,
  Trash2,
  ArrowRight,
  Volume2,
  Maximize2,
  Minimize2,
  Clapperboard,
} from 'lucide-react';
import { SURPRISE_CONFIG } from '../config/surpriseConfig';
import {
  parseVideoSource,
  formatVideoTime,
  BIRTHDAY_SONG_NOTES,
  BIRTHDAY_SONG_TOTAL_DURATION,
  getBirthdaySongVerses,
} from '../utils/videoHelpers';

interface BirthdayVideoSceneProps {
  onPauseAmbientMusic: () => void;
  onBackToLetter: () => void;
  onRestartAll: () => void;
}

const DB_NAME = 'jasmine_birthday_media';
const STORE_NAME = 'videos';
const VIDEO_KEY = 'custom_finale_video';

function openVideoDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE_NAME)) {
        req.result.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveVideoBlob(blob: Blob): Promise<void> {
  try {
    const db = await openVideoDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(blob, VIDEO_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    // Ignore storage quota or private browsing restrictions
  }
}

async function loadVideoBlob(): Promise<Blob | null> {
  try {
    const db = await openVideoDb();
    const result = await new Promise<Blob | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(VIDEO_KEY);
      req.onsuccess = () => resolve((req.result as Blob) || null);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return result;
  } catch {
    return null;
  }
}

async function clearVideoBlob(): Promise<void> {
  try {
    const db = await openVideoDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(VIDEO_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    // Ignore
  }
}

interface StarDot {
  x: number;
  y: number;
  r: number;
  phase: number;
}

export const BirthdayVideoScene: React.FC<BirthdayVideoSceneProps> = ({
  onPauseAmbientMusic,
  onBackToLetter,
  onRestartAll,
}) => {
  const configuredSource = parseVideoSource(SURPRISE_CONFIG.birthdayVideoUrl);

  const [customUrlInput, setCustomUrlInput] = useState<string>('');
  const [customSourceUrl, setCustomSourceUrl] = useState<string>(
    configuredSource.type !== 'none' ? SURPRISE_CONFIG.birthdayVideoUrl : ''
  );
  const [uploadedBlobUrl, setUploadedBlobUrl] = useState<string | null>(null);
  const [showUploadDrawer, setShowUploadDrawer] = useState<boolean>(false);
  const [urlError, setUrlError] = useState<string>('');
  const [autoplayBlockedMuted, setAutoplayBlockedMuted] = useState<boolean>(false);
  const [autoplayBlockedPlay, setAutoplayBlockedPlay] = useState<boolean>(false);
  const [videoLoadError, setVideoLoadError] = useState<boolean>(false);
  const [isNativeFullscreen, setIsNativeFullscreen] = useState<boolean>(false);
  const [isTheaterExpanded, setIsTheaterExpanded] = useState<boolean>(false);

  // Built-in musical video state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const onPauseAmbientMusicRef = useRef(onPauseAmbientMusic);
  onPauseAmbientMusicRef.current = onPauseAmbientMusic;
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const activeOscsRef = useRef<OscillatorNode[]>([]);
  const playStartWallRef = useRef<number>(0);
  const offsetTimeRef = useRef<number>(0);
  const starsRef = useRef<StarDot[]>(
    Array.from({ length: 70 }, (_, i) => ({
      x: ((i * 137.5) % 800),
      y: ((i * 89.3) % 450),
      r: (i % 3) * 0.7 + 0.7,
      phase: i * 0.6,
    }))
  );

  const verses = getBirthdaySongVerses(SURPRISE_CONFIG.recipientName);

  // Load any previously uploaded video from IndexedDB
  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;
    loadVideoBlob().then((blob) => {
      if (active && blob) {
        objectUrl = URL.createObjectURL(blob);
        setUploadedBlobUrl(objectUrl);
      }
    });
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, []);

  // Determine active external/uploaded source
  const activeVideoParsed = uploadedBlobUrl
    ? { type: 'direct' as const, src: uploadedBlobUrl }
    : parseVideoSource(customSourceUrl);

  const isCustomVideoActive = activeVideoParsed.type !== 'none';
  const isExpandedView = isNativeFullscreen || isTheaterExpanded;

  // Sync fullscreen state across standard, webkit, and iOS video fullscreen events
  useEffect(() => {
    const syncFullscreen = () => {
      const doc = document as Document & { webkitFullscreenElement?: Element | null };
      const fsActive = Boolean(document.fullscreenElement || doc.webkitFullscreenElement);
      setIsNativeFullscreen(fsActive);
      if (!fsActive) {
        setIsTheaterExpanded(false);
      }
    };

    const videoEl = videoRef.current;
    const handleWebkitBegin = () => setIsNativeFullscreen(true);
    const handleWebkitEnd = () => setIsNativeFullscreen(false);

    document.addEventListener('fullscreenchange', syncFullscreen);
    document.addEventListener('webkitfullscreenchange', syncFullscreen);
    videoEl?.addEventListener('webkitbeginfullscreen', handleWebkitBegin);
    videoEl?.addEventListener('webkitendfullscreen', handleWebkitEnd);

    return () => {
      document.removeEventListener('fullscreenchange', syncFullscreen);
      document.removeEventListener('webkitfullscreenchange', syncFullscreen);
      videoEl?.removeEventListener('webkitbeginfullscreen', handleWebkitBegin);
      videoEl?.removeEventListener('webkitendfullscreen', handleWebkitEnd);
    };
  }, [activeVideoParsed.type, activeVideoParsed.src]);

  // Allow Escape key to close the theater-mode fallback
  useEffect(() => {
    if (!isTheaterExpanded) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsTheaterExpanded(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTheaterExpanded]);

  const handleEnterFullscreen = async () => {
    const videoEl = videoRef.current as (HTMLVideoElement & {
      webkitEnterFullscreen?: () => void;
    }) | null;

    if (activeVideoParsed.type === 'direct' && videoEl) {
      if (videoEl.muted) {
        videoEl.muted = false;
        setAutoplayBlockedMuted(false);
        onPauseAmbientMusicRef.current();
      }
      if (videoEl.paused) {
        try {
          await videoEl.play();
          setAutoplayBlockedPlay(false);
          onPauseAmbientMusicRef.current();
        } catch {
          // Continue to fullscreen even if browser blocks play
        }
      }
    }

    const container = playerContainerRef.current as (HTMLDivElement & {
      webkitRequestFullscreen?: () => Promise<void> | void;
    }) | null;

    try {
      if (container?.requestFullscreen) {
        await container.requestFullscreen();
        return;
      }
      if (container?.webkitRequestFullscreen) {
        await container.webkitRequestFullscreen();
        return;
      }
      if (videoEl?.webkitEnterFullscreen) {
        videoEl.webkitEnterFullscreen();
        return;
      }
    } catch {
      // Fall back cleanly to expanded in-page theater view
    }

    setIsTheaterExpanded(true);
  };

  const handleExitFullscreen = async () => {
    const doc = document as Document & {
      webkitFullscreenElement?: Element | null;
      webkitExitFullscreen?: () => Promise<void> | void;
    };
    const videoEl = videoRef.current as (HTMLVideoElement & {
      webkitExitFullscreen?: () => void;
    }) | null;

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (doc.webkitFullscreenElement && doc.webkitExitFullscreen) {
        await doc.webkitExitFullscreen();
      } else if (videoEl?.webkitExitFullscreen) {
        videoEl.webkitExitFullscreen();
      }
    } catch {
      // Ignore exit errors
    } finally {
      setIsNativeFullscreen(false);
      setIsTheaterExpanded(false);
    }
  };

  // Autoplay direct video with sound; gracefully fall back to muted autoplay or manual play if blocked
  useEffect(() => {
    setAutoplayBlockedMuted(false);
    setAutoplayBlockedPlay(false);
    setVideoLoadError(false);

    if (activeVideoParsed.type !== 'direct' || !activeVideoParsed.src) {
      return;
    }

    const videoEl = videoRef.current;
    if (!videoEl) return;

    let cancelled = false;

    const attemptAutoplay = async () => {
      try {
        videoEl.muted = false;
        await videoEl.play();
        if (!cancelled) {
          setAutoplayBlockedMuted(false);
          setAutoplayBlockedPlay(false);
          onPauseAmbientMusicRef.current();
        }
      } catch (err) {
        if (cancelled || (err instanceof DOMException && err.name === 'AbortError')) {
          return;
        }
        try {
          videoEl.muted = true;
          await videoEl.play();
          if (!cancelled) {
            setAutoplayBlockedMuted(true);
            setAutoplayBlockedPlay(false);
          }
        } catch (mutedErr) {
          if (cancelled || (mutedErr instanceof DOMException && mutedErr.name === 'AbortError')) {
            return;
          }
          if (!cancelled) {
            setAutoplayBlockedMuted(false);
            setAutoplayBlockedPlay(true);
          }
        }
      }
    };

    attemptAutoplay();

    return () => {
      cancelled = true;
      videoEl.pause();
    };
  }, [activeVideoParsed.type, activeVideoParsed.src]);

  const playUnmutedFromUserGesture = async (onlyPlayIfPaused: boolean) => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    videoEl.muted = false;
    onPauseAmbientMusicRef.current();
    setAutoplayBlockedMuted(false);
    if (!onlyPlayIfPaused || videoEl.paused) {
      try {
        await videoEl.play();
        setAutoplayBlockedPlay(false);
      } catch {
        setAutoplayBlockedPlay(true);
      }
    }
  };

  const stopAudioNodes = useCallback(() => {
    activeOscsRef.current.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // Already stopped
      }
    });
    activeOscsRef.current = [];
  }, []);

  const scheduleSongFrom = useCallback(
    (startOffset: number, streamDest?: MediaStreamAudioDestinationNode) => {
      stopAudioNodes();
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const master = ctx.createGain();
      master.gain.value = 0.55;
      master.connect(ctx.destination);
      if (streamDest) {
        master.connect(streamDest);
      }

      BIRTHDAY_SONG_NOTES.forEach((note) => {
        if (note.start + note.duration <= startOffset) return;
        const delay = Math.max(0, note.start - startOffset);
        const noteStart = now + delay;
        const dur = note.duration;

        // Warm piano fundamental + gentle bell harmonic
        const osc1 = ctx.createOscillator();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(note.freq, noteStart);

        const osc2 = ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(note.freq * 2, noteStart);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1900, noteStart);
        filter.frequency.exponentialRampToValueAtTime(450, noteStart + dur);

        const env = ctx.createGain();
        env.gain.setValueAtTime(0.0001, noteStart);
        env.gain.linearRampToValueAtTime(0.32, noteStart + 0.03);
        env.gain.exponentialRampToValueAtTime(0.0001, noteStart + dur + 0.25);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(env);
        env.connect(master);

        osc1.start(noteStart);
        osc2.start(noteStart);
        osc1.stop(noteStart + dur + 0.3);
        osc2.stop(noteStart + dur + 0.3);

        activeOscsRef.current.push(osc1, osc2);
      });
    },
    [stopAudioNodes]
  );

  // Draw a single animated frame of the personalized Birthday Song video
  const drawFrame = useCallback(
    (t: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const W = 800;
      const H = 450;

      // 1. Deep starry night gradient
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#070b19');
      bg.addColorStop(0.55, '#0d1530');
      bg.addColorStop(1, '#120f24');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Soft golden moon aura
      const aura = ctx.createRadialGradient(W * 0.5, H * 0.38, 10, W * 0.5, H * 0.38, 220);
      aura.addColorStop(0, 'rgba(253, 224, 71, 0.22)');
      aura.addColorStop(0.5, 'rgba(251, 191, 36, 0.06)');
      aura.addColorStop(1, 'transparent');
      ctx.fillStyle = aura;
      ctx.fillRect(0, 0, W, H);

      // 2. Twinkling stars
      starsRef.current.forEach((s) => {
        const alpha = 0.3 + 0.6 * (0.5 + 0.5 * Math.sin(t * 2.2 + s.phase));
        ctx.fillStyle = `rgba(254, 249, 195, ${alpha})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Rising golden sparkles
      for (let i = 0; i < 18; i++) {
        const px = ((i * 97 + Math.sin(t + i) * 18) % W + W) % W;
        const py = H - (((t * 32 + i * 35) % (H + 40)) - 20);
        ctx.fillStyle = `rgba(253, 224, 71, ${0.45 + 0.3 * Math.sin(t * 3 + i)})`;
        ctx.beginPath();
        ctx.arc(px, py, 1.8 + (i % 2), 0, Math.PI * 2);
        ctx.fill();
      }

      // 4. Glowing blooming jasmine emblem at top-center
      ctx.save();
      ctx.translate(W / 2, 118);
      ctx.rotate(Math.sin(t * 0.7) * 0.08);
      const pulse = 1 + Math.sin(t * 2.4) * 0.05;
      ctx.scale(pulse, pulse);

      for (let p = 0; p < 8; p++) {
        ctx.save();
        ctx.rotate((p * Math.PI) / 4);
        const grad = ctx.createLinearGradient(0, 0, 0, -48);
        grad.addColorStop(0, '#fef08a');
        grad.addColorStop(0.45, '#ffffff');
        grad.addColorStop(1, '#e2e8f0');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-11, -18, -12, -36, 0, -48);
        ctx.bezierCurveTo(12, -36, 11, -18, 0, 0);
        ctx.fill();
        ctx.restore();
      }
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.arc(0, 0, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef9c3';
      ctx.beginPath();
      ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 5. Title calligraphy
      ctx.save();
      ctx.textAlign = 'center';
      ctx.direction = 'rtl';
      ctx.shadowColor = 'rgba(253, 224, 71, 0.55)';
      ctx.shadowBlur = 18;
      ctx.fillStyle = '#fef08a';
      ctx.font = "bold 40px 'Aref Ruqaa', 'Amiri', serif";
      ctx.fillText(`عيد ميلاد سعيد يا ${SURPRISE_CONFIG.recipientName}`, W / 2, 225);
      ctx.restore();

      // 6. Active synchronized song lyric
      let activeVerseIndex = 0;
      for (const n of BIRTHDAY_SONG_NOTES) {
        if (t >= n.start) {
          activeVerseIndex = n.verseIndex;
        }
      }
      const lyric = verses[activeVerseIndex] || verses[0];

      ctx.save();
      ctx.textAlign = 'center';
      ctx.direction = 'rtl';
      ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
      ctx.strokeStyle = 'rgba(253, 224, 71, 0.35)';
      ctx.lineWidth = 1.5;
      const boxW = 540;
      const boxH = 66;
      const boxX = (W - boxW) / 2;
      const boxY = 272;
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, boxW, boxH, 33);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#f8fafc';
      ctx.font = "600 28px 'Amiri', 'Tajawal', serif";
      ctx.fillText(lyric, W / 2, boxY + 43);
      ctx.restore();

      // 7. Subtle musical equalizer bars at bottom
      const barCount = 15;
      const barW = 5;
      const gap = 8;
      const startX = W / 2 - ((barCount * (barW + gap)) - gap) / 2;
      for (let b = 0; b < barCount; b++) {
        const amp = isPlaying
          ? 8 + Math.abs(Math.sin(t * 5.2 + b * 0.65)) * 18
          : 5;
        ctx.fillStyle = 'rgba(253, 224, 71, 0.55)';
        ctx.beginPath();
        ctx.roundRect(startX + b * (barW + gap), 388 - amp / 2, barW, amp, 3);
        ctx.fill();
      }
    },
    [isPlaying, verses]
  );

  // Initial static render & cleanup
  useEffect(() => {
    if (!isCustomVideoActive) {
      drawFrame(currentTime);
    }
  }, [drawFrame, currentTime, isCustomVideoActive]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      stopAudioNodes();
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    };
  }, [stopAudioNodes]);

  const stopMusicalVideo = useCallback(() => {
    setIsPlaying(false);
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    stopAudioNodes();
  }, [stopAudioNodes]);

  const startMusicalVideo = useCallback(
    (fromStart = false) => {
      onPauseAmbientMusic();
      const startFrom =
        fromStart || offsetTimeRef.current >= BIRTHDAY_SONG_TOTAL_DURATION - 0.1
          ? 0
          : offsetTimeRef.current;
      offsetTimeRef.current = startFrom;
      playStartWallRef.current = performance.now();
      setIsPlaying(true);
      scheduleSongFrom(startFrom);

      const tick = (now: number) => {
        const elapsed = startFrom + (now - playStartWallRef.current) / 1000;
        if (elapsed >= BIRTHDAY_SONG_TOTAL_DURATION) {
          offsetTimeRef.current = 0;
          setCurrentTime(BIRTHDAY_SONG_TOTAL_DURATION);
          drawFrame(BIRTHDAY_SONG_TOTAL_DURATION);
          stopMusicalVideo();
          return;
        }
        offsetTimeRef.current = elapsed;
        setCurrentTime(elapsed);
        drawFrame(elapsed);
        rafRef.current = requestAnimationFrame(tick);
      };

      rafRef.current = requestAnimationFrame(tick);
    },
    [drawFrame, onPauseAmbientMusic, scheduleSongFrom, stopMusicalVideo]
  );

  const handleTogglePlay = () => {
    if (isPlaying) {
      stopMusicalVideo();
    } else {
      startMusicalVideo(false);
    }
  };

  const handleReplayMusical = () => {
    stopMusicalVideo();
    offsetTimeRef.current = 0;
    setCurrentTime(0);
    setTimeout(() => startMusicalVideo(true), 60);
  };

  // Export animated video + synthesized birthday song to downloadable .webm
  const handleDownloadVideo = async () => {
    const canvas = canvasRef.current;
    if (!canvas || typeof MediaRecorder === 'undefined' || isExporting) return;

    stopMusicalVideo();
    onPauseAmbientMusic();
    setIsExporting(true);

    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!audioCtxRef.current && AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      const streamDest = ctx ? ctx.createMediaStreamDestination() : undefined;

      const canvasStream = canvas.captureStream(30);
      const tracks = [
        ...canvasStream.getVideoTracks(),
        ...(streamDest ? streamDest.stream.getAudioTracks() : []),
      ];
      const combined = new MediaStream(tracks);

      const recorder = new MediaRecorder(combined, {
        mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')
          ? 'video/webm;codecs=vp8,opus'
          : 'video/webm',
      });
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) chunks.push(ev.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `happy-birthday-${SURPRISE_CONFIG.recipientName}.webm`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 5000);
        setIsExporting(false);
      };

      recorder.start();
      offsetTimeRef.current = 0;
      playStartWallRef.current = performance.now();
      setIsPlaying(true);
      scheduleSongFrom(0, streamDest);

      const tickExport = (now: number) => {
        const elapsed = (now - playStartWallRef.current) / 1000;
        if (elapsed >= BIRTHDAY_SONG_TOTAL_DURATION) {
          stopMusicalVideo();
          recorder.stop();
          return;
        }
        offsetTimeRef.current = elapsed;
        setCurrentTime(elapsed);
        drawFrame(elapsed);
        rafRef.current = requestAnimationFrame(tickExport);
      };
      rafRef.current = requestAnimationFrame(tickExport);
    } catch {
      setIsExporting(false);
    }
  };

  // Handle user uploading a video file from device
  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    stopMusicalVideo();
    if (uploadedBlobUrl) {
      URL.revokeObjectURL(uploadedBlobUrl);
    }
    const url = URL.createObjectURL(file);
    setUploadedBlobUrl(url);
    setShowUploadDrawer(false);
    setUrlError('');
    await saveVideoBlob(file);
  };

  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseVideoSource(customUrlInput);
    if (parsed.type === 'none') {
      setUrlError('يرجى إدخال رابط فيديو صحيح (مثل رابط MP4 أو YouTube).');
      return;
    }
    stopMusicalVideo();
    if (uploadedBlobUrl) {
      URL.revokeObjectURL(uploadedBlobUrl);
      setUploadedBlobUrl(null);
    }
    clearVideoBlob();
    setCustomSourceUrl(customUrlInput.trim());
    setUrlError('');
    setShowUploadDrawer(false);
  };

  const handleResetToMusical = async () => {
    if (uploadedBlobUrl) {
      URL.revokeObjectURL(uploadedBlobUrl);
      setUploadedBlobUrl(null);
    }
    await clearVideoBlob();
    setCustomSourceUrl('');
    setCustomUrlInput('');
    setUrlError('');
  };

  const progressPct = Math.min(
    100,
    (currentTime / BIRTHDAY_SONG_TOTAL_DURATION) * 100
  );

  return (
    <div
      className={`relative flex w-full flex-col items-center justify-center px-4 py-2 text-center ${
        isTheaterExpanded && !isNativeFullscreen ? 'z-50' : 'z-10'
      }`}
    >
      {/* Background radial glow */}
      <div className="pointer-events-none absolute h-96 w-96 rounded-full bg-amber-400/10 blur-[120px]" />

      <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
        {/* Cinematic Intro Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center mb-2.5"
        >
          <div className="mb-2 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/10 border border-amber-300/30 text-amber-200 text-xs tracking-wide shadow-[0_0_20px_rgba(253,224,71,0.12)]">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>الفصل السابع · فيديو المفاجأة</span>
          </div>

          <div className="flex items-center justify-center gap-2.5">
            <Clapperboard className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300 drop-shadow-[0_0_10px_rgba(253,224,71,0.5)] shrink-0" />
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-amber-50 font-normal tracking-wide text-glow">
              {SURPRISE_CONFIG.birthdayVideoTitle}
            </h2>
          </div>

          <p className="mt-1 text-xs sm:text-sm text-slate-300 font-light max-w-lg">
            {SURPRISE_CONFIG.birthdayVideoSubtitle}
          </p>

          {/* Fullscreen recommendation & prominent CTA */}
          {isCustomVideoActive && (
            <div className="mt-3 flex flex-col sm:flex-row items-center justify-center gap-2.5 px-4 py-2 rounded-2xl bg-amber-400/10 border border-amber-300/25 shadow-[0_0_25px_rgba(253,224,71,0.12)]">
              <p className="text-xs sm:text-sm text-amber-100/95 font-serif flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0 animate-pulse" />
                <span>ننصحك بتكبير الشاشة لمشاهدة المفاجأة بأجمل جودة ❤️</span>
              </p>

              <button
                type="button"
                onClick={isExpandedView ? handleExitFullscreen : handleEnterFullscreen}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full font-serif text-xs sm:text-sm font-medium text-slate-950 bg-gradient-to-r from-amber-100 via-amber-200 to-amber-100 shadow-[0_0_18px_rgba(253,224,71,0.45)] hover:shadow-[0_0_26px_rgba(253,224,71,0.75)] transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
              >
                {isExpandedView ? (
                  <>
                    <Minimize2 className="w-3.5 h-3.5 text-amber-900" />
                    <span>إغلاق ملء الشاشة</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3.5 h-3.5 text-amber-900" />
                    <span>مشاهدة بملء الشاشة ✨</span>
                  </>
                )}
              </button>
            </div>
          )}
        </motion.div>

        {/* CINEMA FRAME */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          style={isTheaterExpanded && !isNativeFullscreen ? { transform: 'none' } : undefined}
          className={`relative w-full rounded-3xl bg-slate-950/75 border border-amber-300/35 shadow-[0_25px_70px_rgba(0,0,0,0.75)] p-2.5 sm:p-3.5 ${
            isTheaterExpanded && !isNativeFullscreen ? '' : 'backdrop-blur-xl'
          }`}
        >
          <div
            ref={playerContainerRef}
            data-testid="video-fullscreen-container"
            className={`cinema-fullscreen-container overflow-hidden bg-black ${
              isTheaterExpanded && !isNativeFullscreen
                ? 'fixed inset-0 z-50 w-screen h-dvh flex items-center justify-center rounded-none border-0'
                : 'relative w-full aspect-video rounded-2xl border border-white/10'
            }`}
          >
            {isCustomVideoActive ? (
              activeVideoParsed.type === 'youtube' ? (
                <div className="relative w-full h-full">
                  <iframe
                    src={activeVideoParsed.src}
                    title={SURPRISE_CONFIG.birthdayVideoTitle}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                  {isExpandedView && (
                    <button
                      type="button"
                      onClick={handleExitFullscreen}
                      aria-label="إغلاق ملء الشاشة"
                      className="absolute top-4 left-4 z-30 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-amber-100 bg-slate-950/85 hover:bg-slate-900 border border-amber-300/40 shadow-lg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                    >
                      <Minimize2 className="w-3.5 h-3.5 text-amber-300" />
                      <span>إغلاق ملء الشاشة</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="relative w-full h-full flex items-center justify-center bg-black">
                  <video
                    ref={videoRef}
                    src={activeVideoParsed.src}
                    controls
                    playsInline
                    preload="auto"
                    onPlay={() => {
                      setAutoplayBlockedPlay(false);
                      if (videoRef.current && !videoRef.current.muted) {
                        onPauseAmbientMusicRef.current();
                      }
                    }}
                    onVolumeChange={() => {
                      const el = videoRef.current;
                      if (!el) return;
                      if (!el.muted && el.volume > 0) {
                        setAutoplayBlockedMuted(false);
                        if (!el.paused) {
                          onPauseAmbientMusicRef.current();
                        }
                      }
                    }}
                    onError={() => setVideoLoadError(true)}
                    className="w-full h-full object-contain bg-black"
                  />

                  {isExpandedView && (
                    <button
                      type="button"
                      onClick={handleExitFullscreen}
                      aria-label="إغلاق ملء الشاشة"
                      className="absolute top-4 left-4 z-30 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-amber-100 bg-slate-950/85 hover:bg-slate-900 border border-amber-300/40 shadow-lg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                    >
                      <Minimize2 className="w-3.5 h-3.5 text-amber-300" />
                      <span>إغلاق ملء الشاشة</span>
                    </button>
                  )}

                  {autoplayBlockedMuted && !videoLoadError && (
                    <button
                      type="button"
                      onClick={() => playUnmutedFromUserGesture(true)}
                      className="absolute top-3 right-3 z-20 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-950 bg-amber-200/95 hover:bg-amber-100 shadow-[0_0_20px_rgba(253,224,71,0.55)] transition-all cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>تشغيل الصوت</span>
                    </button>
                  )}

                  {autoplayBlockedPlay && !videoLoadError && (
                    <button
                      type="button"
                      onClick={() => playUnmutedFromUserGesture(false)}
                      aria-label="تشغيل فيديو المفاجأة"
                      className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/35 hover:bg-slate-950/20 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-amber-100 to-amber-300 text-slate-950 shadow-[0_0_30px_rgba(253,224,71,0.65)] group-hover:scale-110 transition-transform">
                        <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-slate-950 -mr-0.5" />
                      </div>
                      <span className="mt-3 px-4 py-1.5 rounded-full bg-slate-950/75 border border-amber-300/30 text-amber-100 font-serif text-sm">
                        تشغيل فيديو المفاجأة 🎬
                      </span>
                    </button>
                  )}

                  {videoLoadError && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 bg-slate-950/85 text-center">
                      <p className="text-sm text-rose-200 font-serif mb-1">
                        تعذّر تحميل ملف الفيديو.
                      </p>
                      <p className="text-xs text-slate-400">
                        تأكّد من توفر الملف في المسار الصحيح أو جرّب رفع فيديو آخر أدناه.
                      </p>
                    </div>
                  )}
                </div>
              )
            ) : (
              <>
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={450}
                  data-testid="birthday-video-canvas"
                  className="w-full h-full block"
                />

                {/* Center overlay play button when paused at start */}
                {!isPlaying && currentTime === 0 && (
                  <button
                    type="button"
                    onClick={handleTogglePlay}
                    aria-label="تشغيل فيديو أغنية عيد الميلاد"
                    className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/30 hover:bg-slate-950/20 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-amber-100 to-amber-300 text-slate-950 shadow-[0_0_30px_rgba(253,224,71,0.65)] group-hover:scale-110 transition-transform">
                      <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-slate-950 -mr-0.5" />
                    </div>
                    <span className="mt-3 px-4 py-1.5 rounded-full bg-slate-950/75 border border-amber-300/30 text-amber-100 font-serif text-sm">
                      تشغيل فيديو أغنية عيد الميلاد 🎵
                    </span>
                  </button>
                )}
              </>
            )}
          </div>

          {/* BUILT-IN MUSICAL VIDEO CONTROLS BAR */}
          {!isCustomVideoActive && (
            <div className="mt-3 px-2 flex flex-col gap-2">
              {/* Progress bar */}
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-300 to-amber-100 transition-all duration-150"
                  style={{ width: `${progressPct}%` }}
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTogglePlay}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full font-medium text-slate-950 bg-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-3.5 h-3.5" />
                        <span>إيقاف مؤقت</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        <span>{currentTime > 0 ? 'متابعة' : 'تشغيل الأغنية'}</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleReplayMusical}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-slate-300 hover:text-white border border-white/10 hover:border-white/25 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-200" />
                    <span>إعادة</span>
                  </button>

                  <span className="text-slate-400 font-mono text-[11px] px-1">
                    {formatVideoTime(currentTime)} /{' '}
                    {formatVideoTime(BIRTHDAY_SONG_TOTAL_DURATION)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadVideo}
                  disabled={isExporting}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-amber-100 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-300/30 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5 text-amber-300" />
                  <span>
                    {isExporting ? 'جاري تجهيز الفيديو...' : 'حفظ الفيديو'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* UPLOAD / CUSTOM VIDEO SWITCHER */}
          <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center justify-center gap-2.5">
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileSelected}
              className="hidden"
              aria-label="اختيار ملف فيديو من الجهاز"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium text-amber-100 bg-slate-900/80 hover:bg-slate-800 border border-amber-300/30 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-amber-300" />
              <span>رفع فيديو من جهازك 📹</span>
            </button>

            <button
              type="button"
              onClick={() => setShowUploadDrawer((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs text-slate-300 hover:text-white border border-white/10 hover:border-white/25 transition-colors cursor-pointer"
            >
              <Link2 className="w-3.5 h-3.5 text-amber-200" />
              <span>إضافة رابط فيديو</span>
            </button>

            {isCustomVideoActive && (
              <button
                type="button"
                onClick={handleResetToMusical}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs text-rose-200 hover:text-rose-100 bg-rose-500/10 border border-rose-300/25 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>العودة للفيديو الموسيقي المخصّص</span>
              </button>
            )}
          </div>

          {/* URL INPUT DRAWER */}
          <AnimatePresence>
            {showUploadDrawer && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleApplyUrl}
                className="mt-3 overflow-hidden"
              >
                <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/10 flex flex-col gap-2">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      type="text"
                      dir="ltr"
                      value={customUrlInput}
                      onChange={(e) => setCustomUrlInput(e.target.value)}
                      placeholder="https://... (MP4 أو رابط YouTube)"
                      aria-label="رابط الفيديو"
                      className="flex-1 px-3.5 py-2 rounded-xl text-xs bg-slate-950/80 border border-white/15 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-300 text-left"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl text-xs font-medium text-slate-950 bg-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
                    >
                      عرض الفيديو
                    </button>
                  </div>
                  {urlError && (
                    <p className="text-[11px] text-rose-300 text-right">
                      {urlError}
                    </p>
                  )}
                  <p className="text-[11px] text-slate-400 text-right flex items-center gap-1.5">
                    <Film className="w-3 h-3 text-amber-300/80 shrink-0" />
                    <span>
                      ملاحظة: لحفظ الفيديو بشكلٍ دائم عند مشاركة الرابط، يمكن وضع ملف الفيديو في مجلد public وإضافة مساره في الإعدادات.
                    </span>
                  </p>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Bottom navigation back to Letter or Restart */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              stopMusicalVideo();
              onBackToLetter();
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs text-slate-300 hover:text-white border border-white/10 hover:border-white/25 transition-colors cursor-pointer"
          >
            <ArrowRight className="w-3.5 h-3.5 text-amber-200" />
            <span>العودة إلى الرسالة</span>
          </button>

          <button
            type="button"
            onClick={() => {
              stopMusicalVideo();
              onRestartAll();
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs text-amber-200/80 hover:text-amber-100 border border-amber-300/20 hover:border-amber-300/40 transition-colors cursor-pointer"
          >
            <Music className="w-3.5 h-3.5" />
            <span>إعادة الحكاية من البداية</span>
          </button>
        </div>
      </div>
    </div>
  );
};
