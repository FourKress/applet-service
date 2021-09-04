import {
  IsNotEmpty,
  IsNumber,
  IsMobilePhone,
  IsString,
  IsMongoId,
  IsBoolean,
} from 'class-validator';

export class CreateUserDto {
  @IsMongoId({ message: 'openId 不是正确的ID类型' })
  readonly openId: string;

  @IsString({ message: 'bossId 必须是 string 类型' })
  readonly bossId: string;

  @IsNotEmpty({ message: 'phoneNum 不能为空' })
  @IsMobilePhone(
    'zh-CN',
    { strictMode: false },
    { message: 'phoneNum 不是正确的手机号' },
  )
  readonly phoneNum: string;

  @IsNotEmpty({ message: 'nickName 不能为空' })
  @IsString({ message: 'nickName 必须是 string 类型' })
  readonly nickName: string;

  @IsString({ message: 'city 必须是 string 类型' })
  readonly city: string;

  @IsString({ message: 'province 必须是 string 类型' })
  readonly province: string;

  @IsString({ message: 'country 必须是 string 类型' })
  readonly country: string;

  @IsNumber({ allowNaN: false }, { message: 'gender 必须是 number 类型' })
  readonly gender: number;

  @IsNotEmpty({ message: 'nickName 不能为空' })
  @IsString({ message: 'avatarUrl 必须是 string 类型' })
  readonly avatarUrl: string;

  @IsNumber({ allowNaN: false }, { message: 'teamUpCount 必须是 number 类型' })
  readonly teamUpCount: number;

  @IsNumber(
    { allowNaN: false },
    { message: 'monthlyCardCount 必须是 number 类型' },
  )
  readonly monthlyCardCount: number;
}
