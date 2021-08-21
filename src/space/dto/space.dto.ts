import { SpaceInterface } from '../interfaces/space.interface';

export class SpaceDto {
  constructor(object: SpaceInterface) {
    this.id = object?._id;
    this.stadiumId = object?.stadiumId;
    this.name = object?.name;
    this.unit = object?.unit;
    this.validateDate = object?.validateDate;
    this.createdAt = object?.createdAt;
    this.updatedAt = object?.updatedAt;
  }
  readonly id: string;
  readonly stadiumId: string;
  readonly name: string;
  readonly unit: string;
  readonly validateDate: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
