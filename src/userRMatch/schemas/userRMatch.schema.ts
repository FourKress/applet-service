import * as mongoose from 'mongoose';
import { UserRMatchInterface } from '../interfaces/userRMatch.interface';

export const UserRMatchSchema = new mongoose.Schema<UserRMatchInterface>(
  {
    id: { type: String, index: true },
    userId: { type: String, required: [true, '此项为必填内容'], trim: true },
    matchId: { type: String, required: [true, '此项为必填内容'], trim: true },
    spaceId: { type: String, required: [true, '此项为必填内容'], trim: true },
    stadiumId: { type: String, required: [true, '此项为必填内容'], trim: true },
    count: Number,
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  },
);
