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
  repeatFlag: boolean;
  status: boolean;
  chargeModel: number;
  matchTotalAmt: number;
  createdAt: number;
  updatedAt: number;

  type: number;
  interval: number;
}
