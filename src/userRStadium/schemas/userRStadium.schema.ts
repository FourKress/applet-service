import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { SchemaOptions } from '../../common/schemas/schema-options';
import { UserRStadiumInterface } from '../interfaces/userRStadium.interface';

export type UserRStadiumDocument = UserRStadium & Document;

@Schema(SchemaOptions)
export class UserRStadium implements UserRStadiumInterface {
  @Prop()
  id: string;
  @Prop()
  userId: string;
  @Prop()
  stadiumId: string;
  @Prop()
  stadiumName: string;
  @Prop()
  isWatch: boolean;
  @Prop({ default: new Date().getTime() })
  createdAt: number;
  @Prop({ default: new Date().getTime() })
  updatedAt: number;
}

export const UserRStadiumSchema = SchemaFactory.createForClass(UserRStadium);
