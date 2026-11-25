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
    <nav
      aria-label="فصول الحكاية"
      className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 flex items-center gap-3 px-4 py-2 rounded-full bg-slate-950/60 backdrop-blur-md border border-white/10 shadow-2xl"
    >
      <div className="flex items-center gap-2 sm:gap-3">
        {CHAPTERS.map((chap) => {
          const isCurrent = currentChapter === chap.id;
          const isUnlocked = chap.id <= unlockedChapters;

          return (
            <button
              key={chap.id}
              onClick={() => isUnlocked && onSelectChapter(chap.id)}
              disabled={!isUnlocked}
              title={`الفصل ${chap.number}: ${chap.label}`}
              aria-label={`الفصل ${chap.number}: ${chap.label}`}
              className={`group relative flex items-center justify-center transition-all duration-300 ${
                isUnlocked ? 'cursor-pointer' : 'cursor-not-allowed opacity-35'
              }`}
            >
              {/* Dot */}
              <div
                className={`transition-all duration-500 rounded-full flex items-center justify-center ${
                  isCurrent
                    ? 'w-7 h-7 bg-amber-200/20 border border-amber-300 text-amber-200 font-serif text-xs shadow-[0_0_12px_rgba(253,224,71,0.6)]'
                    : 'w-2.5 h-2.5 bg-slate-400/40 hover:bg-slate-300 hover:scale-125'
                }`}
              >
                {isCurrent && <span>{chap.number}</span>}
              </div>

              {/* Tooltip on hover */}
              <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded px-2 py-0.5 text-[11px] font-medium tracking-wide text-amber-100 bg-slate-900/90 border border-amber-500/20 opacity-0 transition-opacity group-hover:opacity-100 shadow-md">
                {chap.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
