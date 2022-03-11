import { IsString, IsMongoId, IsOptional, IsNotEmpty } from 'class-validator';

export class MatchRunDto {
  @IsOptional()
  @IsMongoId({ message: 'stadiumId 不是正确的ID类型' })
  readonly stadiumId: string;

  @IsNotEmpty({ message: 'runDate 不能为空' })
  @IsString({ message: 'runDate 必须是 string 类型' })
  readonly runDate: string;
}
