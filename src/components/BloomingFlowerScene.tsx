import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, RotateCcw, ArrowLeft } from 'lucide-react';
import { SURPRISE_CONFIG } from '../config/surpriseConfig';
import { audioEngine } from '../utils/audioEngine';

interface BloomingFlowerSceneProps {
  onContinue: () => void;
}

export const BloomingFlowerScene: React.FC<BloomingFlowerSceneProps> = ({
  onContinue,
}) => {
  // Growth progress from 0 to 1
  const [growth, setGrowth] = useState<number>(0);
  const [isFullyBloomed, setIsFullyBloomed] = useState<boolean>(false);
  const [sparklesBursted, setSparklesBursted] = useState<boolean>(false);
  const animationRef = useRef<number | null>(null);

  // Growth animation loop
  const startBloomAnimation = () => {
    setGrowth(0);
    setIsFullyBloomed(false);
    setSparklesBursted(false);
    audioEngine.playBloomHum();

    const startTime = performance.now();
    const duration = 6500; // 6.5s organic growth

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);

      // Smooth organic cubic easing
      const eased =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      setGrowth(eased);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(step);
      } else {
        setIsFullyBloomed(true);
        audioEngine.playMagicalChime();
        setSparklesBursted(true);
      }
    };

    animationRef.current = requestAnimationFrame(step);
  };

  useEffect(() => {
    startBloomAnimation();
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Connected Arabic calligraphic words woven along the growing branches (RTL: right-to-left)
  const vineWords = [
    { text: 'عيد', x: 562, y: 382, rot: -38, trigger: 0.40 },
    { text: 'ميلاد', x: 482, y: 472, rot: -24, trigger: 0.54 },
    { text: 'سعيد', x: 266, y: 452, rot: 26, trigger: 0.68 },
  ];

  // Stem stroke parameters (main stem length ~ 620px)
  const stemDashOffset = Math.max(0, (1 - growth) * 620);
  const leftBranchDashOffset = Math.max(0, (1 - Math.max(0, (growth - 0.25) / 0.75)) * 320);
  const rightBranchDashOffset = Math.max(0, (1 - Math.max(0, (growth - 0.28) / 0.72)) * 380);

  // Flower blossom expansion (starts opening around growth 0.7)
  const flowerOpenProgress = Math.max(0, Math.min(1, (growth - 0.65) / 0.35));

  return (
    <div className="relative z-10 flex w-full flex-col items-center justify-center px-4 py-4 text-center overflow-hidden">
      {/* Soft Ethereal Moonlight backdrop */}
      <div className="pointer-events-none absolute top-12 h-80 w-80 rounded-full bg-slate-200/10 blur-[90px]" />
      <div className="pointer-events-none absolute top-28 h-96 w-96 rounded-full bg-amber-200/10 blur-[100px]" />

      {/* Chapter Indicator */}
      <div className="mb-2 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/10 border border-amber-300/30 text-amber-200 text-xs tracking-wide">
        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
        <span>الفصل الثالث · الزهرة المتفتّحة</span>
      </div>

      <h2 className="font-serif text-2xl sm:text-3xl text-slate-100 font-normal tracking-wide max-w-xl">
        شاهدي السحر ينمو من قلب الأرض...
      </h2>

      {/* BOTANICAL SVG CANVAS */}
      <div className="relative w-full max-w-xl h-[330px] sm:h-[380px] md:h-[410px] my-1 flex items-center justify-center">
        {/* Plant breeze sway container */}
        <motion.div
          animate={
            growth > 0.4
              ? {
                  rotate: [-1.2, 1.2, -1.2],
                  transition: {
                    duration: 5.5,
                    ease: 'easeInOut',
                    repeat: Infinity,
                  },
                }
              : {}
          }
          style={{ transformOrigin: '400px 800px' }}
          className="relative w-full h-full"
        >
          <svg
            viewBox="0 0 800 860"
            className="w-full h-full overflow-visible drop-shadow-[0_0_20px_rgba(253,224,71,0.25)]"
          >
            <defs>
              {/* Botanical Stem Gradient */}
              <linearGradient id="stemGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#1e3a1e" />
                <stop offset="50%" stopColor="#2e7d32" />
                <stop offset="90%" stopColor="#4ade80" />
                <stop offset="100%" stopColor="#a7f3d0" />
              </linearGradient>

              {/* Branch Gradient */}
              <linearGradient id="branchGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2e7d32" />
                <stop offset="100%" stopColor="#86efac" />
              </linearGradient>

              {/* Leaf Gradient */}
              <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#86efac" />
                <stop offset="40%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#14532d" />
              </linearGradient>

              {/* Jasmine Petal Gradient */}
              <radialGradient id="petalGrad" cx="50%" cy="85%" r="85%">
                <stop offset="0%" stopColor="#fef08a" stopOpacity="0.95" />
                <stop offset="35%" stopColor="#ffffff" stopOpacity="0.98" />
                <stop offset="85%" stopColor="#f8fafc" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#e2e8f0" stopOpacity="0.9" />
              </radialGradient>

              {/* Flower Core Stamen Glow */}
              <radialGradient id="stamenGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="50%" stopColor="#eab308" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>

              {/* Soil Gradient */}
              <radialGradient id="soilGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#3f271a" />
                <stop offset="70%" stopColor="#1c120c" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>

            {/* 1. GARDEN SOIL MOUND */}
            <g id="soil-bed">
              <ellipse
                cx="400"
                cy="820"
                rx="180"
                ry="38"
                fill="url(#soilGlow)"
                className="opacity-90"
              />
              <path
                d="M260 830 Q400 805 540 830 Q400 845 260 830"
                fill="#241711"
                stroke="#452a1d"
                strokeWidth="1.5"
              />
              {/* Subtle moss & stardust at base */}
              <circle cx="370" cy="818" r="3" fill="#4ade80" opacity="0.6" />
              <circle cx="430" cy="822" r="2.5" fill="#4ade80" opacity="0.5" />
              <circle cx="390" cy="824" r="2" fill="#fef08a" opacity="0.8" />
              <circle cx="415" cy="815" r="2.2" fill="#fef08a" opacity="0.7" />
            </g>

            {/* 2. MAIN ORGANIC GROWING STEM */}
            {/* Path from ground (400, 815) curving up to the central flower (400, 310) */}
            <path
              id="mainStem"
              d="M400 815 C395 720, 415 620, 395 520 C380 430, 408 360, 400 310"
              fill="none"
              stroke="url(#stemGrad)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray="620"
              strokeDashoffset={stemDashOffset}
            />

            {/* 3. LATERAL CURVING BRANCHES */}
            {/* Left Vine holding HAPPY */}
            <path
              id="branchLeft"
              d="M395 560 C350 540, 290 515, 190 440"
              fill="none"
              stroke="url(#branchGrad)"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeDasharray="320"
              strokeDashoffset={leftBranchDashOffset}
            />

            {/* Right Vine holding BIRTHDAY */}
            <path
              id="branchRight"
              d="M395 540 C460 530, 560 480, 680 350"
              fill="none"
              stroke="url(#branchGrad)"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeDasharray="380"
              strokeDashoffset={rightBranchDashOffset}
            />

            {/* Upper secondary tender shoots */}
            {growth > 0.5 && (
              <path
                d="M390 420 C350 390, 330 350, 310 320"
                fill="none"
                stroke="url(#branchGrad)"
                strokeWidth="2.2"
                strokeLinecap="round"
                opacity={Math.min(1, (growth - 0.5) * 3)}
              />
            )}
            {growth > 0.55 && (
              <path
                d="M405 400 C450 370, 480 340, 505 310"
                fill="none"
                stroke="url(#branchGrad)"
                strokeWidth="2.2"
                strokeLinecap="round"
                opacity={Math.min(1, (growth - 0.55) * 3)}
              />
            )}

            {/* 4. UNFOLDING GREEN JASMINE LEAVES */}
            {/* Leaf 1 (Lower Right) */}
            {growth > 0.25 && (
              <g
                transform="translate(412, 700) rotate(35)"
                style={{
                  transformOrigin: '0 0',
                  transform: `translate(412px, 700px) rotate(35deg) scale(${Math.min(
                    1,
                    (growth - 0.25) * 4
                  )})`,
                  transition: 'transform 0.4s ease-out',
                }}
              >
                <path
                  d="M0 0 C25 -15, 55 -10, 75 0 C55 15, 25 15, 0 0"
                  fill="url(#leafGrad)"
                  stroke="#86efac"
                  strokeWidth="0.8"
                />
                <line x1="0" y1="0" x2="65" y2="0" stroke="#a7f3d0" strokeWidth="0.8" opacity="0.6" />
              </g>
            )}

            {/* Leaf 2 (Lower Left) */}
            {growth > 0.3 && (
              <g
                style={{
                  transformOrigin: '0 0',
                  transform: `translate(390px, 670px) rotate(-145deg) scale(${Math.min(
                    1,
                    (growth - 0.3) * 4
                  )})`,
                }}
              >
                <path
                  d="M0 0 C25 -15, 55 -10, 75 0 C55 15, 25 15, 0 0"
                  fill="url(#leafGrad)"
                  stroke="#86efac"
                  strokeWidth="0.8"
                />
                <line x1="0" y1="0" x2="65" y2="0" stroke="#a7f3d0" strokeWidth="0.8" opacity="0.6" />
              </g>
            )}

            {/* Leaf 3 (Mid Right) */}
            {growth > 0.45 && (
              <g
                style={{
                  transformOrigin: '0 0',
                  transform: `translate(490px, 510px) rotate(20deg) scale(${Math.min(
                    1,
                    (growth - 0.45) * 3.5
                  )})`,
                }}
              >
                <path
                  d="M0 0 C22 -12, 45 -8, 62 0 C45 12, 22 12, 0 0"
                  fill="url(#leafGrad)"
                  stroke="#86efac"
                  strokeWidth="0.8"
                />
              </g>
            )}

            {/* Leaf 4 (Mid Left) */}
            {growth > 0.48 && (
              <g
                style={{
                  transformOrigin: '0 0',
                  transform: `translate(280px, 495px) rotate(-160deg) scale(${Math.min(
                    1,
                    (growth - 0.48) * 3.5
                  )})`,
                }}
              >
                <path
                  d="M0 0 C22 -12, 45 -8, 62 0 C45 12, 22 12, 0 0"
                  fill="url(#leafGrad)"
                  stroke="#86efac"
                  strokeWidth="0.8"
                />
              </g>
            )}

            {/* Leaf 5 & 6 (Sub-blossom calyx leaves) */}
            {growth > 0.6 && (
              <>
                <path
                  d="M390 330 C365 335, 345 350, 335 365 C355 355, 380 345, 395 330"
                  fill="url(#leafGrad)"
                  opacity={Math.min(1, (growth - 0.6) * 3)}
                />
                <path
                  d="M405 330 C430 335, 450 350, 460 365 C440 355, 415 345, 400 330"
                  fill="url(#leafGrad)"
                  opacity={Math.min(1, (growth - 0.6) * 3)}
                />
              </>
            )}

            {/* 5. SIDE BUDS */}
            {growth > 0.55 && (
              <g transform="translate(305, 315) rotate(-30)">
                <ellipse cx="0" cy="0" rx="8" ry="14" fill="#f8fafc" stroke="#86efac" strokeWidth="1" />
                <path d="M-6 8 Q0 16 6 8" fill="#22c55e" />
              </g>
            )}
            {growth > 0.62 && (
              <g transform="translate(508, 305) rotate(35)">
                <ellipse cx="0" cy="0" rx="9" ry="15" fill="#f8fafc" stroke="#86efac" strokeWidth="1" />
                <path d="M-6 8 Q0 16 6 8" fill="#22c55e" />
              </g>
            )}

            {/* 6. CALLIGRAPHIC GOLDEN ARABIC GREETING WOVEN INTO VINES */}
            <g id="vine-words">
              {vineWords.map((w, i) => {
                const isVisible = growth >= w.trigger;
                const wordProgress = Math.min(1, (growth - w.trigger) * 4);
                if (!isVisible) return null;

                return (
                  <text
                    key={`vine-word-${i}`}
                    x={w.x}
                    y={w.y}
                    textAnchor="middle"
                    transform={`rotate(${w.rot}, ${w.x}, ${w.y})`}
                    className="select-none"
                    style={{
                      fontFamily: "'Aref Ruqaa', 'Amiri', serif",
                      fontSize: '40px',
                      fontWeight: 'bold',
                      fill: '#fef08a',
                      opacity: wordProgress,
                      filter:
                        'drop-shadow(0 0 10px rgba(253, 224, 71, 0.9)) drop-shadow(0 0 20px rgba(234, 179, 8, 0.6))',
                    }}
                  >
                    {w.text}
                  </text>
                );
              })}
            </g>

            {/* 7. THE MASTERPIECE JASMINE BLOSSOM (Center: 400, 280) */}
            {growth > 0.65 && (
              <g
                id="jasmine-blossom"
                transform={`translate(400, 280) scale(${flowerOpenProgress})`}
                style={{
                  transformOrigin: '400px 280px',
                  filter: 'drop-shadow(0 0 25px rgba(254, 240, 138, 0.5))',
                }}
              >
                {/* Petals Whorl 1: Outer 8 star petals */}
                {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, idx) => (
                  <g key={`outer-petal-${idx}`} transform={`rotate(${angle})`}>
                    <path
                      d="M0 0 C-22 -40, -26 -85, 0 -115 C26 -85, 22 -40, 0 0"
                      fill="url(#petalGrad)"
                      stroke="#f1f5f9"
                      strokeWidth="1.2"
                      opacity="0.95"
                    />
                    {/* Petal center vein */}
                    <line
                      x1="0"
                      y1="-10"
                      x2="0"
                      y2="-95"
                      stroke="#e2e8f0"
                      strokeWidth="0.8"
                      opacity="0.7"
                    />
                  </g>
                ))}

                {/* Petals Whorl 2: Inner offset 6 layered petals */}
                {[22.5, 82.5, 142.5, 202.5, 262.5, 322.5].map((angle, idx) => (
                  <g key={`inner-petal-${idx}`} transform={`rotate(${angle})`}>
                    <path
                      d="M0 0 C-18 -30, -20 -68, 0 -92 C20 -68, 18 -30, 0 0"
                      fill="url(#petalGrad)"
                      stroke="#ffffff"
                      strokeWidth="1.2"
                      opacity="0.98"
                    />
                  </g>
                ))}

                {/* Flower Golden Core & Pistil / Stamens */}
                <circle cx="0" cy="0" r="28" fill="url(#stamenGlow)" />
                <circle cx="0" cy="0" r="16" fill="#fef08a" />
                <circle cx="0" cy="0" r="9" fill="#eab308" />

                {/* Stamens radiating */}
                {[0, 40, 80, 120, 160, 200, 240, 280, 320].map((deg, i) => (
                  <g key={`stamen-${i}`} transform={`rotate(${deg})`}>
                    <line x1="0" y1="0" x2="0" y2="18" stroke="#ca8a04" strokeWidth="1.6" />
                    <circle cx="0" cy="18" r="2.8" fill="#fef08a" />
                  </g>
                ))}
              </g>
            )}

            {/* Sparkles ascending along the stem */}
            {growth < 0.98 && (
              <circle
                cx={400 + Math.sin(growth * 15) * 12}
                cy={815 - growth * 510}
                r="4.5"
                fill="#fef08a"
                className="animate-pulse"
                style={{
                  filter: 'drop-shadow(0 0 10px #fef08a)',
                }}
              />
            )}
          </svg>
        </motion.div>
      </div>

      {/* REVEAL QUOTE & CELEBRATION */}
      <AnimatePresence>
        {isFullyBloomed && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full max-w-lg mx-auto mb-6 px-5 py-4 rounded-2xl bg-slate-950/75 backdrop-blur-xl border border-amber-300/30 shadow-[0_0_35px_rgba(253,224,71,0.25)] flex flex-col items-center gap-3.5"
          >
            <p className="font-serif text-lg sm:text-xl md:text-2xl text-amber-100 font-normal tracking-wide text-glow">
              «{SURPRISE_CONFIG.flowerQuote}»
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 mt-1">
              <button
                onClick={onContinue}
                className="group inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-serif text-base font-medium text-slate-950 bg-gradient-to-r from-amber-100 via-amber-200 to-amber-100 shadow-[0_0_20px_rgba(253,224,71,0.4)] hover:shadow-[0_0_30px_rgba(253,224,71,0.7)] transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
              >
                <span>تمنّي أمنية وأطفئي الشموع 🎂</span>
                <ArrowLeft className="w-4 h-4 text-amber-800 transition-transform group-hover:-translate-x-1" />
              </button>

              <button
                onClick={startBloomAnimation}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs text-slate-300 hover:text-white border border-white/10 hover:border-white/25 transition-colors cursor-pointer"
                title="شاهدي الزهرة تتفتّح من جديد"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-200" />
                <span>إعادة التفتّح</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
