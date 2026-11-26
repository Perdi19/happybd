import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Sparkles, Wind, RotateCcw, ArrowLeft, Heart } from 'lucide-react';
import { SURPRISE_CONFIG } from '../config/surpriseConfig';
import { audioEngine } from '../utils/audioEngine';
import {
  CANDLE_POSITIONS,
  WIND_PARTICLES,
  canStartBlowSequence,
  getLitCandleIndices,
  getCandleFlameOrigin,
  getCandleFlickerProfile,
  getCandleBlowSchedule,
  getBlowSequenceDurationMs,
} from '../utils/candleAnimation';

interface BirthdayCakeSceneProps {
  onContinue: () => void;
}

export const BirthdayCakeScene: React.FC<BirthdayCakeSceneProps> = ({ onContinue }) => {
  const shouldReduceMotion = Boolean(useReducedMotion());

  // 5 candles + per-candle wind-bending & post-extinguish smoke state
  const [candles, setCandles] = useState<boolean[]>([true, true, true, true, true]);
  const [bendingCandles, setBendingCandles] = useState<boolean[]>([false, false, false, false, false]);
  const [smokingCandles, setSmokingCandles] = useState<boolean[]>([false, false, false, false, false]);
  const [blowCycle, setBlowCycle] = useState<number>(0);
  const [isBlowing, setIsBlowing] = useState<boolean>(false);
  const [allExtinguished, setAllExtinguished] = useState<boolean>(false);

  const timersRef = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  const scheduleTimeout = useCallback((fn: () => void, delayMs: number) => {
    const id = window.setTimeout(() => {
      timersRef.current = timersRef.current.filter((t) => t !== id);
      fn();
    }, delayMs);
    timersRef.current.push(id);
    return id;
  }, []);

  // Clean up all timers if user navigates away mid-animation
  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  // Trigger wish blessing state smoothly right after the final flame extinguishes
  useEffect(() => {
    if (candles.every((c) => !c) && !allExtinguished) {
      const revealDelay = shouldReduceMotion ? 40 : 220;
      const timer = window.setTimeout(() => {
        setAllExtinguished(true);
        audioEngine.playMagicalChime();
      }, revealDelay);
      return () => window.clearTimeout(timer);
    }
  }, [candles, allExtinguished, shouldReduceMotion]);

  const handleBlowAll = () => {
    if (!canStartBlowSequence(isBlowing, candles)) return;

    const litIndices = getLitCandleIndices(candles);
    clearTimers();
    setIsBlowing(true);
    setBlowCycle((prev) => prev + 1);
    audioEngine.playBlowSound();

    // Sweep directional breath gust across currently lit candles from left to right
    litIndices.forEach((idx) => {
      const step = getCandleBlowSchedule(idx, litIndices, shouldReduceMotion);

      scheduleTimeout(() => {
        setBendingCandles((prev) => {
          const next = [...prev];
          next[idx] = true;
          return next;
        });
      }, step.bendMs);

      scheduleTimeout(() => {
        setCandles((prev) => {
          const next = [...prev];
          next[idx] = false;
          return next;
        });
        setBendingCandles((prev) => {
          const next = [...prev];
          next[idx] = false;
          return next;
        });
        setSmokingCandles((prev) => {
          const next = [...prev];
          next[idx] = true;
          return next;
        });
      }, step.extinguishMs);

      scheduleTimeout(() => {
        setSmokingCandles((prev) => {
          const next = [...prev];
          next[idx] = false;
          return next;
        });
      }, step.smokeEndMs);
    });

    const totalGustDuration = getBlowSequenceDurationMs(litIndices, shouldReduceMotion);
    scheduleTimeout(() => {
      setIsBlowing(false);
      setBendingCandles([false, false, false, false, false]);
    }, totalGustDuration);
  };

  const handleToggleCandle = (idx: number) => {
    if (isBlowing) return;

    if (candles[idx]) {
      audioEngine.playBlowSound();
      const smokeDuration = shouldReduceMotion ? 900 : 2300;
      setBendingCandles((prev) => {
        const next = [...prev];
        next[idx] = true;
        return next;
      });
      scheduleTimeout(() => {
        setCandles((prev) => {
          const next = [...prev];
          next[idx] = false;
          return next;
        });
        setBendingCandles((prev) => {
          const next = [...prev];
          next[idx] = false;
          return next;
        });
        setSmokingCandles((prev) => {
          const next = [...prev];
          next[idx] = true;
          return next;
        });
        scheduleTimeout(() => {
          setSmokingCandles((prev) => {
            const next = [...prev];
            next[idx] = false;
            return next;
          });
        }, smokeDuration);
      }, shouldReduceMotion ? 40 : 160);
    } else {
      audioEngine.playSparkleNote(784, 0.8, 0.12);
      setSmokingCandles((prev) => {
        const next = [...prev];
        next[idx] = false;
        return next;
      });
      setCandles((prev) => {
        const next = [...prev];
        next[idx] = true;
        return next;
      });
      setAllExtinguished(false);
    }
  };

  const handleRelight = () => {
    clearTimers();
    setIsBlowing(false);
    setBendingCandles([false, false, false, false, false]);
    setSmokingCandles([false, false, false, false, false]);
    setCandles([true, true, true, true, true]);
    setAllExtinguished(false);
    audioEngine.playSparkleNote(880, 1.2, 0.15);
  };

  const candlePositions = CANDLE_POSITIONS;
  const litRatio = candles.filter(Boolean).length / candlePositions.length;

  return (
    <div className="relative z-10 flex w-full flex-col items-center justify-center px-4 py-2 sm:py-3 md:py-4 text-center overflow-visible">
      {/* Background radial candlelight glow */}
      <div className="pointer-events-none absolute top-1/4 h-80 w-80 md:h-[26rem] md:w-[26rem] rounded-full bg-amber-400/15 blur-[110px]" />

      {/* Chapter Marker */}
      <div className="mb-1.5 sm:mb-2 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/10 border border-amber-300/30 text-amber-200 text-xs tracking-wide">
        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
        <span>الفصل الرابع · أمنية الميلاد</span>
      </div>

      <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-slate-100 font-normal tracking-wide max-w-xl">
        تمنّي أمنية يا {SURPRISE_CONFIG.recipientName}...
      </h2>
      <p className="text-xs sm:text-sm md:text-base text-slate-300 font-light mt-1 max-w-lg">
        أغمضي عينيكِ، واحفظي أمنيةً سرية في قلبكِ، ثم أطفئي الشموع.
      </p>

      {/* INTERACTIVE CAKE & CANDLES SVG */}
      <div className="relative w-full max-w-[360px] sm:max-w-md md:max-w-xl lg:max-w-2xl h-[255px] sm:h-[290px] md:h-[clamp(290px,43dvh,420px)] xl:h-[clamp(340px,46dvh,480px)] my-1 sm:my-2 flex items-center justify-center overflow-visible">
        <svg
          viewBox="30 110 740 555"
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full overflow-visible drop-shadow-[0_18px_36px_rgba(0,0,0,0.65)]"
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

            {/* Warm reflection on top tier from lit candles */}
            <radialGradient id="cakeWarmReflection" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(253, 224, 71, 0.34)" />
              <stop offset="55%" stopColor="rgba(251, 146, 60, 0.14)" />
              <stop offset="100%" stopColor="rgba(251, 146, 60, 0)" />
            </radialGradient>

            {/* Layered Flame & Halo Gradients */}
            <radialGradient id="flameGlowAura" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(254, 240, 138, 0.52)" />
              <stop offset="48%" stopColor="rgba(251, 191, 36, 0.2)" />
              <stop offset="100%" stopColor="rgba(251, 191, 36, 0)" />
            </radialGradient>

            <radialGradient id="flameOuter" cx="50%" cy="76%" r="65%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="45%" stopColor="#fb923c" />
              <stop offset="85%" stopColor="rgba(234, 88, 12, 0.55)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>

            <radialGradient id="flameInner" cx="50%" cy="80%" r="70%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="30%" stopColor="#fef08a" />
              <stop offset="72%" stopColor="#f97316" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>

            {/* Visible Breath Wind & Smoke Gradients */}
            <linearGradient id="windStreamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(186, 230, 253, 0)" />
              <stop offset="28%" stopColor="rgba(224, 242, 254, 0.85)" />
              <stop offset="62%" stopColor="rgba(254, 249, 195, 0.72)" />
              <stop offset="100%" stopColor="rgba(254, 249, 195, 0)" />
            </linearGradient>

            <linearGradient id="windVeilGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(186, 230, 253, 0)" />
              <stop offset="45%" stopColor="rgba(186, 230, 253, 0.24)" />
              <stop offset="75%" stopColor="rgba(254, 240, 138, 0.14)" />
              <stop offset="100%" stopColor="rgba(254, 240, 138, 0)" />
            </linearGradient>

            <linearGradient id="smokeGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="rgba(248, 250, 252, 0.92)" />
              <stop offset="55%" stopColor="rgba(203, 213, 225, 0.56)" />
              <stop offset="100%" stopColor="rgba(203, 213, 225, 0)" />
            </linearGradient>
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

          {/* 5. CANDLES, REALISTIC FLAMES, SMOKE & BREATH GUST */}
          <motion.ellipse
            cx="400"
            cy="332"
            rx="145"
            ry="34"
            fill="url(#cakeWarmReflection)"
            animate={{ opacity: 0.1 + litRatio * 0.9 }}
            transition={{ duration: shouldReduceMotion ? 0.15 : 0.4 }}
            className="pointer-events-none"
          />

          {candlePositions.map((pos, idx) => {
            const isLit = candles[idx];
            const isBending = bendingCandles[idx];
            const isSmoking = smokingCandles[idx];
            const origin = getCandleFlameOrigin(pos);
            const flicker = getCandleFlickerProfile(idx);

            return (
              <g
                key={`candle-group-${idx}`}
                data-testid={`candle-${idx}`}
                data-lit={isLit ? 'true' : 'false'}
                data-bending={isBending ? 'true' : 'false'}
                role="button"
                tabIndex={0}
                aria-label={isLit ? `إطفاء الشمعة ${idx + 1}` : `إشعال الشمعة ${idx + 1}`}
                onClick={() => handleToggleCandle(idx)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleToggleCandle(idx);
                  }
                }}
                className="cursor-pointer group focus:outline-none"
              >
                {/* Expanded touch target for comfortable tapping on mobile & desktop */}
                <rect
                  x={pos.x - 16}
                  y={pos.y - pos.height - 44}
                  width="32"
                  height={pos.height + 50}
                  fill="transparent"
                />

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
                {/* Melted wax rim top detail */}
                <ellipse
                  cx={pos.x}
                  cy={pos.y - pos.height + 1.5}
                  rx="4"
                  ry="1.8"
                  fill="#fffbeb"
                  opacity="0.9"
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
                  y2={pos.y - pos.height - 8}
                  stroke={isLit ? '#78350f' : '#475569'}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />

                {/* LIT FLAME WITH WIND BENDING OR POST-EXTINGUISH RISING SMOKE */}
                <g transform={`translate(${origin.x}, ${origin.y})`}>
                  <AnimatePresence>
                    {isLit && (
                      <motion.g
                        key={`flame-${idx}`}
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{
                          opacity: 0,
                          scale: 0.15,
                          transition: { duration: shouldReduceMotion ? 0.14 : 0.18, ease: 'easeIn' },
                        }}
                        style={{ transformBox: 'fill-box', transformOrigin: '50% 100%' }}
                      >
                        {/* Soft Warm Ambient Halo */}
                        <circle
                          cx="0"
                          cy="-15"
                          r="38"
                          fill="url(#flameGlowAura)"
                          className={shouldReduceMotion ? '' : 'candle-halo-breathe'}
                          style={
                            {
                              '--flame-dur': `${flicker.durationSec + 0.35}s`,
                              '--flame-delay': `${flicker.delaySec}s`,
                            } as React.CSSProperties
                          }
                        />

                        {/* Dynamic Wind-Responsive Flame Pivot (anchored at wick base 50% 100%) */}
                        <motion.g
                          animate={
                            isBending
                              ? shouldReduceMotion
                                ? { rotate: 8, scaleY: 0.84, opacity: 0.7 }
                                : {
                                    rotate: [
                                      flicker.tiltAngleDeg * 0.6,
                                      flicker.tiltAngleDeg,
                                      flicker.tiltAngleDeg - 7,
                                      flicker.tiltAngleDeg + 8,
                                    ],
                                    skewX: [-10, -18, -14, -20],
                                    scaleX: [0.95, 0.88, 0.9, 0.82],
                                    scaleY: [0.88, 0.74, 0.78, 0.65],
                                  }
                              : {
                                  rotate: 0,
                                  skewX: 0,
                                  scaleX: 1,
                                  scaleY: 1,
                                  opacity: 1,
                                }
                          }
                          exit={
                            shouldReduceMotion
                              ? { opacity: 0, scale: 0.4 }
                              : {
                                  rotate: flicker.tiltAngleDeg + 14,
                                  skewX: -22,
                                  scaleX: 0.35,
                                  scaleY: 0.15,
                                  opacity: 0,
                                }
                          }
                          transition={{
                            duration: isBending ? 0.28 : 0.25,
                            ease: 'easeOut',
                          }}
                          style={{ transformBox: 'fill-box', transformOrigin: '50% 100%' }}
                        >
                          <g
                            className={
                              shouldReduceMotion || isBending ? '' : 'candle-flame-dance'
                            }
                            style={
                              {
                                '--flame-dur': `${flicker.durationSec}s`,
                                '--flame-delay': `${flicker.delaySec}s`,
                              } as React.CSSProperties
                            }
                          >
                            {/* Outer Amber Flame Envelope */}
                            <path
                              d="M0 -35 C10 -24, 11 -10, 0 2 C-11 -10, -10 -24, 0 -35 Z"
                              fill="url(#flameOuter)"
                              opacity="0.82"
                            />
                            {/* Mid Golden Teardrop Flame */}
                            <path
                              d="M0 -29 C7.5 -20, 9 -8.5, 0 0 C-9 -8.5, -7.5 -20, 0 -29 Z"
                              fill="url(#flameInner)"
                              style={{
                                filter: 'drop-shadow(0 0 8px rgba(253, 224, 71, 0.9))',
                              }}
                            />
                            {/* Incandescent Inner Core + Blue Wick Base */}
                            <ellipse cx="0" cy="-6" rx="3.1" ry="6.5" fill="#ffffff" opacity="0.95" />
                            <circle cx="0" cy="-1.2" r="2.1" fill="#dbeafe" opacity="0.6" />
                          </g>
                        </motion.g>
                      </motion.g>
                    )}
                  </AnimatePresence>

                  {/* RISING CURLING SMOKE WISPS + COOLING EMBER AFTER EXTINGUISH */}
                  <AnimatePresence>
                    {!isLit && isSmoking && (
                      <motion.g
                        key={`smoke-${idx}`}
                        data-testid={`candle-smoke-${idx}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0.3 } }}
                        className="pointer-events-none"
                      >
                        {/* Cooling glowing ember at wick tip */}
                        <motion.circle
                          cx="0"
                          cy="2"
                          r="2.6"
                          fill="#fb923c"
                          initial={{ opacity: 0.95, scale: 1.25 }}
                          animate={{ opacity: 0, scale: 0.35 }}
                          transition={{ duration: shouldReduceMotion ? 0.35 : 0.7 }}
                          style={{ transformBox: 'fill-box', transformOrigin: '50% 50%' }}
                        />

                        {shouldReduceMotion ? (
                          <motion.path
                            d="M0 0 C4 -14, -4 -28, 2 -42"
                            fill="none"
                            stroke="url(#smokeGrad)"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 0.6, 0] }}
                            transition={{ duration: 0.85, ease: 'easeOut' }}
                          />
                        ) : (
                          <>
                            {/* Primary curling smoke ribbon */}
                            <motion.path
                              d="M0 1 C7 -14, -10 -29, 5 -46 C15 -60, -5 -74, 7 -92"
                              fill="none"
                              stroke="url(#smokeGrad)"
                              strokeWidth="3.2"
                              strokeLinecap="round"
                              initial={{ pathLength: 0.08, opacity: 0, y: 4, x: 0 }}
                              animate={{
                                pathLength: [0.08, 0.85, 1],
                                opacity: [0, 0.88, 0.5, 0],
                                y: [4, -14, -34],
                                x: [0, 7, 15],
                              }}
                              transition={{ duration: 2.25, ease: 'easeOut' }}
                            />

                            {/* Secondary swirling smoke trail */}
                            <motion.path
                              d="M-1 -2 C-8 -16, 9 -28, -2 -44 C-10 -57, 7 -70, -2 -84"
                              fill="none"
                              stroke="rgba(226, 232, 240, 0.66)"
                              strokeWidth="2.1"
                              strokeLinecap="round"
                              initial={{ pathLength: 0.05, opacity: 0, y: 2, x: 0 }}
                              animate={{
                                pathLength: [0.05, 0.8, 1],
                                opacity: [0, 0.68, 0.3, 0],
                                y: [2, -16, -30],
                                x: [0, 4, 11],
                              }}
                              transition={{ duration: 2.05, delay: 0.14, ease: 'easeOut' }}
                            />

                            {/* Soft expanding smoke puff */}
                            <motion.circle
                              cx="2"
                              cy="-10"
                              r="7.5"
                              fill="rgba(226, 232, 240, 0.4)"
                              initial={{ scale: 0.5, opacity: 0, y: 0, x: 0 }}
                              animate={{
                                scale: [0.5, 1.4, 2.2],
                                opacity: [0, 0.45, 0],
                                y: [0, -28, -56],
                                x: [0, 8, 16],
                              }}
                              transition={{ duration: 1.9, ease: 'easeOut' }}
                              style={{ transformBox: 'fill-box', transformOrigin: '50% 50%' }}
                            />

                            {/* Tiny departing ember spark */}
                            <motion.circle
                              cx="3"
                              cy="-4"
                              r="1.6"
                              fill="#fde047"
                              initial={{ opacity: 0.9, x: 0, y: 0, scale: 1 }}
                              animate={{ opacity: 0, x: 24, y: -22, scale: 0.2 }}
                              transition={{ duration: 0.55, ease: 'easeOut' }}
                              style={{ transformBox: 'fill-box', transformOrigin: '50% 50%' }}
                            />
                          </>
                        )}
                      </motion.g>
                    )}
                  </AnimatePresence>
                </g>
              </g>
            );
          })}

          {/* VISIBLE BREATH STREAM & AIR PARTICLES OVERLAY WHEN BLOWING */}
          <AnimatePresence>
            {isBlowing && !shouldReduceMotion && (
              <motion.g
                key={`wind-gust-${blowCycle}`}
                data-testid="breath-wind-gust"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.22 } }}
                className="pointer-events-none"
              >
                {/* Soft atmospheric air veil sweeping across candle line */}
                <motion.path
                  d="M20 278 C165 256, 345 242, 650 232 C495 268, 285 288, 30 302 Z"
                  fill="url(#windVeilGrad)"
                  initial={{ x: -120, opacity: 0 }}
                  animate={{ x: [-110, 45, 115], opacity: [0, 0.85, 0] }}
                  transition={{ duration: 0.92, ease: 'easeOut' }}
                />

                {/* Flowing aerodynamic breath streamlines */}
                <motion.path
                  d="M42 278 C165 258, 285 252, 415 242 C510 235, 585 224, 668 214"
                  fill="none"
                  stroke="url(#windStreamGrad)"
                  strokeWidth="4.2"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, pathOffset: 0, opacity: 0 }}
                  animate={{
                    pathLength: [0.18, 0.58, 0.22],
                    pathOffset: [0, 0.35, 0.85],
                    opacity: [0, 0.96, 0],
                  }}
                  transition={{ duration: 0.88, ease: 'easeOut' }}
                />

                <motion.path
                  d="M58 256 C185 246, 305 244, 430 234 C520 227, 595 238, 662 246"
                  fill="none"
                  stroke="url(#windStreamGrad)"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, pathOffset: 0, opacity: 0 }}
                  animate={{
                    pathLength: [0.14, 0.54, 0.2],
                    pathOffset: [0, 0.4, 0.88],
                    opacity: [0, 0.9, 0],
                  }}
                  transition={{ duration: 0.85, delay: 0.08, ease: 'easeOut' }}
                />

                <motion.path
                  d="M72 296 C190 282, 310 272, 435 262 C525 255, 595 252, 658 242"
                  fill="none"
                  stroke="url(#windStreamGrad)"
                  strokeWidth="2.7"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, pathOffset: 0, opacity: 0 }}
                  animate={{
                    pathLength: [0.14, 0.5, 0.18],
                    pathOffset: [0, 0.38, 0.86],
                    opacity: [0, 0.84, 0],
                  }}
                  transition={{ duration: 0.82, delay: 0.14, ease: 'easeOut' }}
                />

                {/* Glowing breath & stardust droplets carried by the wind */}
                {WIND_PARTICLES.map((particle) => {
                  const fill =
                    particle.tone === 'gold'
                      ? '#fef08a'
                      : particle.tone === 'cyan'
                        ? '#bae6fd'
                        : '#ffffff';

                  return (
                    <motion.circle
                      key={`wind-p-${particle.id}`}
                      cx={particle.startX}
                      cy={particle.startY}
                      r={particle.r}
                      fill={fill}
                      initial={{ opacity: 0, x: 0, y: 0, scale: 0.6 }}
                      animate={{
                        opacity: [0, 0.95, 0.7, 0],
                        x: [0, (particle.endX - particle.startX) * 0.55, particle.endX - particle.startX],
                        y: [0, -10, particle.endY - particle.startY],
                        scale: [0.6, 1.15, 0.45],
                      }}
                      transition={{
                        duration: particle.duration,
                        delay: particle.delay,
                        ease: 'easeOut',
                      }}
                    />
                  );
                })}
              </motion.g>
            )}
          </AnimatePresence>
        </svg>
      </div>

      {/* ACTION CONTROLS & WISH BLESSING */}
      <div className="w-full max-w-lg mx-auto flex flex-col items-center">
        {!allExtinguished ? (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-1">
            <button
              type="button"
              data-testid="blow-candles-btn"
              onClick={handleBlowAll}
              disabled={isBlowing}
              className={`group inline-flex items-center gap-3 px-8 py-3 rounded-full font-serif text-base sm:text-lg font-medium text-slate-950 bg-gradient-to-r from-amber-100 via-amber-200 to-amber-100 shadow-[0_0_25px_rgba(253,224,71,0.5)] transition-all duration-300 ${
                isBlowing
                  ? 'opacity-80 scale-95 cursor-wait'
                  : 'hover:shadow-[0_0_35px_rgba(253,224,71,0.8)] hover:scale-105 active:scale-95 cursor-pointer'
              }`}
            >
              <Wind
                className={`w-5 h-5 text-amber-800 transition-transform ${
                  isBlowing ? 'translate-x-1 rotate-12' : 'group-hover:rotate-12'
                }`}
              />
              <span>{isBlowing ? 'جاري إطفاء الشموع... ✨' : 'أطفئي الشموع 🕯️💨'}</span>
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
            className="w-full max-w-lg mb-2 sm:mb-4 p-3.5 sm:p-4 md:p-5 rounded-2xl bg-slate-950/75 backdrop-blur-xl border border-amber-300/30 shadow-[0_0_35px_rgba(253,224,71,0.25)] flex flex-col items-center gap-2.5 sm:gap-3"
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
