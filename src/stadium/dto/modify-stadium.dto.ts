import {
  IsNotEmpty,
  IsNumber,
  IsMobilePhone,
  IsString,
  IsOptional,
  IsMongoId,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { SpaceDto } from '../dto/space.dto';
import { Type } from 'class-transformer';

export class ModifyStadiumDto {
  @IsMongoId({ message: 'id 不是正确的ID类型' })
  readonly id: string;

  @IsMongoId({ message: 'bossId 不是正确的ID类型' })
  readonly bossId: string;

  @IsOptional()
  @IsString({ message: 'name 必须是 string 类型' })
  readonly name: string;

  @IsOptional()
  @IsString({ message: 'city 必须是 string 类型' })
  readonly city: string;

  @IsOptional()
  @IsString({ message: 'province 必须是 string 类型' })
  readonly province: string;

  @IsOptional()
  @IsString({ message: 'district 必须是 string 类型' })
  readonly district: string;

  @IsOptional()
  @IsNumber({ allowNaN: false }, { message: 'longitude 必须是 number 类型' })
  readonly longitude: number;

  @IsOptional()
  @IsNumber({ allowNaN: false }, { message: 'latitude 必须是 number 类型' })
  readonly latitude: number;

  @IsOptional()
  @IsNotEmpty({ message: 'phoneNum 不能为空' })
  @IsMobilePhone(
    'zh-CN',
    { strictMode: false },
    { message: 'phoneNum 不是正确的手机号' },
  )
  readonly phoneNum: string;

  @IsOptional()
  @IsString({ message: 'address 必须是 string 类型' })
  readonly address: string;

  @IsOptional()
  @IsString({ message: 'stadiumUrl 必须是 string 类型' })
  readonly stadiumUrl: string;

  @IsOptional()
  @IsString({ message: 'remarks 必须是 string 类型' })
  readonly remarks: string;

  @IsOptional()
  @IsString({ message: 'description 必须是 string 类型' })
  readonly description: string;

  @IsOptional()
  @IsBoolean({ message: 'monthlyCardStatus 必须是 boolean 类型' })
  readonly monthlyCardStatus: boolean;

  @IsOptional()
  @IsNumber(
    { allowNaN: false },
    { message: 'monthlyCardPrice 必须是 number 类型' },
  )
  readonly monthlyCardPrice: number;

  @IsOptional()
  @ValidateNested({
    message: (constraints) => constraints['isString'],
  })
  @Type(() => SpaceDto)
  readonly spaces: SpaceDto[];
}
