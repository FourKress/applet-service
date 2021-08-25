import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { SchemaOptions } from '../../common/schemas/schema-options';
import { MonthlyCardInterface } from '../interfaces/monthlyCard.interface';

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
  createdAt: Date;
  @Prop()
  updatedAt: Date;
}

export const MonthlyCardSchema = SchemaFactory.createForClass(MonthlyCard);
