import { IRule } from './rule.interface';

export interface RefundRuleInterface {
  id: string;
  // 球场Id
  stadiumId: string;
  rules: IRule[];
  validFlag: boolean;
  createdAt: number;
  updatedAt: number;
}
