import {
  ArgumentMetadata,
  Injectable,
  PipeTransform,
  BadRequestException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

@Injectable()
export class ValidationPipe implements PipeTransform {
  async transform(value: any, metadata: ArgumentMetadata) {
    const metaType = metadata.metatype;
    if (!metaType || !this.toValidate(metaType)) {
      return value;
    }
    // 将对象转换为 Class 来验证
    const object = plainToClass(metaType, value);
    const errors = await validate(object);
    if (errors.length > 0) {
      let msg;
      if (errors[0]?.children?.length) {
        msg = this.recursionLookErrorMsg(errors[0].children[0].children);
      } else {
        msg = Object.values(errors[0].constraints)[0];
      }
      throw new BadRequestException(`Validation failed: ${msg}`);
    }
    return value;
  }
  private toValidate(metaType: any): boolean {
    const types: any[] = [String, Boolean, Number, Array, Object, Date];
    return !types.includes(metaType);
  }

  private recursionLookErrorMsg(target: any): any {
    if (target['children']?.length) {
      this.recursionLookErrorMsg(target['children'][0]);
    }
    const msg = Object.values(target[0].constraints)[0];
    return msg;
  }
}
