import { IsString, IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';

export class ModifyMonthlyCardDto {
  @IsMongoId({ message: 'userId 不是正确的ID类型' })
  userId: string;

  @IsMongoId({ message: 'stadiumId 不是正确的ID类型' })
  stadiumId: string;

  @IsOptional()
  @IsNotEmpty({ message: 'validPeriodStart 不能为空' })
  @IsString({ message: 'validPeriodStart 必须是 string 类型' })
  validPeriodStart: string;

  @IsOptional()
  @IsNotEmpty({ message: 'validPeriodEnd 不能为空' })
  @IsString({ message: 'validPeriodEnd 必须是 string 类型' })
  validPeriodEnd: string;
}
