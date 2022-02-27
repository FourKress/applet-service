import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaOptions } from '../../common/schemas/schema-options';
import { OrderInterface } from '../interfaces/order.interface';
import { User } from '../../users/schemas/user.schema';
import { Stadium } from '../../stadium/schemas/stadium.schema';
import { Space } from '../../space/schemas/space.schema';
import { Match } from '../../match/schemas/match.schema';

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
  @Prop({ type: Types.ObjectId, ref: Stadium.name })
  stadiumId: string;
  @Prop({ type: Types.ObjectId, ref: Space.name })
  spaceId: string;
  @Prop({ type: Types.ObjectId, ref: Match.name })
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
  @Prop({ type: Types })
  prepayInfo: any;
  @Prop()
  closeFlag: boolean;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
