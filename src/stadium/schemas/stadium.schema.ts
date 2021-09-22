import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { SchemaOptions } from '../../common/schemas/schema-options';
import { StadiumInterface } from '../interfaces/stadium.interface';

export type StadiumDocument = Stadium & Document;

@Schema(SchemaOptions)
export class Stadium implements StadiumInterface {
  @Prop()
  id: string;
  @Prop({ required: true })
  bossId: string;
  @Prop({ required: true })
  name: string;
  @Prop()
  city: string;
  @Prop()
  country: string;
  @Prop()
  province: string;
  @Prop({ required: true })
  phoneNum: string;
  @Prop()
  address: string;
  @Prop()
  stadiumUrl: string;
  @Prop()
  remarks: string;
  @Prop()
  description: string;
  @Prop({ default: false })
  monthlyCardStatus: boolean;
  @Prop({ default: 0 })
  monthlyCardPrice: number;
  @Prop()
  createdAt: number;
  @Prop()
  updatedAt: number;
}

export const StadiumSchema = SchemaFactory.createForClass(Stadium);