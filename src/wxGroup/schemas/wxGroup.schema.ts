import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { SchemaOptions } from '../../common/schemas/schema-options';
import { WxGroupInterface } from '../interfaces/wxGroup.interface';

export type WxGroupDocument = WxGroup & Document;

@Schema(SchemaOptions)
export class WxGroup implements WxGroupInterface {
  @Prop()
  id: string;
  @Prop()
  wxGroupId: string;
  @Prop()
  wxGroupName: string;
  @Prop()
  bossId: string;
  @Prop()
  stadiumId: string;
  @Prop()
  createdAt: number;
  @Prop()
  updatedAt: number;
}

export const WxGroupSchema = SchemaFactory.createForClass(WxGroup);
