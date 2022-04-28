import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { SchemaOptions } from '../../common/schemas/schema-options';
import { WithdrawInterface } from '../interfaces/withdraw.interfaces';
import { User } from '../../users/schemas/user.schema';

export type WithdrawDocument = Withdraw & Document;

@Schema(SchemaOptions)
export class Withdraw implements WithdrawInterface {
  @Prop()
  id: string;
  @Prop({ type: Types.ObjectId, ref: User.name })
  userId: string;
  @Prop()
  bossId: string;
  @Prop()
  withdrawAmt: number;
  @Prop()
  createdMonthAt: number;
  @Prop({ default: false })
  status: boolean;
  @Prop({ default: 0 })
  wxWithdrawAt: string;
  @Prop({ default: '' })
  wxWithdrawId: string;
  @Prop({ default: '' })
  return_code: string;
  @Prop({ default: '' })
  return_msg: string;
  @Prop({ default: '' })
  err_code: string;
  @Prop({ default: '' })
  err_code_des: string;
  @Prop({ default: '' })
  result_code: string;
  @Prop()
  createdAt: number;
  @Prop()
  updatedAt: number;
}

export const WithdrawSchema = SchemaFactory.createForClass(Withdraw);
