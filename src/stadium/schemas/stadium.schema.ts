import * as mongoose from 'mongoose';
import { StadiumInterface } from '../interfaces/stadium,interface';

export const StadiumSchema = new mongoose.Schema<StadiumInterface>(
  {
    id: { type: String, index: true },
    bossId: { type: String, required: [true, '此项为必填内容'], trim: true },
    name: { type: String, required: [true, '此项为必填内容'], trim: true },
    city: String,
    country: String,
    province: String,
    firstPhoneNum: String,
    secondPhoneNum: String,
    address: String,
    stadiumUrl: String,
    remarks: String,
    description: String,
    monthlyCardPrice: Number,
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  },
);
