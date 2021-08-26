import { IsNotEmpty, IsString, IsMongoId } from 'class-validator';

export class CreateSpaceDto {
  @IsMongoId({ message: 'stadiumId 不是正确的ID类型' })
  stadiumId: string;

  @IsNotEmpty({ message: 'name 不能为空' })
  @IsString({ message: 'name 必须是 string 类型' })
  name: string;

  @IsNotEmpty({ message: 'unit 不能为空' })
  @IsString({ message: 'unit 必须是 string 类型' })
  unit: string;
}
