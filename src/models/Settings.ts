import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  userId: string;
  darkMode: boolean;
  autoPlayAudio: boolean;
  quizMode: 'mc' | 'type';
  fullCoverage: boolean;
  questionsPerQuiz: number;
}

const SettingsSchema = new Schema<ISettings>({
  userId: { type: String, required: true, default: 'default', unique: true },
  darkMode: { type: Boolean, default: true },
  autoPlayAudio: { type: Boolean, default: false },
  quizMode: { type: String, enum: ['mc', 'type'], default: 'mc' },
  fullCoverage: { type: Boolean, default: false },
  questionsPerQuiz: { type: Number, default: 20 },
}, { timestamps: true });

export default (mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema));
