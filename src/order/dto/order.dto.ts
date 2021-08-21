import { OrderInterface } from '../interfaces/order.interface';
import { Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export class OrderDto {
  constructor(object: OrderInterface) {
    this.id = object?._id;
    this.userId = object?.userId;
    this.stadiumId = object?.stadiumId;
    this.spaceId = object?.spaceId;
    this.matchId = object?.matchId;
    this.payAmount = object?.payAmount;
    this.isMonthlyCard = object?.isMonthlyCard;
    this.personCount = object?.personCount;
    this.status = object?.status;
    this.createdAt = object?.createdAt;
    this.updatedAt = object?.updatedAt;
  }
  readonly id: string;
  readonly userId: string;
  readonly stadiumId: string;
  readonly spaceId: string;
  readonly matchId: string;
  readonly payAmount: string;
  readonly isMonthlyCard: boolean;
  readonly personCount: number;
  readonly status: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
