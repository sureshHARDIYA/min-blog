import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavTab } from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ArchitectureView } from './views/ArchitectureView';
import { TrajectoryView } from './views/TrajectoryView';
import { ResearchView } from './views/ResearchView';
import { StackView } from './views/StackView';
import { ConnectView } from './views/ConnectView';
import { LanguageProvider } from './i18n/LanguageContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

const MainLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('architecture');
  const { theme } = useTheme();

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

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <QueryClientProvider client={queryClient}>
          <MainLayout />
        </QueryClientProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
