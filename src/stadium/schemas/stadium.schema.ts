import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { SchemaOptions } from '../../common/schemas/schema-options';
import { StadiumInterface } from '../interfaces/stadium.interface';

export type StadiumDocument = Stadium & Document;

@Schema(SchemaOptions)
export class Stadium implements StadiumInterface {
  @Prop()
  id: string;
  @Prop()
  bossId: string;
  @Prop()
  name: string;
  @Prop()
  city: string;
  @Prop()
  country: string;
  @Prop()
  province: string;
  @Prop()
  firstPhoneNum: string;
  @Prop()
  secondPhoneNum: string;
  @Prop()
  address: string;
  @Prop()
  stadiumUrl: string;
  @Prop()
  remarks: string;
  @Prop()
  description: string;
  @Prop()
  monthlyCardPrice: number;
  @Prop()
  createdAt: Date;
  @Prop()
  updatedAt: Date;
}

export const StadiumSchema = SchemaFactory.createForClass(Stadium);
