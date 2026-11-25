import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, Sparkles, RotateCcw, Eraser, Lock, Star } from 'lucide-react';
import {
  LetterTile,
  PUZZLE_TARGET_WORD,
  PUZZLE_DECOY_LETTERS,
  PROGRESSIVE_HINTS,
  createScrambledTiles,
  evaluateAttempt,
  getUnlockedHints,
  getRemainingAttemptsForNextHint,
} from '../utils/puzzleLogic';
import { audioEngine } from '../utils/audioEngine';

interface RiddleSceneProps {
  onSolved: () => void;
}

const CELEBRATION_STARS = [
  { x: '8%', y: '14%', size: 16, delay: 0 },
  { x: '91%', y: '18%', size: 18, delay: 0.15 },
  { x: '14%', y: '78%', size: 14, delay: 0.25 },
  { x: '86%', y: '74%', size: 16, delay: 0.1 },
  { x: '24%', y: '8%', size: 12, delay: 0.3 },
  { x: '75%', y: '10%', size: 13, delay: 0.2 },
  { x: '5%', y: '48%', size: 14, delay: 0.35 },
  { x: '94%', y: '48%', size: 14, delay: 0.18 },
];

export const RiddleScene: React.FC<RiddleSceneProps> = ({ onSolved }) => {
  const targetWord = PUZZLE_TARGET_WORD;
  const wordLength = targetWord.length;

  const [poolTiles, setPoolTiles] = useState<LetterTile[]>(() =>
    createScrambledTiles(targetWord, PUZZLE_DECOY_LETTERS)
  );
  const [slots, setSlots] = useState<(LetterTile | null)[]>(() =>
    Array(wordLength).fill(null)
  );
  const [incorrectAttempts, setIncorrectAttempts] = useState<number>(0);
  const [attemptFeedback, setAttemptFeedback] = useState<'idle' | 'wrong'>('idle');
  const [showHint, setShowHint] = useState<boolean>(false);
  const [isSolved, setIsSolved] = useState<boolean>(false);
  const [draggedTileId, setDraggedTileId] = useState<string | null>(null);

  const lastEvaluatedAttemptKeyRef = useRef<string | null>(null);

  const unlockedHints = getUnlockedHints(incorrectAttempts, PROGRESSIVE_HINTS);
  const remainingForNextHint = getRemainingAttemptsForNextHint(
    incorrectAttempts,
    PROGRESSIVE_HINTS
  );

  // Evaluate slots whenever all 7 letters are placed
  useEffect(() => {
    const status = evaluateAttempt(slots, targetWord);

    if (status === 'incomplete') {
      lastEvaluatedAttemptKeyRef.current = null;
      setAttemptFeedback('idle');
      return;
    }

    if (status === 'solved') {
      if (!isSolved) {
        setIsSolved(true);
        setAttemptFeedback('idle');
        audioEngine.playMagicalChime();
      }
      return;
    }

    // Incorrect full 7-letter attempt
    const attemptKey = slots.map((t) => t?.id ?? '').join('|');
    if (lastEvaluatedAttemptKeyRef.current === attemptKey || isSolved) {
      return;
    }
    lastEvaluatedAttemptKeyRef.current = attemptKey;

    setAttemptFeedback('wrong');
    audioEngine.playTileClick(0.75);
    setIncorrectAttempts((prev) => {
      const nextCount = prev + 1;
      const newlyUnlocked = PROGRESSIVE_HINTS.some(
        (h) => h.requiredAttempts > 0 && h.requiredAttempts === nextCount
      );
      if (newlyUnlocked) {
        setShowHint(true);
      }
      return nextCount;
    });
  }, [slots, targetWord, isSolved]);

  // Clear all placed slots back into the pool without losing hint progress
  const handleClearSlots = () => {
    if (isSolved) return;
    const placed = slots.filter((t): t is LetterTile => t !== null);
    if (placed.length === 0) return;

    setSlots(Array(wordLength).fill(null));
    setPoolTiles((prev) => [...prev, ...placed]);
    setAttemptFeedback('idle');
    lastEvaluatedAttemptKeyRef.current = null;
    audioEngine.playTileClick(0.85);
  };

  // Reshuffle all 10 tiles cleanly
  const handleReshuffle = () => {
    if (isSolved) return;
    setPoolTiles(createScrambledTiles(targetWord, PUZZLE_DECOY_LETTERS));
    setSlots(Array(wordLength).fill(null));
    setAttemptFeedback('idle');
    lastEvaluatedAttemptKeyRef.current = null;
    audioEngine.playTileClick(0.95);
  };

  // Place clicked pool tile into first open slot (left-to-right)
  const handleTileClick = (tile: LetterTile) => {
    if (isSolved) return;
    const nextEmptySlotIndex = slots.findIndex((s) => s === null);
    if (nextEmptySlotIndex === -1) return;

    const nextSlots = [...slots];
    nextSlots[nextEmptySlotIndex] = tile;
    setSlots(nextSlots);
    setPoolTiles((prev) => prev.filter((t) => t.id !== tile.id));
    audioEngine.playTileClick(1 + nextEmptySlotIndex * 0.08);
  };

  // Remove placed tile from slot back into pool
  const handleSlotClick = (slotIndex: number) => {
    if (isSolved) return;
    const tile = slots[slotIndex];
    if (!tile) return;

    const nextSlots = [...slots];
    nextSlots[slotIndex] = null;
    setSlots(nextSlots);
    setPoolTiles((prev) => [...prev, tile]);
    audioEngine.playTileClick(0.9);
  };

  // Drag and drop handlers
  const handleDragStart = (tileId: string) => {
    if (isSolved) return;
    setDraggedTileId(tileId);
  };

  const handleDropOnSlot = (targetSlotIndex: number) => {
    if (isSolved || !draggedTileId) return;

    const sourceFromPool = poolTiles.find((t) => t.id === draggedTileId);
    const sourceSlotIndex = slots.findIndex((t) => t?.id === draggedTileId);

    if (sourceFromPool) {
      const existingInTarget = slots[targetSlotIndex];
      setPoolTiles((prev) => {
        const filtered = prev.filter((t) => t.id !== draggedTileId);
        return existingInTarget ? [...filtered, existingInTarget] : filtered;
      });
      setSlots((prev) => {
        const next = [...prev];
        next[targetSlotIndex] = sourceFromPool;
        return next;
      });
    } else if (sourceSlotIndex !== -1 && sourceSlotIndex !== targetSlotIndex) {
      setSlots((prev) => {
        const next = [...prev];
        const temp = next[targetSlotIndex];
        next[targetSlotIndex] = next[sourceSlotIndex];
        next[sourceSlotIndex] = temp;
        return next;
      });
    }

    audioEngine.playTileClick(1.1);
    setDraggedTileId(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="relative z-10 flex w-full flex-col items-center justify-center px-3 sm:px-4 py-4 text-center">
      {/* Ambient golden glow */}
      <motion.div
        animate={
          isSolved
            ? { scale: [1, 1.25, 1.15], opacity: [0.25, 0.55, 0.4] }
            : { scale: 1, opacity: 0.2 }
        }
        transition={{ duration: 1.4, ease: 'easeOut' }}
        className="pointer-events-none absolute h-96 w-96 rounded-full bg-amber-400/20 blur-[110px]"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className={`relative w-full max-w-2xl px-4 sm:px-7 py-7 sm:py-9 rounded-3xl bg-slate-950/65 backdrop-blur-xl transition-all duration-700 ${
          isSolved
            ? 'border border-amber-300/60 shadow-[0_0_55px_rgba(253,224,71,0.3)]'
            : 'border border-white/15 shadow-[0_25px_70px_rgba(0,0,0,0.65)]'
        }`}
      >
        {/* Decorative celebratory stars when solved */}
        <AnimatePresence>
          {isSolved && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl"
            >
              {CELEBRATION_STARS.map((star, idx) => (
                <motion.div
                  key={`celeb-star-${idx}`}
                  initial={{ opacity: 0, scale: 0, rotate: -30 }}
                  animate={{
                    opacity: [0, 1, 0.65, 1],
                    scale: [0, 1.25, 0.95, 1.15],
                    rotate: [0, 20, -10, 15],
                    y: [0, -6, 2, -4],
                  }}
                  transition={{
                    duration: 2.6,
                    delay: star.delay,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    ease: 'easeInOut',
                  }}
                  style={{ left: star.x, top: star.y }}
                  className="absolute text-amber-200 drop-shadow-[0_0_10px_rgba(253,224,71,0.85)]"
                >
                  {idx % 2 === 0 ? (
                    <Star
                      style={{ width: star.size, height: star.size }}
                      className="fill-amber-200/75 text-amber-100"
                    />
                  ) : (
                    <Sparkles
                      style={{ width: star.size, height: star.size }}
                      className="text-amber-300"
                    />
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Chapter badge */}
        <div className="mb-2.5 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/10 border border-amber-300/30 text-amber-200 text-xs tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
          <span>الفصل الثاني · لغز القلب</span>
        </div>

        <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-slate-100 font-normal tracking-wide mt-1 mb-2">
          قبل أن تتفتّح أمنية ميلادكِ، اكتشفي الكلمة السرية...
        </h2>

        <p className="text-xs sm:text-sm text-slate-300 font-light mb-6 max-w-md mx-auto">
          رتّبي الحروف السبعة الصحيحة من اليسار إلى اليمين لاكتشاف الاسم السري (انتبهي: بين البطاقات ٣ حروف مُضلِّلة ✨).
        </p>

        {/* TARGET 7 SLOTS (Always strictly LTR for English spelling JASMINE) */}
        <motion.div
          dir="ltr"
          data-testid="puzzle-slots"
          animate={
            attemptFeedback === 'wrong'
              ? { x: [0, -8, 8, -5, 5, 0] }
              : { x: 0 }
          }
          transition={{ duration: 0.4 }}
          className="flex flex-nowrap items-center justify-center gap-1.5 sm:gap-2.5 md:gap-3 mb-6"
        >
          {slots.map((tile, idx) => (
            <motion.button
              key={`slot-${idx}`}
              type="button"
              onDragOver={handleDragOver}
              onDrop={() => handleDropOnSlot(idx)}
              onClick={() => handleSlotClick(idx)}
              disabled={!tile || isSolved}
              animate={
                isSolved
                  ? {
                      scale: [1, 1.08, 1],
                      transition: { delay: idx * 0.07, duration: 0.6 },
                    }
                  : { scale: 1 }
              }
              aria-label={
                tile
                  ? `الخانة ${idx + 1}: حرف ${tile.char} (اضغطي للإزالة)`
                  : `الخانة ${idx + 1} فارغة`
              }
              className={`relative flex items-center justify-center w-9 h-12 sm:w-12 sm:h-15 md:w-14 md:h-16 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80 ${
                isSolved
                  ? 'border-amber-300 bg-gradient-to-b from-amber-300/30 to-amber-500/20 shadow-[0_0_24px_rgba(253,224,71,0.65)] text-amber-50 cursor-default'
                  : attemptFeedback === 'wrong'
                  ? 'border-rose-300/60 bg-rose-500/10 text-rose-100 cursor-pointer shadow-[0_0_15px_rgba(244,63,94,0.25)] hover:border-amber-300'
                  : tile
                  ? 'border-amber-300/70 bg-amber-300/15 text-amber-50 cursor-pointer shadow-[0_0_16px_rgba(253,224,71,0.25)] hover:border-amber-200 hover:bg-amber-300/20'
                  : 'border-dashed border-white/20 bg-slate-900/45 text-slate-600'
              }`}
            >
              <span className="font-serif text-xl sm:text-2xl md:text-3xl font-semibold tracking-wider select-none">
                {tile ? tile.char : ''}
              </span>
              {!tile && !isSolved && (
                <span className="absolute bottom-1 text-[9px] sm:text-[10px] text-slate-500 font-mono">
                  {idx + 1}
                </span>
              )}
            </motion.button>
          ))}
        </motion.div>

        {/* GENTLE INCORRECT FEEDBACK BANNER */}
        <AnimatePresence>
          {attemptFeedback === 'wrong' && !isSolved && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              role="status"
              className="mb-4 px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-300/25 text-xs sm:text-sm text-rose-100/90"
            >
              ليست هذه الكلمة السرية بعد... اضغطي على أي حرف لإزالته وجرّبي ترتيباً آخر ✨
              {remainingForNextHint !== null && (
                <span className="block text-[11px] text-amber-200/80 mt-0.5">
                  (متبقي {remainingForNextHint} {remainingForNextHint === 1 ? 'محاولة' : 'محاولات'} للتلميح الإضافي · المحاولات: {incorrectAttempts})
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 10 SHUFFLED LETTER TILES OR CELEBRATION CARD */}
        <AnimatePresence mode="wait">
          {!isSolved ? (
            <motion.div
              key="puzzle-interactive-area"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.35 }}
            >
              {/* SCATTERED 10-TILE POOL (LTR 5+5 balanced layout) */}
              <div
                dir="ltr"
                data-testid="puzzle-pool"
                className="min-h-[76px] max-w-[360px] mx-auto flex flex-wrap items-center justify-center gap-2 sm:gap-3 p-3.5 sm:p-4 rounded-2xl bg-slate-900/40 border border-white/10 mb-5 shadow-inner"
              >
                <AnimatePresence>
                  {poolTiles.map((tile) => (
                    <motion.button
                      key={tile.id}
                      type="button"
                      layout
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.65, opacity: 0 }}
                      whileHover={{ scale: 1.09, y: -3 }}
                      whileTap={{ scale: 0.94 }}
                      draggable
                      onDragStart={() => handleDragStart(tile.id)}
                      onClick={() => handleTileClick(tile)}
                      className="flex items-center justify-center w-11 h-12 sm:w-12 sm:h-14 md:w-13 md:h-14 rounded-xl bg-gradient-to-b from-slate-800/95 to-slate-950 border border-amber-200/40 text-amber-100 font-serif text-xl sm:text-2xl font-semibold shadow-[0_6px_16px_rgba(0,0,0,0.55)] hover:border-amber-300 hover:text-amber-50 hover:shadow-[0_0_20px_rgba(253,224,71,0.4)] transition-colors cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80"
                      aria-label={`بطاقة حرف ${tile.char}`}
                    >
                      {tile.char}
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>

              {/* UTILITY CONTROLS */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setShowHint((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs text-amber-100 bg-amber-400/15 border border-amber-300/30 hover:bg-amber-400/25 hover:border-amber-300/50 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/70"
                  aria-expanded={showHint}
                >
                  <HelpCircle className="w-3.5 h-3.5 text-amber-300" />
                  <span>
                    {showHint
                      ? 'إخفاء التلميحات'
                      : `التلميحات (${unlockedHints.length}/${PROGRESSIVE_HINTS.length}) 🌿`}
                  </span>
                </button>

                {slots.some((s) => s !== null) && (
                  <button
                    type="button"
                    onClick={handleClearSlots}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs text-slate-300 hover:text-white border border-white/10 hover:border-white/25 transition-colors cursor-pointer"
                  >
                    <Eraser className="w-3.5 h-3.5 text-amber-200/80" />
                    <span>تفريغ الخانات</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleReshuffle}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs text-slate-400 hover:text-slate-200 border border-white/10 hover:border-white/20 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>بعثرة الحروف</span>
                </button>
              </div>

              {/* PROGRESSIVE HINT DRAWER */}
              <AnimatePresence>
                {showHint && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 overflow-hidden"
                  >
                    <div className="p-4 rounded-2xl bg-slate-900/75 border border-amber-300/25 text-right flex flex-col gap-2.5">
                      {unlockedHints.map((hint) => (
                        <motion.div
                          key={`hint-${hint.level}`}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-start gap-2 text-xs sm:text-sm text-amber-100/95 font-serif leading-relaxed"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0 mt-1" />
                          <div>
                            <span className="text-amber-300 font-semibold ml-1.5">
                              {hint.title}:
                            </span>
                            <span>{hint.text}</span>
                          </div>
                        </motion.div>
                      ))}

                      {remainingForNextHint !== null && (
                        <div className="pt-2 border-t border-white/10 flex items-center gap-2 text-[11px] text-slate-400">
                          <Lock className="w-3 h-3 text-amber-300/70 shrink-0" />
                          <span>
                            تلميحٌ إضافي يُفتح تلقائياً بعد {remainingForNextHint}{' '}
                            {remainingForNextHint === 1 ? 'محاولة خاطئة' : 'محاولات خاطئة'}.
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            /* EMOTIONAL BIRTHDAY CELEBRATION STATE */
            <motion.div
              key="puzzle-celebration"
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
              className="mt-2 p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-amber-400/20 via-amber-500/10 to-slate-900/70 border border-amber-300/50 shadow-[0_0_40px_rgba(253,224,71,0.3)] flex flex-col items-center gap-3.5"
            >
              <div className="flex items-center justify-center w-11 h-11 rounded-full bg-amber-300/20 border border-amber-200/50 text-amber-200 shadow-[0_0_20px_rgba(253,224,71,0.45)]">
                <Sparkles className="w-5 h-5 text-amber-200 animate-pulse" />
              </div>

              <p
                dir="ltr"
                className="font-serif text-lg sm:text-xl md:text-2xl text-amber-50 leading-relaxed tracking-wide text-glow max-w-lg"
              >
                Well done, Jasmine! You&apos;ve discovered the secret... but the real surprise is still waiting for you. ❤️
              </p>

              <p className="text-xs sm:text-sm text-amber-200/80 font-light">
                تتفتح أبواب الحديقة الساحرة لأجلكِ الآن تحت ضوء القمر...
              </p>

              <button
                type="button"
                onClick={onSolved}
                className="mt-1 group inline-flex items-center gap-2.5 px-7 py-3 rounded-full font-serif text-base sm:text-lg font-medium text-slate-950 bg-gradient-to-r from-amber-100 via-amber-200 to-amber-100 shadow-[0_0_25px_rgba(253,224,71,0.5)] hover:shadow-[0_0_35px_rgba(253,224,71,0.8)] transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
              >
                <span>ادخلي إلى الحديقة الآن ✨</span>
                <span className="transition-transform duration-300 group-hover:-translate-x-1">
                  ←
                </span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
