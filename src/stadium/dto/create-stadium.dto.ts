import {
  IsNotEmpty,
  IsNumber,
  IsMobilePhone,
  IsString,
  IsMongoId,
  IsOptional,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SpaceDto } from '../dto/space.dto';

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

  @IsNotEmpty({ message: 'phoneNum 不能为空' })
  @IsMobilePhone(
    'zh-CN',
    { strictMode: false },
    { message: 'phoneNum 不是正确的手机号' },
  )
  readonly phoneNum: string;

  @IsString({ message: 'address 必须是 string 类型' })
  readonly address: string;

  @IsString({ message: 'stadiumUrl 必须是 string 类型' })
  readonly stadiumUrl: string;

  @IsString({ message: 'remarks 必须是 string 类型' })
  readonly remarks: string;

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
  @IsNotEmpty({ message: 'spaces 不能为空' })
  @ValidateNested({
    message: (constraints) => constraints['isString'],
  })
  @Type(() => SpaceDto)
  readonly spaces: SpaceDto[];
}
