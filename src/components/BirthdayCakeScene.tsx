import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Wind, RotateCcw, ArrowLeft, Heart } from 'lucide-react';
import { SURPRISE_CONFIG } from '../config/surpriseConfig';
import { audioEngine } from '../utils/audioEngine';

interface BirthdayCakeSceneProps {
  onContinue: () => void;
}

export const BirthdayCakeScene: React.FC<BirthdayCakeSceneProps> = ({ onContinue }) => {
  // 5 candles
  const [candles, setCandles] = useState<boolean[]>([true, true, true, true, true]);
  const [isBlowing, setIsBlowing] = useState<boolean>(false);
  const [allExtinguished, setAllExtinguished] = useState<boolean>(false);

  // Check if all blown
  useEffect(() => {
    if (candles.every((c) => !c) && !allExtinguished) {
      setAllExtinguished(true);
      audioEngine.playMagicalChime();
    }
  }, [candles, allExtinguished]);

  const handleBlowAll = () => {
    setIsBlowing(true);
    audioEngine.playBlowSound();

    // Stagger candle extinction over 400ms for realistic breath flow
    [0, 1, 2, 3, 4].forEach((idx) => {
      setTimeout(() => {
        setCandles((prev) => {
          const next = [...prev];
          next[idx] = false;
          return next;
        });
      }, 100 + idx * 80);
    });

    setTimeout(() => {
      setIsBlowing(false);
    }, 1000);
  };

  const handleToggleCandle = (idx: number) => {
    if (candles[idx]) {
      audioEngine.playBlowSound();
    } else {
      audioEngine.playSparkleNote(784, 0.8, 0.12);
    }
    setCandles((prev) => {
      const next = [...prev];
      next[idx] = !next[idx];
      return next;
    });
  };

  const handleRelight = () => {
    setCandles([true, true, true, true, true]);
    setAllExtinguished(false);
    audioEngine.playSparkleNote(880, 1.2, 0.15);
  };

  const candlePositions = [
    { x: 310, y: 340, height: 50 },
    { x: 355, y: 330, height: 60 },
    { x: 400, y: 320, height: 70 },
    { x: 445, y: 330, height: 60 },
    { x: 490, y: 340, height: 50 },
  ];

  return (
    <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 pt-10 pb-20 text-center overflow-hidden">
      {/* Background radial candlelight glow */}
      <div className="pointer-events-none absolute top-1/4 h-80 w-80 rounded-full bg-amber-400/15 blur-[100px]" />

      {/* Chapter Marker */}
      <div className="mb-2 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/10 border border-amber-300/30 text-amber-200 text-xs tracking-wide">
        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
        <span>الفصل الرابع · أمنية الميلاد</span>
      </div>

      <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-slate-100 font-normal tracking-wide max-w-xl">
        تمنّي أمنية يا {SURPRISE_CONFIG.recipientName}...
      </h2>
      <p className="text-xs sm:text-sm text-slate-300 font-light mt-1 max-w-md">
        أغمضي عينيكِ، واحفظي أمنيةً سرية في قلبكِ، ثم أطفئي الشموع.
      </p>

      {/* INTERACTIVE CAKE & CANDLES SVG */}
      <div className="relative w-full max-w-md h-[260px] sm:h-[290px] md:h-[320px] my-1 flex items-center justify-center">
        {/* Breath Wind animation across the cake */}
        <AnimatePresence>
          {isBlowing && (
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: [0, 0.8, 0], x: [ -100, 100 ] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
              className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center"
            >
              <div className="w-72 h-16 rounded-full bg-gradient-to-r from-transparent via-cyan-100/30 to-transparent blur-md transform -rotate-6" />
            </motion.div>
          )}
        </AnimatePresence>

        <svg
          viewBox="0 0 800 700"
          className="w-full h-full overflow-visible drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)]"
        >
          <defs>
            {/* Cake Icing Gradients */}
            <linearGradient id="frostingTop" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fffdfa" />
              <stop offset="60%" stopColor="#fdf8ed" />
              <stop offset="100%" stopColor="#f5ecd8" />
            </linearGradient>

            <linearGradient id="frostingShadow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#e8dcbe" />
              <stop offset="25%" stopColor="#fdf8ed" />
              <stop offset="75%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#e3d6b3" />
            </linearGradient>

            {/* Gold Leaf & Pedestal Gradients */}
            <linearGradient id="goldPlate" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="45%" stopColor="#ca8a04" />
              <stop offset="75%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#854d0e" />
            </linearGradient>

            {/* Candle Body Gradient */}
            <linearGradient id="candleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fef3c7" />
              <stop offset="50%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#fde68a" />
            </linearGradient>

            {/* Flame Radial Gradient */}
            <radialGradient id="flameInner" cx="50%" cy="80%" r="70%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="25%" stopColor="#fef08a" />
              <stop offset="65%" stopColor="#f97316" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>

          {/* 1. GOLDEN PEDESTAL STAND */}
          <g id="cake-stand">
            {/* Base */}
            <ellipse cx="400" cy="625" rx="160" ry="24" fill="url(#goldPlate)" />
            <path
              d="M360 625 L375 560 L425 560 L440 625 Z"
              fill="url(#goldPlate)"
              opacity="0.95"
            />
            {/* Top Plate rim */}
            <ellipse cx="400" cy="560" rx="220" ry="32" fill="url(#goldPlate)" />
            <ellipse cx="400" cy="558" rx="214" ry="28" fill="#fef08a" opacity="0.3" />
          </g>

          {/* 2. BOTTOM TIER (Wide Tier) */}
          <g id="bottom-tier">
            {/* Body */}
            <path
              d="M230 460 C230 495, 570 495, 570 460 L570 550 C570 585, 230 585, 230 550 Z"
              fill="url(#frostingShadow)"
            />
            {/* Top Surface */}
            <ellipse cx="400" cy="460" rx="170" ry="28" fill="url(#frostingTop)" stroke="#eadeca" strokeWidth="1" />
            {/* Bottom piped pearl trim */}
            {[...Array(24)].map((_, i) => (
              <circle
                key={`b-pearl-${i}`}
                cx={245 + i * 13.5}
                cy={555 + Math.sin((i / 23) * Math.PI) * 16}
                r="3.5"
                fill="#ffffff"
                stroke="#e2d4bc"
                strokeWidth="0.8"
              />
            ))}
            {/* Jasmine flower garland decor on bottom tier */}
            <g transform="translate(235, 520) rotate(-15)">
              <circle cx="0" cy="0" rx="6" fill="#ffffff" />
              {[0, 72, 144, 216, 288].map((deg, j) => (
                <ellipse key={j} cx="0" cy="-7" rx="3" ry="6" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.5" transform={`rotate(${deg})`} />
              ))}
              <circle cx="0" cy="0" r="2" fill="#eab308" />
            </g>
            <g transform="translate(565, 520) rotate(15)">
              <circle cx="0" cy="0" rx="6" fill="#ffffff" />
              {[0, 72, 144, 216, 288].map((deg, j) => (
                <ellipse key={j} cx="0" cy="-7" rx="3" ry="6" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.5" transform={`rotate(${deg})`} />
              ))}
              <circle cx="0" cy="0" r="2" fill="#eab308" />
            </g>
          </g>

          {/* 3. MIDDLE TIER (With Cursive Name) */}
          <g id="middle-tier">
            {/* Body */}
            <path
              d="M275 380 C275 410, 525 410, 525 380 L525 460 C525 490, 275 490, 275 460 Z"
              fill="url(#frostingShadow)"
            />
            {/* Top Surface */}
            <ellipse cx="400" cy="380" rx="125" ry="22" fill="url(#frostingTop)" stroke="#eadeca" strokeWidth="1" />
            
            {/* Golden script lettering on cake */}
            <text
              x="400"
              y="426"
              textAnchor="middle"
              className="select-none"
              style={{
                fontFamily: "'Aref Ruqaa', 'Amiri', serif",
                fontSize: '24px',
                fill: '#78350f',
                fontWeight: 'bold',
                filter: 'drop-shadow(0 1px 1px rgba(254, 240, 138, 0.7))',
              }}
            >
              عيد ميلاد سعيد يا {SURPRISE_CONFIG.recipientName}
            </text>

            {/* Jasmine cluster on middle rim */}
            <g transform="translate(285, 435) rotate(-10)">
              {[0, 72, 144, 216, 288].map((deg, j) => (
                <ellipse key={j} cx="0" cy="-6" rx="2.8" ry="5.5" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.5" transform={`rotate(${deg})`} />
              ))}
              <circle cx="0" cy="0" r="1.8" fill="#eab308" />
            </g>
            <g transform="translate(515, 435) rotate(10)">
              {[0, 72, 144, 216, 288].map((deg, j) => (
                <ellipse key={j} cx="0" cy="-6" rx="2.8" ry="5.5" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.5" transform={`rotate(${deg})`} />
              ))}
              <circle cx="0" cy="0" r="1.8" fill="#eab308" />
            </g>
          </g>

          {/* 4. TOP TIER */}
          <g id="top-tier">
            {/* Body */}
            <path
              d="M315 320 C315 345, 485 345, 485 320 L485 380 C485 405, 315 405, 315 380 Z"
              fill="url(#frostingShadow)"
            />
            {/* Top Surface (where candles stand) */}
            <ellipse cx="400" cy="320" rx="85" ry="18" fill="url(#frostingTop)" stroke="#eadeca" strokeWidth="1" />
            
            {/* Pearl rim around top tier */}
            {[...Array(14)].map((_, i) => (
              <circle
                key={`top-pearl-${i}`}
                cx={328 + i * 11}
                cy={382 + Math.sin((i / 13) * Math.PI) * 11}
                r="2.8"
                fill="#ffffff"
                stroke="#e2d4bc"
                strokeWidth="0.6"
              />
            ))}
          </g>

          {/* 5. CANDLES & LIVE FLICKERING FLAMES */}
          {candlePositions.map((pos, idx) => {
            const isLit = candles[idx];

            return (
              <g
                key={`candle-group-${idx}`}
                onClick={() => handleToggleCandle(idx)}
                className="cursor-pointer group"
              >
                {/* Candle Stick */}
                <rect
                  x={pos.x - 4}
                  y={pos.y - pos.height}
                  width="8"
                  height={pos.height}
                  rx="3"
                  fill="url(#candleGrad)"
                  stroke="#eab308"
                  strokeWidth="0.8"
                />
                {/* Spiral golden glitter stripe */}
                <line
                  x1={pos.x - 3}
                  y1={pos.y - pos.height + 8}
                  x2={pos.x + 3}
                  y2={pos.y - pos.height + 16}
                  stroke="#ca8a04"
                  strokeWidth="1.2"
                />
                <line
                  x1={pos.x - 3}
                  y1={pos.y - pos.height + 24}
                  x2={pos.x + 3}
                  y2={pos.y - pos.height + 32}
                  stroke="#ca8a04"
                  strokeWidth="1.2"
                />

                {/* Wick */}
                <line
                  x1={pos.x}
                  y1={pos.y - pos.height}
                  x2={pos.x}
                  y2={pos.y - pos.height - 7}
                  stroke="#475569"
                  strokeWidth="1.4"
                />

                {/* FLAME or SMOKE */}
                {isLit ? (
                  <g transform={`translate(${pos.x}, ${pos.y - pos.height - 10})`}>
                    {/* Pulsing Light Aura */}
                    <circle
                      cx="0"
                      cy="-12"
                      r="22"
                      fill="#fef08a"
                      opacity="0.25"
                      className="animate-pulse"
                    />

                    {/* Outer Teardrop Flame */}
                    <path
                      d="M0 -30 C8 -22, 10 -10, 0 0 C-10 -10, -8 -22, 0 -30 Z"
                      fill="url(#flameInner)"
                      style={{
                        transformOrigin: '0 0',
                        animation: `pulseGlow ${1.8 + idx * 0.2}s ease-in-out infinite`,
                        filter: 'drop-shadow(0 0 8px rgba(253, 224, 71, 0.9))',
                      }}
                    />

                    {/* Inner Intense Core */}
                    <ellipse cx="0" cy="-6" rx="3.5" ry="7" fill="#ffffff" opacity="0.9" />
                  </g>
                ) : (
                  /* Curling Wisps of Smoke */
                  <g transform={`translate(${pos.x}, ${pos.y - pos.height - 10})`}>
                    <path
                      d="M0 0 C4 -10, -6 -20, 2 -32 C8 -42, -2 -50, 4 -62"
                      fill="none"
                      stroke="rgba(226, 232, 240, 0.6)"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeDasharray="4 2"
                      className="animate-pulse"
                    />
                    <circle cx="2" cy="-35" r="2" fill="#fef08a" opacity="0.7" />
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* ACTION CONTROLS & WISH BLESSING */}
      <div className="w-full max-w-lg mx-auto flex flex-col items-center">
        {!allExtinguished ? (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-1">
            <button
              onClick={handleBlowAll}
              disabled={isBlowing}
              className="group inline-flex items-center gap-3 px-8 py-3 rounded-full font-serif text-base sm:text-lg font-medium text-slate-950 bg-gradient-to-r from-amber-100 via-amber-200 to-amber-100 shadow-[0_0_25px_rgba(253,224,71,0.5)] hover:shadow-[0_0_35px_rgba(253,224,71,0.8)] transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Wind className="w-5 h-5 text-amber-800 transition-transform group-hover:rotate-12" />
              <span>أطفئي الشموع 🕯️💨</span>
            </button>

            <span className="text-[11px] text-slate-400 font-light">
              (أو انقري على كل شمعة)
            </span>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-lg mb-6 p-4 sm:p-5 rounded-2xl bg-slate-950/75 backdrop-blur-xl border border-amber-300/30 shadow-[0_0_35px_rgba(253,224,71,0.25)] flex flex-col items-center gap-3"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-300/10 border border-amber-200/30 text-amber-300">
              <Heart className="w-4 h-4 fill-amber-300/30 text-amber-200 animate-pulse" />
            </div>

            <p className="font-serif text-lg sm:text-xl md:text-2xl text-amber-100 font-normal leading-relaxed tracking-wide text-glow">
              «لقد حملت النجوم أمنيتكِ إلى السماء... ✨»
            </p>
            <p className="text-xs sm:text-sm text-slate-300 font-light">
              عسى أن يتفتّح كل حلمٍ همسَ به قلبكِ واقعاً جميلاً هذه الليلة.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 mt-1">
              <button
                onClick={onContinue}
                className="group inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-serif text-base font-medium text-slate-950 bg-gradient-to-r from-amber-100 via-amber-200 to-amber-100 shadow-[0_0_20px_rgba(253,224,71,0.4)] hover:shadow-[0_0_30px_rgba(253,224,71,0.7)] transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
              >
                <span>سماءٌ مليئة بالأمنيات</span>
                <ArrowLeft className="w-4 h-4 text-amber-800 transition-transform group-hover:-translate-x-1" />
              </button>

              <button
                onClick={handleRelight}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs text-slate-300 hover:text-white border border-white/10 hover:border-white/25 transition-colors cursor-pointer"
                title="إعادة إشعال شموع الميلاد"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-200" />
                <span>إشعال الشموع مجدداً 🕯️</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
