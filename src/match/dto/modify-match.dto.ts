import {
  IsNumber,
  IsString,
  IsMongoId,
  IsOptional,
  IsNotEmpty,
  IsBoolean,
} from 'class-validator';

export class ModifyMatchDto {
  @IsMongoId({ message: 'id 不是正确的ID类型' })
  readonly id: string;

  @IsMongoId({ message: 'stadiumId 不是正确的ID类型' })
  readonly stadiumId: string;

  @IsMongoId({ message: 'spaceId 不是正确的ID类型' })
  readonly spaceId: string;

  @IsOptional()
  @IsNumber({ allowNaN: false }, { message: 'duration 必须是 number 类型' })
  readonly duration: number;

  @IsOptional()
  @IsString({ message: 'runDate 必须是 string 类型' })
  readonly runDate: string;

  @IsOptional()
  @IsString({ message: 'startAt 必须是 string 类型' })
  readonly startAt: string;

  @IsOptional()
  @IsString({ message: 'endAt 必须是 string 类型' })
  readonly endAt: string;

  @IsOptional()
  @IsNumber({ allowNaN: false }, { message: 'totalPeople 必须是 number 类型' })
  readonly totalPeople: number;

  @IsOptional()
  @IsNumber({ allowNaN: false }, { message: 'selectPeople 必须是 number 类型' })
  readonly selectPeople: number;

  @IsOptional()
  @IsNumber({ allowNaN: false }, { message: 'minPeople 必须是 number 类型' })
  readonly minPeople: number;

  @IsOptional()
  @IsNumber({ allowNaN: false }, { message: 'rebate 必须是 number 类型' })
  readonly rebate: number;

  @IsOptional()
  @IsNumber({ allowNaN: false }, { message: 'price 必须是 number 类型' })
  readonly price: number;

  @IsOptional()
  @IsNumber({ allowNaN: false }, { message: 'price 必须是 number 类型' })
  readonly repeatModel: number;

  @IsOptional()
  @IsNotEmpty({ message: 'repeatWeek 不能为空' })
  readonly repeatWeek: number[];

  @IsOptional()
  @IsNotEmpty({ message: 'repeatFlag 不能为空' })
  @IsBoolean({ message: 'repeatFlag 必须是 boolean 类型' })
  readonly repeatFlag: boolean;

  @IsOptional()
  @IsNotEmpty({ message: 'chargeModel 不能为空' })
  @IsNumber({ allowNaN: false }, { message: 'chargeModel 必须是 number 类型' })
  readonly chargeModel: number;
}
