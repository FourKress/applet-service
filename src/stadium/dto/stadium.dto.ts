import {
  IsNotEmpty,
  IsMongoId,
  IsString,
  IsMobilePhone,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { StadiumInterface } from '../interfaces/stadium.interface';
import { Exclude } from 'class-transformer';

export class StadiumDto implements StadiumInterface {
  // @Exclude()
  @IsNotEmpty({ message: 'id 不能为空' })
  @IsMongoId({ message: 'id 不是正确的ID类型' })
  readonly id: string;

  @IsNotEmpty({ message: 'bossId 不能为空' })
  @IsMongoId({ message: 'bossId 不是正确的ID类型' })
  readonly bossId: string;

  @IsNotEmpty({ message: 'name 不能为空' })
  @IsString({ message: 'name 必须是 string 类型' })
  readonly name: string;

  @IsNotEmpty({ message: 'city 不能为空' })
  @IsString({ message: 'city 必须是 string 类型' })
  readonly city: string;

  @IsNotEmpty({ message: 'province 不能为空' })
  @IsString({ message: 'province 必须是 string 类型' })
  readonly province: string;

  @IsNotEmpty({ message: 'country 不能为空' })
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

  @IsNotEmpty({ message: 'address 不能为空' })
  @IsString({ message: 'address 必须是 string 类型' })
  readonly address: string;

  @IsNotEmpty({ message: 'stadiumUrl 不能为空' })
  @IsString({ message: 'stadiumUrl 必须是 string 类型' })
  readonly stadiumUrl: string;

  @IsNotEmpty({ message: 'remarks 不能为空' })
  @IsString({ message: 'remarks 必须是 string 类型' })
  readonly remarks: string;

  @IsNotEmpty({ message: 'description 不能为空' })
  @IsString({ message: 'description 必须是 string 类型' })
  readonly description: string;

  @IsNotEmpty({ message: 'monthlyCardPrice 不能为空' })
  @IsNumber(
    { allowNaN: false },
    { message: 'monthlyCardPrice 必须是 number 类型' },
  )
  readonly monthlyCardPrice: number;

  readonly createdAt: Date;
  readonly updatedAt: Date;
}
