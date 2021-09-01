import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaOptions } from '../../common/schemas/schema-options';
import { OrderInterface } from '../interfaces/order.interface';

export type OrderDocument = Order & Document;

@Schema(SchemaOptions)
export class Order implements OrderInterface {
  @Prop()
  id: string;
  @Prop()
  userId: string;
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
  @Prop({ default: false })
  isMonthlyCard: boolean;
  @Prop()
  personCount: number;
  @Prop()
  status: number;
  @Prop()
  createdAt: number;
  @Prop()
  updatedAt: number;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
