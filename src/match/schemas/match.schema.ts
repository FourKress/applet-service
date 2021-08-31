import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { SchemaOptions } from '../../common/schemas/schema-options';
import { MatchInterface } from '../interfaces/match.interface';
import { Space } from '../../space/schemas/space.schema';

export type MatchDocument = Match & Document;

@Schema(SchemaOptions)
export class Match implements MatchInterface {
  @Prop()
  id: string;
  @Prop({ require: true })
  stadiumId: string;
  @Prop({ require: true })
  spaceId: string;
  @Prop({ require: true })
  duration: number;
  @Prop()
  runDate: string;
  @Prop({ require: true })
  startAt: string;
  @Prop({ require: true })
  endAt: string;
  @Prop({ require: true })
  totalPeople: number;
  @Prop({ default: 0 })
  selectPeople: number;
  @Prop({ require: true })
  minPeople: number;
  @Prop({ require: true })
  rebate: number;
  @Prop({ require: true })
  rebatePrice: number;
  @Prop({ require: true })
  price: number;
  @Prop({ require: true })
  repeatModel: number;
  @Prop()
  repeatName: string;
  @Prop()
  repeatWeek: number[];
  @Prop({ type: Types.ObjectId, ref: Space.name })
  space: string;
  @Prop({ default: false })
  isDone: boolean;
  @Prop({ default: false })
  isCancel: boolean;
  @Prop({ default: true })
  status: boolean;
  @Prop({ default: new Date().getTime() })
  createdAt: number;
  @Prop({ default: new Date().getTime() })
  updatedAt: number;
}

export const MatchSchema = SchemaFactory.createForClass(Match);
