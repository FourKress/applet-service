export interface UserRStadiumInterface {
  id: string;
  // 用户Id
  userId: string;
  // 球场Id
  stadiumId: string;
  // 球场名称
  stadiumName: string;
  // 是否关注
  isWatch: boolean;
  createdAt: Date;
  updatedAt: Date;
}
