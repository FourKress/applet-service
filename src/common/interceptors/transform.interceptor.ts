import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseSuccess } from '../dto/response.dto';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log('---Before---');
    const now = Date.now();
    const req = context.switchToHttp().getRequest();
    const { statusCode } = context.switchToHttp().getResponse();
    const { originalUrl, method, query, body } = req;

    let requestParams = JSON.parse(JSON.stringify(body));
    if (method === 'GET') {
      requestParams = JSON.parse(JSON.stringify(query));
    }
    console.log(
      `${new Date().toString()} - [Request]: ${method} ${originalUrl} - ${JSON.stringify(
        requestParams,
      )} - [User]: ${JSON.stringify(req?.user)}`,
    );

    return next.handle().pipe(
      map((data) => {
        const response = JSON.parse(JSON.stringify(data));
        console.log(
          `${new Date().toString()} - [Response]: ${statusCode} ${JSON.stringify(
            response,
          )}`,
        );
        console.log(`---After--- ${Date.now() - now}ms`);
        return new ResponseSuccess(data);
      }),
    );
  }
}
