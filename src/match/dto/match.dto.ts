import { MatchInterface } from '../interfaces/match.interface';

export class MatchDto {
  constructor(object: MatchInterface) {
    this.id = object?._id;
    this.spaceId = object?.spaceId;
    this.duration = object?.duration;
    this.startAt = object?.startAt;
    this.endAt = object?.endAt;
    this.totalPeople = object?.totalPeople;
    this.selectPeople = object?.selectPeople;
    this.minPeople = object?.minPeople;
    this.rebate = object?.rebate;
    this.price = object?.price;
    this.createdAt = object?.createdAt;
    this.updatedAt = object?.updatedAt;
  }
  readonly id: string;
  readonly spaceId: string;
  readonly duration: number;
  readonly startAt: string;
  readonly endAt: string;
  readonly totalPeople: number;
  readonly selectPeople: number;
  readonly minPeople: number;
  readonly rebate: number;
  readonly price: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
