import { IsNotEmpty, IsNumberString, IsString } from 'class-validator';
import { CreateStadiumDto } from './create-stadium.dto';
import { StadiumInterface } from '../interfaces/stadium.interface';

export class StadiumDto extends CreateStadiumDto implements StadiumInterface {
  @IsNotEmpty({ message: 'id 不能为空' })
  @IsNumberString({}, { message: 'id 必须是数字的 string 类型' })
  readonly id: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
