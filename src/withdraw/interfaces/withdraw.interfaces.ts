export interface WithdrawInterface {
  id: string;
  // 用户ID
  userId: string;
  bossId: string;
  // 提现金额
  amount: number;
  status: boolean;
  wxWithdrawAt: number;
  wxWithdrawId: string;
  return_code: string;
  return_msg: string;
  err_code: string;
  err_code_des: string;
  result_code: string;
  createdAt: number;
  updatedAt: number;
}
