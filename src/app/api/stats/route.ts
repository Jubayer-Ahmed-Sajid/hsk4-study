import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Progress from '@/models/Progress';
import SRSItem from '@/models/SRSItem';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || 'default';

    let progress = await Progress.findOne({ userId });
    if (!progress) progress = new Progress({ userId });

    const allItems = await SRSItem.find({ userId });
    const now = new Date();
    const dueItems = await SRSItem.find({ userId, nextReview: { $lte: now } });

    const mastered = allItems.filter(i => i.timesSeen > 0 && (i.timesCorrect / i.timesSeen) >= 0.8).length;
    const learning = allItems.filter(i => i.timesSeen > 0 && (i.timesCorrect / i.timesSeen) < 0.8).length;

    const avgEase = allItems.length > 0
      ? allItems.reduce((sum, i) => sum + i.easeFactor, 0) / allItems.length
      : 2.5;

    const overallAccuracy = progress.totalQuestions > 0
      ? progress.totalCorrect / progress.totalQuestions
      : 0;

    // Per-section breakdown
    const sections: Record<string, { mastered:number, learning:number, new_:number, accuracy:number, total:number }> = {};
    for (const item of allItems) {
      const key = `${item.type}-${item.sectionId}`;
      if (!sections[key]) sections[key] = { mastered:0, learning:0, new_:0, accuracy:0, total:0 };
      sections[key].total += 1;
      if (item.timesSeen === 0) sections[key].new_ += 1;
      else if (item.timesCorrect / item.timesSeen >= 0.8) sections[key].mastered += 1;
      else sections[key].learning += 1;
    }
    for (const key of Object.keys(sections)) {
      const s = sections[key];
      const sectionItems = allItems.filter(i => `${i.type}-${i.sectionId}` === key);
      const totalSeen = sectionItems.filter(i => i.timesSeen > 0);
      s.accuracy = totalSeen.length > 0
        ? totalSeen.reduce((sum, i) => sum + (i.timesCorrect / i.timesSeen), 0) / totalSeen.length
        : 0;
    }

    return NextResponse.json({
      totalQuestions: progress.totalQuestions,
      totalCorrect: progress.totalCorrect,
      overallAccuracy,
      currentStreak: progress.currentStreak,
      longestStreak: progress.longestStreak,
      lastStudyDate: progress.lastStudyDate,
      totalTracked: allItems.length,
      mastered,
      learning,
      masteryPercent: allItems.length > 0 ? mastered / allItems.length : 0,
      avgEaseFactor: avgEase,
      dueToday: dueItems.length,
      dueRadicals: dueItems.filter(i => i.type === 'radical').length,
      dueWords: dueItems.filter(i => i.type === 'word').length,
      dueGrammar: dueItems.filter(i => i.type === 'grammar').length,
      sections,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();
    const userId = 'default';
    await Progress.deleteOne({ userId });
    await SRSItem.deleteMany({ userId });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
