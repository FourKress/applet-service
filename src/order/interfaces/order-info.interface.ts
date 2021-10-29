import { OrderInterface } from './order.interface';

export class OrderInfoInterface implements OrderInterface {
  id: string;
  bossId: string;
  userId: string;
  user: string;
  stadiumId: string;
  spaceId: string;
  matchId: string;
  payMethod: number;
  payAmount: number;
  newMonthlyCard: boolean;
  isMonthlyCard: boolean;
  personCount: number;
  status: number;
  refundType: number;
  payAt: number;
  refundAt: number;
  refundAmount: number;
  createdAt: number;
  updatedAt: number;
  stadiumName: string;
  spaceName: string;
  unit: number;
  runAt: string;
  runDate: string;
  duration: number;
  price: number;
  totalPrice: number;
  monthlyCardPrice: number;
  countdown: number;
}
