'use client';

import React from 'react';

export type TabId = 'home' | 'study' | 'stats' | 'settings';

interface BottomNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
  {
    id: 'home',
    label: 'Quiz',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.12 5.6-1.12 6.772 0 1.171 1.12 1.171 3.092 0 4.212-1.172 1.12-5.6 1.12-6.772 0-1.171-1.12-1.171-3.092 0-4.212Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 15.25c1.5 1 4.5 1 6 0" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.386-1.591 1.591M3 12h2.25m.386-6.364 1.591 1.591" />
      </svg>
    ),
  },
  {
    id: 'study',
    label: 'Study',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.961 8.961 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
  {
    id: 'stats',
    label: 'Stats',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25C6.996 12 7.5 12.504 7.5 13.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25C3.504 21 3 20.496 3 19.875v-6.75Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25c-.621 0-1.125-.504-1.125-1.125V8.625Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25c-.621 0-1.125-.504-1.125-1.125V4.125Z" />
      </svg>
    ),
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.334.272.616.553.81l1.078.744c.3.207.673.252.994.095l1.176-.577c.5-.257 1.104-.137 1.452.324l.82 1.197c.311.454.26 1.088-.153 1.404l-.97 1.077c-.293.21-.486.508-.553.81l-.213 1.282c-.09.542-.56.94-1.11.94h-2.593c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.334-.272-.616-.553-.81l-1.078-.744c-.3-.207-.673-.252-.994-.095l-1.176.577c-.5.257-1.104.137-1.452-.324l-.82-1.197c-.311-.454-.26-1.088.153-1.404l.97-1.077c.293-.21.486-.508.553-.81l.213-1.282Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      </svg>
    ),
  },
];

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--card-border)] bg-[var(--background)]/95 backdrop-blur-xl"
      role="tablist"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto h-16 px-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={`tap-target flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-lg transition-all duration-200 relative ${
                isActive
                  ? 'text-gold'
                  : 'text-[var(--muted)] hover:text-foreground'
              }`}
            >
              <span className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'scale-100'}`}>
                {tab.icon}
              </span>
              <span className={`text-[10px] font-medium tracking-wide ${isActive ? 'text-gold' : ''}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gold rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
