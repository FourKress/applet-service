import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { SchemaOptions } from '../../common/schemas/schema-options';
import { WithdrawInterface } from '../interfaces/withdraw.interfaces';

export type WithdrawDocument = Withdraw & Document;

@Schema(SchemaOptions)
export class Withdraw implements WithdrawInterface {
  @Prop()
  id: string;
  @Prop()
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
  wxWithdrawAt: number;
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
