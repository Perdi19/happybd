import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, Sparkles, RotateCcw, Check } from 'lucide-react';
import { SURPRISE_CONFIG } from '../config/surpriseConfig';
import { LetterTile, createScrambledTiles, isWordComplete } from '../utils/puzzleLogic';
import { audioEngine } from '../utils/audioEngine';

interface RiddleSceneProps {
  onSolved: () => void;
}

export const RiddleScene: React.FC<RiddleSceneProps> = ({ onSolved }) => {
  const targetWord = SURPRISE_CONFIG.puzzleWord;
  const wordLength = targetWord.length;

  const [poolTiles, setPoolTiles] = useState<LetterTile[]>([]);
  const [slots, setSlots] = useState<(LetterTile | null)[]>(
    Array(wordLength).fill(null)
  );
  const [showHint, setShowHint] = useState(false);
  const [isSolved, setIsSolved] = useState(false);
  const [draggedTileId, setDraggedTileId] = useState<string | null>(null);

  // Initialize scrambled tiles
  useEffect(() => {
    resetPuzzle();
  }, [targetWord]);

  const resetPuzzle = () => {
    const scrambled = createScrambledTiles(targetWord);
    setPoolTiles(scrambled);
    setSlots(Array(wordLength).fill(null));
    setIsSolved(false);
  };

  const onSolvedRef = useRef(onSolved);
  onSolvedRef.current = onSolved;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Check victory
  useEffect(() => {
    if (isWordComplete(slots, targetWord) && !isSolved) {
      setIsSolved(true);
      audioEngine.playMagicalChime();
      timerRef.current = setTimeout(() => {
        onSolvedRef.current();
      }, 2200);
    }
  }, [slots, targetWord, isSolved]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Handle clicking a tile in the pool to place in first open slot
  const handleTileClick = (tile: LetterTile) => {
    if (isSolved) return;
    setSlots((prev) => {
      const nextEmptySlotIndex = prev.findIndex((s) => s === null);
      if (nextEmptySlotIndex === -1) return prev;

      const next = [...prev];
      next[nextEmptySlotIndex] = tile;
      setPoolTiles((currentPool) => currentPool.filter((t) => t.id !== tile.id));
      audioEngine.playTileClick(1 + nextEmptySlotIndex * 0.1);
      return next;
    });
  };

  // Handle clicking a placed slot to return tile to pool
  const handleSlotClick = (slotIndex: number) => {
    if (isSolved) return;
    setSlots((prev) => {
      const tile = prev[slotIndex];
      if (!tile) return prev;

      const next = [...prev];
      next[slotIndex] = null;
      setPoolTiles((currentPool) => [...currentPool, tile]);
      audioEngine.playTileClick(0.9);
      return next;
    });
  };

  // Drag and Drop handlers
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

  // Instant solve shortcut if she desires
  const handleInstantReveal = () => {
    const solved: LetterTile[] = targetWord.split('').map((char, i) => ({
      id: `tile-revealed-${i}`,
      char,
      originalIndex: i,
    }));
    setPoolTiles([]);
    setSlots(solved);
  };

  return (
    <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-16 text-center">
      {/* Background glow circle */}
      <div className="pointer-events-none absolute h-96 w-96 rounded-full bg-amber-500/10 blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-2xl px-6 py-10 rounded-3xl bg-slate-950/60 backdrop-blur-xl border border-white/10 shadow-2xl relative"
      >
        <div className="mb-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-300/30 text-amber-200 text-xs tracking-wide">
          <Sparkles className="w-3.5 h-3.5" />
          <span>الفصل الثاني · لغز القلب</span>
        </div>

        <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-slate-100 font-normal tracking-wide mt-3 mb-2">
          قبل أن تتفتّح أمنية ميلادكِ، حلّي هذا اللغز الصغير...
        </h2>

        <p className="text-xs sm:text-sm text-slate-300 font-light mb-8 max-w-md mx-auto">
          اضغطي على الحروف المضيئة أو اسحبيها إلى الأماكن المخصّصة لتكتشفي الكلمة السرية.
        </p>

        {/* TARGET SLOTS */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3.5 mb-8">
          {slots.map((tile, idx) => (
            <div
              key={`slot-${idx}`}
              onDragOver={handleDragOver}
              onDrop={() => handleDropOnSlot(idx)}
              onClick={() => handleSlotClick(idx)}
              className={`relative flex items-center justify-center w-12 h-14 sm:w-14 sm:h-16 md:w-16 md:h-20 rounded-2xl border-2 transition-all duration-300 ${
                isSolved
                  ? 'border-amber-300 bg-amber-400/25 shadow-[0_0_20px_rgba(253,224,71,0.6)] text-amber-100'
                  : tile
                  ? 'border-amber-400/60 bg-amber-300/10 text-slate-100 cursor-pointer shadow-[0_0_15px_rgba(253,224,71,0.25)] hover:border-amber-300'
                  : 'border-dashed border-white/20 bg-slate-900/40 text-slate-600'
              }`}
            >
              <span className="font-serif text-2xl sm:text-3xl md:text-4xl font-semibold select-none">
                {tile ? tile.char : ''}
              </span>
              {!tile && !isSolved && (
                <span className="absolute bottom-1.5 text-[10px] text-slate-500">
                  {idx + 1}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* SCATTERED TILE POOL */}
        <div className="min-h-[72px] flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 p-4 rounded-2xl bg-slate-900/30 border border-white/5 mb-6">
          <AnimatePresence>
            {poolTiles.map((tile) => (
              <motion.button
                key={tile.id}
                layout
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                whileHover={{ scale: 1.08, y: -3 }}
                whileTap={{ scale: 0.95 }}
                draggable
                onDragStart={() => handleDragStart(tile.id)}
                onClick={() => handleTileClick(tile)}
                className="flex items-center justify-center w-11 h-13 sm:w-13 sm:h-15 md:w-14 md:h-16 rounded-xl bg-gradient-to-b from-slate-800 to-slate-900 border border-amber-200/40 text-amber-100 font-serif text-2xl sm:text-3xl font-medium shadow-[0_4px_15px_rgba(0,0,0,0.5)] hover:border-amber-300 hover:shadow-[0_0_20px_rgba(253,224,71,0.35)] cursor-pointer select-none"
                aria-label={`بطاقة حرف ${tile.char}`}
              >
                {tile.char}
              </motion.button>
            ))}
          </AnimatePresence>
          {poolTiles.length === 0 && !isSolved && (
            <span className="text-xs text-slate-400">
              تم وضع جميع الحروف! اضغطي على أي خانة أعلاه إذا أردتِ التعديل.
            </span>
          )}
        </div>

        {/* SUCCESS MESSAGE */}
        <AnimatePresence>
          {isSolved && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 rounded-2xl bg-amber-400/15 border border-amber-300/40 shadow-[0_0_25px_rgba(253,224,71,0.3)] flex flex-col items-center gap-2"
            >
              <div className="flex items-center gap-2 text-amber-200 font-serif text-lg sm:text-xl">
                <Check className="w-5 h-5 text-amber-300" />
                <span>لقد اكتشفتِ السر! شاهدي سحركِ الآن وهو يتفتّح...</span>
              </div>
              <p className="text-xs text-amber-200/70">
                تُفتح أبواب الحديقة تحت ضوء القمر...
              </p>
              <button
                onClick={onSolved}
                className="mt-1 inline-flex items-center gap-2 px-5 py-2 rounded-full font-serif text-sm font-medium text-slate-950 bg-gradient-to-r from-amber-100 to-amber-200 shadow-md hover:scale-105 transition-all cursor-pointer"
              >
                <span>ادخلي إلى الحديقة الآن</span>
                <span>←</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* BOTTOM UTILITY BUTTONS */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => setShowHint((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs text-amber-200/90 bg-amber-400/10 border border-amber-300/20 hover:bg-amber-400/20 hover:border-amber-300/40 transition-colors"
            aria-expanded={showHint}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{showHint ? 'إخفاء التلميح' : 'تلميح لطيف 🌿'}</span>
          </button>

          <button
            onClick={resetPuzzle}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs text-slate-400 hover:text-slate-200 border border-white/5 hover:border-white/15 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>بعثرة الحروف</span>
          </button>

          {!isSolved && (
            <button
              onClick={handleInstantReveal}
              className="text-[11px] text-slate-400 hover:text-amber-200/80 transition-colors underline underline-offset-4"
            >
              اكشفي الكلمة
            </button>
          )}
        </div>

        {/* HINT DRAWER */}
        <AnimatePresence>
          {showHint && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 rounded-xl bg-slate-900/60 border border-amber-300/20 text-xs sm:text-sm text-amber-100/90 font-serif tracking-wide"
            >
              «{SURPRISE_CONFIG.puzzleHint}»
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
