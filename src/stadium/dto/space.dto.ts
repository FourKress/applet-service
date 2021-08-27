import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class SpaceDto {
  @IsOptional()
  @IsMongoId({ message: 'id 不是正确的ID类型' })
  readonly id: string;

  @IsOptional()
  @IsMongoId({ message: 'stadiumId 不是正确的ID类型' })
  readonly stadiumId: string;

  @IsNotEmpty({ message: 'name 不能为空' })
  @IsString({ message: 'name 必须是 string 类型' })
  readonly name: string;

  @IsNotEmpty({ message: 'unit 不能为空' })
  @IsNumber({ allowNaN: false }, { message: 'unit 必须是 number 类型' })
  readonly unit: string;
}
