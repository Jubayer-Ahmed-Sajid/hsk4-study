'use client';

import React, { useEffect, useState, useRef } from 'react';

interface SettingsData {
  darkMode: boolean;
  autoPlayAudio: boolean;
  quizMode: 'mc' | 'type';
  fullCoverage: boolean;
  questionsPerQuiz: number;
}

export default function Settings() {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const importRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (!res.ok) throw new Error('Failed to fetch settings');
      const data = await res.json();
      setSettings({
        darkMode: data.darkMode ?? true,
        autoPlayAudio: data.autoPlayAudio ?? false,
        quizMode: data.quizMode ?? 'mc',
        fullCoverage: data.fullCoverage ?? false,
        questionsPerQuiz: data.questionsPerQuiz ?? 20,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: keyof SettingsData, value: any) => {
    if (!settings) return;
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    // Apply dark mode immediately
    if (key === 'darkMode') {
      if (value) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      try { localStorage.setItem('theme', value ? 'dark' : 'light'); } catch {}
    }

    // Save to API
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value }),
      });
      if (!res.ok) throw new Error('Failed to save');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Reset all progress? This cannot be undone.')) return;
    try {
      await fetch('/api/stats', { method: 'DELETE' });
      alert('Progress reset successfully');
    } catch {
      setError('Failed to reset progress');
    }
  };

  const handleExport = () => {
    if (!settings) return;
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hsk4-settings-${new Date().toISOString().split('T')[0]}.json`;
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
        setSettings(data);
      } catch {
        setError('Invalid JSON file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-[#d4a847] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-6 anim-fadeUp">
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {saving && (
        <div className="p-3 rounded-lg bg-[#d4a847]/10 border border-[#d4a847]/30 text-[#d4a847] text-sm">
          Saving...
        </div>
      )}

      {/* Dark Mode */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)]">
        <div>
          <p className="text-sm font-medium text-[var(--foreground)]">Dark Mode</p>
          <p className="text-xs text-[var(--muted)]">Toggle dark/light theme</p>
        </div>
        <button
          onClick={() => updateSetting('darkMode', !settings.darkMode)}
          className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
            settings.darkMode ? 'bg-[#d4a847]' : 'bg-[var(--card-border)]'
          }`}
          role="switch"
          aria-checked={settings.darkMode}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
              settings.darkMode ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Auto-play Audio */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)]">
        <div>
          <p className="text-sm font-medium text-[var(--foreground)]">Auto-play Audio</p>
          <p className="text-xs text-[var(--muted)]">Play Chinese audio automatically</p>
        </div>
        <button
          onClick={() => updateSetting('autoPlayAudio', !settings.autoPlayAudio)}
          className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
            settings.autoPlayAudio ? 'bg-[#d4a847]' : 'bg-[var(--card-border)]'
          }`}
          role="switch"
          aria-checked={settings.autoPlayAudio}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
              settings.autoPlayAudio ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Quiz Mode */}
      <div className="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)]">
        <p className="text-sm font-medium text-[var(--foreground)] mb-3">Default Quiz Mode</p>
        <div className="flex gap-1 bg-[var(--muted-bg)] rounded-lg p-0.5">
          <button
            onClick={() => updateSetting('quizMode', 'mc')}
            className={`flex-1 py-2 rounded-md text-xs font-medium transition-all ${
              settings.quizMode === 'mc' ? 'bg-[#d4a847] text-black' : 'text-[var(--muted)]'
            }`}
          >
            Multiple Choice
          </button>
          <button
            onClick={() => updateSetting('quizMode', 'type')}
            className={`flex-1 py-2 rounded-md text-xs font-medium transition-all ${
              settings.quizMode === 'type' ? 'bg-[#d4a847] text-black' : 'text-[var(--muted)]'
            }`}
          >
            Type Answer
          </button>
        </div>
      </div>

      {/* Full Coverage */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)]">
        <div>
          <p className="text-sm font-medium text-[var(--foreground)]">Full Coverage Mode</p>
          <p className="text-xs text-[var(--muted)]">Quiz from all sections at once</p>
        </div>
        <button
          onClick={() => updateSetting('fullCoverage', !settings.fullCoverage)}
          className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
            settings.fullCoverage ? 'bg-[#d4a847]' : 'bg-[var(--card-border)]'
          }`}
          role="switch"
          aria-checked={settings.fullCoverage}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
              settings.fullCoverage ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Questions per Quiz */}
      <div className="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)]">
        <p className="text-sm font-medium text-[var(--foreground)] mb-3">Questions per Quiz</p>
        <div className="flex gap-2">
          {[10, 20, 30, 50].map(n => (
            <button
              key={n}
              onClick={() => updateSetting('questionsPerQuiz', n)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                settings.questionsPerQuiz === n
                  ? 'bg-[#d4a847] text-black'
                  : 'bg-[var(--muted-bg)] text-[var(--foreground)] border border-[var(--card-border)] hover:border-[#d4a847]/40'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Data Management */}
      <div className="space-y-3 pt-4 border-t border-[var(--card-border)]">
        <h3 className="text-sm font-semibold text-[var(--foreground)]">Data Management</h3>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="flex-1 py-2.5 rounded-xl border border-[var(--card-border)] text-sm font-medium text-[var(--foreground)] hover:border-[#d4a847]/40 transition-colors"
          >
            Export Settings
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
