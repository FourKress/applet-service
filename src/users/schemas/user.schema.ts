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
  bossPhoneNum: string;
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
  @Prop({ default: 0 })
  teamUpCount: number;
  @Prop({ default: 0 })
  monthlyCardCount: number;
  @Prop({ default: 0 })
  balanceAmt: number;
  @Prop({ select: false })
  withdrawAt: number;
  @Prop()
  createdAt: number;
  @Prop()
  updatedAt: number;
  @Prop({ default: false })
  isAdmin: boolean;
  @Prop()
  adminPassword: string;
  @Prop({ default: false })
  bossStatus: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
