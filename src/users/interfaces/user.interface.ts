export interface UserInterface {
  id: string;
  // 微信openId
  openId: string;
  // 联系电话
  phoneNum: string;
  // 微信昵称
  nickName: string;
  // 区
  city: string;
  // 国家
  country: string;
  // 省
  province: string;
  // 性别 1:男 2:女 0:未知
  gender: number;
  // 头像
  avatarUrl: string;
  // 组队次数
  teamUpCount: number;
  // 是否场主
  isBoss: boolean;
  // 场主Id
  bossId: string;
  // 月卡数量
  monthlyCardCount: number;
  createdAt: Date;
  updatedAt: Date;
}
