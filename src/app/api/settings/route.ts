import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Settings from '@/models/Settings';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || 'default';
    let settings = await Settings.findOne({ userId });
    if (!settings) settings = new Settings({ userId });
    await settings.save();
    return NextResponse.json(settings);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { userId = 'default', ...updates } = body;
    const settings = await Settings.findOneAndUpdate(
      { userId },
      { $set: updates },
      { upsert: true, new: true }
    );
    return NextResponse.json(settings);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
