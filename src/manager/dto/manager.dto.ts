import { IsMongoId } from 'class-validator';

export class ManagerDto {
  @IsMongoId({ message: 'stadiumId 不是正确的ID类型' })
  readonly stadiumId: string;

  @IsMongoId({ message: 'userId 不是正确的ID类型' })
  readonly userId: string;

  @IsMongoId({ message: 'userId 不是正确的ID类型' })
  readonly bossId: string;
}
