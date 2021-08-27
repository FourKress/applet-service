import {
  IsNotEmpty,
  IsString,
  IsMongoId,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class ModifySpaceDto {
  @IsMongoId({ message: 'id 不是正确的ID类型' })
  id: string;

  @IsMongoId({ message: 'stadiumId 不是正确的ID类型' })
  stadiumId: string;

  @IsOptional()
  @IsNotEmpty({ message: 'name 不能为空' })
  @IsString({ message: 'name 必须是 string 类型' })
  name: string;

  @IsOptional()
  @IsNotEmpty({ message: 'unit 不能为空' })
  @IsNumber({ allowNaN: false }, { message: 'unit 必须是 number 类型' })
  unit: string;
}
