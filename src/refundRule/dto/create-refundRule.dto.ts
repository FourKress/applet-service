import { IsNotEmpty, IsMongoId } from 'class-validator';
import { IRule } from '../interfaces/rule.interface';

export class CreateRefundRuleDto {
  @IsMongoId({ message: 'stadiumId 不是正确的ID类型' })
  stadiumId: string;

  @IsNotEmpty({ message: 'rules 不能为空' })
  rules: IRule[];
}
