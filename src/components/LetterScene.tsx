import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Heart, RotateCcw, Copy, Check, Edit3, Film, ArrowLeft } from 'lucide-react';
import { SURPRISE_CONFIG } from '../config/surpriseConfig';
import { audioEngine } from '../utils/audioEngine';

interface LetterSceneProps {
  onGoToVideo: () => void;
  onReplayFlower: () => void;
  onRestartAll: () => void;
}

export const LetterScene: React.FC<LetterSceneProps> = ({
  onGoToVideo,
  onReplayFlower,
  onRestartAll,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [actionsReady, setActionsReady] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [customLetter, setCustomLetter] = useState<string>(
    SURPRISE_CONFIG.letterParagraphs.join('\n\n')
  );
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const readyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (readyTimerRef.current) clearTimeout(readyTimerRef.current);
    };
  }, []);

  const handleOpenLetter = () => {
    if (isOpen) return;
    audioEngine.playLetterUnfold();
    setIsOpen(true);
    setActionsReady(false);
    readyTimerRef.current = setTimeout(() => {
      setActionsReady(true);
    }, 900);
  };

  const handleCopy = async () => {
    const fullText = [
      SURPRISE_CONFIG.letterGreeting,
      '',
      customLetter,
      '',
      SURPRISE_CONFIG.letterClosing,
    ].join('\n\n');

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(fullText);
      } else {
        throw new Error('Clipboard API unavailable');
      }
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = fullText;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2500);
      } finally {
        document.body.removeChild(textarea);
      }
    }
  };

  return (
    <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 pt-20 pb-28 text-center overflow-y-auto">
      {/* Background radial warmth */}
      <div className="pointer-events-none absolute h-96 w-96 rounded-full bg-amber-400/10 blur-[120px]" />

      <div className="w-full max-w-2xl mx-auto flex flex-col items-center my-auto">
        {/* Chapter marker */}
        <div className="mb-2.5 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/10 border border-amber-300/30 text-amber-200 text-xs tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>الفصل السادس · رسالة الحب</span>
        </div>

        <AnimatePresence mode="wait">
          {/* SEALED ENVELOPE STATE */}
          {!isOpen ? (
            <motion.div
              key="sealed-envelope"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: -15 }}
              transition={{ duration: 0.45 }}
              className="flex flex-col items-center"
            >
              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-slate-100 font-normal tracking-wide mb-2">
                {SURPRISE_CONFIG.envelopeTitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-light mb-8">
                رسالةٌ خاصة مختومة بزهرة ياسمين رقيقة
              </p>

              {/* Interactive Floating Envelope */}
              <motion.div
                animate={{ y: [-5, 6, -5] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                onClick={handleOpenLetter}
                className="group relative w-72 sm:w-80 h-48 sm:h-52 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-amber-300/40 shadow-[0_20px_50px_rgba(0,0,0,0.7)] flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-105 hover:border-amber-300"
              >
                {/* Envelope Flap Fold Lines */}
                <svg
                  viewBox="0 0 320 200"
                  className="absolute inset-0 w-full h-full pointer-events-none"
                >
                  <path
                    d="M0 0 L160 110 L320 0"
                    fill="none"
                    stroke="rgba(254, 240, 138, 0.3)"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M0 200 L120 90 M320 200 L200 90"
                    fill="none"
                    stroke="rgba(254, 240, 138, 0.2)"
                    strokeWidth="1"
                  />
                </svg>

                {/* White Jasmine Wax Seal */}
                <div className="relative z-10 flex flex-col items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-50 to-amber-200 border-2 border-amber-400/80 shadow-[0_0_25px_rgba(253,224,71,0.5)] group-hover:scale-110 transition-transform">
                  {/* Jasmine flower embossed icon */}
                  <svg viewBox="0 0 100 100" className="w-12 h-12">
                    {[0, 60, 120, 180, 240, 300].map((deg, i) => (
                      <path
                        key={i}
                        d="M50 50 C40 30, 42 12, 50 4 C58 12, 60 30, 50 50"
                        fill="#ffffff"
                        stroke="#d97706"
                        strokeWidth="1.2"
                        transform={`rotate(${deg} 50 50)`}
                      />
                    ))}
                    <circle cx="50" cy="50" r="7" fill="#eab308" />
                  </svg>
                  <span className="text-[11px] font-serif text-amber-900 font-semibold mt-0.5">
                    {SURPRISE_CONFIG.recipientName}
                  </span>
                </div>

                {/* Glow sheen */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-amber-400/0 via-amber-300/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>

              {/* Open Button */}
              <button
                type="button"
                onClick={handleOpenLetter}
                className="mt-8 group inline-flex items-center gap-3 px-8 py-3.5 rounded-full font-serif text-lg font-medium text-slate-950 bg-gradient-to-r from-amber-100 via-amber-200 to-amber-100 shadow-[0_0_25px_rgba(253,224,71,0.4)] hover:shadow-[0_0_35px_rgba(253,224,71,0.7)] transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
              >
                <span>{SURPRISE_CONFIG.envelopeButtonText}</span>
                <Heart className="w-4 h-4 fill-amber-700 text-amber-700 group-hover:scale-125 transition-transform" />
              </button>
            </motion.div>
          ) : (
            /* UNFOLDED LETTER STATE */
            <motion.div
              key="unfolded-letter"
              initial={{ opacity: 0, scale: 0.88, y: 35 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-xl p-6 sm:p-10 rounded-3xl bg-gradient-to-b from-[#fdfbf7] via-[#faf6ee] to-[#f5eedc] text-slate-900 border border-amber-300/50 shadow-[0_25px_70px_rgba(0,0,0,0.7)] my-auto"
            >
              {/* Fine gold border detail */}
              <div className="pointer-events-none absolute inset-3 rounded-2xl border border-amber-900/15" />

              {/* Top Jasmine motif */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="w-10 h-[1px] bg-amber-800/25" />
                <span className="text-amber-800/80 font-serif text-xs tracking-wide">
                  رسالة حب إلى {SURPRISE_CONFIG.recipientName}
                </span>
                <span className="w-10 h-[1px] bg-amber-800/25" />
              </div>

              {/* Greeting */}
              <h3
                className="text-2xl sm:text-3xl md:text-4xl text-amber-950 font-normal tracking-wide mb-4 text-center"
                style={{ fontFamily: "'Aref Ruqaa', 'Amiri', serif" }}
              >
                {SURPRISE_CONFIG.letterGreeting}
              </h3>

              {/* Letter Paragraphs */}
              {isEditing ? (
                <textarea
                  dir="rtl"
                  value={customLetter}
                  onChange={(e) => setCustomLetter(e.target.value)}
                  rows={8}
                  aria-label="تعديل نص الرسالة"
                  className="w-full p-4 rounded-xl font-serif text-base text-slate-800 bg-white/60 border border-amber-800/30 focus:outline-none focus:border-amber-800 text-right"
                />
              ) : (
                <div className="space-y-3 font-serif text-sm sm:text-base md:text-lg leading-relaxed text-slate-800/90 text-right">
                  {customLetter
                    .split(/\n\n+/)
                    .filter((p) => p.trim().length > 0)
                    .map((para, idx) => (
                      <motion.p
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + idx * 0.15, duration: 0.6 }}
                      >
                        {para}
                      </motion.p>
                    ))}
                </div>
              )}

              {/* Closing */}
              <div className="mt-5 pt-3 border-t border-amber-900/10 flex flex-col items-center">
                <p
                  className="text-xl sm:text-2xl md:text-3xl text-amber-950 font-medium"
                  style={{ fontFamily: "'Aref Ruqaa', 'Amiri', serif" }}
                >
                  {SURPRISE_CONFIG.letterClosing}
                </p>

                {/* Footer credit */}
                <p className="mt-2.5 text-xs font-serif text-amber-900/70 tracking-wide">
                  {SURPRISE_CONFIG.footerCredit}
                </p>
              </div>

              {/* Primary Video Finale CTA + Secondary Actions */}
              <div className="mt-5 flex flex-col items-center gap-3 pt-4 border-t border-amber-900/10">
                <button
                  type="button"
                  onClick={() => actionsReady && onGoToVideo()}
                  className="group inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full font-serif text-base font-medium text-slate-950 bg-gradient-to-r from-amber-200 via-amber-300 to-amber-200 shadow-[0_4px_20px_rgba(217,119,6,0.3)] hover:shadow-[0_6px_25px_rgba(217,119,6,0.5)] transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Film className="w-4 h-4 text-amber-900" />
                  <span>فيديو أغنية عيد الميلاد 🎬</span>
                  <ArrowLeft className="w-4 h-4 text-amber-900 transition-transform group-hover:-translate-x-1" />
                </button>

                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => actionsReady && onReplayFlower()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-amber-950 bg-amber-200/50 hover:bg-amber-300/60 border border-amber-700/25 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-900" />
                    <span>إعادة تفتح الزهرة</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-800 bg-white/70 hover:bg-white border border-slate-300 transition-colors cursor-pointer"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>تم النسخ!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>حفظ الرسالة</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsEditing((prev) => !prev)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs text-amber-900/75 hover:text-amber-950 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isEditing ? 'إنهاء التعديل' : 'تعديل الرسالة'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => actionsReady && onRestartAll()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    <span>إعادة الحكاية</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
