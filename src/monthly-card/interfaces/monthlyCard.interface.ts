export interface MonthlyCardInterface {
  id: string;
  // 用户ID
  userId: string;
  // 球场ID
  stadiumId: string;
  // 有效期开始
  validPeriodStart: string;
  // 有效期结束
  validPeriodEnd: string;
  stadium: string;
  createdAt: number;
  updatedAt: number;
}
