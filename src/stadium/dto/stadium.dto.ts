import { IsNotEmpty, IsMongoId } from 'class-validator';
import { CreateStadiumDto } from './create-stadium.dto';
import { StadiumInterface } from '../interfaces/stadium.interface';

export class StadiumDto extends CreateStadiumDto implements StadiumInterface {
  @IsNotEmpty({ message: 'id 不能为空' })
  @IsMongoId({ message: 'id 不是正确的ID类型' })
  readonly id: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
