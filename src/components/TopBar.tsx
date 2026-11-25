import React from 'react';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

interface TopBarProps {
  isMusicPlaying: boolean;
  onToggleMusic: () => void;
  onResetExperience: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  isMusicPlaying,
  onToggleMusic,
  onResetExperience,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-4">
      {/* Brand / Title mark */}
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-amber-200/80 animate-pulse" />
        <span className="font-serif text-base tracking-wide text-slate-200">
          حكاية ساحرة لياسمين
        </span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMusic}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all duration-300 border ${
            isMusicPlaying
              ? 'bg-amber-400/15 border-amber-300/40 text-amber-200 shadow-[0_0_15px_rgba(253,224,71,0.25)]'
              : 'bg-slate-900/50 border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20'
          }`}
          aria-label={isMusicPlaying ? 'كتم موسيقى البيانو' : 'تشغيل لحن البيانو الحالم'}
        >
          {isMusicPlaying ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span className="hidden sm:inline">البيانو الحالم: يعمل</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">تشغيل الموسيقى ♫</span>
            </>
          )}
        </button>

        <button
          onClick={onResetExperience}
          className="px-3 py-1.5 rounded-full text-xs text-slate-400 hover:text-slate-200 transition-colors border border-transparent hover:border-white/10"
          title="البدء من جديد"
          aria-label="إعادة بدء المفاجأة من البداية"
        >
          إعادة البدء
        </button>
      </div>
    </header>
  );
};
