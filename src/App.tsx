'use client';

import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getNavTabFromPath, NavTab } from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ArchitectureView } from './views/ArchitectureView';
import { TrajectoryView } from './views/TrajectoryView';
import { ResearchView } from './views/ResearchView';
import { StackView } from './views/StackView';
import { ConnectView } from './views/ConnectView';
import { LanguageProvider } from './i18n/LanguageContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';

const TAB_META: Record<NavTab, { title: string; description: string }> = {
  architecture: {
    title: 'Suresh Kumar Mukhiya, PhD | System Architect, Cybersecurity & AI',
    description: 'Suresh Kumar Mukhiya, PhD: adaptive systems, scalable architecture, cybersecurity, AI, and technical leadership in Norway.',
  },
  trajectory: {
    title: 'Trajectory | Suresh Kumar Mukhiya, PhD',
    description: 'Career timeline and engineering leadership trajectory for Suresh Kumar Mukhiya, PhD.',
  },
  research: {
    title: 'Research & PhD Thesis | Suresh Kumar Mukhiya, PhD',
    description: 'Research publications, books, and PhD thesis by Suresh Kumar Mukhiya on adaptive systems, interoperability, health informatics, and software engineering.',
  },
  stack: {
    title: 'Technology Stack | Suresh Kumar Mukhiya, PhD',
    description: 'Production technology stack across frontend, backend, cloud, security, AI, data systems, and software architecture.',
  },
  connect: {
    title: 'Contact | Suresh Kumar Mukhiya, PhD',
    description: 'Contact Suresh Kumar Mukhiya for architecture, cybersecurity, AI engineering, and technical leadership collaboration.',
  },
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

interface AppProps {
  initialTab?: NavTab;
}

const MainLayout: React.FC<AppProps> = ({ initialTab = 'architecture' }) => {
  const [activeTab, setActiveTab] = useState<NavTab>(initialTab);
  const { theme } = useTheme();

  useEffect(() => {
    const handleRouteChange = () => {
      setActiveTab(getNavTabFromPath(window.location.pathname));
    };

    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  useEffect(() => {
    const meta = TAB_META[activeTab];
    document.title = meta.title;

    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (description) {
      description.content = meta.description;
    }
  }, [activeTab]);

  const renderCurrentView = () => {
    switch (activeTab) {
      case 'architecture':
        return <ArchitectureView setActiveTab={setActiveTab} />;
      case 'trajectory':
        return <TrajectoryView />;
      case 'research':
        return <ResearchView />;
      case 'stack':
        return <StackView />;
      case 'connect':
        return <ConnectView />;
      default:
        return <ArchitectureView setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      theme === 'light'
        ? 'bg-[#F4F6F8] text-[#0F172A]'
        : 'bg-[#0C0C0C] text-[#F5F5F5]'
    }`}>
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-grow pt-16 md:pt-20">
        {renderCurrentView()}
      </main>
      <Footer setActiveTab={setActiveTab} />
    </div>
  );
};

export default function App({ initialTab = 'architecture' }: AppProps) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <QueryClientProvider client={queryClient}>
          <MainLayout initialTab={initialTab} />
        </QueryClientProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
