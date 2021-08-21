import { Document } from 'mongoose';

export class UserRMatchInterface extends Document {
  id: string;
  // 用户Id
  userId: string;
  // 人数
  count: number;
  // 比赛Id
  matchId: string;
  // 场次Id
  spaceId: string;
  // 球场Id
  stadiumId: string;
  createdAt: Date;
  updatedAt: Date;
}
