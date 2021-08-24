import { IsMongoId, IsNumber } from 'class-validator';

export class ModifyUserRMatchDto {
  @IsMongoId({ message: 'id 不是正确的ID类型' })
  id: string;

  @IsMongoId({ message: 'userId 不是正确的ID类型' })
  userId: string;

  @IsNumber({ allowNaN: false }, { message: 'count 必须是 number 类型' })
  count: number;

  @IsMongoId({ message: 'matchId 不是正确的ID类型' })
  matchId: string;

  @IsMongoId({ message: 'spaceId 不是正确的ID类型' })
  spaceId: string;

  @IsMongoId({ message: 'stadiumId 不是正确的ID类型' })
  stadiumId: string;
}
