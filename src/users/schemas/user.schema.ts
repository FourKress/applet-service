import * as mongoose from 'mongoose';
import { User } from '../interfaces/user.interface';

export const UserSchema = new mongoose.Schema<User>(
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
    monthlyCardCount: Number,
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  },
);
