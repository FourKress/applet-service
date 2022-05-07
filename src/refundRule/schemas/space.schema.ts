import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { SchemaOptions } from '../../common/schemas/schema-options';
import { RefundRuleInterface } from '../interfaces/refundRule.interface';
import { IRule } from '../interfaces/rule.interface';

export type RefundRuleDocument = RefundRule & Document;

@Schema(SchemaOptions)
export class RefundRule implements RefundRuleInterface {
  @Prop()
  id: string;
  @Prop({ required: true })
  stadiumId: string;
  @Prop({ required: true })
  rules: IRule[];
  @Prop({ default: true })
  validFlag: boolean;
  @Prop()
  createdAt: number;
  @Prop()
  updatedAt: number;
}

export const RefundRuleSchema = SchemaFactory.createForClass(RefundRule);
