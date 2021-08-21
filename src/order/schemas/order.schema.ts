import * as mongoose from 'mongoose';
import { OrderInterface } from '../interfaces/order.interface';

export const OrderSchema = new mongoose.Schema<OrderInterface>(
  {
    id: { type: String, index: true },
    userId: { type: String, required: [true, '此项为必填内容'], trim: true },
    stadiumId: { type: String, required: [true, '此项为必填内容'], trim: true },
    spaceId: { type: String, required: [true, '此项为必填内容'], trim: true },
    matchId: { type: String, required: [true, '此项为必填内容'], trim: true },
    payAmount: String,
    isMonthlyCard: Boolean,
    personCount: Number,
    status: Number,
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  },
);
