'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { speakChinese } from '@/lib/audio';
import { RADICALS } from '@/data/radicals';
import { WORDS } from '@/data/words';
import { GRAMMAR } from '@/data/grammar';

interface StudyItem {
  type: 'radical' | 'word' | 'grammar';
  sectionId: number;
  id: string;
  character: string;
  pinyin: string;
  meaning: string;
  sentence?: { c: string; e: string };
}

interface StudyModeProps {
  type: 'radical' | 'word' | 'grammar';
  onBack: () => void;
  onStartQuiz: (type: 'radical' | 'word' | 'grammar') => void;
}

export default function StudyMode({ type, onBack, onStartQuiz }: StudyModeProps) {
  const [items, setItems] = useState<StudyItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  // Build items from data
  useEffect(() => {
    const allItems: StudyItem[] = [];
    if (type === 'radical') {
      for (const section of RADICALS) {
        for (const r of section.radicals) {
          allItems.push({
            type: 'radical',
            sectionId: section.id,
            id: `r-${section.id}-${r.c}`,
            character: r.c,
            pinyin: r.p,
            meaning: r.m,
          });
        }
      }
    } else if (type === 'word') {
      for (const section of WORDS) {
        for (const w of section.words) {
          allItems.push({
            type: 'word',
            sectionId: section.id,
            id: `w-${section.id}-${w.c}`,
            character: w.c,
            pinyin: w.p,
            meaning: w.m,
            sentence: w.s,
          });
        }
      }
    } else {
      for (const g of GRAMMAR) {
        for (const ex of g.examples) {
          allItems.push({
            type: 'grammar',
            sectionId: g.id,
            id: `g-${g.id}-${ex.c}`,
            character: g.name,
            pinyin: '',
            meaning: g.nameEn,
            sentence: ex,
          });
        }
      }
    }
    setItems(allItems);
    setLoading(false);
  }, [type]);

  const current = items[currentIndex];
  const total = items.length;

  const handleFlip = useCallback(() => setFlipped(f => !f), []);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setFlipped(false);
    }
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < total - 1) {
      setCurrentIndex(prev => prev + 1);
      setFlipped(false);
    }
  }, [currentIndex, total]);

  const markKnown = useCallback(async () => {
    if (!current) return;
    try {
      await fetch('/api/srs/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: current.type,
          itemId: current.id,
          sectionId: current.sectionId,
          correct: true,
        }),
      });
    } catch {}
    handleNext();
  }, [current, handleNext]);

  const markDifficult = useCallback(async () => {
    if (!current) return;
    try {
      await fetch('/api/srs/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: current.type,
          itemId: current.id,
          sectionId: current.sectionId,
          correct: false,
        }),
      });
    } catch {}
  }, [current]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev();
      else if (e.key === 'ArrowRight') handleNext();
      else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); handleFlip(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handlePrev, handleNext, handleFlip]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!current) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-[var(--muted)]">No items to study</p>
        <button onClick={onBack} className="px-4 py-2 bg-gold text-black text-sm font-medium rounded-lg">Go Back</button>
      </div>
    );
  }

  const typeName = type === 'radical' ? 'Radicals' : type === 'word' ? 'Words' : 'Grammar';

  return (
    <div className="px-4 pt-4 pb-24 max-w-lg mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="tap-target p-2 rounded-lg hover:bg-[var(--muted-bg)] text-[var(--muted)] transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h2 className="text-lg font-bold">{typeName} Study</h2>
        <span className="text-xs text-[var(--muted)] tabular-nums">{currentIndex + 1}/{total}</span>
      </div>

      {/* Flashcard */}
      <div
        onClick={handleFlip}
        className="card p-8 min-h-[280px] flex flex-col items-center justify-center cursor-pointer select-none transition-transform active:scale-[0.98]"
        role="button"
        tabIndex={0}
        aria-label={flipped ? 'Show front' : 'Show back'}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleFlip(); }}
      >
        {!flipped ? (
          <div className="animate-card-in flex flex-col items-center gap-4">
            <p className="text-7xl font-bold zh-text leading-none">
              {current.character}
            </p>
            <p className="text-xs text-[var(--muted)]">Tap to reveal</p>
          </div>
        ) : (
          <div className="animate-card-in flex flex-col items-center gap-3 text-center">
            <p className="text-5xl font-bold zh-text leading-none">
              {current.character}
            </p>
            {current.pinyin && (
              <p className="text-lg text-gold font-medium">{current.pinyin}</p>
            )}
            <p className="text-base">{current.meaning}</p>
            {current.sentence && (
              <div className="mt-4 pt-4 border-t border-[var(--card-border)] w-full space-y-1">
                <p className="text-sm zh-text">{current.sentence.c}</p>
                <p className="text-xs text-[var(--muted)]">{current.sentence.e}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Audio Button */}
      {current.character && (
        <div className="flex justify-center">
          <button
            onClick={() => speakChinese(current.character)}
            className="tap-target p-3 rounded-full bg-gold/10 text-gold hover:bg-gold/20 transition-colors"
            aria-label="Play audio"
          >
            🔊
          </button>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="tap-target p-3 rounded-lg bg-[var(--muted-bg)] text-foreground hover:bg-surface2 transition-colors disabled:opacity-30"
          aria-label="Previous card"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>

        <div className="flex gap-2">
          <button
            onClick={markDifficult}
            className="tap-target px-4 py-2 text-xs font-medium rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
          >
            Difficult
          </button>
          <button
            onClick={markKnown}
            className="tap-target px-4 py-2 text-xs font-medium rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors"
          >
            Known ✓
          </button>
        </div>

        <button
          onClick={handleNext}
          disabled={currentIndex >= total - 1}
          className="tap-target p-3 rounded-lg bg-[var(--muted-bg)] text-foreground hover:bg-surface2 transition-colors disabled:opacity-30"
          aria-label="Next card"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-1 flex-wrap">
        {items.slice(Math.max(0, currentIndex - 5), currentIndex + 6).map((_, i) => {
          const realIdx = Math.max(0, currentIndex - 5) + i;
          return (
            <span
              key={realIdx}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                realIdx === currentIndex ? 'bg-gold' : 'bg-[var(--card-border)]'
              }`}
            />
          );
        })}
      </div>

      {/* Start Quiz Button */}
      <button
        onClick={() => onStartQuiz(type)}
        className="w-full py-3 bg-gold text-black font-bold text-sm rounded-xl hover:bg-gold2 transition-colors tap-target"
      >
        Start Quiz
      </button>
    </div>
  );
}
