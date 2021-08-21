export class CreateOderDto {
  // 用户ID
  userId: string;
  // 球场ID
  stadiumId: string;
  // 场地ID
  spaceId: string;
  // 场次ID
  matchId: string;
  // 支付金额
  payAmount: string;
  // 是否月卡
  isMonthlyCard: boolean;
  // 人数
  personCount: number;
  status: number;
}
