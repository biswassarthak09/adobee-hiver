import React, { useEffect, useRef, useState } from 'react';
import { useNavigation } from '../../context/NavigationContext';

export const Header: React.FC = () => {
  const { globalSearchQuery, setGlobalSearchQuery, setCurrentView, isMobileMenuOpen, setIsMobileMenuOpen } = useNavigation();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isDark, setIsDark] = useState<boolean>(() => {
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('hive_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('hive_theme', 'light');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest/90 backdrop-blur-xl border-b border-surface-container-highest/60">
      <div className="h-16 w-full px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left Section: Mobile Toggle & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
            title="Toggle Menu"
          >
            <span className="material-symbols-outlined text-[24px]">
              {isMobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>

          <div 
            className="flex items-center gap-3 cursor-pointer"
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
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-xl mx-auto hidden md:block">
          <div className="relative flex items-center w-full bg-surface-container-low rounded-lg px-3 py-1.5 border border-surface-container-highest/80 focus-within:border-primary transition-all shadow-inner">
            <span className="material-symbols-outlined text-on-surface-variant text-[20px] mr-2">
              search
            </span>
            <input
              ref={searchInputRef}
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
        <div className="flex items-center gap-2 sm:gap-4 justify-end">
          {/* Live Pipeline Telemetry Pill */}
          <div className="hidden xl:flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-lg border border-surface-container-highest/50 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
            <span className="font-mono text-xs text-on-surface-variant">Pipeline:</span>
            <span className="font-mono text-xs text-tertiary font-semibold">Live Analyzer Sync</span>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            <span className="material-symbols-outlined text-[20px]">
              {isDark ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-2.5 pl-1 border-l border-surface-container-highest/60 sm:pl-3">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold text-on-surface leading-tight">
                Recruiting Lead
              </div>
              <div className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">
                Talent Operations
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary border border-primary/40 flex items-center justify-center font-bold text-xs shadow-sm">
              RL
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
