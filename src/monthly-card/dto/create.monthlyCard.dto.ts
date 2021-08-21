export class CreateMonthlyCardDto {
  userId: string;
  // 球场ID
  stadiumId: string;
  // 有效期开始
  validPeriodStart: string;
  // 有效期结束
  validPeriodEnd: string;
}
