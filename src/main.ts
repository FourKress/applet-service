import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { json, urlencoded } from 'express';
import * as helmet from 'helmet';
import * as rateLimit from 'express-rate-limit';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { AppModule } from './app.module';
import { AnyExceptionsFilter } from './common/filters/any-exception.filter';
import { HttpExceptionsFilter } from './common/filters/http-exception.filter';
import { BadRequestExceptionFilter } from './common/filters/badRequest-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { ValidationPipe } from './common/pipe/validation.pipe';

import * as mongoose from 'mongoose';
mongoose.set('returnOriginal', false);

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get<ConfigService>(ConfigService);

  app.setGlobalPrefix('api');
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalGuards(new JwtAuthGuard(app.get(Reflector)));
  app.useGlobalFilters(
    new AnyExceptionsFilter(),
    new HttpExceptionsFilter(),
    new BadRequestExceptionFilter(),
  );
  app.useGlobalPipes(new ValidationPipe());

  // 文件上传大小限制
  app.use(json({ limit: '5mb' }));
  app.use(urlencoded({ extended: true, limit: '5mb' }));

  app.enableCors();
  app.enable('trust proxy');
  app.use(helmet());

  app.use(
    rateLimit({
      windowMs: 5 * 60 * 1000,
      max: 300,
      message: 'Too many requests from this IP, please try again later',
    }),
  );

  const port = configService.get<number>('app.port');
  await app.listen(port);

  console.log(`Application is running on: http://localhost:${port}`);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap()
  .then(() => {
    console.log('服务启动成功');
  })
  .catch(() => {
    console.log('服务启动失败');
  });
