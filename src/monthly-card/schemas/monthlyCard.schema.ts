import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { SchemaOptions } from '../../common/schemas/schema-options';
import { MonthlyCardInterface } from '../interfaces/monthlyCard.interface';
import { Stadium } from '../../stadium/schemas/stadium.schema';

export type MonthlyCardDocument = MonthlyCard & Document;

@Schema(SchemaOptions)
export class MonthlyCard implements MonthlyCardInterface {
  @Prop()
  id: string;
  @Prop()
  userId: string;
  @Prop()
  stadiumId: string;
  @Prop()
  validPeriodStart: string;
  @Prop()
  validPeriodEnd: string;
  @Prop()
  @Prop({ type: Types.ObjectId, ref: Stadium.name })
  stadium: string;
  @Prop()
  createdAt: number;
  @Prop()
  updatedAt: number;
}

export const MonthlyCardSchema = SchemaFactory.createForClass(MonthlyCard);
