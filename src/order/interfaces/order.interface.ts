export interface OrderInterface {
  id: string;
  // 用户ID
  userId: string;
  // 用户ID
  bossId: string;
  // 球场ID
  stadiumId: string;
  // 场地ID
  spaceId: string;
  // 场次ID
  matchId: string;
  // 支付金额
  payAmount: number;
  // 是否月卡
  isMonthlyCard: boolean;
  // 人数
  personCount: number;
  // 状态
  status: number;
  createdAt: number;
  updatedAt: number;
}
