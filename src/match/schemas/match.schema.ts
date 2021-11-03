import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { SchemaOptions } from '../../common/schemas/schema-options';
import { MatchInterface } from '../interfaces/match.interface';
import { Space } from '../../space/schemas/space.schema';
import { Stadium } from '../../stadium/schemas/stadium.schema';

export type MatchDocument = Match & Document;

@Schema(SchemaOptions)
export class Match implements MatchInterface {
  @Prop()
  id: string;
  @Prop({ require: true })
  stadiumId: string;
  @Prop({ require: true, type: Types.ObjectId, ref: Stadium.name })
  stadium: string;
  @Prop({ require: true })
  spaceId: string;
  @Prop()
  parentId: string;
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
  @Prop({ default: true })
  status: boolean;
  @Prop()
  createdAt: number;
  @Prop()
  updatedAt: number;
}

export const MatchSchema = SchemaFactory.createForClass(Match);
