import { IsString, IsOptional, IsMongoId, IsBoolean } from 'class-validator';

export class ModifyUserRStadiumDto {
  @IsMongoId({ message: 'id 不是正确的ID类型' })
  id: string;

  @IsOptional()
  @IsMongoId({ message: 'userId 不是正确的ID类型' })
  userId: string;

  @IsOptional()
  @IsMongoId({ message: 'stadiumId 不是正确的ID类型' })
  stadiumId: string;

  @IsOptional()
  @IsString({ message: 'stadiumName 必须是 string 类型' })
  stadiumName: string;

  @IsOptional()
  @IsBoolean({ message: 'isWatch 必须是 boolean 类型' })
  isWatch: boolean;
}
