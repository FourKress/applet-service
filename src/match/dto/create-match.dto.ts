import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsMongoId,
  IsOptional,
} from 'class-validator';

export class CreateMatchDto {
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

  @IsNotEmpty({ message: 'startAt 不能为空' })
  @IsString({ message: 'startAt 必须是 string 类型' })
  readonly startAt: string;

  @IsNotEmpty({ message: 'endAt 不能为空' })
  @IsString({ message: 'endAt 必须是 string 类型' })
  readonly endAt: string;

  @IsNotEmpty({ message: 'totalPeople 不能为空' })
  @IsNumber({ allowNaN: false }, { message: 'totalPeople 必须是 number 类型' })
  readonly totalPeople: number;

  @IsOptional()
  @IsNumber({ allowNaN: false }, { message: 'selectPeople 必须是 number 类型' })
  readonly selectPeople: number;

  @IsNotEmpty({ message: 'minPeople 不能为空' })
  @IsNumber({ allowNaN: false }, { message: 'minPeople 必须是 number 类型' })
  readonly minPeople: number;

  @IsNotEmpty({ message: 'rebate 不能为空' })
  @IsNumber({ allowNaN: false }, { message: 'rebate 必须是 number 类型' })
  readonly rebate: number;

  @IsNotEmpty({ message: 'price 不能为空' })
  @IsNumber({ allowNaN: false }, { message: 'price 必须是 number 类型' })
  readonly price: number;

  @IsNotEmpty({ message: 'repeatModel 不能为空' })
  @IsNumber({ allowNaN: false }, { message: 'repeatModel 必须是 number 类型' })
  readonly repeatModel: number;

  @IsOptional()
  @IsNotEmpty({ message: 'repeatWeek 不能为空' })
  readonly repeatWeek: number[];

  @IsOptional()
  @IsNumber({ allowNaN: false }, { message: 'chargeModel 必须是 number 类型' })
  readonly chargeModel: number;

  @IsNotEmpty({ message: 'type 不能为空' })
  @IsNumber({ allowNaN: false }, { message: 'type 必须是 number 类型' })
  readonly type: number;

  @IsOptional()
  @IsNumber({ allowNaN: false }, { message: 'interval 必须是 number 类型' })
  readonly interval: number;
}
