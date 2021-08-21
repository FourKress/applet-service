import { Document } from 'mongoose';

export class MatchInterface extends Document {
  id: string;
  // 场地Id
  spaceId: string;
  // 时长
  duration: number;
  // 开始时间
  startAt: string;
  // 结束时间
  endAt: string;
  // 总人数
  totalPeople: number;
  // 已选人数
  selectPeople: number;
  // 最小人数
  minPeople: number;
  // 折扣
  rebate: number;
  // 单价
  price: number;
  createdAt: Date;
  updatedAt: Date;
}
