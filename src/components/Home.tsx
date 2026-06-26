'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface HomeProps {
  onStartQuiz: (type: 'radical' | 'word' | 'grammar') => void;
}

interface StatsData {
  dueToday: number;
  dueRadicals: number;
  dueWords: number;
  dueGrammar: number;
  currentStreak: number;
  lastStudyDate: string | null;
  masteryPercent: number;
  totalQuestions: number;
  overallAccuracy: number;
}

export default function Home({ onStartQuiz }: HomeProps) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {
      // Graceful fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const dueCount = stats?.dueToday ?? 0;
  const streak = stats?.currentStreak ?? 0;
  const today = new Date().toISOString().split('T')[0];
  const studiedToday = stats?.lastStudyDate === today;

  return (
    <div className="px-4 pt-6 pb-24 space-y-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="animate-fade-up">
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="gold-text">HSK-4</span> Study
        </h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          Master Chinese, one card at a time
        </p>
      </div>

      {/* Streak Banner */}
      {!studiedToday && !loading && (
        <div className="animate-fade-up animate-gold-shift card p-4 flex items-center gap-3 border-gold/30">
          <span className="text-2xl">🔥</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gold">Keep your streak going!</p>
            <p className="text-xs text-[var(--muted)]">Study today to maintain your progress</p>
          </div>
        </div>
      )}

      {/* Due Cards Hero */}
      <div className="animate-fade-up card p-6 text-center">
        {loading ? (
          <div className="space-y-3">
            <div className="h-12 w-20 mx-auto bg-[var(--muted-bg)] rounded animate-pulse" />
            <div className="h-4 w-32 mx-auto bg-[var(--muted-bg)] rounded animate-pulse" />
          </div>
        ) : (
          <>
            <p className="text-xs uppercase tracking-widest text-[var(--muted)] mb-2">Due for Review</p>
            <p className={`text-5xl font-bold tabular-nums ${dueCount > 0 ? 'text-gold' : 'text-foreground'}`}>
              {dueCount}
            </p>
            <p className="text-sm text-[var(--muted)] mt-1">
              {dueCount === 0 ? 'All caught up! 🎉' : dueCount === 1 ? 'card waiting' : 'cards waiting'}
            </p>
            {dueCount > 0 && (
              <button
                onClick={() => onStartQuiz('word')}
                className="mt-4 px-6 py-2.5 bg-gold text-black font-semibold text-sm rounded-lg hover:bg-gold2 transition-colors tap-target"
              >
                Start Review
              </button>
            )}
          </>
        )}
      </div>

      {/* Stats Row */}
      <div className="animate-fade-up flex gap-3">
        <div className="card flex-1 p-4 text-center">
          <p className="text-xs uppercase tracking-wider text-[var(--muted)]">Streak</p>
          <p className="text-2xl font-bold mt-1">
            {streak > 0 ? (
              <><span className="text-gold">{streak}</span><span className="text-lg ml-1">🔥</span></>
            ) : (
              <span className="text-[var(--muted)]">0</span>
            )}
          </p>
        </div>
        <div className="card flex-1 p-4 text-center">
          <p className="text-xs uppercase tracking-wider text-[var(--muted)]">Mastery</p>
          <p className="text-2xl font-bold mt-1 tabular-nums">
            {stats ? `${Math.round(stats.masteryPercent * 100)}%` : '—'}
          </p>
        </div>
        <div className="card flex-1 p-4 text-center">
          <p className="text-xs uppercase tracking-wider text-[var(--muted)]">Accuracy</p>
          <p className="text-2xl font-bold mt-1 tabular-nums">
            {stats ? `${Math.round(stats.overallAccuracy * 100)}%` : '—'}
          </p>
        </div>
      </div>

      {/* Quick-Start Buttons */}
      <div className="animate-fade-up space-y-2">
        <p className="text-xs uppercase tracking-widest text-[var(--muted)] mb-2">Quick Start</p>
        <div className="grid grid-cols-2 gap-2">
          <QuickButton emoji="📚" label="Daily Review" subtitle={`${dueCount} due`} onClick={() => onStartQuiz('word')} accent={dueCount > 0} />
          <QuickButton emoji="部" label="Radicals Quiz" subtitle={`${stats?.dueRadicals ?? 0} due`} onClick={() => onStartQuiz('radical')} accent={(stats?.dueRadicals ?? 0) > 0} />
          <QuickButton emoji="词" label="Words Quiz" subtitle={`${stats?.dueWords ?? 0} due`} onClick={() => onStartQuiz('word')} accent={(stats?.dueWords ?? 0) > 0} />
          <QuickButton emoji="句" label="Grammar Drill" subtitle={`${stats?.dueGrammar ?? 0} due`} onClick={() => onStartQuiz('grammar')} accent={(stats?.dueGrammar ?? 0) > 0} />
        </div>
      </div>
    </div>
  );
}

function QuickButton({ emoji, label, subtitle, onClick, accent }: { emoji: string; label: string; subtitle: string; onClick: () => void; accent: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`card p-3 flex items-center gap-3 text-left tap-target transition-all hover:scale-[1.02] active:scale-[0.98] ${accent ? 'border-gold/30' : ''}`}
    >
      <span className={`text-xl flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg ${accent ? 'bg-gold/10' : 'bg-[var(--muted-bg)]'}`}>
        {emoji}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold truncate">{label}</p>
        <p className="text-[11px] text-[var(--muted)]">{subtitle}</p>
      </div>
    </button>
  );
}
