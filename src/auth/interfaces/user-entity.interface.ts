/**
 * request中通过token解析出的用户信息
 */
export interface UserEntity {
  /** 用户Id */
  userid: string;
  /** 用户身份 */
  roles: string[];
}
