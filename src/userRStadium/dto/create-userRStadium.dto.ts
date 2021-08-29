import { IsString, IsMongoId, IsBoolean, IsNotEmpty } from 'class-validator';

export class CreateUserRStadiumDto {
  @IsMongoId({ message: 'userId 不是正确的ID类型' })
  userId: string;

  @IsMongoId({ message: 'stadiumId 不是正确的ID类型' })
  stadiumId: string;

  @IsNotEmpty({ message: 'stadiumName 不能为空' })
  @IsString({ message: 'stadiumName 必须是 string 类型' })
  stadiumName: string;

  @IsNotEmpty({ message: 'isWatch 不能为空' })
  @IsBoolean({ message: 'isWatch 必须是 boolean 类型' })
  isWatch: boolean;
}
