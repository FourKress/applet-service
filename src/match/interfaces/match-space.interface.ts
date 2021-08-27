import { MatchInterface } from './match.interface';

export class MatchSpaceInterface implements MatchInterface {
  readonly isDone: boolean;
  readonly isCancel: boolean;
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
  readonly repeatModel: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
