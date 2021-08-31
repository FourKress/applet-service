import { OrderInterface } from './order.interface';

export class OrderInfoInterface implements OrderInterface {
  id: string;
  bossId: string;
  userId: string;
  stadiumId: string;
  spaceId: string;
  matchId: string;
  payAmount: number;
  isMonthlyCard: boolean;
  personCount: number;
  status: number;
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
