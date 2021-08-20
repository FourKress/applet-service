import { StadiumInterface } from '../interfaces/stadium,interface';

export class StadiumDto {
  constructor(object: StadiumInterface) {
    this.id = object._id;
    this.name = object.name;
    this.city = object.city;
    this.province = object.province;
    this.country = object.country;
    this.firstPhoneNum = object.firstPhoneNum;
    this.secondPhoneNum = object.secondPhoneNum;
    this.address = object.address;
    this.stadiumUrl = object.stadiumUrl;
    this.remarks = object.remarks;
    this.description = object.description;
    this.monthlyCardPrice = object.monthlyCardPrice;
    this.createdAt = object.createdAt;
    this.updatedAt = object.updatedAt;
  }
  readonly id: string;
  readonly name: string;
  readonly city: string;
  readonly province: string;
  readonly country: string;
  readonly firstPhoneNum: string;
  readonly secondPhoneNum: string;
  readonly address: string;
  readonly stadiumUrl: string;
  readonly remarks: string;
  readonly description: string;
  readonly monthlyCardPrice: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
