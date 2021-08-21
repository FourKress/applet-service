import { UserRMatchInterface } from '../interfaces/userRMatch.interface';

export class UserRMatchDto {
  constructor(object: UserRMatchInterface) {
    this.id = object?._id;
    this.userId = object?.userId;
    this.matchId = object?.matchId;
    this.spaceId = object?.spaceId;
    this.stadiumId = object?.stadiumId;
    this.count = object?.count;
    this.createdAt = object?.createdAt;
    this.updatedAt = object?.updatedAt;
  }

  readonly id: string;
  readonly userId: string;
  readonly matchId: string;
  readonly spaceId: string;
  readonly stadiumId: string;
  readonly count: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
