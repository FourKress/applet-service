import { IsNotEmpty, IsNumber, IsMongoId } from 'class-validator';

export class CreateOderDto {
  @IsMongoId({ message: 'bossId 不是正确的ID类型' })
  bossId: string;

  @IsMongoId({ message: 'stadiumId 不是正确的ID类型' })
  stadiumId: string;

  @IsMongoId({ message: 'spaceId 不是正确的ID类型' })
  spaceId: string;

  @IsMongoId({ message: 'matchId 不是正确的ID类型' })
  matchId: string;

  @IsNotEmpty({ message: 'payAmount 不能为空' })
  @IsNumber({ allowNaN: false }, { message: 'payAmount 必须是 number 类型' })
  payAmount: number;

  @IsNotEmpty({ message: 'personCount 不能为空' })
  @IsNumber({ allowNaN: false }, { message: 'personCount 必须是 number 类型' })
  personCount: number;
}
