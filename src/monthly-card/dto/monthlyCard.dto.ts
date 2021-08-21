import { MonthlyCardInterface } from '../interfaces/monthlyCard.interface';

export class MonthlyCardDto {
  constructor(object: MonthlyCardInterface) {
    this.id = object?._id;
    this.userId = object?.userId;
    this.stadiumId = object?.stadiumId;
    this.validPeriodStart = object?.validPeriodStart;
    this.validPeriodEnd = object?.validPeriodEnd;
    this.createdAt = object?.createdAt;
    this.updatedAt = object?.updatedAt;
  }
  readonly id: string;
  readonly userId: string;
  readonly stadiumId: string;
  readonly validPeriodStart: string;
  readonly validPeriodEnd: string;
  readonly status: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
