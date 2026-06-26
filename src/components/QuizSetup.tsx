'use client';

import React, { useState, useMemo } from 'react';
import { RADICALS } from '@/data/radicals';
import { WORDS } from '@/data/words';
import { GRAMMAR } from '@/data/grammar';

export interface QuizConfig {
  type: 'radical' | 'word' | 'grammar';
  sectionIds: number[];
  count: number;
  mode: 'mc' | 'type';
  fullCoverage: boolean;
}

interface QuizSetupProps {
  initialType?: 'radical' | 'word' | 'grammar';
  onStart: (config: QuizConfig) => void;
  onBack: () => void;
}

const QUIZ_COUNTS = [1, 2, 3, 5, 10] as const;

export default function QuizSetup({ initialType = 'word', onStart, onBack }: QuizSetupProps) {
  const [type, setType] = useState<'radical' | 'word' | 'grammar'>(initialType);
  const [selectedSections, setSelectedSections] = useState<Set<number>>(new Set());
  const [count, setCount] = useState(5);
  const [mode, setMode] = useState<'mc' | 'type'>('mc');
  const [fullCoverage, setFullCoverage] = useState(false);
  const [rangeFrom, setRangeFrom] = useState('');
  const [rangeTo, setRangeTo] = useState('');

  const sections = useMemo(() => {
    if (type === 'radical') return RADICALS.map(s => ({ id: s.id, title: s.title, count: s.radicals.length }));
    if (type === 'word') return WORDS.map(s => ({ id: s.id, title: s.title, count: s.words.length }));
    return GRAMMAR.map(s => ({ id: s.id, title: s.nameEn, count: s.examples.length }));
  }, [type]);

  // Auto-select all sections when type changes
  React.useEffect(() => {
    setSelectedSections(new Set(sections.map(s => s.id)));
    setRangeFrom('');
    setRangeTo('');
  }, [sections]);

  const toggleSection = (id: number) => {
    setSelectedSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelectedSections(new Set(sections.map(s => s.id)));
  const selectNone = () => setSelectedSections(new Set());

  const applyRange = () => {
    const from = parseInt(rangeFrom, 10);
    const to = parseInt(rangeTo, 10);
    if (isNaN(from) || isNaN(to)) return;
    const rangeIds = sections.filter(s => s.id >= from && s.id <= to).map(s => s.id);
    setSelectedSections(new Set(rangeIds));
  };

  const totalItems = useMemo(() => {
    if (type === 'radical') {
      return RADICALS.filter(s => selectedSections.has(s.id)).reduce((sum, s) => sum + s.radicals.length, 0);
    }
    if (type === 'word') {
      return WORDS.filter(s => selectedSections.has(s.id)).reduce((sum, s) => sum + s.words.length, 0);
    }
    return GRAMMAR.filter(s => selectedSections.has(s.id)).reduce((sum, s) => sum + s.examples.length, 0);
  }, [type, selectedSections]);

  const handleStart = () => {
    if (selectedSections.size === 0) return;
    onStart({
      type,
      sectionIds: Array.from(selectedSections),
      count,
      mode,
      fullCoverage,
    });
  };

  // Smart selection info
  const dueCount = Math.min(Math.ceil(totalItems * 0.3), count);
  const newCount = Math.max(totalItems - Math.ceil(totalItems * 0.5), 0);
  const weakCount = Math.ceil(totalItems * 0.15);

  return (
    <div className="px-4 pt-4 pb-24 max-w-lg mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="tap-target p-2 rounded-lg hover:bg-[var(--muted-bg)] text-[var(--muted)] hover:text-foreground transition-colors"
          aria-label="Go back"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h2 className="text-lg font-bold">Quiz Setup</h2>
      </div>

      {/* Type Selector */}
      <div className="flex gap-2">
        {(['radical', 'word', 'grammar'] as const).map(t => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all tap-target ${
              type === t
                ? 'bg-gold text-black'
                : 'bg-[var(--muted-bg)] text-[var(--muted)] hover:text-foreground'
            }`}
          >
            {t === 'radical' ? '部 Radicals' : t === 'word' ? '词 Words' : '句 Grammar'}
          </button>
        ))}
      </div>

      {/* Section Selection */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-widest text-[var(--muted)]">
            Sections ({selectedSections.size}/{sections.length})
          </p>
          <div className="flex gap-2">
            <button onClick={selectAll} className="text-xs text-gold hover:text-gold2 transition-colors">All</button>
            <button onClick={selectNone} className="text-xs text-[var(--muted)] hover:text-foreground transition-colors">None</button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => toggleSection(s.id)}
              className={`p-2 text-left rounded-lg text-xs transition-all tap-target ${
                selectedSections.has(s.id)
                  ? 'bg-gold/15 border border-gold/40 text-foreground'
                  : 'bg-[var(--muted-bg)] border border-transparent text-[var(--muted)] hover:border-[var(--card-border)]'
              }`}
            >
              <span className="font-medium">{s.id}.</span> {s.title}
              <span className="text-[10px] ml-1 opacity-60">({s.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Range Selector */}
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-[var(--muted)]">Range Select</p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            max={sections.length}
            placeholder="From"
            value={rangeFrom}
            onChange={e => setRangeFrom(e.target.value)}
            className="w-20 px-2 py-1.5 text-sm rounded-lg bg-[var(--muted-bg)] border border-[var(--card-border)] focus:border-gold outline-none"
          />
          <span className="text-[var(--muted)] text-sm">to</span>
          <input
            type="number"
            min={1}
            max={sections.length}
            placeholder="To"
            value={rangeTo}
            onChange={e => setRangeTo(e.target.value)}
            className="w-20 px-2 py-1.5 text-sm rounded-lg bg-[var(--muted-bg)] border border-[var(--card-border)] focus:border-gold outline-none"
          />
          <button
            onClick={applyRange}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gold/15 text-gold hover:bg-gold/25 transition-colors"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Quiz Count */}
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-[var(--muted)]">Questions</p>
        <div className="flex gap-2">
          {QUIZ_COUNTS.map(n => (
            <button
              key={n}
              onClick={() => setCount(n)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all tap-target ${
                count === n
                  ? 'bg-gold text-black'
                  : 'bg-[var(--muted-bg)] text-[var(--muted)] hover:text-foreground'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-[var(--muted)]">Mode</p>
        <div className="flex gap-2">
          <button
            onClick={() => setMode('mc')}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all tap-target ${
              mode === 'mc'
                ? 'bg-gold text-black'
                : 'bg-[var(--muted-bg)] text-[var(--muted)] hover:text-foreground'
            }`}
          >
            Multiple Choice
          </button>
          <button
            onClick={() => setMode('type')}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all tap-target ${
              mode === 'type'
                ? 'bg-gold text-black'
                : 'bg-[var(--muted-bg)] text-[var(--muted)] hover:text-foreground'
            }`}
          >
            Type Answer
          </button>
        </div>
      </div>

      {/* Full Coverage Toggle */}
      <div className="flex items-center justify-between card p-3">
        <div>
          <p className="text-sm font-medium">Full Coverage</p>
          <p className="text-[11px] text-[var(--muted)]">Include all items, not just due</p>
        </div>
        <button
          onClick={() => setFullCoverage(!fullCoverage)}
          className={`relative w-11 h-6 rounded-full transition-colors ${
            fullCoverage ? 'bg-gold' : 'bg-[var(--card-border)]'
          }`}
          role="switch"
          aria-checked={fullCoverage}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow-sm ${
              fullCoverage ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Smart Selection Info */}
      <div className="card p-3 space-y-2">
        <p className="text-xs uppercase tracking-widest text-[var(--muted)]">Smart Selection</p>
        <div className="flex gap-4 text-xs">
          <span className="text-gold">⏰ {dueCount} due</span>
          <span className="text-[var(--muted)]">🆕 {newCount} new</span>
          <span className="text-red-400">⚠️ {weakCount} weak</span>
        </div>
        <p className="text-[11px] text-[var(--muted)]">
          {totalItems} total items across {selectedSections.size} section{selectedSections.size !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Start Button */}
      <button
        onClick={handleStart}
        disabled={selectedSections.size === 0}
        className="w-full py-3 bg-gold text-black font-bold text-sm rounded-xl hover:bg-gold2 transition-all disabled:opacity-40 disabled:cursor-not-allowed tap-target animate-fade-up"
      >
        Start Quiz ({Math.min(count * selectedSections.size, totalItems)} questions)
      </button>
    </div>
  );
}
