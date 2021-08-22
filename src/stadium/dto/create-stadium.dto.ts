import {
  IsNotEmpty,
  IsNumber,
  IsMobilePhone,
  IsString,
  IsNumberString,
} from 'class-validator';

export class CreateStadiumDto {
  @IsNotEmpty({ message: 'bossId 不能为空' })
  @IsNumberString({}, { message: 'bossId 必须是数字的 string 类型' })
  bossId: string;
  @IsNotEmpty({ message: 'name 不能为空' })
  @IsString({ message: 'name 必须是 string 类型' })
  name: string;
  // @IsString({ message: 'city 必须是 string 类型' })
  city: string;
  // @IsString({ message: 'province 必须是 string 类型' })
  province: string;
  // @IsString({ message: 'country 必须是 string 类型' })
  country: string;
  // @IsNotEmpty({ message: 'firstPhoneNum 不能为空' })
  // @IsMobilePhone(
  //   'zh-CN',
  //   { strictMode: false },
  //   { message: 'firstPhoneNum 不是正确的手机号' },
  // )
  firstPhoneNum: string;
  // @IsMobilePhone(
  //   'zh-CN',
  //   { strictMode: false },
  //   { message: 'secondPhoneNum 不是正确的手机号' },
  // )
  secondPhoneNum: string;
  // @IsString({ message: 'address 必须是 string 类型' })
  address: string;
  // @IsString({ message: 'stadiumUrl 必须是 string 类型' })
  stadiumUrl: string;
  // @IsString({ message: 'remarks 必须是 string 类型' })
  remarks: string;
  // @IsString({ message: 'description 必须是 string 类型' })
  description: string;
  // @IsNumber(
  //   { allowNaN: false },
  //   { message: 'monthlyCardPrice 必须是 number 类型' },
  // )
  monthlyCardPrice: number;
}
