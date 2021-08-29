import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ResponseError } from '../dto/response.dto';

@Injectable()
export class ToolsService {
  static fail(error, status = HttpStatus.OK) {
    throw new HttpException(new ResponseError(error), status);
  }
}
