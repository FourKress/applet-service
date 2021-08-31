import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { SchemaOptions } from '../../common/schemas/schema-options';
import { UserInterface } from '../interfaces/user.interface';

export type UserDocument = User & Document;

@Schema(SchemaOptions)
export class User implements UserInterface {
  @Prop()
  id: string;
  @Prop()
  bossId: string;
  @Prop()
  openId: string;
  @Prop()
  phoneNum: string;
  @Prop()
  nickName: string;
  @Prop()
  city: string;
  @Prop()
  country: string;
  @Prop()
  province: string;
  @Prop()
  gender: number;
  @Prop()
  avatarUrl: string;
  @Prop()
  teamUpCount: number;
  @Prop()
  isBoss: boolean;
  @Prop()
  monthlyCardCount: number;
  @Prop({ default: new Date().getTime() })
  createdAt: number;
  @Prop({ default: new Date().getTime() })
  updatedAt: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
