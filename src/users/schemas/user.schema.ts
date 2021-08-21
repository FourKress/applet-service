import * as mongoose from 'mongoose';
import { UserInterface } from '../interfaces/user.interface';

export const UserSchema = new mongoose.Schema<UserInterface>(
  {
    id: { type: String, index: true },
    openId: { type: String, required: [true, '此项为必填内容'], trim: true },
    phoneNum: String,
    nickName: String,
    city: String,
    country: String,
    province: String,
    gender: Number,
    avatarUrl: String,
    teamUpCount: Number,
    isBoss: Boolean,
    bossId: String,
    monthlyCardCount: Number,
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  },
);
