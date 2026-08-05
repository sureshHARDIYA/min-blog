import React from 'react';
import { PublishedBook } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../context/ThemeContext';

interface BookDetailModalProps {
  book: PublishedBook | null;
  onClose: () => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({ book, onClose }) => {
  const { t } = useLanguage();
  const { theme } = useTheme();

  if (!book) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div 
        className={`border w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 md:p-8 relative shadow-2xl ${
          theme === 'light'
            ? 'bg-white border-slate-300 text-slate-900'
            : 'bg-[#141414] border-[#00FF41]/40 text-[#F5F5F5]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded cursor-pointer transition-colors ${
            theme === 'light' ? 'text-slate-500 hover:text-[#008822]' : 'text-[#F5F5F5]/60 hover:text-[#00FF41]'
          }`}
          aria-label="Close modal"
        >
          <span className="material-symbols-outlined text-2xl">close</span>
        </button>

        <div className="mb-6">
          <span className={`font-code text-xs uppercase tracking-widest block mb-2 font-bold ${
            theme === 'light' ? 'text-[#008822]' : 'text-[#00FF41]'
          }`}>
            {book.publisher} • {book.year}
          </span>
          <h2 className={`font-black text-2xl md:text-3xl leading-tight mb-2 tracking-tight ${
            theme === 'light' ? 'text-slate-900' : 'text-[#F5F5F5]'
          }`}>
            {book.title}
          </h2>
          {book.isbn && (
            <p className={`font-code text-xs ${
              theme === 'light' ? 'text-slate-500' : 'text-[#F5F5F5]/60'
            }`}>
              ISBN: {book.isbn} | {t.modal.pages}: {book.pages}
            </p>
          )}
        </div>

        <div className="space-y-4 mb-6">
          <div className={`border p-4 ${
            theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#0C0C0C] border-white/10'
          }`}>
            <h3 className={`font-code text-xs font-bold uppercase tracking-widest mb-2 ${
              theme === 'light' ? 'text-[#008822]' : 'text-[#00FF41]'
            }`}>
              {t.modal.summaryTitle}
            </h3>
            <p className={`font-body-md text-sm leading-relaxed ${
              theme === 'light' ? 'text-slate-700' : 'text-[#F5F5F5]/80'
            }`}>
              {book.summary}
            </p>
          </div>

          <div>
            <h3 className={`font-code text-xs font-bold uppercase tracking-widest mb-2 ${
              theme === 'light' ? 'text-slate-900' : 'text-[#F5F5F5]'
            }`}>
              {t.modal.topicsTitle}
            </h3>
            <div className="flex flex-wrap gap-2">
              {book.topics.map((topic, i) => (
                <span
                  key={i}
                  className={`font-code text-xs border px-3 py-1 font-bold ${
                    theme === 'light'
                      ? 'bg-slate-100 border-slate-300 text-[#007A1E]'
                      : 'bg-[#0C0C0C] border-white/20 text-[#00FF41]'
                  }`}
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className={`pt-4 border-t flex justify-between items-center ${
          theme === 'light' ? 'border-slate-200' : 'border-white/10'
        }`}>
          <span className={`font-code text-xs uppercase tracking-widest ${
            theme === 'light' ? 'text-slate-500' : 'text-[#F5F5F5]/50'
          }`}>
            {t.modal.refLabel}
          </span>
          <button
            onClick={onClose}
            className={`px-5 py-2 font-code text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer ${
              theme === 'light'
                ? 'bg-[#008822] text-white hover:bg-slate-900'
                : 'bg-[#00FF41] text-[#0C0C0C] hover:bg-[#F5F5F5]'
            }`}
          >
            {t.modal.closeReader}
          </button>
        </div>
      </div>
    </div>
  );
};
