import { UserInterface } from '../interfaces/user.interface';

export class UserDto {
  constructor(object: UserInterface) {
    this.id = object._id;
    this.openId = object.openId;
    this.phoneNum = object.phoneNum;
    this.nickName = object.nickName;
    this.city = object.city;
    this.country = object.country;
    this.province = object.province;
    this.gender = object.gender;
    this.avatarUrl = object.avatarUrl;
    this.teamUpCount = object.teamUpCount;
    this.isBoss = object.isBoss;
    this.monthlyCardCount = object.monthlyCardCount;
    this.createdAt = object.createdAt;
    this.updatedAt = object.updatedAt;
  }
  readonly id: string;
  readonly openId: string;
  readonly phoneNum: string;
  readonly nickName: string;
  readonly city: string;
  readonly country: string;
  readonly province: string;
  readonly gender: number;
  readonly avatarUrl: string;
  readonly teamUpCount: number;
  readonly isBoss: boolean;
  readonly monthlyCardCount: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
