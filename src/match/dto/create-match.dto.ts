import { IsNotEmpty, IsNumber, IsString, IsMongoId } from 'class-validator';

export class CreateMatchDto {
  @IsMongoId({ message: 'spaceId 不是正确的ID类型' })
  readonly spaceId: string;

  @IsNotEmpty()
  @IsNumber({ allowNaN: false }, { message: 'duration 必须是 number 类型' })
  readonly duration: number;

  @IsNotEmpty()
  @IsString({ message: 'startAt 必须是 string 类型' })
  readonly startAt: string;

  @IsNotEmpty()
  @IsString({ message: 'endAt 必须是 string 类型' })
  readonly endAt: string;

  @IsNotEmpty()
  @IsNumber({ allowNaN: false }, { message: 'totalPeople 必须是 number 类型' })
  readonly totalPeople: number;

  @IsNotEmpty()
  @IsNumber({ allowNaN: false }, { message: 'selectPeople 必须是 number 类型' })
  readonly selectPeople: number;

  @IsNotEmpty()
  @IsNumber({ allowNaN: false }, { message: 'minPeople 必须是 number 类型' })
  readonly minPeople: number;

  @IsNotEmpty()
  @IsNumber({ allowNaN: false }, { message: 'rebate 必须是 number 类型' })
  readonly rebate: number;

  @IsNotEmpty()
  @IsNumber({ allowNaN: false }, { message: 'price 必须是 number 类型' })
  readonly price: number;
}
