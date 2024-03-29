﻿import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { appConfig, dbUrl } from './config';

import { TasksModule } from './tasks/tasks.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { WxModule } from './wx/wx.module';
import { StadiumModule } from './stadium/stadium.module';
import { UserRStadiumModule } from './userRStadium/userRStadium.module';
import { SpaceModule } from './space/space.module';
import { MatchModule } from './match/match.module';
import { OrderModule } from './order/order.module';
import { MonthlyCardModule } from './monthly-card/monthly-card.module';
import { UserRMatchModule } from './userRMatch/userRMatch.module';
import { WxGroupModule } from './wxGroup/wxGroup.module';
import { WithdrawModule } from './withdraw/withdraw.module';
import { RefundRuleModule } from './refundRule/refundRule.module';
import { ManagerModule } from './manager/manager.module';
import { SuggestionsModule } from './suggestions/suggestions.module';

@Module({
  imports: [
    // APP全局配置
    ConfigModule.forRoot({
      load: [appConfig],
    }),
    // 数据库连接
    MongooseModule.forRoot(dbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    }),
    // 静态文件
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      exclude: ['/api*'],
      serveRoot: '/serverStatic',
    }),
    TasksModule,
    UsersModule,
    AuthModule,
    WxModule,
    StadiumModule,
    UserRStadiumModule,
    SpaceModule,
    MatchModule,
    OrderModule,
    MonthlyCardModule,
    UserRMatchModule,
    WxGroupModule,
    WithdrawModule,
    RefundRuleModule,
    ManagerModule,
    SuggestionsModule,
  ],
})
export class AppModule {}
