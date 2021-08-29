import { IsString, IsMongoId, IsNotEmpty } from 'class-validator';

export class CreateMonthlyCardDto {
  @IsMongoId({ message: 'userId 不是正确的ID类型' })
  userId: string;

  @IsMongoId({ message: 'stadiumId 不是正确的ID类型' })
  stadiumId: string;

  @IsNotEmpty({ message: 'validPeriodStart 不能为空' })
  @IsString({ message: 'validPeriodStart 必须是 string 类型' })
  validPeriodStart: string;

  @IsNotEmpty({ message: 'validPeriodEnd 不能为空' })
  @IsString({ message: 'validPeriodEnd 必须是 string 类型' })
  validPeriodEnd: string;
}
