'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { speakChinese } from '@/lib/audio';
import { matchPinyin, matchMeaning, matchChinese } from '@/lib/fuzzyMatch';
import { RADICALS } from '@/data/radicals';
import { WORDS } from '@/data/words';
import { GRAMMAR } from '@/data/grammar';
import type { QuizConfig } from './QuizSetup';

type QuestionType = 'MEANING' | 'PINYIN' | 'CHARACTER' | 'LISTEN' | 'SENTENCE_FIT' | 'SENTENCE_MEAN';

interface QuizItem {
  type: 'radical' | 'word' | 'grammar';
  sectionId: number;
  id: string;
  character: string;
  pinyin: string;
  meaning: string;
  sentence?: { c: string; e: string };
}

interface Question {
  item: QuizItem;
  questionType: QuestionType;
  prompt: string;
  correctAnswer: string;
  options?: string[];
}

interface QuizProps {
  config: QuizConfig;
  onFinish: (results: { correct: number; total: number }) => void;
  onBack: () => void;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateQuestions(items: QuizItem[], count: number, mode: 'mc' | 'type'): Question[] {
  const selected = shuffle(items).slice(0, count);
  const allChars = items.map(i => i.character);
  const allMeanings = items.map(i => i.meaning);
  const allPinyin = items.map(i => i.pinyin);

  const questionTypes: QuestionType[] = mode === 'mc'
    ? ['MEANING', 'PINYIN']
    : ['MEANING', 'PINYIN', 'CHARACTER'];

  return selected.map(item => {
    const qType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    let prompt = '';
    let correctAnswer = '';
    let options: string[] | undefined;

    switch (qType) {
      case 'MEANING':
        prompt = item.character;
        correctAnswer = item.meaning;
        if (mode === 'mc') {
          const distractors = shuffle(allMeanings.filter(m => m !== correctAnswer)).slice(0, 3);
          options = shuffle([correctAnswer, ...distractors]);
        }
        break;
      case 'PINYIN':
        prompt = item.character;
        correctAnswer = item.pinyin;
        if (mode === 'mc') {
          const distractors = shuffle(allPinyin.filter(p => p !== correctAnswer)).slice(0, 3);
          options = shuffle([correctAnswer, ...distractors]);
        }
        break;
      case 'CHARACTER':
        prompt = item.meaning;
        correctAnswer = item.character;
        if (mode === 'mc') {
          const distractors = shuffle(allChars.filter(c => c !== correctAnswer)).slice(0, 3);
          options = shuffle([correctAnswer, ...distractors]);
        }
        break;
      case 'LISTEN':
        prompt = '🔊 Listen and choose the meaning';
        correctAnswer = item.meaning;
        if (mode === 'mc') {
          const distractors = shuffle(allMeanings.filter(m => m !== correctAnswer)).slice(0, 3);
          options = shuffle([correctAnswer, ...distractors]);
        }
        break;
      case 'SENTENCE_FIT':
        if (item.sentence) {
          const blanked = item.sentence.c.replace(item.character, '____');
          prompt = blanked;
          correctAnswer = item.character;
          if (mode === 'mc') {
            const distractors = shuffle(allChars.filter(c => c !== correctAnswer)).slice(0, 3);
            options = shuffle([correctAnswer, ...distractors]);
          }
        } else {
          prompt = item.character;
          correctAnswer = item.meaning;
        }
        break;
      case 'SENTENCE_MEAN':
        prompt = item.sentence?.c ?? item.character;
        correctAnswer = item.sentence?.e ?? item.meaning;
        break;
    }

    return { item, questionType: qType, prompt, correctAnswer, options };
  });
}

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

export default function Quiz({ config, onFinish, onBack }: QuizProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  // Build quiz items from data
  const allItems = useMemo<QuizItem[]>(() => {
    const items: QuizItem[] = [];
    if (config.type === 'radical') {
      for (const section of RADICALS) {
        if (!config.sectionIds.includes(section.id)) continue;
        for (const r of section.radicals) {
          items.push({
            type: 'radical',
            sectionId: section.id,
            id: `r-${section.id}-${r.c}`,
            character: r.c,
            pinyin: r.p,
            meaning: r.m,
          });
        }
      }
    } else if (config.type === 'word') {
      for (const section of WORDS) {
        if (!config.sectionIds.includes(section.id)) continue;
        for (const w of section.words) {
          items.push({
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
        if (!config.sectionIds.includes(g.id)) continue;
        for (const ex of g.examples) {
          items.push({
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
    return items;
  }, [config]);

  // Initialize questions
  useEffect(() => {
    if (allItems.length === 0) {
      setLoading(false);
      return;
    }
    const q = generateQuestions(allItems, config.count, config.mode);
    setQuestions(q);
    setLoading(false);
  }, [allItems, config.count, config.mode]);

  const current = questions[currentIndex];
  const total = questions.length;

  // Auto-play audio for LISTEN type
  useEffect(() => {
    if (current && current.questionType === 'LISTEN' && !answered) {
      speakChinese(current.item.character);
    }
  }, [current, answered]);

  const checkAnswer = useCallback((answer: string) => {
    if (!current || answered) return;
    let correct = false;

    if (current.questionType === 'PINYIN' || current.questionType === 'LISTEN') {
      correct = matchPinyin(answer, current.correctAnswer);
    } else if (current.questionType === 'MEANING' || current.questionType === 'SENTENCE_MEAN') {
      correct = matchMeaning(answer, current.correctAnswer);
    } else {
      correct = matchChinese(answer, current.correctAnswer);
    }

    setIsCorrect(correct);
    setAnswered(true);
    if (correct) setScore(prev => prev + 1);

    // Post to SRS
    fetch('/api/srs/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: current.item.type,
        itemId: current.item.id,
        sectionId: current.item.sectionId,
        correct,
      }),
    }).catch(() => {});
  }, [current, answered]);

  const handleOptionSelect = (index: number) => {
    if (answered || !current?.options) return;
    setSelectedOption(index);
    checkAnswer(current.options[index]);
  };

  const handleTypeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedAnswer.trim()) return;
    checkAnswer(typedAnswer.trim());
  };

  const handleNext = useCallback(() => {
    if (currentIndex >= total - 1) {
      onFinish({ correct: score, total });
      return;
    }
    setCurrentIndex(prev => prev + 1);
    setAnswered(false);
    setIsCorrect(false);
    setSelectedOption(null);
    setTypedAnswer('');
    inputRef.current?.focus();
  }, [currentIndex, total, score, onFinish]);

  // Auto-advance after 1.5s
  useEffect(() => {
    if (!answered) return;
    const timer = setTimeout(handleNext, 1500);
    return () => clearTimeout(timer);
  }, [answered, handleNext]);

  // Keyboard shortcuts for MC
  useEffect(() => {
    if (!current?.options || answered) return;
    const handler = (e: KeyboardEvent) => {
      const idx = OPTION_LABELS.indexOf(e.key.toUpperCase());
      if (idx !== -1 && idx < current.options!.length) {
        handleOptionSelect(idx);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [current, answered]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-[var(--muted)]">No questions available</p>
        <button onClick={onBack} className="px-4 py-2 bg-gold text-black text-sm font-medium rounded-lg">Go Back</button>
      </div>
    );
  }

  const progressPercent = ((currentIndex + (answered ? 1 : 0)) / total) * 100;

  return (
    <div className="px-4 pt-4 pb-24 max-w-lg mx-auto space-y-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="tap-target p-2 rounded-lg hover:bg-[var(--muted-bg)] text-[var(--muted)] transition-colors"
          aria-label="Exit quiz"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
        <span className="text-sm font-medium tabular-nums">
          <span className="text-gold">{score}</span>/{currentIndex + (answered ? 1 : 0)}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar">
        <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
      </div>

      {/* Question Card */}
      <div className={`card p-6 text-center space-y-4 animate-card-in ${
        answered ? (isCorrect ? 'border-green-500/40' : 'border-red-500/40') : ''
      } ${answered && isCorrect ? 'animate-pop-correct' : ''} ${answered && !isCorrect ? 'animate-shake-wrong' : ''}`}>
        {/* Question Type Label */}
        <p className="text-[10px] uppercase tracking-widest text-[var(--muted)]">
          {current.questionType.replace('_', ' ')}
        </p>

        {/* Audio button for non-LISTEN types */}
        {current.item.character && current.questionType !== 'LISTEN' && (
          <button
            onClick={() => speakChinese(current.item.character)}
            className="text-2xl hover:scale-110 transition-transform tap-target"
            aria-label="Play audio"
          >
            🔊
          </button>
        )}

        {/* Prompt */}
        <div className="space-y-2">
          {current.questionType === 'LISTEN' ? (
            <button
              onClick={() => speakChinese(current.item.character)}
              className="text-4xl hover:scale-110 transition-transform tap-target"
              aria-label="Replay audio"
            >
              🔊
            </button>
          ) : (
            <p className={`text-3xl font-bold ${/[\u4e00-\u9fff]/.test(current.prompt) ? 'zh-text' : ''}`}>
              {current.prompt}
            </p>
          )}
          <p className="text-xs text-[var(--muted)]">
            {current.questionType === 'MEANING' && 'What does this mean?'}
            {current.questionType === 'PINYIN' && 'What is the pinyin?'}
            {current.questionType === 'CHARACTER' && 'Write the character'}
            {current.questionType === 'LISTEN' && 'Listen and choose the meaning'}
            {current.questionType === 'SENTENCE_FIT' && 'Fill in the blank'}
            {current.questionType === 'SENTENCE_MEAN' && 'What does this sentence mean?'}
          </p>
        </div>

        {/* MC Options */}
        {config.mode === 'mc' && current.options && (
          <div className="grid grid-cols-2 gap-2">
            {current.options.map((opt, i) => {
              const isThis = selectedOption === i;
              const isCorrectOpt = opt === current.correctAnswer;
              let cls = 'bg-[var(--muted-bg)] border border-transparent';
              if (answered) {
                if (isCorrectOpt) cls = 'bg-green-500/15 border border-green-500/50 text-green-600 dark:text-green-400';
                else if (isThis && !isCorrect) cls = 'bg-red-500/15 border border-red-500/50 text-red-600 dark:text-red-400';
                else cls = 'bg-[var(--muted-bg)] border border-transparent opacity-50';
              } else if (isThis) {
                cls = 'bg-gold/15 border border-gold/40';
              }

              return (
                <button
                  key={i}
                  onClick={() => handleOptionSelect(i)}
                  disabled={answered}
                  className={`p-3 rounded-lg text-sm font-medium text-left tap-target transition-all ${cls}`}
                >
                  <span className="inline-block w-5 text-xs text-[var(--muted)]">{OPTION_LABELS[i]}</span>
                  <span className={/[\u4e00-\u9fff]/.test(opt) ? 'zh-text' : ''}>{opt}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Type Answer Input */}
        {config.mode === 'type' && (
          <form onSubmit={handleTypeSubmit} className="space-y-3">
            <input
              ref={inputRef}
              type="text"
              value={typedAnswer}
              onChange={e => setTypedAnswer(e.target.value)}
              disabled={answered}
              placeholder="Type your answer…"
              className="w-full px-4 py-3 text-base rounded-lg bg-[var(--muted-bg)] border border-[var(--card-border)] focus:border-gold outline-none disabled:opacity-50"
              autoComplete="off"
              autoFocus
            />
            {!answered && (
              <button
                type="submit"
                disabled={!typedAnswer.trim()}
                className="w-full py-2.5 bg-gold text-black font-semibold text-sm rounded-lg hover:bg-gold2 transition-colors disabled:opacity-40 tap-target"
              >
                Submit
              </button>
            )}
          </form>
        )}

        {/* Feedback */}
        {answered && (
          <div className={`pt-2 text-sm font-semibold animate-fade-up ${
            isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {isCorrect ? (
              <span>✓ Correct!</span>
            ) : (
              <span>✗ Correct answer: <span className={/[\u4e00-\u9fff]/.test(current.correctAnswer) ? 'zh-text' : ''}>{current.correctAnswer}</span></span>
            )}
          </div>
        )}
      </div>

      {/* Card X of Y */}
      <p className="text-center text-xs text-[var(--muted)] tabular-nums">
        {currentIndex + 1} of {total}
      </p>
    </div>
  );
}
