import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { SchemaOptions } from '../../common/schemas/schema-options';
import { ManagerInterfaces } from '../interfaces/manager.interfaces';

export type ManagerDocument = Manager & Document;

@Schema(SchemaOptions)
export class Manager implements ManagerInterfaces {
  @Prop()
  id: string;
  @Prop()
  userId: string;
  @Prop()
  stadiumId: string;
  @Prop()
  bossId: string;
  @Prop()
  createdAt: number;
  @Prop()
  updatedAt: number;
  @Prop()
  validFlag: boolean;
}

export const ManagerSchema = SchemaFactory.createForClass(Manager);
