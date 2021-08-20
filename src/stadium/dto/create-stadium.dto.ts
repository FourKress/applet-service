export class CreateStadiumDto {
  // 球场名称
  name: string;
  // 区
  city: string;
  // 省
  province: string;
  // 国家
  country: string;
  // 球场电话
  firstPhoneNum: string;
  // 球场电话
  secondPhoneNum: string;
  // 球场地址
  address: number;
  // 球场图
  stadiumUrl: string;
  // 场地
  remarks: string;
  // 富文本描述
  description: string;
  // 月卡价格
  monthlyCardPrice: string;
}
