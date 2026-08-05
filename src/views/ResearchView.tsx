import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchBooks, fetchResearchPapers } from '../services/api';
import { PublishedBook, ResearchPaper } from '../types';
import { BookDetailView } from './BookDetailView';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../context/ThemeContext';

export const ResearchView: React.FC = () => {
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'all' | 'books' | 'papers'>('all');
  const [showDissertationModal, setShowDissertationModal] = useState(false);
  const [expandedPaperId, setExpandedPaperId] = useState<string | null>(null);

  const { t } = useLanguage();
  const { theme } = useTheme();

  const { data: books, isLoading: isLoadingBooks } = useQuery<PublishedBook[]>({
    queryKey: ['published-books'],
    queryFn: fetchBooks,
  });

  const { data: papers, isLoading: isLoadingPapers } = useQuery<ResearchPaper[]>({
    queryKey: ['research-papers'],
    queryFn: fetchResearchPapers,
  });

  // Handle hash-based routing for book details (e.g. #book/book-1)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#book/')) {
        const id = hash.replace('#book/', '');
        setSelectedBookId(id);
      } else {
        setSelectedBookId(null);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const openBookPage = (bookId: string) => {
    setSelectedBookId(bookId);
    window.location.hash = `book/${bookId}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeBookPage = () => {
    setSelectedBookId(null);
    if (window.location.hash) {
      window.history.pushState('', document.title, window.location.pathname + window.location.search);
      window.dispatchEvent(new Event('hashchange'));
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectedBook = books?.find((b) => b.id === selectedBookId);

  // If a book is active, render the dedicated BookDetailView route page!
  if (selectedBookId && selectedBook) {
    return (
      <BookDetailView
        book={selectedBook}
        onBack={closeBookPage}
        onSelectBook={openBookPage}
        allBooks={books || []}
      />
    );
  }

  return (
    <div className="blueprint-grid min-h-[calc(100vh-80px)] pt-[100px] pb-16">
      <div className="px-6 max-w-[1120px] mx-auto w-full">
        {/* Main Header */}
        <header className={`mb-12 pt-4 border-b pb-8 ${
          theme === 'light' ? 'border-slate-300' : 'border-white/10'
        }`}>
          <span className={`font-mono text-xs uppercase tracking-[0.25em] font-bold block mb-1 ${
            theme === 'light' ? 'text-[#008822]' : 'text-[#00FF41]'
          }`}>
            {t.research.tag}
          </span>
          <h1 className={`font-black text-4xl md:text-[64px] md:leading-[1.05] tracking-tighter uppercase ${
            theme === 'light' ? 'text-slate-900' : 'text-[#F5F5F5]'
          }`}>
            {t.research.title}
          </h1>
          <p className={`font-code text-sm mt-3 max-w-2xl marker-line pl-6 ${
            theme === 'light' ? 'text-slate-700' : 'text-[#F5F5F5]/70'
          }`}>
            {t.research.subtitle}
          </p>

          {/* Section Filter Tabs */}
          <div className="flex flex-wrap items-center gap-3 mt-8">
            <span className={`font-code text-xs uppercase tracking-wider font-bold mr-2 ${
              theme === 'light' ? 'text-slate-500' : 'text-[#F5F5F5]/50'
            }`}>
              View Category:
            </span>
            <button
              onClick={() => setActiveSection('all')}
              className={`font-code text-xs px-4 py-2 uppercase tracking-wider font-bold border transition-colors cursor-pointer ${
                activeSection === 'all'
                  ? theme === 'light'
                    ? 'bg-[#008822] text-white border-[#008822]'
                    : 'bg-[#00FF41] text-[#0C0C0C] border-[#00FF41]'
                  : theme === 'light'
                    ? 'bg-white text-slate-700 border-slate-300 hover:border-[#008822]'
                    : 'bg-[#141414] text-[#F5F5F5]/70 border-white/20 hover:border-[#00FF41]'
              }`}
            >
              All Works ({ (books?.length || 0) + (papers?.length || 0) })
            </button>

            <button
              onClick={() => setActiveSection('books')}
              className={`font-code text-xs px-4 py-2 uppercase tracking-wider font-bold border transition-colors cursor-pointer flex items-center gap-2 ${
                activeSection === 'books'
                  ? theme === 'light'
                    ? 'bg-[#008822] text-white border-[#008822]'
                    : 'bg-[#00FF41] text-[#0C0C0C] border-[#00FF41]'
                  : theme === 'light'
                    ? 'bg-white text-slate-700 border-slate-300 hover:border-[#008822]'
                    : 'bg-[#141414] text-[#F5F5F5]/70 border-white/20 hover:border-[#00FF41]'
              }`}
            >
              <span className="material-symbols-outlined text-base">book</span>
              <span>Books ({books?.length || 4})</span>
            </button>

            <button
              onClick={() => setActiveSection('papers')}
              className={`font-code text-xs px-4 py-2 uppercase tracking-wider font-bold border transition-colors cursor-pointer flex items-center gap-2 ${
                activeSection === 'papers'
                  ? theme === 'light'
                    ? 'bg-[#008822] text-white border-[#008822]'
                    : 'bg-[#00FF41] text-[#0C0C0C] border-[#00FF41]'
                  : theme === 'light'
                    ? 'bg-white text-slate-700 border-slate-300 hover:border-[#008822]'
                    : 'bg-[#141414] text-[#F5F5F5]/70 border-white/20 hover:border-[#00FF41]'
              }`}
            >
              <span className="material-symbols-outlined text-base">article</span>
              <span>Research Papers ({papers?.length || 15})</span>
            </button>
          </div>
        </header>

        {/* PhD Academic Degree Overview */}
        <section className={`border p-8 mb-12 relative overflow-hidden shadow-xl ${
          theme === 'light'
            ? 'bg-white border-slate-200 text-slate-900'
            : 'bg-[#141414] border-white/10 text-[#F5F5F5]'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-8 space-y-3">
              <span className={`font-code text-xs uppercase tracking-widest font-bold block ${
                theme === 'light' ? 'text-[#008822]' : 'text-[#00FF41]'
              }`}>
                {t.research.phdDegree} • {t.research.period}
              </span>
              <h2 className={`font-black text-2xl md:text-3xl tracking-tight uppercase ${
                theme === 'light' ? 'text-slate-900' : 'text-[#F5F5F5]'
              }`}>
                {t.research.institution}
              </h2>
              <p className={`font-body-md text-sm leading-relaxed font-light ${
                theme === 'light' ? 'text-slate-700' : 'text-[#F5F5F5]/80'
              }`}>
                {t.research.phdDesc}
              </p>
            </div>

            <div className="md:col-span-4 flex flex-col gap-3">
              <button
                onClick={() => setShowDissertationModal(true)}
                className={`w-full py-3 px-4 font-code text-xs font-bold uppercase tracking-widest border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  theme === 'light'
                    ? 'bg-[#008822] text-white border-[#008822] hover:bg-slate-900'
                    : 'bg-[#00FF41] text-[#0C0C0C] border-[#00FF41] hover:bg-[#F5F5F5]'
                }`}
              >
                <span>{t.research.viewDissertation}</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 1: PUBLISHED BOOKS */}
        {(activeSection === 'all' || activeSection === 'books') && (
          <section className="mb-16">
            <div className={`flex items-end justify-between mb-6 border-b pb-3 ${
              theme === 'light' ? 'border-slate-300' : 'border-white/10'
            }`}>
              <div>
                <span className={`font-code text-xs uppercase tracking-widest font-bold block mb-1 ${
                  theme === 'light' ? 'text-[#008822]' : 'text-[#00FF41]'
                }`}>
                  SECTION 01
                </span>
                <h2 className={`font-black text-2xl md:text-3xl uppercase tracking-tight ${
                  theme === 'light' ? 'text-slate-900' : 'text-[#F5F5F5]'
                }`}>
                  Published Books
                </h2>
              </div>
              <span className={`font-code text-xs uppercase tracking-widest font-bold border px-3 py-1 ${
                theme === 'light'
                  ? 'bg-[#008822]/10 border-[#008822]/30 text-[#007A1E]'
                  : 'bg-[#00FF41]/10 border-[#00FF41]/30 text-[#00FF41]'
              }`}>
                04 VOLUMES
              </span>
            </div>

            {isLoadingBooks ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className={`border h-72 animate-pulse ${
                    theme === 'light' ? 'bg-slate-200 border-slate-300' : 'bg-[#141414] border-white/10'
                  }`}></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                {books?.map((book) => (
                  <article
                    key={book.id}
                    onClick={() => openBookPage(book.id)}
                    className={`border p-6 transition-all duration-300 flex flex-col justify-between group cursor-pointer shadow-lg relative overflow-hidden ${
                      theme === 'light'
                        ? 'bg-white border-slate-200 hover:border-[#008822]'
                        : 'bg-[#141414] border-white/10 hover:border-[#00FF41]'
                    }`}
                  >
                    <div className={`absolute top-0 left-0 w-1 h-full transform origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-300 ${
                      theme === 'light' ? 'bg-[#008822]' : 'bg-[#00FF41]'
                    }`}></div>

                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className={`font-code text-[11px] uppercase font-bold tracking-wider px-2 py-0.5 border ${
                          theme === 'light'
                            ? 'bg-slate-100 border-slate-300 text-[#007A1E]'
                            : 'bg-[#0C0C0C] border-white/20 text-[#00FF41]'
                        }`}>
                          {book.publisher}
                        </span>
                        <span className={`font-code text-xs font-bold ${
                          theme === 'light' ? 'text-slate-600' : 'text-[#F5F5F5]/60'
                        }`}>
                          {book.year}
                        </span>
                      </div>

                      <h3 className={`font-black text-xl leading-snug tracking-tight mb-3 transition-colors ${
                        theme === 'light'
                          ? 'text-slate-900 group-hover:text-[#008822]'
                          : 'text-[#F5F5F5] group-hover:text-[#00FF41]'
                      }`}>
                        {book.title}
                      </h3>

                      <p className={`font-body-md text-xs leading-relaxed line-clamp-3 mb-4 font-light ${
                        theme === 'light' ? 'text-slate-600' : 'text-[#F5F5F5]/70'
                      }`}>
                        {book.summary}
                      </p>

                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {book.topics.slice(0, 3).map((topic, idx) => (
                          <span
                            key={idx}
                            className={`font-code text-[10px] px-2 py-0.5 border ${
                              theme === 'light'
                                ? 'bg-slate-50 border-slate-200 text-slate-600'
                                : 'bg-[#0C0C0C] border-white/10 text-[#F5F5F5]/60'
                            }`}
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className={`flex items-center justify-between pt-4 border-t ${
                      theme === 'light' ? 'border-slate-200' : 'border-white/10'
                    }`}>
                      <span className={`font-code text-xs font-bold flex items-center gap-1.5 ${
                        theme === 'light' ? 'text-[#008822]' : 'text-[#00FF41]'
                      }`}>
                        <span>Read Full Page &amp; MD</span>
                        <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                          arrow_forward
                        </span>
                      </span>

                      <span className={`font-code text-[11px] ${
                        theme === 'light' ? 'text-slate-500' : 'text-[#F5F5F5]/50'
                      }`}>
                        {book.pages ? `${book.pages} pages` : 'Book Route'}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {/* SECTION 2: RESEARCH PAPERS */}
        {(activeSection === 'all' || activeSection === 'papers') && (
          <section className="mb-12">
            <div className={`flex items-end justify-between mb-6 border-b pb-3 ${
              theme === 'light' ? 'border-slate-300' : 'border-white/10'
            }`}>
              <div>
                <span className={`font-code text-xs uppercase tracking-widest font-bold block mb-1 ${
                  theme === 'light' ? 'text-[#008822]' : 'text-[#00FF41]'
                }`}>
                  SECTION 02
                </span>
                <h2 className={`font-black text-2xl md:text-3xl uppercase tracking-tight ${
                  theme === 'light' ? 'text-slate-900' : 'text-[#F5F5F5]'
                }`}>
                  Peer-Reviewed Research Papers
                </h2>
              </div>
              <span className={`font-code text-xs uppercase tracking-widest font-bold border px-3 py-1 ${
                theme === 'light'
                  ? 'bg-[#008822]/10 border-[#008822]/30 text-[#007A1E]'
                  : 'bg-[#00FF41]/10 border-[#00FF41]/30 text-[#00FF41]'
              }`}>
                {papers?.length || 15} PAPERS
              </span>
            </div>

            {isLoadingPapers ? (
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className={`border h-32 animate-pulse ${
                    theme === 'light' ? 'bg-slate-200 border-slate-300' : 'bg-[#141414] border-white/10'
                  }`}></div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {papers?.map((paper) => {
                  const isExpanded = expandedPaperId === paper.id;
                  return (
                    <article
                      key={paper.id}
                      className={`border p-6 transition-all duration-300 shadow-md ${
                        theme === 'light'
                          ? 'bg-white border-slate-200 hover:border-slate-400'
                          : 'bg-[#141414] border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="space-y-2 flex-grow">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`font-code text-[10px] font-bold uppercase tracking-wider border px-2 py-0.5 ${
                              theme === 'light'
                                ? 'bg-slate-100 border-slate-300 text-[#008822]'
                                : 'bg-[#0C0C0C] border-white/20 text-[#00FF41]'
                            }`}>
                              {paper.journal}
                            </span>
                            <span className={`font-code text-xs font-bold ${
                              theme === 'light' ? 'text-slate-600' : 'text-[#F5F5F5]/60'
                            }`}>
                              {paper.year}
                            </span>
                            {paper.citations && (
                              <span className={`font-code text-[10px] border px-2 py-0.5 font-bold ${
                                theme === 'light'
                                  ? 'bg-[#008822]/10 border-[#008822]/30 text-[#007A1E]'
                                  : 'bg-[#00FF41]/10 border-[#00FF41]/30 text-[#00FF41]'
                              }`}>
                                {paper.citations} Citations
                              </span>
                            )}
                          </div>

                          <h3 className={`font-black text-lg md:text-xl leading-snug tracking-tight ${
                            theme === 'light' ? 'text-slate-900' : 'text-[#F5F5F5]'
                          }`}>
                            {paper.title}
                          </h3>

                          <p className={`font-code text-xs ${
                            theme === 'light' ? 'text-slate-600' : 'text-[#F5F5F5]/60'
                          }`}>
                            Authors: <span className="font-bold">{paper.authors.join(', ')}</span>
                          </p>

                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {paper.topics.map((t, idx) => (
                              <span
                                key={idx}
                                className={`font-code text-[10px] px-2 py-0.5 border ${
                                  theme === 'light'
                                    ? 'bg-slate-50 border-slate-200 text-slate-600'
                                    : 'bg-[#0C0C0C] border-white/10 text-[#F5F5F5]/60'
                                }`}
                              >
                                #{t}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-row md:flex-col gap-2 shrink-0 justify-end">
                          <button
                            onClick={() => setExpandedPaperId(isExpanded ? null : paper.id)}
                            className={`px-3 py-1.5 font-code text-xs uppercase tracking-wider font-bold border transition-colors cursor-pointer flex items-center gap-1 ${
                              theme === 'light'
                                ? 'bg-slate-100 border-slate-300 text-slate-800 hover:border-[#008822]'
                                : 'bg-[#0C0C0C] border-white/20 text-[#F5F5F5] hover:border-[#00FF41]'
                            }`}
                          >
                            <span>{isExpanded ? 'Hide Abstract' : 'View Abstract'}</span>
                            <span className="material-symbols-outlined text-xs">
                              {isExpanded ? 'expand_less' : 'expand_more'}
                            </span>
                          </button>

                          {paper.url && (
                            <a
                              href={paper.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`px-3 py-1.5 font-code text-xs uppercase tracking-wider font-bold border transition-colors text-center inline-flex items-center justify-center gap-1 ${
                                theme === 'light'
                                  ? 'bg-[#008822]/10 border-[#008822]/40 text-[#007A1E] hover:bg-[#008822] hover:text-white'
                                  : 'bg-[#00FF41]/10 border-[#00FF41]/40 text-[#00FF41] hover:bg-[#00FF41] hover:text-[#0C0C0C]'
                              }`}
                            >
                              <span>DOI Link</span>
                              <span className="material-symbols-outlined text-xs">north_east</span>
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Expandable Abstract Drawer */}
                      {isExpanded && (
                        <div className={`mt-4 pt-4 border-t space-y-2 animate-fadeIn ${
                          theme === 'light' ? 'border-slate-200' : 'border-white/10'
                        }`}>
                          <span className={`font-code text-[10px] font-bold uppercase tracking-widest block ${
                            theme === 'light' ? 'text-[#008822]' : 'text-[#00FF41]'
                          }`}>
                            ABSTRACT &amp; METHODOLOGY
                          </span>
                          <p className={`font-body-md text-sm leading-relaxed font-light ${
                            theme === 'light' ? 'text-slate-700' : 'text-[#F5F5F5]/80'
                          }`}>
                            {paper.abstract}
                          </p>
                          {paper.doi && (
                            <p className={`font-code text-xs ${
                              theme === 'light' ? 'text-slate-500' : 'text-[#F5F5F5]/50'
                            }`}>
                              Digital Object Identifier: <strong className={theme === 'light' ? 'text-slate-900' : 'text-[#F5F5F5]'}>{paper.doi}</strong>
                            </p>
                          )}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </div>

      {/* Dissertation Modal */}
      {showDissertationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className={`border w-full max-w-xl p-6 md:p-8 relative shadow-2xl ${
            theme === 'light'
              ? 'bg-white border-slate-300 text-slate-900'
              : 'bg-[#141414] border-[#00FF41]/40 text-[#F5F5F5]'
          }`}>
            <button
              onClick={() => setShowDissertationModal(false)}
              className={`absolute top-4 right-4 p-1 cursor-pointer ${
                theme === 'light' ? 'text-slate-500 hover:text-[#008822]' : 'text-[#F5F5F5]/60 hover:text-[#00FF41]'
              }`}
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>

            <span className={`font-code text-xs uppercase tracking-widest font-bold block mb-1 ${
              theme === 'light' ? 'text-[#008822]' : 'text-[#00FF41]'
            }`}>
              PhD DISSERTATION • WESTERN NORWAY UNIVERSITY (HVL)
            </span>
            <h3 className={`font-black text-2xl mb-3 tracking-tight ${
              theme === 'light' ? 'text-slate-900' : 'text-[#F5F5F5]'
            }`}>
              A Software Framework for Adaptive and Interoperable Internet-Delivered Psychological Treatments
            </h3>
            
            <div className="space-y-4 my-4">
              <p className={`font-body-md text-sm leading-relaxed font-light ${
                theme === 'light' ? 'text-slate-700' : 'text-[#F5F5F5]/80'
              }`}>
                This study used Model-based Software Engineering (MBSE), design thinking, and AI approaches to create adaptive and interoperable Internet-Delivered Psychological Treatments (IDPT) systems.
              </p>

              <div className={`border p-4 text-xs font-code space-y-2 ${
                theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#0C0C0C] border-white/10'
              }`}>
                <div className="flex justify-between">
                  <span className={theme === 'light' ? 'text-slate-500' : 'text-[#F5F5F5]/50'}>Doctorate (2018–2021):</span>
                  <span className={`font-bold ${theme === 'light' ? 'text-slate-900' : 'text-[#F5F5F5]'}`}>PhD in Software Engineering (HVL, Norway)</span>
                </div>
                <div className="flex justify-between">
                  <span className={theme === 'light' ? 'text-slate-500' : 'text-[#F5F5F5]/50'}>Award Date:</span>
                  <span className={`font-bold ${theme === 'light' ? 'text-[#008822]' : 'text-[#00FF41]'}`}>Conferred 21st September, 2021</span>
                </div>
                <div className="flex justify-between">
                  <span className={theme === 'light' ? 'text-slate-500' : 'text-[#F5F5F5]/50'}>Master Degree (2014–2016):</span>
                  <span className={`font-bold ${theme === 'light' ? 'text-slate-900' : 'text-[#F5F5F5]'}`}>M.S. in Info Systems (NTNU, Norway)</span>
                </div>
                <div className="flex justify-between">
                  <span className={theme === 'light' ? 'text-slate-500' : 'text-[#F5F5F5]/50'}>Master Thesis:</span>
                  <span className={`font-bold ${theme === 'light' ? 'text-slate-900' : 'text-[#F5F5F5]'}`}>Predicting The Next Click With Web Log Process Mining</span>
                </div>
                <div className="flex justify-between">
                  <span className={theme === 'light' ? 'text-slate-500' : 'text-[#F5F5F5]/50'}>Bachelor Degree (2008–2013):</span>
                  <span className={`font-bold ${theme === 'light' ? 'text-slate-900' : 'text-[#F5F5F5]'}`}>B.S. CSIT (Kathford, 91.6% - Vice-Chancellor's Award)</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowDissertationModal(false)}
              className={`w-full font-bold py-3 font-code text-xs uppercase tracking-widest transition-colors cursor-pointer ${
                theme === 'light'
                  ? 'bg-[#008822] text-white hover:bg-slate-900'
                  : 'bg-[#00FF41] text-[#0C0C0C] hover:bg-[#F5F5F5]'
              }`}
            >
              {t.modal.closeDissertation}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
