import {
  IsNotEmpty,
  IsNumber,
  IsMobilePhone,
  IsString,
  IsNumberString,
  IsOptional,
} from 'class-validator';

export class ModifyStadiumDto {
  @IsNotEmpty({ message: 'id 不能为空' })
  @IsNumberString({}, { message: 'id 必须是数字的 string 类型' })
  readonly id: string;

  @IsNotEmpty({ message: 'bossId 不能为空' })
  @IsNumberString({}, { message: 'bossId 必须是数字的 string 类型' })
  bossId: string;

  @IsOptional()
  @IsString({ message: 'name 必须是 string 类型' })
  name: string;

  @IsOptional()
  @IsString({ message: 'city 必须是 string 类型' })
  city: string;

  @IsOptional()
  @IsString({ message: 'province 必须是 string 类型' })
  province: string;

  @IsOptional()
  @IsString({ message: 'country 必须是 string 类型' })
  country: string;

  @IsOptional()
  @IsNotEmpty({ message: 'firstPhoneNum 不能为空' })
  @IsMobilePhone(
    'zh-CN',
    { strictMode: false },
    { message: 'firstPhoneNum 不是正确的手机号' },
  )
  firstPhoneNum: string;

  @IsOptional()
  @IsMobilePhone(
    'zh-CN',
    { strictMode: false },
    { message: 'secondPhoneNum 不是正确的手机号' },
  )
  secondPhoneNum: string;

  @IsOptional()
  @IsString({ message: 'address 必须是 string 类型' })
  address: string;

  @IsOptional()
  @IsString({ message: 'stadiumUrl 必须是 string 类型' })
  stadiumUrl: string;

  @IsOptional()
  @IsString({ message: 'remarks 必须是 string 类型' })
  remarks: string;

  @IsOptional()
  @IsString({ message: 'description 必须是 string 类型' })
  description: string;

  @IsOptional()
  @IsNumber(
    { allowNaN: false },
    { message: 'monthlyCardPrice 必须是 number 类型' },
  )
  monthlyCardPrice: number;
}
