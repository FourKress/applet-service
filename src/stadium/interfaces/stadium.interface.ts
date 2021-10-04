export interface StadiumInterface {
  readonly id: string;
  // 关联的用户bossId
  readonly bossId: string;
  // 球场名称
  readonly name: string;
  // 区
  readonly city: string;
  // 省
  readonly province: string;
  // 国家
  readonly district: string;
  readonly longitude: number;
  readonly latitude: number;
  // 球场电话
  readonly phoneNum: string;
  // 球场地址
  readonly address: string;
  // 球场图
  readonly stadiumUrl: string;
  // 场地
  readonly remarks: string;
  // 富文本描述
  readonly description: string;
  // 月卡是否开启状态
  readonly monthlyCardStatus: boolean;
  // 月卡价格
  readonly monthlyCardPrice: number;
  readonly createdAt: number;
  readonly updatedAt: number;
}
