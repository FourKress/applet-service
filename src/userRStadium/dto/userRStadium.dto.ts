import { UserRStadiumInterface } from '../interfaces/userRStadium.interface';

export class UserRStadiumDto {
  constructor(object: UserRStadiumInterface) {
    this.id = object?._id;
    this.userId = object?.userId;
    this.stadiumId = object?.stadiumId;
    this.stadiumName = object?.stadiumName;
    this.isWatch = object?.isWatch;
    this.createdAt = object?.createdAt;
    this.updatedAt = object?.updatedAt;
  }

  readonly id: string;
  readonly userId: string;
  readonly stadiumId: string;
  readonly stadiumName: string;
  readonly isWatch: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
