# HSK-4 Study System

A premium, production-grade HSK-4 Chinese language study platform built as a full-stack MERN (Next.js + MongoDB) application with intelligent spaced repetition, dual-mode quizzes, flashcard study, and detailed progress analytics. Designed for offline-first usage with PWA support.

**Live URL:** [https://hsk4-study.vercel.app](https://hsk4-study.vercel.app)

**GitHub:** [https://github.com/Jubayer-Ahmed-Sajid/hsk4-study](https://github.com/Jubayer-Ahmed-Sajid/hsk4-study)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Spaced Repetition System](#spaced-repetition-system)
- [Design System](#design-system)
- [Content](#content)
- [API Reference](#api-reference)
- [Local Development](#local-development)
- [Deployment](#deployment)
- [Screenshots](#screenshots)

---

## Features

### Dual Quiz Modes

**Multiple Choice** — Select the correct answer from four options. Supports question types:
- **Meaning** — See a character, choose its English meaning
- **Pinyin** — See a character, select the correct romanization

**Type Answer (Production Recall)** — Type the answer from memory for deeper learning:
- **Meaning** — See a character, type its English meaning (with fuzzy matching)
- **Pinyin** — See a character, type its pinyin (tone-insensitive, accepts "shì"/"shi4")
- **Character** — See a meaning, write the Chinese character

### Spaced Repetition Engine

Implements the **SM-2 algorithm** with per-item tracking:
- **Ease Factor** — Adjusts based on answer quality (range: 1.3–3.0)
- **Interval** — Days until next review (grows exponentially for correct answers)
- **Repetitions** — Consecutive correct streak count
- **Next Review** — Exact date calculated from interval
- Accuracy tracked per-item and displayed in stats

### Study Mode

Flashcard-based study with tap-to-reveal:
- Front: Large character display
- Back: Character + Pinyin + Meaning + Example sentence
- **Mark Known** — Records as correct in SRS, advances to next card
- **Mark Difficult** — Records as incorrect, flags for priority review
- Keyboard navigation (← → arrows, Space/Enter to flip)
- Audio playback on tap

### Progress Dashboard

Real-time analytics showing:
- **Mastery Percentage** — Items with ≥80% accuracy
- **Current Streak** — Consecutive days studied
- **Longest Streak** — Personal best
- **Overall Accuracy** — Total correct / total questions
- **Average Ease Factor** — Across all tracked items
- **Due Today** — Items ready for review, broken down by type
- **Per-Section Breakdown** — Mastered / Learning / New counts with accuracy bars

### Smart Quiz Generation

Questions are prioritized intelligently:
1. Due for review (past next-review date)
2. Difficult items (low accuracy)
3. New / unseen items
4. Random items from the pool

### Settings & Customization

- **Dark/Light Mode** — Persisted in localStorage with system preference detection
- **Auto-Play Audio** — Chinese pronunciation via Web Speech API
- **Default Quiz Mode** — Multiple Choice or Type Answer
- **Full Coverage Mode** — Quiz from all sections at once
- **Questions per Quiz** — 10, 20, 30, or 50

### Data Management

- **Export Progress** — Download settings as JSON
- **Import Progress** — Restore from backup
- **Reset All Progress** — Clear all spaced repetition data
- **MongoDB Persistence** — Server-side progress via Mongoose ODM

### Accessibility & PWA

- WCAG AA contrast compliance with careful color choices
- Keyboard navigation throughout (Tab, Enter, Arrow keys)
- Focus-visible indicators on all interactive elements
- ARIA labels, roles, and landmarks on every component
- PWA manifest for installation on mobile devices
- Service worker for offline capability after first load
- Skip-to-content link for screen readers
- `prefers-reduced-motion` respected — animations disabled for sensitive users

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 with App Router |
| **Language** | TypeScript (strict) |
| **Styling** | Tailwind CSS 4 with custom gold theme |
| **Database** | MongoDB with Mongoose ODM |
| **State** | React hooks + localStorage client-side |
| **Audio** | Web Speech API (speechSynthesis) |
| **Deployment** | Vercel (Edge + Static Export) |
| **Fonts** | Google Fonts (Inter, Noto Serif SC) |

---

## Architecture

```
hsk4-study/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── srs/route.ts          # POST/GET spaced repetition data
│   │   │   ├── stats/route.ts        # GET/DELETE user statistics
│   │   │   └── settings/route.ts     # GET/PUT user preferences
│   │   ├── globals.css               # CSS variables, themes, animations
│   │   ├── layout.tsx                # Root layout, fonts, PWA registration
│   │   └── page.tsx                  # Bottom navigation routing
│   ├── components/
│   │   ├── BottomNav.tsx             # Persistent 4-tab mobile navigation
│   │   ├── Home.tsx                  # Dashboard with due cards & streaks
│   │   ├── Quiz.tsx                  # Dual-mode quiz engine
│   │   ├── QuizSetup.tsx             # Section/range/mode configuration
│   │   ├── Settings.tsx              # Appearance & preferences
│   │   ├── Stats.tsx                 # Detailed progress analytics
│   │   └── StudyMode.tsx            # Flashcard study with known/difficult
│   ├── data/
│   │   ├── radicals.ts               # 96 HSK-4 radicals (6 sections)
│   │   ├── words.ts                  # 304 HSK-4 words (10 sections, with sentences)
│   │   └── grammar.ts                # 13 grammar patterns (with examples)
│   └── lib/
│       ├── mongodb.ts                # Database connection with DNS fix for Vercel
│       ├── audio.ts                  # Chinese text-to-speech helper
│       └── fuzzyMatch.ts             # Tolerant pinyin/meaning matching
├── models/
│   ├── Progress.ts                   # User-level stats (streaks, totals)
│   ├── SRSItem.ts                    # Per-item spaced repetition data
│   └── Settings.ts                   # User preferences (theme, audio, etc.)
├── public/
│   └── manifest.json                 # PWA installable manifest
└── vercel.json                       # Vercel deployment configuration
```

---

## Spaced Repetition System

The app uses the **SM-2 algorithm** with the following parameters:

| Parameter | Value | Description |
|-----------|-------|-------------|
| Initial EF | 2.5 | Starting ease factor |
| Min EF | 1.3 | Floor for incorrect answers |
| Max EF | 3.0 | Ceiling for correct answers |
| Correct bonus | +0.1 | EF increase per correct answer |
| Incorrect penalty | −0.2 | EF decrease per incorrect answer |
| Graduate interval | 1 → 3 days | First two correct answers |
| Multiplier | EF × previous | Subsequent intervals scale exponentially |

Items are scheduled for review on their `nextReview` date. Items with the lowest ease factor are prioritized when generating quizzes.

---

## Design System

### Colors

| Token | Dark Mode | Light Mode | Usage |
|-------|-----------|------------|-------|
| Background | `#0a0a0a` | `#f8f8f8` | Page background |
| Foreground | `#f5f5f5` | `#1a1a1a` | Text color |
| Card Bg | `#1a1a1a` | `#ffffff` | Card surfaces |
| Gold | `#d4a847` | `#d4a847` | Primary accent |
| Gold 2 | `#e8c468` | `#e8c468` | Lighter gold |
| Muted | `#737373` | `#a3a3a3` | Secondary text |
| Border | `#2a2a2a` | `#e5e5e5` | Card borders |

### Typography

- **Inter** — UI text, labels, stats (loaded from Google Fonts)
- **Noto Serif SC** — Chinese characters displayed in study/quiz modes

### Animations

- `fadeUp` — Card entrance transitions
- `cardIn` — Quiz card swipe effect
- `popCorrect` — Correct answer celebration
- `shakeWrong` — Incorrect answer feedback
- `goldShift` — Strobe animation for streak banner
- `spin` — Loading spinner

All animations respect `prefers-reduced-motion: reduce`.

---

## Content

### Radicals (Section 1–6)

96 essential HSK-4 radicals organized by stroke count and complexity:
1. Stroke patterns (1–3 strokes: 的, 一, 人...)
2. Common radicals (口, 木, 水, 火...)
3. Compound radicals (言, 食, 马, 金...)
4. Semantic radicals (心, 手, 目, 耳...)
5. Advanced forms (龍, 鹿, 麻, 黃...)
6. Rare variants (麥, 黃, 黑, 鼓...)

### Words (Section 1–1)

304 vocabulary words with pinyin, English meaning, and example sentences covering:
- Daily life, work, education, travel, health, culture, abstract concepts

### Grammar Patterns (13 patterns)

Essential sentence structures including:
- 把 construction, 被 passive, 比较 sentences, complement patterns, aspect markers, and more

---

## API Reference

### `GET /api/srs`

Returns due items for review and breakdown by type.

**Query Parameters:**
- `type` — Filter: `radical`, `word`, `grammar` (omit for all)

**Response:**
```json
{
  "dueCount": 15,
  "dueBreakdown": { "radical": 8, "word": 5, "grammar": 2 },
  "totalTracked": 42,
  "typeBreakdown": { "radical": 20, "word": 18, "grammar": 4 },
  "dueItems": [...]
}
```

### `POST /api/srs`

Record an answer for spaced repetition.

**Body:**
```json
{
  "type": "radical",
  "itemId": "r-1-的",
  "sectionId": 1,
  "correct": true
}
```

**Response:**
```json
{
  "easeFactor": 2.6,
  "interval": 1,
  "repetitions": 1,
  "nextReview": "2026-06-27T19:46:07.018Z",
  "accuracy": 1,
  "streak": 1
}
```

### `GET /api/stats`

Returns comprehensive user statistics.

**Response:**
```json
{
  "totalQuestions": 47,
  "totalCorrect": 38,
  "overallAccuracy": 0.808,
  "currentStreak": 5,
  "longestStreak": 12,
  "lastStudyDate": "2026-06-26",
  "totalTracked": 42,
  "mastered": 30,
  "learning": 12,
  "masteryPercent": 0.714,
  "avgEaseFactor": 2.4,
  "dueToday": 8,
  "dueRadicals": 3,
  "dueWords": 4,
  "dueGrammar": 1,
  "sections": {
    "radical-1": { "mastered": 15, "learning": 2, "new_": 0, "accuracy": 0.92, "total": 17 }
  }
}
```

### `DELETE /api/stats`

Reset all progress (requires confirmation in UI).

### `GET /api/settings`

Retrieve user preferences.

### `PUT /api/settings`

Update a setting.

**Body:**
```json
{
  "darkMode": true,
  "autoPlayAudio": false,
  "quizMode": "mc",
  "fullCoverage": false,
  "questionsPerQuiz": 20
}
```

---

## Local Development

### Prerequisites

- Node.js 18+
- MongoDB instance (local or Atlas)
- npm or pnpm

### Setup

```bash
# Clone the repository
git clone https://github.com/Jubayer-Ahmed-Sajid/hsk4-study.git
cd hsk4-study

# Install dependencies
npm install

# Create .env.local
echo 'MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/QuizAppDB?appName=Cluster0' > .env.local

# Run development server
npm run dev
```

The app will be available at `http://localhost:3000`.

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB connection string with database name |

---

## Deployment

Deployed to **Vercel** with automatic deployments from the `main` branch.

### Build Configuration

- **Framework:** Next.js 16
- **Build Command:** `npm run build`
- **Output:** Static export with dynamic API routes
- **Node:** 20.x

### Vercel Environment Variables

Set in Vercel Dashboard → Project Settings → Environment Variables:

| Variable | Environment | Value |
|----------|-------------|-------|
| `MONGODB_URI` | Production, Preview, Development | Your MongoDB Atlas URI |

### DNS Fix for Vercel Edge

The database connection module (`src/lib/mongodb.ts`) includes a DNS server override to ensure MongoDB Atlas SRV record resolution works correctly in Vercel's Edge environment:

```typescript
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
```

### MongoDB Atlas Setup

1. Create a cluster on MongoDB Atlas
2. Create a database user with read/write access
3. Add `0.0.0.0/0` to IP Access List (allow all for Vercel)
4. Copy the connection string to Vercel environment variables

---

## Screenshots

| Screen | Description |
|--------|-------------|
| **Home** | Due card count, streak banner, quick-start buttons |
| **Quiz Setup** | Section selection, question count, mode toggle |
| **Quiz (MC)** | Character prompt + 4 multiple choice options |
| **Quiz (Type)** | Character prompt + text input with fuzzy matching |
| **Study Mode** | Tap-to-reveal flashcards with known/difficult buttons |
| **Stats** | Mastery %, streak, accuracy, per-section breakdown |
| **Settings** | Dark mode, audio, quiz mode, data management |

---

## License

MIT License — Free to use, modify, and distribute.

---

Built with care for HSK-4 learners who want a focused, distraction-free study experience. 加油!
