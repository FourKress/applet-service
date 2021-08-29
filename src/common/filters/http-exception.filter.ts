import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionsFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    let result;
    if (status === 200) {
      result = handleServiceException(exception);
    } else {
      result = handleHttpException(status, request.url);
    }
    response.status(status).json(result);
  }
}

const handleHttpException = (statusCode, path) => {
  return {
    statusCode,
    timestamp: new Date().toISOString(),
    path,
  };
};

const handleServiceException = (exception) => {
  const exceptionRes: any = exception.getResponse();
  return exceptionRes;
};
