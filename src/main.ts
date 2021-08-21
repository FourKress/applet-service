import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as helmet from 'helmet';
import * as rateLimit from 'express-rate-limit';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

import * as mongoose from 'mongoose';
mongoose.set('returnOriginal', false);

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get<ConfigService>(ConfigService);

  app.setGlobalPrefix('api');
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );
  app.useGlobalGuards(new JwtAuthGuard(app.get(Reflector)));
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(new ValidationPipe());
  /* 安全 */
  app.enable('trust proxy');
  app.use(helmet());

  app.use(
    rateLimit({
      windowMs: 5 * 60 * 1000,
      max: 100,
      message: 'Too many requests from this IP, please try again later',
    }),
  );

  await app.listen(
    configService.get<number>('app.port'),
    configService.get<string>('app.host'),
  );

  console.log(`Application is running on: ${await app.getUrl()}`);

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
