import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { SchemaOptions } from '../../common/schemas/schema-options';
import { SpaceInterface } from '../interfaces/space.interface';

export type SpaceDocument = Space & Document;

@Schema(SchemaOptions)
export class Space implements SpaceInterface {
  @Prop()
  id: string;
  @Prop({ required: true })
  stadiumId: string;
  @Prop({ required: true })
  name: string;
  @Prop({ required: true })
  unit: number;
  @Prop({ default: false })
  full: boolean;
  @Prop({ default: false })
  rebate: boolean;
  @Prop()
  createdAt: number;
  @Prop()
  updatedAt: number;
}

export const SpaceSchema = SchemaFactory.createForClass(Space);
