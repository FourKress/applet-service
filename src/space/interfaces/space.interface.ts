import { Document } from 'mongoose';
export class SpaceInterface extends Document {
  id: string;
  // 球场Id
  stadiumId: string;
  // 场次名称
  name: string;
  // 5V5
  unit: string;
  // 日期
  validateDate: string;
  createdAt: Date;
  updatedAt: Date;
}
