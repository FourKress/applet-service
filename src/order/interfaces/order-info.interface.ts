import { OrderInterface } from './order.interface';

export class OrderInfoInterface implements OrderInterface {
  id: string;
  userId: string;
  stadiumId: string;
  spaceId: string;
  matchId: string;
  payAmount: string;
  isMonthlyCard: boolean;
  personCount: number;
  status: number;
  createdAt: Date;
  updatedAt: Date;
  stadiumName: string;
  spaceName: string;
  unit: number;
  runAt: string;
  duration: number;
  price: number;
  totalPrice: number;
  monthlyCardPrice: number;
  countdown: number;
}
