export class CreateUserDto {
  // 微信openId
  readonly openId: string;
  // 联系电话
  readonly phoneNum: string;
  // 微信昵称
  readonly nickName: string;
  // 区
  readonly city: string;
  // 国家
  readonly country: string;
  // 省
  readonly province: string;
  // 性别 1:男 2:女 0:未知
  readonly gender: number;
  // 头像
  readonly avatarUrl: string;
  // 组队次数
  readonly teamUpCount: number;
  // 是否场主
  readonly isBoss: boolean;
  // 月卡数量
  readonly monthlyCardCount: number;
}
