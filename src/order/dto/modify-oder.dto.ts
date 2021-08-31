import {
  IsNotEmpty,
  IsNumber,
  IsMongoId,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class ModifyOderDto {
  @IsMongoId({ message: 'id 不是正确的ID类型' })
  id: string;

  @IsMongoId({ message: 'bossId 不是正确的ID类型' })
  bossId: string;

  @IsMongoId({ message: 'stadiumId 不是正确的ID类型' })
  stadiumId: string;

  @IsMongoId({ message: 'spaceId 不是正确的ID类型' })
  spaceId: string;

  @IsMongoId({ message: 'matchId 不是正确的ID类型' })
  matchId: string;

  @IsOptional()
  @IsNotEmpty({ message: 'payAmount 不能为空' })
  @IsNumber({ allowNaN: false }, { message: 'payAmount 必须是 number 类型' })
  payAmount: number;

  @IsOptional()
  @IsNotEmpty({ message: 'isMonthlyCard 不能为空' })
  @IsBoolean({ message: 'isMonthlyCard 必须是 boolean 类型' })
  isMonthlyCard: boolean;

  @IsOptional()
  @IsNotEmpty({ message: 'personCount 不能为空' })
  @IsNumber({ allowNaN: false }, { message: 'personCount 必须是 number 类型' })
  personCount: number;

  @IsOptional()
  @IsNotEmpty({ message: 'status 不能为空' })
  @IsNumber({ allowNaN: false }, { message: 'status 必须是 number 类型' })
  status: number;
}
