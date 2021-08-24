import {
  IsNotEmpty,
  IsNumber,
  IsMobilePhone,
  IsString,
  IsOptional,
  IsMongoId,
} from 'class-validator';

export class CreateStadiumDto {
  @IsMongoId({ message: 'bossId 不是正确的ID类型' })
  readonly bossId: string;

  @IsNotEmpty({ message: 'name 不能为空' })
  @IsString({ message: 'name 必须是 string 类型' })
  readonly name: string;

  @IsString({ message: 'city 必须是 string 类型' })
  readonly city: string;

  @IsString({ message: 'province 必须是 string 类型' })
  readonly province: string;

  @IsString({ message: 'country 必须是 string 类型' })
  readonly country: string;

  @IsNotEmpty({ message: 'firstPhoneNum 不能为空' })
  @IsMobilePhone(
    'zh-CN',
    { strictMode: false },
    { message: 'firstPhoneNum 不是正确的手机号' },
  )
  readonly firstPhoneNum: string;

  @IsOptional()
  @IsMobilePhone(
    'zh-CN',
    { strictMode: false },
    { message: 'secondPhoneNum 不是正确的手机号' },
  )
  readonly secondPhoneNum: string;

  @IsString({ message: 'address 必须是 string 类型' })
  readonly address: string;

  @IsString({ message: 'stadiumUrl 必须是 string 类型' })
  readonly stadiumUrl: string;

  @IsString({ message: 'remarks 必须是 string 类型' })
  readonly remarks: string;

  @IsString({ message: 'description 必须是 string 类型' })
  readonly description: string;

  @IsNumber(
    { allowNaN: false },
    { message: 'monthlyCardPrice 必须是 number 类型' },
  )
  readonly monthlyCardPrice: number;
}
