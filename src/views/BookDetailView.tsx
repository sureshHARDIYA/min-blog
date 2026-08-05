import React from 'react';
import ReactMarkdown from 'react-markdown';
import { PublishedBook } from '../types';
import { getBookMarkdown } from '../content/books';
import { useTheme } from '../context/ThemeContext';

interface BookDetailViewProps {
  book: PublishedBook;
  onBack: () => void;
  onSelectBook?: (bookId: string) => void;
  allBooks?: PublishedBook[];
}

export const BookDetailView: React.FC<BookDetailViewProps> = ({
  book,
  onBack,
  onSelectBook,
  allBooks = [],
}) => {
  const { theme } = useTheme();
  const markdownContent = getBookMarkdown(book.id);

  const currentIndex = allBooks.findIndex((b) => b.id === book.id);
  const prevBook = currentIndex > 0 ? allBooks[currentIndex - 1] : null;
  const nextBook = currentIndex >= 0 && currentIndex < allBooks.length - 1 ? allBooks[currentIndex + 1] : null;

  return (
    <div className="blueprint-grid min-h-[calc(100vh-80px)] pt-[100px] pb-16 animate-fadeIn">
      <div className="px-6 max-w-[1120px] mx-auto w-full">
        {/* Navigation Breadcrumb Bar */}
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={onBack}
            className={`inline-flex items-center gap-2 font-code text-xs uppercase tracking-widest font-bold border px-4 py-2 transition-colors cursor-pointer ${
              theme === 'light'
                ? 'bg-white border-slate-300 text-slate-800 hover:border-[#008822] hover:text-[#008822]'
                : 'bg-[#141414] border-white/20 text-[#F5F5F5] hover:border-[#00FF41] hover:text-[#00FF41]'
            }`}
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Back to Research &amp; Academic Works</span>
          </button>

          <span className={`font-code text-xs uppercase tracking-widest hidden sm:inline ${
            theme === 'light' ? 'text-slate-500' : 'text-[#F5F5F5]/60'
          }`}>
            Book Route // <strong className={theme === 'light' ? 'text-[#008822]' : 'text-[#00FF41]'}>{book.id}</strong>
          </span>
        </div>

        {/* Hero Banner for the Book */}
        <section className={`border p-8 md:p-10 mb-10 relative overflow-hidden shadow-2xl ${
          theme === 'light'
            ? 'bg-white border-slate-300 text-slate-900'
            : 'bg-[#141414] border-[#00FF41]/30 text-[#F5F5F5]'
        }`}>
          <div className={`absolute top-0 right-0 w-48 h-48 rounded-bl-full -mr-16 -mt-16 pointer-events-none opacity-20 ${
            theme === 'light' ? 'bg-[#008822]' : 'bg-[#00FF41]'
          }`}></div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-8 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className={`font-code text-xs uppercase tracking-widest px-3 py-1 font-bold border ${
                  theme === 'light'
                    ? 'bg-[#008822]/10 border-[#008822]/30 text-[#007A1E]'
                    : 'bg-[#00FF41]/10 border-[#00FF41]/30 text-[#00FF41]'
                }`}>
                  {book.publisher}
                </span>
                <span className={`font-code text-xs ${
                  theme === 'light' ? 'text-slate-600' : 'text-[#F5F5F5]/70'
                }`}>
                  Published {book.year}
                </span>
              </div>

              <h1 className={`font-black text-3xl md:text-5xl tracking-tight uppercase leading-tight ${
                theme === 'light' ? 'text-slate-900' : 'text-[#F5F5F5]'
              }`}>
                {book.title}
              </h1>

              <p className={`font-body-lg text-base max-w-2xl leading-relaxed font-light ${
                theme === 'light' ? 'text-slate-700' : 'text-[#F5F5F5]/80'
              }`}>
                {book.summary}
              </p>

              {/* Topics */}
              <div className="flex flex-wrap gap-2 pt-2">
                {book.topics.map((topic, i) => (
                  <span
                    key={i}
                    className={`font-code text-[11px] px-2.5 py-1 border ${
                      theme === 'light'
                        ? 'bg-slate-100 border-slate-300 text-slate-700'
                        : 'bg-[#0C0C0C] border-white/10 text-[#F5F5F5]/70'
                    }`}
                  >
                    #{topic}
                  </span>
                ))}
              </div>
            </div>

            {/* Right Spec Card */}
            <div className={`md:col-span-4 border p-6 flex flex-col justify-between gap-6 ${
              theme === 'light' ? 'bg-slate-50 border-slate-300' : 'bg-[#0C0C0C] border-white/10'
            }`}>
              <div className="space-y-3 font-code text-xs">
                <span className={`block font-bold uppercase tracking-wider border-b pb-2 ${
                  theme === 'light' ? 'text-[#008822] border-slate-300' : 'text-[#00FF41] border-white/10'
                }`}>
                  PUBLICATION DATA
                </span>
                <div className="flex justify-between">
                  <span className={theme === 'light' ? 'text-slate-500' : 'text-[#F5F5F5]/50'}>ISBN:</span>
                  <span className={`font-mono font-bold ${theme === 'light' ? 'text-slate-900' : 'text-[#F5F5F5]'}`}>{book.isbn || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className={theme === 'light' ? 'text-slate-500' : 'text-[#F5F5F5]/50'}>Length:</span>
                  <span className={`font-mono font-bold ${theme === 'light' ? 'text-slate-900' : 'text-[#F5F5F5]'}`}>{book.pages ? `${book.pages} pages` : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className={theme === 'light' ? 'text-slate-500' : 'text-[#F5F5F5]/50'}>Format:</span>
                  <span className={`font-mono font-bold ${theme === 'light' ? 'text-slate-900' : 'text-[#F5F5F5]'}`}>Paperback &amp; eBook</span>
                </div>
                <div className="flex justify-between">
                  <span className={theme === 'light' ? 'text-slate-500' : 'text-[#F5F5F5]/50'}>Language:</span>
                  <span className={`font-mono font-bold ${theme === 'light' ? 'text-slate-900' : 'text-[#F5F5F5]'}`}>English</span>
                </div>
              </div>

              {book.url && (
                <a
                  href={book.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full py-3 px-4 font-code text-xs font-bold uppercase tracking-widest text-center transition-colors inline-flex items-center justify-center gap-2 ${
                    theme === 'light'
                      ? 'bg-[#008822] text-white hover:bg-slate-900'
                      : 'bg-[#00FF41] text-[#0C0C0C] hover:bg-[#F5F5F5]'
                  }`}
                >
                  <span>Publisher Catalog</span>
                  <span className="material-symbols-outlined text-sm">open_in_new</span>
                </a>
              )}
            </div>
          </div>
        </section>

        {/* Markdown Content Section */}
        <section className={`border p-8 md:p-12 shadow-xl mb-12 ${
          theme === 'light' ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#141414] border-white/10 text-[#F5F5F5]'
        }`}>
          <div className="prose max-w-none dark:prose-invert">
            <ReactMarkdown
              components={{
                h1: ({ ...props }) => (
                  <h1
                    className={`font-black text-2xl md:text-3xl uppercase tracking-tight mb-6 pb-4 border-b ${
                      theme === 'light' ? 'text-slate-900 border-slate-300' : 'text-[#F5F5F5] border-white/10'
                    }`}
                    {...props}
                  />
                ),
                h2: ({ ...props }) => (
                  <h2
                    className={`font-black text-xl md:text-2xl uppercase tracking-tight mt-8 mb-4 flex items-center gap-2 ${
                      theme === 'light' ? 'text-[#008822]' : 'text-[#00FF41]'
                    }`}
                    {...props}
                  />
                ),
                h3: ({ ...props }) => (
                  <h3
                    className={`font-bold text-lg uppercase tracking-tight mt-6 mb-3 ${
                      theme === 'light' ? 'text-slate-800' : 'text-[#F5F5F5]/90'
                    }`}
                    {...props}
                  />
                ),
                p: ({ ...props }) => (
                  <p
                    className={`font-body-md text-sm md:text-base leading-relaxed mb-4 font-light ${
                      theme === 'light' ? 'text-slate-700' : 'text-[#F5F5F5]/80'
                    }`}
                    {...props}
                  />
                ),
                ul: ({ ...props }) => (
                  <ul className="list-disc list-inside space-y-2 mb-6 font-body-md text-sm pl-2" {...props} />
                ),
                li: ({ ...props }) => (
                  <li
                    className={theme === 'light' ? 'text-slate-700' : 'text-[#F5F5F5]/80'}
                    {...props}
                  />
                ),
                code: ({ className, children, ...props }: React.ComponentPropsWithoutRef<'code'>) => {
                  const isInline = !className;
                  if (isInline) {
                    return (
                      <code
                        className={`font-mono text-xs px-1.5 py-0.5 border ${
                          theme === 'light'
                            ? 'bg-slate-100 border-slate-300 text-[#007A1E]'
                            : 'bg-[#0C0C0C] border-white/20 text-[#00FF41]'
                        }`}
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  }
                  return (
                    <div className="my-6 border overflow-x-auto shadow-inner rounded-xs">
                      <div className={`px-4 py-2 border-b font-code text-[11px] font-bold uppercase tracking-wider flex justify-between ${
                        theme === 'light' ? 'bg-slate-200 border-slate-300 text-slate-700' : 'bg-[#080808] border-white/10 text-[#00FF41]'
                      }`}>
                        <span>Source Snippet</span>
                        <span>TypeScript / React</span>
                      </div>
                      <pre className={`p-4 font-mono text-xs leading-relaxed overflow-x-auto ${
                        theme === 'light' ? 'bg-slate-50 text-slate-900' : 'bg-[#0A0A0A] text-[#00FF41]'
                      }`}>
                        <code {...props}>{children}</code>
                      </pre>
                    </div>
                  );
                },
                hr: () => (
                  <hr className={`my-8 ${theme === 'light' ? 'border-slate-300' : 'border-white/10'}`} />
                ),
                blockquote: ({ ...props }) => (
                  <blockquote
                    className={`border-l-4 pl-4 py-2 my-6 font-mono text-sm italic ${
                      theme === 'light'
                        ? 'border-[#008822] bg-slate-50 text-slate-800'
                        : 'border-[#00FF41] bg-[#0C0C0C] text-[#F5F5F5]/90'
                    }`}
                    {...props}
                  />
                ),
              }}
            >
              {markdownContent}
            </ReactMarkdown>
          </div>
        </section>

        {/* Next / Prev Book Navigation */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t ${
          theme === 'light' ? 'border-slate-300' : 'border-white/10'
        }`}>
          {prevBook ? (
            <button
              onClick={() => onSelectBook && onSelectBook(prevBook.id)}
              className={`border p-5 text-left transition-all group cursor-pointer ${
                theme === 'light'
                  ? 'bg-white border-slate-200 hover:border-[#008822]'
                  : 'bg-[#141414] border-white/10 hover:border-[#00FF41]'
              }`}
            >
              <span className={`font-code text-[10px] uppercase tracking-widest block mb-1 font-bold ${
                theme === 'light' ? 'text-slate-500' : 'text-[#F5F5F5]/50'
              }`}>
                ← PREVIOUS VOLUME
              </span>
              <span className={`font-bold text-sm line-clamp-1 ${
                theme === 'light' ? 'text-slate-900 group-hover:text-[#008822]' : 'text-[#F5F5F5] group-hover:text-[#00FF41]'
              }`}>
                {prevBook.title}
              </span>
            </button>
          ) : <div />}

          {nextBook ? (
            <button
              onClick={() => onSelectBook && onSelectBook(nextBook.id)}
              className={`border p-5 text-right transition-all group cursor-pointer ${
                theme === 'light'
                  ? 'bg-white border-slate-200 hover:border-[#008822]'
                  : 'bg-[#141414] border-white/10 hover:border-[#00FF41]'
              }`}
            >
              <span className={`font-code text-[10px] uppercase tracking-widest block mb-1 font-bold ${
                theme === 'light' ? 'text-slate-500' : 'text-[#F5F5F5]/50'
              }`}>
                NEXT VOLUME →
              </span>
              <span className={`font-bold text-sm line-clamp-1 ${
                theme === 'light' ? 'text-slate-900 group-hover:text-[#008822]' : 'text-[#F5F5F5] group-hover:text-[#00FF41]'
              }`}>
                {nextBook.title}
              </span>
            </button>
          ) : <div />}
        </div>
      </div>
    </div>
  );
};
