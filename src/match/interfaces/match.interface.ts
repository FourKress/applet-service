export interface MatchInterface {
  id: string;
  stadiumId: string;
  spaceId: string;
  duration: number;
  runDate: string;
  startAt: string;
  endAt: string;
  totalPeople: number;
  selectPeople: number;
  minPeople: number;
  rebate: number;
  rebatePrice: number;
  price: number;
  repeatModel: number;
  space: string;
  repeatName: string;
  repeatWeek: number[];
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}
