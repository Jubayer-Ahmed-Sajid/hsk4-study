'use client';

import React, { useEffect, useState, useRef } from 'react';

interface StatsData {
  totalQuestions: number;
  totalCorrect: number;
  overallAccuracy: number;
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string;
  totalTracked: number;
  mastered: number;
  learning: number;
  masteryPercent: number;
  avgEaseFactor: number;
  dueToday: number;
  sections: Record<string, { mastered: number; learning: number; new_: number; accuracy: number; total: number }>;
}

export default function Stats() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const importRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/stats');
      if (!res.ok) throw new Error('Failed to fetch stats');
      const data = await res.json();
      setStats(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset all progress? This cannot be undone.')) return;
    try {
      const res = await fetch('/api/stats', { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to reset');
      await fetchStats();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleExport = () => {
    if (!stats) return;
    const blob = new Blob([JSON.stringify(stats, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hsk4-stats-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        setStats(data);
        setError(null);
      } catch {
        setError('Invalid JSON file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-[#d4a847] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="px-4 py-6">
        <p className="text-center text-[var(--muted)]">No stats available yet. Start studying!</p>
      </div>
    );
  }

  const statCards = [
    { label: 'Mastery', value: `${Math.round(stats.masteryPercent * 100)}%`, icon: '🎯' },
    { label: 'Due Today', value: stats.dueToday, icon: '📋' },
    { label: 'Streak', value: `${stats.currentStreak}d`, icon: '🔥' },
    { label: 'Questions', value: stats.totalQuestions, icon: '❓' },
    { label: 'Accuracy', value: `${Math.round(stats.overallAccuracy * 100)}%`, icon: '📈' },
    { label: 'Avg Ease', value: stats.avgEaseFactor.toFixed(2), icon: '⚡' },
  ];

  return (
    <div className="px-4 py-6 space-y-6 anim-fadeUp">
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Stat cards grid */}
      <div className="grid grid-cols-3 gap-3">
        {statCards.map((s, i) => (
          <div
            key={s.label}
            className="card p-3 text-center"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <span className="text-lg block mb-1" aria-hidden="true">{s.icon}</span>
            <p className="text-xl font-bold text-[#d4a847]">{s.value}</p>
            <p className="text-xs text-[var(--muted)] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Section breakdown */}
      {Object.keys(stats.sections).length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">Section Progress</h3>
          <div className="space-y-2">
            {Object.entries(stats.sections).slice(0, 15).map(([key, section]) => {
              const pct = section.total > 0 ? (section.mastered / section.total) * 100 : 0;
              return (
                <div key={key} className="p-3 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)]">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-medium text-[var(--foreground)] truncate mr-2">
                      {key}
                    </span>
                    <span className="text-xs text-[var(--muted)] shrink-0">
                      {section.mastered}/{section.total}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3 pt-4 border-t border-[var(--card-border)]">
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="flex-1 py-2.5 rounded-xl border border-[var(--card-border)] text-sm font-medium text-[var(--foreground)] hover:border-[#d4a847]/40 transition-colors"
          >
            Export
          </button>
          <button
            onClick={() => importRef.current?.click()}
            className="flex-1 py-2.5 rounded-xl border border-[var(--card-border)] text-sm font-medium text-[var(--foreground)] hover:border-[#d4a847]/40 transition-colors"
          >
            Import
          </button>
          <input
            ref={importRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </div>
        <button
          onClick={handleReset}
          className="w-full py-2.5 rounded-xl border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/10 transition-colors"
        >
          Reset All Progress
        </button>
      </div>
    </div>
  );
}
