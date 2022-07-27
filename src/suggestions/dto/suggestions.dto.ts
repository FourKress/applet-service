import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SuggestionsDto {
  @IsOptional()
  @IsMongoId({ message: 'id 不是正确的ID类型' })
  readonly id: string;

  @IsNotEmpty({ message: 'remark 不能为空' })
  @IsString({ message: 'remark 必须是 string 类型' })
  readonly remark: string;

  @IsOptional()
  @IsNotEmpty({ message: 'imageUrls 不能为空' })
  readonly imageUrls: string;
}
