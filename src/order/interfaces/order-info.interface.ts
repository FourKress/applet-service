import { OrderInterface } from './order.interface';

export class OrderInfoInterface extends OrderInterface {
  stadiumName: string;
  spaceName: string;
  unit: string;
  validateDate: string;
  runAt: string;
  duration: number;
  price: number;
  totalPrice: number;
  isMonthlyCard: boolean;
  monthlyCardPrice: number;
  countdown: number;
}
