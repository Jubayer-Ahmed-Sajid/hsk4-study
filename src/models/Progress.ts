import mongoose, { Schema, Document } from 'mongoose';

export interface IProgress extends Document {
  userId: string;
  totalQuestions: number;
  totalCorrect: number;
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string | null;
  quizHistory: {
    date: string;
    questions: number;
    correct: number;
    type: string;
  }[];
}

const ProgressSchema = new Schema<IProgress>({
  userId: { type: String, required: true, default: 'default', unique: true },
  totalQuestions: { type: Number, default: 0 },
  totalCorrect: { type: Number, default: 0 },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastStudyDate: { type: String, default: null },
  quizHistory: [{
    date: String,
    questions: Number,
    correct: Number,
    type: String,
  }],
}, { timestamps: true });

export default (mongoose.models.Progress || mongoose.model<IProgress>('Progress', ProgressSchema));
