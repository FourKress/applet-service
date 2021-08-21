import * as mongoose from 'mongoose';
import { SpaceInterface } from '../interfaces/space.interface';

export const SpaceSchema = new mongoose.Schema<SpaceInterface>(
  {
    id: { type: String, index: true },
    stadiumId: { type: String, required: [true, '此项为必填内容'], trim: true },
    name: String,
    unit: String,
    validateDate: String,
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  },
);
