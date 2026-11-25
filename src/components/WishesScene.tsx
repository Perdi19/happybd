import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Heart, ArrowLeft } from 'lucide-react';
import { SURPRISE_CONFIG } from '../config/surpriseConfig';
import { audioEngine } from '../utils/audioEngine';

interface WishesSceneProps {
  onContinue: () => void;
}

interface FloatingWish {
  id: string;
  text: string;
  x: number; // percentage horizontal
  delay: number;
}

export const WishesScene: React.FC<WishesSceneProps> = ({ onContinue }) => {
  const [activeWishes, setActiveWishes] = useState<FloatingWish[]>([]);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [customWishInput, setCustomWishInput] = useState<string>('');
  const [isAddingWish, setIsAddingWish] = useState<boolean>(false);

  useEffect(() => {
    // Staggered wishes sequence
    const defaultWishes = SURPRISE_CONFIG.wishes;
    const initialWishes: FloatingWish[] = defaultWishes.map((text, i) => ({
      id: `wish-${i}`,
      text,
      x: 18 + (i % 3) * 30 + (Math.random() - 0.5) * 10,
      delay: i * 1.5 + 0.5,
    }));
    setActiveWishes(initialWishes);

    const timer = setTimeout(() => {
      setShowCelebration(true);
      audioEngine.playSparkleNote(880, 1.8, 0.15);
    }, (defaultWishes.length * 1.5 + 1.2) * 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleWishClick = (wishText: string) => {
    audioEngine.playSparkleNote(1046.5, 1.5, 0.2);
  };

  const handleAddCustomWish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customWishInput.trim()) return;

    const newWish: FloatingWish = {
      id: `custom-wish-${Date.now()}`,
      text: customWishInput.trim(),
      x: 20 + Math.random() * 60,
      delay: 0,
    };
    setActiveWishes((prev) => [...prev, newWish]);
    audioEngine.playSparkleNote(1174.66, 1.8, 0.2);
    setCustomWishInput('');
    setIsAddingWish(false);
  };

  return (
    <div className="relative z-10 flex w-full flex-col items-center justify-center gap-4 px-4 py-4 text-center overflow-hidden">
      {/* Soft celestial sky halo */}
      <div className="pointer-events-none absolute top-10 h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[130px]" />
      <div className="pointer-events-none absolute top-32 h-[350px] w-[350px] rounded-full bg-amber-200/10 blur-[100px]" />

      {/* Chapter header */}
      <div className="flex flex-col items-center">
        <div className="mb-2 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/10 border border-amber-300/30 text-amber-200 text-xs tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>الفصل الخامس · سماءٌ مليئة بالأمنيات</span>
        </div>

        <h2 className="font-serif text-2xl sm:text-3xl text-slate-100 font-normal tracking-wide max-w-xl">
          أمنياتٌ تصعد نحو هذا الكون الهادئ...
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 font-light mt-1">
          كل دعوةٍ ورجاءٍ يرتفع كغبار النجوم لأجلكِ
        </p>
      </div>

      {/* FLOATING WISH WORDS CANVAS CONTAINER */}
      <div className="relative w-full max-w-3xl h-[220px] sm:h-[250px] my-2 overflow-hidden pointer-events-auto">
        {activeWishes.map((w) => (
          <motion.div
            key={w.id}
            initial={{ opacity: 0, y: 180, scale: 0.8 }}
            animate={{
              opacity: [0, 0.95, 0.9, 0],
              y: [180, 40, -120],
              scale: [0.8, 1.05, 1, 0.9],
            }}
            transition={{
              duration: 8.5,
              delay: w.delay,
              repeat: Infinity,
              repeatDelay: 2,
              ease: 'easeInOut',
            }}
            onClick={() => handleWishClick(w.text)}
            style={{ left: `${w.x}%` }}
            className="absolute top-1/2 -translate-x-1/2 cursor-pointer group"
          >
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/50 backdrop-blur-md border border-amber-300/30 shadow-[0_0_20px_rgba(253,224,71,0.3)] hover:scale-110 transition-transform">
              <Sparkles className="w-3 h-3 text-amber-300 group-hover:rotate-45 transition-transform" />
              <span className="font-serif text-lg sm:text-xl text-amber-100 tracking-wide select-none whitespace-nowrap">
                {w.text}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CENTERPIECE CELEBRATION CARD */}
      <div className="w-full max-w-xl mx-auto mb-6">
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="p-5 sm:p-6 rounded-3xl bg-slate-950/70 backdrop-blur-xl border border-amber-300/30 shadow-[0_0_40px_rgba(0,0,0,0.6)] flex flex-col items-center gap-4"
            >
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-amber-300/10 border border-amber-200/30 text-amber-300">
                <Heart className="w-4 h-4 fill-amber-300/30 text-amber-200 animate-pulse" />
              </div>

              <p className="font-serif text-xl sm:text-2xl text-slate-100 font-normal leading-relaxed tracking-wide">
                «{SURPRISE_CONFIG.wishesCelebrationText}»
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full mt-1">
                <button
                  onClick={onContinue}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full font-serif text-base sm:text-lg font-medium text-slate-950 bg-gradient-to-r from-amber-100 via-amber-200 to-amber-100 shadow-[0_0_25px_rgba(253,224,71,0.4)] hover:shadow-[0_0_35px_rgba(253,224,71,0.7)] transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <span>انتقلي إلى الرسالة الأخيرة 💌</span>
                  <ArrowLeft className="w-4 h-4 text-amber-800" />
                </button>

                {!isAddingWish && (
                  <button
                    onClick={() => setIsAddingWish(true)}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-full text-xs text-amber-200/80 hover:text-amber-100 border border-amber-300/20 hover:border-amber-300/40 transition-colors"
                  >
                    + أرسلي أمنيتكِ الخاصة
                  </button>
                )}
              </div>

              {/* Add Custom Wish Form */}
              {isAddingWish && (
                <form
                  onSubmit={handleAddCustomWish}
                  className="w-full flex items-center gap-2 mt-2"
                >
                  <input
                    type="text"
                    value={customWishInput}
                    onChange={(e) => setCustomWishInput(e.target.value)}
                    placeholder="اكتبي دعوة أو أمنية سرية..."
                    maxLength={40}
                    className="flex-1 px-4 py-2 rounded-full text-xs sm:text-sm bg-slate-900/80 border border-white/15 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-300"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-full text-xs font-medium text-slate-950 bg-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
                  >
                    أطلقيها ✨
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingWish(false)}
                    className="px-2.5 py-2 text-xs text-slate-400 hover:text-white"
                  >
                    إلغاء
                  </button>
                </form>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
