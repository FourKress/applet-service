import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { SchemaOptions } from '../../common/schemas/schema-options';
import { ManagerInterfaces } from '../interfaces/manager.interfaces';
import { User } from '../../users/schemas/user.schema';

export type ManagerDocument = Manager & Document;

@Schema(SchemaOptions)
export class Manager implements ManagerInterfaces {
  @Prop()
  id: string;
  @Prop({ type: Types.ObjectId, ref: User.name })
  user: string;
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
