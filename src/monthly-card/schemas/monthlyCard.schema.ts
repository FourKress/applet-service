import * as mongoose from 'mongoose';
import { MonthlyCardInterface } from '../interfaces/monthlyCard.interface';

export const MonthlyCardSchema = new mongoose.Schema<MonthlyCardInterface>(
  {
    id: { type: String, index: true },
    userId: { type: String, required: [true, '此项为必填内容'], trim: true },
    stadiumId: { type: String, required: [true, '此项为必填内容'], trim: true },
    validPeriodStart: String,
    validPeriodEnd: String,
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  },
);
