import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SRSItem from '@/models/SRSItem';
import Progress from '@/models/Progress';

// SM-2 Algorithm
function updateSRS(item: any, correct: boolean) {
  const now = new Date();
  item.timesSeen += 1;
  item.lastReview = now;

  if (correct) {
    item.timesCorrect += 1;
    item.repetitions += 1;
    if (item.repetitions === 1) item.interval = 1;
    else if (item.repetitions === 2) item.interval = 3;
    else item.interval = Math.round(item.interval * item.easeFactor);
    item.easeFactor = Math.min(3.0, item.easeFactor + 0.1);
  } else {
    item.repetitions = 0;
    item.interval = 1;
    item.easeFactor = Math.max(1.3, item.easeFactor - 0.2);
  }

  item.nextReview = new Date(now.getTime() + item.interval * 24 * 60 * 60 * 1000);
  return item;
}

// POST /api/srs/answer — Record an answer
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { type, itemId, sectionId, correct, userId = 'default' } = body;

    let item = await SRSItem.findOne({ userId, type, itemId });

    if (!item) {
      item = new SRSItem({ userId, type, itemId, sectionId });
    }

    updateSRS(item, correct);
    await item.save();

    // Update progress
    let progress = await Progress.findOne({ userId });
    if (!progress) progress = new Progress({ userId });
    progress.totalQuestions += 1;
    if (correct) progress.totalCorrect += 1;

    const today = new Date().toISOString().split('T')[0];
    if (progress.lastStudyDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (progress.lastStudyDate === yesterday) {
        progress.currentStreak += 1;
      } else if (progress.lastStudyDate !== today) {
        progress.currentStreak = 1;
      }
      progress.lastStudyDate = today;
      progress.longestStreak = Math.max(progress.longestStreak, progress.currentStreak);
    }
    await progress.save();

    return NextResponse.json({
      easeFactor: item.easeFactor,
      interval: item.interval,
      repetitions: item.repetitions,
      nextReview: item.nextReview,
      accuracy: item.timesSeen > 0 ? item.timesCorrect / item.timesSeen : 0,
      streak: progress.currentStreak,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// GET /api/srs — Get due items and stats
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || 'default';
    const type = searchParams.get('type'); // radical, word, grammar, or null for all

    const now = new Date();
    const filter: any = { userId };
    if (type) filter.type = type;

    const dueItems = await SRSItem.find({ ...filter, nextReview: { $lte: now } }).sort({ easeFactor: 1 });
    const allItems = await SRSItem.find(filter);

    const typeBreakdown: Record<string, number> = {};
    for (const item of allItems) {
      typeBreakdown[item.type] = (typeBreakdown[item.type] || 0) + 1;
    }

    const dueBreakdown: Record<string, number> = {};
    for (const item of dueItems) {
      dueBreakdown[item.type] = (dueBreakdown[item.type] || 0) + 1;
    }

    return NextResponse.json({
      dueCount: dueItems.length,
      dueBreakdown,
      totalTracked: allItems.length,
      typeBreakdown,
      dueItems: dueItems.map(i => ({
        itemId: i.itemId,
        type: i.type,
        sectionId: i.sectionId,
        accuracy: i.timesSeen > 0 ? i.timesCorrect / i.timesSeen : 0,
        easeFactor: i.easeFactor,
        nextReview: i.nextReview,
        difficult: i.difficult,
      })),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
