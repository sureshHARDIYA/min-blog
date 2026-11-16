'use client';

import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getNavTabFromPath, NavTab } from './types';
import type { BlogPostSummary } from './components/BlogPostCard';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomeView } from './views/home/HomeView';
import { TrajectoryView } from './views/TrajectoryView';
import { ResearchView } from './views/ResearchView';
import { StackView } from './views/StackView';
import { ConnectView } from './views/ConnectView';
import { useTheme } from './context/ThemeContext';

const TAB_META: Record<NavTab, { title: string; description: string }> = {
  architecture: {
    title: 'Suresh Kumar Mukhiya, PhD | AppSec & Architecture',
    description: 'Cybersecurity and software architecture field notes from Suresh Kumar Mukhiya, a Tech Lead in Bergen working with secure APIs, cloud systems and AI.',
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
  latestPosts?: BlogPostSummary[];
}

const MainLayout: React.FC<AppProps> = ({
  initialTab = 'architecture',
  latestPosts = [],
}) => {
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
        return (
<HomeView latestPosts={latestPosts} />
        );
      case 'trajectory':
        return <TrajectoryView />;
      case 'research':
        return <ResearchView />;
      case 'stack':
        return <StackView />;
      case 'connect':
        return <ConnectView />;
      default:
        return (
<HomeView latestPosts={latestPosts} />
        );
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
      <Footer />
    </div>
  );
};

export default function App({
  initialTab = 'architecture',
  latestPosts = [],
}: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <MainLayout
        initialTab={initialTab}
        latestPosts={latestPosts}
      />
    </QueryClientProvider>
  );
}
