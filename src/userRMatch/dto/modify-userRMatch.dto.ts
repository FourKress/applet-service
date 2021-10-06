import { IsMongoId, IsNumber, IsOptional, IsString } from 'class-validator';

export class ModifyUserRMatchDto {
  @IsMongoId({ message: 'id 不是正确的ID类型' })
  id: string;

  @IsOptional()
  @IsMongoId({ message: 'userId 不是正确的ID类型' })
  userId: string;

  @IsOptional()
  @IsNumber({ allowNaN: false }, { message: 'count 必须是 number 类型' })
  count: number;

  @IsOptional()
  @IsMongoId({ message: 'matchId 不是正确的ID类型' })
  matchId: string;

  @IsOptional()
  @IsMongoId({ message: 'spaceId 不是正确的ID类型' })
  spaceId: string;

  @IsOptional()
  @IsMongoId({ message: 'stadiumId 不是正确的ID类型' })
  stadiumId: string;

  @IsOptional()
  @IsString({ message: 'expirationDate 必须是 string 类型' })
  expirationDate: string;
}
