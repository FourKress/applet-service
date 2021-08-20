import * as mongoose from 'mongoose';

import { UserRStadiumInterface } from '../interfaces/userRStadium.interface';

export const UserRStadiumSchema = new mongoose.Schema<UserRStadiumInterface>(
  {
    id: { type: String, index: true },
    userId: { type: String, required: [true, '此项为必填内容'], trim: true },
    stadiumId: String,
    stadiumName: String,
    isWatch: Boolean,
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  },
);
