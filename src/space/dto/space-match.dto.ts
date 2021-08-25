import { SpaceInterface } from '../interfaces/space.interface';

export class SpaceMatchDto implements SpaceInterface {
  readonly id: string;
  readonly stadiumId: string;
  readonly name: string;
  readonly unit: string;
  readonly validateDate: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly full: boolean;
  readonly rebate: boolean;
}
