import mongoose, { Schema, Document } from 'mongoose';

export interface ISRSItem extends Document {
  userId: string;
  type: 'radical' | 'word' | 'grammar';
  itemId: string;
  sectionId: number;
  easeFactor: number;
  interval: number;
  repetitions: number;
  lastReview: Date | null;
  nextReview: Date;
  timesSeen: number;
  timesCorrect: number;
  difficult: boolean;
}

const SRSItemSchema = new Schema<ISRSItem>({
  userId: { type: String, required: true, default: 'default' },
  type: { type: String, enum: ['radical', 'word', 'grammar'], required: true },
  itemId: { type: String, required: true },
  sectionId: { type: Number, required: true },
  easeFactor: { type: Number, default: 2.5 },
  interval: { type: Number, default: 0 },
  repetitions: { type: Number, default: 0 },
  lastReview: { type: Date, default: null },
  nextReview: { type: Date, default: () => new Date() },
  timesSeen: { type: Number, default: 0 },
  timesCorrect: { type: Number, default: 0 },
  difficult: { type: Boolean, default: false },
}, { timestamps: true });

SRSItemSchema.index({ userId: 1, type: 1, itemId: 1 }, { unique: true });
SRSItemSchema.index({ userId: 1, nextReview: 1 });

export default (mongoose.models.SRSItem || mongoose.model<ISRSItem>('SRSItem', SRSItemSchema));
