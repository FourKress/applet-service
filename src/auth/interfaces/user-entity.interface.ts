/**
 * request中通过token解析出的用户信息
 */
export interface UserEntity {
  // 用户Id
  userId: string;
  // 微信唯一标识
  openId: string;
  // 用户身份
  isBoss: boolean;
}
