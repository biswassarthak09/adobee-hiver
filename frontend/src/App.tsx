import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { JobPostingsView } from './components/jobPostings/JobPostingsView';
import { CandidatePoolView } from './components/candidatePool/CandidatePoolView';
import { DossierView } from './components/dossier/DossierView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { SettingsView } from './components/settings/SettingsView';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    },
  },
});

const MainContent: React.FC = () => {
  const { currentView } = useNavigation();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar />
      <main className="pl-64 pt-16">
        {currentView === 'job-postings' && <JobPostingsView />}
        {currentView === 'candidate-search' && <CandidatePoolView />}
        {currentView === 'candidate-dossier' && <DossierView />}
        {currentView === 'analytics-pipelines' && <AnalyticsView />}
        {currentView === 'settings-team' && <SettingsView />}
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationProvider>
        <MainContent />
      </NavigationProvider>
    </QueryClientProvider>
  );
};

export default App;
