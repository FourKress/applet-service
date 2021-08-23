// import * as mongoose from 'mongoose';
// import { StadiumInterface } from '../interfaces/stadium.interface';
//
// export const StadiumSchema = new mongoose.Schema<StadiumInterface>(
//   {
//     id: { type: String, index: true },
//     bossId: { type: String, required: [true, '此项为必填内容'], trim: true },
//     name: { type: String, required: [true, '此项为必填内容'], trim: true },
//     city: String,
//     country: String,
//     province: String,
//     firstPhoneNum: String,
//     secondPhoneNum: String,
//     address: String,
//     stadiumUrl: String,
//     remarks: String,
//     description: String,
//     monthlyCardPrice: Number,
//   },
//   {
//     timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
//   },
// );

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StadiumDocument = Stadium & Document;

@Schema()
export class Stadium {
  @Prop({ name: 'id' })
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
