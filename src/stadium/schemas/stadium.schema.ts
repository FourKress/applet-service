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
  district: string;
  @Prop()
  province: string;
  @Prop()
  longitude: number;
  @Prop()
  latitude: number;
  @Prop({ required: true })
  phoneNum: string;
  @Prop()
  address: string;
  @Prop()
  stadiumUrls: any[];
  @Prop()
  remarks: string;
  @Prop()
  description: string;
  @Prop({ default: false })
  monthlyCardStatus: boolean;
  @Prop({ default: 0 })
  monthlyCardPrice: number;
  @Prop()
  wxGroup: string;
  @Prop()
  wxGroupId: string;
  @Prop()
  welcomeWords: string;
  @Prop()
  createdAt: number;
  @Prop()
  updatedAt: number;
}

export const StadiumSchema = SchemaFactory.createForClass(Stadium);
