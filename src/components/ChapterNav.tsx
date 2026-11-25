import React from 'react';

export type ChapterId = 1 | 2 | 3 | 4 | 5 | 6 | 7;

interface ChapterNavProps {
  currentChapter: ChapterId;
  onSelectChapter: (chapter: ChapterId) => void;
  unlockedChapters: number;
}

const CHAPTERS: { id: ChapterId; label: string; number: string }[] = [
  { id: 1, label: 'السر', number: '١' },
  { id: 2, label: 'اللغز', number: '٢' },
  { id: 3, label: 'التفتح', number: '٣' },
  { id: 4, label: 'كعكة الأمنية', number: '٤' },
  { id: 5, label: 'سماء الأمنيات', number: '٥' },
  { id: 6, label: 'الرسالة', number: '٦' },
  { id: 7, label: 'فيديو المفاجأة', number: '٧' },
];

export const ChapterNav: React.FC<ChapterNavProps> = ({
  currentChapter,
  onSelectChapter,
  unlockedChapters,
}) => {
  return (
    <>
      {/* Desktop & Tablet (>= md): Compact vertical RTL rail on the right edge */}
      <nav
        aria-label="فصول الحكاية"
        data-testid="chapter-nav-desktop"
        className="hidden md:flex fixed right-4 lg:right-6 top-1/2 z-40 -translate-y-1/2 flex-col items-center gap-2 px-2 py-3.5 rounded-full bg-slate-950/70 backdrop-blur-xl border border-amber-300/20 shadow-[0_12px_40px_rgba(0,0,0,0.65)]"
      >
        <span className="text-[10px] font-serif text-amber-200/70 tracking-wide mb-0.5 select-none">
          الفصول
        </span>

        <div className="relative flex flex-col items-center gap-2">
          {/* Subtle vertical connecting line */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-3 bottom-3 w-px bg-gradient-to-b from-amber-300/25 via-amber-200/15 to-amber-300/25"
          />

          {CHAPTERS.map((chap) => {
            const isCurrent = currentChapter === chap.id;
            const isUnlocked = chap.id <= unlockedChapters;
            const isCompleted = chap.id < currentChapter;

            return (
              <button
                key={`desktop-${chap.id}`}
                type="button"
                onClick={() => isUnlocked && onSelectChapter(chap.id)}
                disabled={!isUnlocked}
                title={`الفصل ${chap.number}: ${chap.label}`}
                aria-label={`الفصل ${chap.number}: ${chap.label}`}
                aria-current={isCurrent ? 'step' : undefined}
                className={`group relative z-10 flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80 ${
                  isUnlocked ? 'cursor-pointer' : 'cursor-not-allowed opacity-35'
                }`}
              >
                <div
                  className={`transition-all duration-300 rounded-full flex items-center justify-center ${
                    isCurrent
                      ? 'w-7 h-7 bg-gradient-to-br from-amber-200/30 to-amber-400/20 border border-amber-300 text-amber-100 font-serif text-xs font-semibold shadow-[0_0_16px_rgba(253,224,71,0.6)] scale-105'
                      : isCompleted
                      ? 'w-2.5 h-2.5 bg-amber-300/75 group-hover:bg-amber-200 group-hover:scale-125 shadow-[0_0_8px_rgba(253,224,71,0.35)]'
                      : isUnlocked
                      ? 'w-2.5 h-2.5 bg-slate-300/60 group-hover:bg-amber-200 group-hover:scale-125'
                      : 'w-2 h-2 bg-slate-500/40'
                  }`}
                >
                  {isCurrent && <span>{chap.number}</span>}
                </div>

                {/* Tooltip placed to the left of the right rail (RTL-safe) */}
                <span className="pointer-events-none absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg px-2.5 py-1 text-[11px] font-medium tracking-wide text-amber-100 bg-slate-950/95 border border-amber-300/30 opacity-0 translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100 group-focus-visible:translate-x-0 shadow-lg">
                  {`الفصل ${chap.number}: ${chap.label}`}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile (< md): Compact horizontal bar in a dedicated in-flow sticky safe-area footer */}
      <nav
        aria-label="فصول الحكاية"
        data-testid="chapter-nav-mobile"
        className="sticky bottom-0 z-40 md:hidden w-full bg-slate-950/90 backdrop-blur-xl border-t border-amber-300/15 px-3 pt-2 pb-[max(0.65rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(0,0,0,0.65)]"
      >
        <div className="max-w-md mx-auto flex items-center justify-between gap-1">
          {CHAPTERS.map((chap) => {
            const isCurrent = currentChapter === chap.id;
            const isUnlocked = chap.id <= unlockedChapters;
            const isCompleted = chap.id < currentChapter;

            return (
              <button
                key={`mobile-${chap.id}`}
                type="button"
                onClick={() => isUnlocked && onSelectChapter(chap.id)}
                disabled={!isUnlocked}
                title={`الفصل ${chap.number}: ${chap.label}`}
                aria-label={`الفصل ${chap.number}: ${chap.label}`}
                aria-current={isCurrent ? 'step' : undefined}
                className={`flex flex-col items-center justify-center min-w-[38px] min-h-[38px] px-1 rounded-xl transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80 ${
                  isCurrent
                    ? 'bg-amber-300/15 border border-amber-300/45 text-amber-100 shadow-[0_0_12px_rgba(253,224,71,0.3)]'
                    : isUnlocked
                    ? 'text-slate-300 hover:text-amber-100 cursor-pointer'
                    : 'text-slate-600 cursor-not-allowed opacity-40'
                }`}
              >
                <span
                  className={`flex items-center justify-center rounded-full font-serif text-xs transition-all duration-300 ${
                    isCurrent
                      ? 'w-6 h-6 bg-amber-300/20 text-amber-200 font-semibold'
                      : isCompleted
                      ? 'w-5 h-5 text-amber-300/85'
                      : 'w-5 h-5'
                  }`}
                >
                  {chap.number}
                </span>
                {isCurrent && (
                  <span className="text-[9px] leading-tight text-amber-200/90 whitespace-nowrap mt-0.5">
                    {chap.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
