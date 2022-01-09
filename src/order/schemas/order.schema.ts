import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaOptions } from '../../common/schemas/schema-options';
import { OrderInterface } from '../interfaces/order.interface';
import { User } from '../../users/schemas/user.schema';

export type OrderDocument = Order & Document;

@Schema(SchemaOptions)
export class Order implements OrderInterface {
  @Prop()
  id: string;
  @Prop()
  userId: string;
  @Prop({ type: Types.ObjectId, ref: User.name })
  user: string;
  @Prop()
  bossId: string;
  @Prop()
  stadiumId: string;
  @Prop()
  spaceId: string;
  @Prop()
  matchId: string;
  @Prop()
  payAmount: number;
  @Prop()
  payMethod: number;
  @Prop({ default: false })
  newMonthlyCard: boolean;
  @Prop({ default: false })
  isMonthlyCard: boolean;
  @Prop()
  personCount: number;
  @Prop()
  status: number;
  @Prop()
  refundType: number;
  @Prop()
  refundAmount: number;
  @Prop()
  payAt: number;
  @Prop()
  refundAt: number;
  @Prop()
  refundId: string;
  @Prop()
  createdAt: number;
  @Prop()
  updatedAt: number;
  @Prop()
  wxOrderId: string;
  @Prop()
  wxRefundId: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
