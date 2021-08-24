import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { SchemaOptions } from '../../common/schemas/schema-options';
import { UserRMatchInterface } from '../interfaces/userRMatch.interface';

export type UserRMatchDocument = UserRMatch & Document;

@Schema(SchemaOptions)
export class UserRMatch implements UserRMatchInterface {
  @Prop()
  id: string;
  @Prop()
  userId: string;
  @Prop()
  count: number;
  @Prop()
  matchId: string;
  @Prop()
  spaceId: string;
  @Prop()
  stadiumId: string;
  @Prop()
  createdAt: Date;
  @Prop()
  updatedAt: Date;
}

export const UserRMatchSchema = SchemaFactory.createForClass(UserRMatch);
