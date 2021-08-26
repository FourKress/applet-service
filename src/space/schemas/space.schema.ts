import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { SchemaOptions } from '../../common/schemas/schema-options';
import { SpaceInterface } from '../interfaces/space.interface';

export type SpaceDocument = Space & Document;

@Schema(SchemaOptions)
export class Space implements SpaceInterface {
  @Prop()
  id: string;
  @Prop()
  stadiumId: string;
  @Prop()
  name: string;
  @Prop()
  unit: string;
  @Prop()
  createdAt: Date;
  @Prop()
  updatedAt: Date;
}

export const SpaceSchema = SchemaFactory.createForClass(Space);
