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
  stadiumId: string;
  @Prop()
  spaceId: string;
  @Prop()
  matchId: string;
  @Prop()
  payAmount: string;
  @Prop()
  isMonthlyCard: boolean;
  @Prop()
  personCount: number;
  @Prop()
  status: number;
  @Prop()
  createdAt: Date;
  @Prop()
  updatedAt: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
