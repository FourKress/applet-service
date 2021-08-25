import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { SchemaOptions } from '../../common/schemas/schema-options';
import { MatchInterface } from '../interfaces/match.interface';

export type MatchDocument = Match & Document;

@Schema(SchemaOptions)
export class Match implements MatchInterface {
  @Prop()
  id: string;
  @Prop()
  spaceId: string;
  @Prop()
  duration: number;
  @Prop()
  startAt: string;
  @Prop()
  endAt: string;
  @Prop()
  totalPeople: number;
  @Prop()
  selectPeople: number;
  @Prop()
  minPeople: number;
  @Prop()
  rebate: number;
  @Prop()
  price: number;
  @Prop()
  createdAt: Date;
  @Prop()
  updatedAt: Date;
}

export const MatchSchema = SchemaFactory.createForClass(Match);
