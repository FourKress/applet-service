import {
  IsNotEmpty,
  IsNumber,
  IsMobilePhone,
  IsString,
  IsMongoId,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class ModifyUserDto {
  @IsOptional()
  @IsMongoId({ message: 'id 不是正确的ID类型' })
  readonly id: string;

  @IsOptional()
  @IsMongoId({ message: 'openId 不是正确的ID类型' })
  readonly openId: string;

  @IsOptional()
  @IsMongoId({ message: 'bossId 不是正确的ID类型' })
  readonly bossId: string;

  @IsOptional()
  @IsMobilePhone(
    'zh-CN',
    { strictMode: false },
    { message: 'phoneNum 不是正确的手机号' },
  )
  readonly phoneNum: string;

  @IsOptional()
  @IsMobilePhone(
    'zh-CN',
    { strictMode: false },
    { message: 'bossPhoneNum 不是正确的手机号' },
  )
  readonly bossPhoneNum: string;

  @IsOptional()
  @IsString({ message: 'nickName 必须是 string 类型' })
  readonly nickName: string;

  @IsOptional()
  @IsString({ message: 'city 必须是 string 类型' })
  readonly city: string;

  @IsOptional()
  @IsString({ message: 'province 必须是 string 类型' })
  readonly province: string;

  @IsOptional()
  @IsString({ message: 'country 必须是 string 类型' })
  readonly country: string;

  @IsOptional()
  @IsNumber({ allowNaN: false }, { message: 'gender 必须是 number 类型' })
  readonly gender: number;

  @IsOptional()
  @IsString({ message: 'avatarUrl 必须是 string 类型' })
  readonly avatarUrl: string;

  @IsOptional()
  @IsNumber({ allowNaN: false }, { message: 'teamUpCount 必须是 number 类型' })
  readonly teamUpCount: number;

  @IsOptional()
  @IsBoolean({ message: 'isBoss 必须是 boolean 类型' })
  readonly isBoss: boolean;

  @IsOptional()
  @IsNumber(
    { allowNaN: false },
    { message: 'monthlyCardCount 必须是 number 类型' },
  )
  readonly monthlyCardCount: number;
}
