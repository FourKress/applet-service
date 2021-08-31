import { MatchInterface } from './match.interface';

export class MatchSpaceInterface implements MatchInterface {
  readonly isDone: boolean;
  readonly isCancel: boolean;
  readonly id: string;
  readonly stadiumId: string;
  readonly spaceId: string;
  readonly duration: number;
  readonly runDate: string;
  readonly startAt: string;
  readonly endAt: string;
  readonly totalPeople: number;
  readonly selectPeople: number;
  readonly minPeople: number;
  readonly rebate: number;
  readonly rebatePrice: number;
  readonly price: number;
  readonly repeatModel: number;
  readonly repeatWeek: number[];
  readonly space: string;
  readonly repeatName: string;
  readonly status: boolean;
  readonly createdAt: number;
  readonly updatedAt: number;
}
