import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class ValidationIDPipe implements PipeTransform<string> {
  transform(value: string, metadata: ArgumentMetadata): string {
    const flag = Types.ObjectId.isValid(value);
    if (!flag) {
      throw new BadRequestException('非法ID');
    }
    return value;
  }
}
