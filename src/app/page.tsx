'use client';

import React, { useState, useCallback } from 'react';
import BottomNav, { type TabId } from '@/components/BottomNav';
import Home from '@/components/Home';
import QuizSetup, { type QuizConfig } from '@/components/QuizSetup';
import Quiz from '@/components/Quiz';
import StudyMode from '@/components/StudyMode';
import Stats from '@/components/Stats';
import Settings from '@/components/Settings';

type View =
  | { id: 'home' }
  | { id: 'quizSetup'; type: 'radical' | 'word' | 'grammar' }
  | { id: 'quiz'; config: QuizConfig }
  | { id: 'study'; type: 'radical' | 'word' | 'grammar' }
  | { id: 'stats' }
  | { id: 'settings' };

export default function AppShell() {
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [view, setView] = useState<View>({ id: 'home' });

  const handleTabChange = useCallback((tab: TabId) => {
    setActiveTab(tab);
    if (tab === 'home') setView({ id: 'home' });
    else if (tab === 'study') setView({ id: 'study', type: 'word' });
    else if (tab === 'stats') setView({ id: 'stats' });
    else if (tab === 'settings') setView({ id: 'settings' });
  }, []);

  const handleStartQuiz = useCallback((type: 'radical' | 'word' | 'grammar') => {
    setView({ id: 'quizSetup', type });
  }, []);

  const handleQuizStart = useCallback((config: QuizConfig) => {
    setView({ id: 'quiz', config });
  }, []);

  const handleQuizFinish = useCallback((_results: { correct: number; total: number }) => {
    setView({ id: 'home' });
    setActiveTab('home');
  }, []);

  const handleBack = useCallback(() => {
    setView({ id: 'home' });
    setActiveTab('home');
  }, []);

  return (
    <div className="flex flex-col min-h-dvh">
      <main className="flex-1">
        {view.id === 'home' && (
          <Home onStartQuiz={handleStartQuiz} />
        )}

        {view.id === 'quizSetup' && (
          <QuizSetup
            initialType={view.type}
            onStart={handleQuizStart}
            onBack={handleBack}
          />
        )}

        {view.id === 'quiz' && (
          <Quiz
            config={view.config}
            onFinish={handleQuizFinish}
            onBack={handleBack}
          />
        )}

        {view.id === 'study' && (
          <StudyMode
            type={view.type}
            onBack={handleBack}
            onStartQuiz={handleStartQuiz}
          />
        )}

        {view.id === 'stats' && <Stats />}
        {view.id === 'settings' && <Settings />}
      </main>

      {/* Bottom nav — hide during active quiz */}
      {view.id !== 'quiz' && (
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      )}
    </div>
  );
}
