import * as mongoose from 'mongoose';
import { MatchInterface } from '../interfaces/match.interface';

export const MatchSchema = new mongoose.Schema<MatchInterface>(
  {
    id: { type: String, index: true },
    spaceId: { type: String, required: [true, '此项为必填内容'], trim: true },
    duration: Number,
    startAt: String,
    endAt: String,
    totalPeople: Number,
    selectPeople: Number,
    minPeople: Number,
    rebate: Number,
    price: Number,
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  },
);
