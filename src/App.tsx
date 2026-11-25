/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, Component, ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ParticleGarden } from './components/ParticleGarden';
import { TopBar } from './components/TopBar';
import { ChapterNav, ChapterId } from './components/ChapterNav';
import { OpeningScene } from './components/OpeningScene';
import { RiddleScene } from './components/RiddleScene';
import { BloomingFlowerScene } from './components/BloomingFlowerScene';
import { BirthdayCakeScene } from './components/BirthdayCakeScene';
import { WishesScene } from './components/WishesScene';
import { LetterScene } from './components/LetterScene';
import { BirthdayVideoScene } from './components/BirthdayVideoScene';
import { audioEngine } from './utils/audioEngine';
import midnightGardenBg from './assets/images/midnight_garden_fairytale_1792848341183.jpg';

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: unknown) {
    console.error("Fairytale caught error:", error);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center text-slate-100">
          <h2 className="font-serif text-3xl text-amber-200 mb-3">تبعثر القليل من غبار النجوم...</h2>
          <p className="text-slate-300 mb-6 text-sm">دعينا نستعيد رحلتكِ الساحرة.</p>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
            className="px-6 py-2.5 rounded-full font-serif text-slate-900 bg-amber-200 hover:bg-amber-100 transition-colors"
          >
            إعادة بدء الحكاية ✨
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [currentChapter, setCurrentChapter] = useState<ChapterId>(1);
  const [unlockedChapters, setUnlockedChapters] = useState<number>(1);
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(false);

  // Check URL params for testing/jumping (?autostart=1 or ?chapter=4)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlChapter = params.get('chapter');
      if (urlChapter && ['1', '2', '3', '4', '5', '6', '7'].includes(urlChapter)) {
        const chapNum = parseInt(urlChapter, 10) as ChapterId;
        setCurrentChapter(chapNum);
        setUnlockedChapters(7);
      } else if (params.get('autostart') === '1') {
        setCurrentChapter(3);
        setUnlockedChapters(7);
      }
    }
  }, []);

  const handleToggleMusic = () => {
    const newState = audioEngine.toggleMelody();
    setIsMusicPlaying(newState);
  };

  const handlePauseMusic = () => {
    audioEngine.stopMelody();
    setIsMusicPlaying(false);
  };

  const advanceToChapter = (nextChap: ChapterId) => {
    setCurrentChapter(nextChap);
    setUnlockedChapters((prev) => Math.max(prev, nextChap));
  };

  const handleRestart = () => {
    setCurrentChapter(1);
    setUnlockedChapters(1);
  };

  return (
    <div dir="rtl" className="relative min-h-dvh w-full flex flex-col overflow-x-clip bg-[#070a14] text-slate-100 font-sans selection:bg-amber-400/30 selection:text-amber-100">
      {/* 1. Cinematic Enchanted Garden Photographic Backdrop */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src={midnightGardenBg}
          alt="حديقة منتصف الليل الساحرة"
          className="h-full w-full object-cover opacity-25 scale-105 filter blur-[2px] transition-all duration-1000"
          referrerPolicy="no-referrer"
        />
        {/* Deep midnight vignette gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#070a14]/90 via-[#0a1024]/75 to-[#070a14]/95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_0%,#070a14_85%)]" />
      </div>

      {/* 2. Interactive Canvas Particle Engine (Stars, Fireflies, Floating Petals, Shooting Stars) */}
      <ParticleGarden
        petalDensity={currentChapter >= 3 ? 'high' : 'medium'}
        showShootingStars={true}
      />

      {/* 3. Top Navigation & Audio Controls */}
      <TopBar
        isMusicPlaying={isMusicPlaying}
        onToggleMusic={handleToggleMusic}
        onResetExperience={handleRestart}
      />

      {/* 4. Main Journey Stages */}
      <ErrorBoundary>
        <main className="relative flex-1 flex flex-col justify-center pt-16 pb-4 md:pt-16 md:pb-6 md:pr-20">
          <AnimatePresence mode="wait">
            {currentChapter === 1 && (
              <motion.div
                key="chapter-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, filter: 'blur(8px)' }}
                transition={{ duration: 0.6 }}
              >
                <OpeningScene
                  onDiscover={() => advanceToChapter(2)}
                  isMusicPlaying={isMusicPlaying}
                  onToggleMusic={handleToggleMusic}
                />
              </motion.div>
            )}

            {currentChapter === 2 && (
              <motion.div
                key="chapter-2"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15, filter: 'blur(8px)' }}
                transition={{ duration: 0.6 }}
              >
                <RiddleScene onSolved={() => advanceToChapter(3)} />
              </motion.div>
            )}

            {currentChapter === 3 && (
              <motion.div
                key="chapter-3"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02, filter: 'blur(8px)' }}
                transition={{ duration: 0.7 }}
              >
                <BloomingFlowerScene onContinue={() => advanceToChapter(4)} />
              </motion.div>
            )}

            {currentChapter === 4 && (
              <motion.div
                key="chapter-4"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02, filter: 'blur(8px)' }}
                transition={{ duration: 0.7 }}
              >
                <BirthdayCakeScene onContinue={() => advanceToChapter(5)} />
              </motion.div>
            )}

            {currentChapter === 5 && (
              <motion.div
                key="chapter-5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
                transition={{ duration: 0.6 }}
              >
                <WishesScene onContinue={() => advanceToChapter(6)} />
              </motion.div>
            )}

            {currentChapter === 6 && (
              <motion.div
                key="chapter-6"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7 }}
              >
                <LetterScene
                  onGoToVideo={() => advanceToChapter(7)}
                  onReplayFlower={() => advanceToChapter(3)}
                  onRestartAll={handleRestart}
                />
              </motion.div>
            )}

            {currentChapter === 7 && (
              <motion.div
                key="chapter-7"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7 }}
              >
                <BirthdayVideoScene
                  onPauseAmbientMusic={handlePauseMusic}
                  onBackToLetter={() => advanceToChapter(6)}
                  onRestartAll={handleRestart}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </ErrorBoundary>

      {/* 5. Chapter Progress Indicator */}
      <ChapterNav
        currentChapter={currentChapter}
        onSelectChapter={(chap) => setCurrentChapter(chap)}
        unlockedChapters={unlockedChapters}
      />
    </div>
  );
}
