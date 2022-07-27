import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { SchemaOptions } from '../../common/schemas/schema-options';
import { SuggestionsInterface } from '../interfaces/suggestions.interface';
import { User } from '../../users/schemas/user.schema';

export type SuggestionsDocument = Suggestions & Document;

@Schema(SchemaOptions)
export class Suggestions implements SuggestionsInterface {
  @Prop()
  id: string;
  @Prop()
  imageUrls: any[];
  @Prop()
  remark: string;
  @Prop({ type: Types.ObjectId, ref: User.name })
  user: string;
  @Prop()
  createdAt: number;
  @Prop()
  updatedAt: number;
}

export const SuggestionsSchema = SchemaFactory.createForClass(Suggestions);
