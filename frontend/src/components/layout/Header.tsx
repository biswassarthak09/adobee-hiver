import React from 'react';
import { useNavigation } from '../../context/NavigationContext';

export const Header: React.FC = () => {
  const { globalSearchQuery, setGlobalSearchQuery, setCurrentView } = useNavigation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest/90 backdrop-blur-xl border-b border-surface-container-highest/60">
      <div className="h-16 w-full px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Brand Section */}
        <div 
          className="flex items-center gap-3 min-w-[240px] cursor-pointer"
          onClick={() => setCurrentView('job-postings')}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-amber-600 flex items-center justify-center text-on-primary font-bold shadow-md shadow-amber-500/20">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-headline text-lg font-bold text-primary tracking-tight leading-none">
              adobee hive
            </span>
            <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mt-1">
              Talent Intelligence
            </span>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-xl mx-auto hidden md:block">
          <div className="relative flex items-center w-full bg-surface-container-low rounded-lg px-3 py-1.5 border border-surface-container-highest/80 focus-within:border-primary transition-all shadow-inner">
            <span className="material-symbols-outlined text-on-surface-variant text-[20px] mr-2">
              search
            </span>
            <input
              type="text"
              value={globalSearchQuery}
              onChange={(e) => setGlobalSearchQuery(e.target.value)}
              placeholder="Search candidates, requisitions, skill clusters... (Press ⌘K)"
              className="w-full bg-transparent text-on-surface placeholder:text-on-surface-variant/60 text-sm focus:outline-none"
            />
            <span className="font-mono text-xs text-on-surface-variant bg-surface-container-high px-1.5 py-0.5 rounded border border-white/5">
              ⌘K
            </span>
          </div>
        </div>

        {/* Header Right Cluster */}
        <div className="flex items-center gap-3 sm:gap-5 justify-end">
          {/* Live Pipeline Telemetry Pill */}
          <div className="hidden xl:flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-lg border border-surface-container-highest/50 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
            <span className="font-mono text-xs text-on-surface-variant">Pipeline Live:</span>
            <span className="font-mono text-xs text-tertiary font-semibold">98.4% Match Index</span>
          </div>

          {/* Notifications Button */}
          <div className="relative flex items-center">
            <button 
              className="flex items-center justify-center p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
              title="Alerts & Telemetry"
            >
              <span className="material-symbols-outlined text-[22px]">notifications</span>
            </button>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary ring-2 ring-surface-container-lowest" />
          </div>

          <div className="h-6 w-px bg-surface-container-highest hidden sm:block" />

          {/* User Profile */}
          <div className="flex items-center gap-2.5 pl-1">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold text-on-surface leading-tight">
                Sarah Jenkins
              </div>
              <div className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">
                VP Talent Acquisition
              </div>
            </div>
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDlAQmWCanKos7ZkB5WRtCe2HdjzWmAx5zMaUKQuwwMu2FZp3kfcV42JwhSOaWL4pdrmi6sy7L63bvLTGOom6KTYt4Iba3ApR5wgnSPa-XpbtE1RET1HQ1BwkkC7z1B8N-odxsQ397JK1urDa_9s0V2kRVA7TXCRG4RZ_4DJDZLkpbkNSteT9prqDmndA2ilomj1XvDA9FPaX86_8mivFBoSMlnNfhxLn88kuuaCjDe"
              alt="Sarah Jenkins"
              className="w-8 h-8 rounded-full object-cover ring-1 ring-primary/40 shadow-sm"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
