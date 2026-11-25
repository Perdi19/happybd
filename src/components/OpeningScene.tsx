import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { SURPRISE_CONFIG } from '../config/surpriseConfig';
import { audioEngine } from '../utils/audioEngine';

interface OpeningSceneProps {
  onDiscover: () => void;
  isMusicPlaying: boolean;
  onToggleMusic: () => void;
}

export const OpeningScene: React.FC<OpeningSceneProps> = ({
  onDiscover,
  isMusicPlaying,
  onToggleMusic,
}) => {
  const [isDissolving, setIsDissolving] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleStart = () => {
    if (isDissolving) return;
    setIsDissolving(true);
    // Play sweet gentle chime tone
    audioEngine.playSparkleNote(659.25, 1.2, 0.2);
    if (!isMusicPlaying) {
      onToggleMusic();
    }
    timerRef.current = setTimeout(() => {
      onDiscover();
    }, 900);
  };

  return (
    <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12 text-center">
      {/* Soft Moon glow halo behind card */}
      <div className="pointer-events-none absolute h-96 w-96 rounded-full bg-indigo-500/10 blur-[100px]" />
      <div className="pointer-events-none absolute h-72 w-72 rounded-full bg-amber-200/10 blur-[90px]" />

      <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.96 }}
        animate={
          isDissolving
            ? { opacity: 0, scale: 1.08, filter: 'blur(12px)', y: -20 }
            : { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }
        }
        transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        className="relative max-w-xl w-full p-8 sm:p-12 rounded-3xl bg-slate-950/45 backdrop-blur-xl border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
      >
        {/* Decorative corner accents */}
        <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-amber-300/40 rounded-tl" />
        <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-amber-300/40 rounded-tr" />
        <div className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-amber-300/40 rounded-bl" />
        <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-amber-300/40 rounded-br" />

        {/* Delicate botanical icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-amber-300/10 border border-amber-200/30 text-amber-200 shadow-[0_0_20px_rgba(253,224,71,0.2)]"
        >
          <Sparkles className="h-6 w-6 text-amber-200 animate-pulse" />
        </motion.div>

        {/* Message */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.8 }}
          className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal tracking-wide text-slate-100 leading-snug"
        >
          {SURPRISE_CONFIG.openingTitle}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.8 }}
          className="mt-4 text-sm sm:text-base text-slate-300 font-light tracking-wide max-w-md mx-auto"
        >
          {SURPRISE_CONFIG.openingSubtitle}
        </motion.p>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.8 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={handleStart}
            disabled={isDissolving}
            className="group relative inline-flex items-center gap-3 px-8 py-3.5 rounded-full font-serif text-xl tracking-wide text-slate-900 bg-gradient-to-r from-amber-100 via-amber-200 to-amber-100 font-medium shadow-[0_0_25px_rgba(253,224,71,0.4)] hover:shadow-[0_0_35px_rgba(253,224,71,0.7)] transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span>{SURPRISE_CONFIG.openingButtonText}</span>
            <span className="text-amber-700 transition-transform duration-300 group-hover:-translate-x-1">
              ←
            </span>
          </button>
        </motion.div>

        {/* Subtle note about music */}
        <p className="mt-5 text-xs text-slate-400/80 font-light tracking-wide">
          ♫ يعزف لحناً هادئاً · يُفعّل الصوت عند التفاعل
        </p>
      </motion.div>
    </div>
  );
};
