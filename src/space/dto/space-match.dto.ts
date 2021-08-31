import { SpaceInterface } from '../interfaces/space.interface';

export class SpaceMatchDto implements SpaceInterface {
  readonly id: string;
  readonly stadiumId: string;
  readonly name: string;
  readonly unit: number;
  readonly createdAt: number;
  readonly updatedAt: number;
  readonly full: boolean;
  readonly rebate: boolean;
}
