import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
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
  amount: number;
  @Prop()
  status: number;
  @Prop()
  wxWithdrawAt: number;
  @Prop()
  wxWithdrawId: string;
  @Prop()
  createdAt: number;
  @Prop()
  updatedAt: number;
  @Prop()
  return_code: string;
  @Prop()
  return_msg: string;
  @Prop()
  err_code: string;
  @Prop()
  err_code_des: string;
  @Prop()
  result_code: string;
}

export const WithdrawSchema = SchemaFactory.createForClass(Withdraw);
