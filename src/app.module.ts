import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { WxModule } from './wx/wx.module';
import { StadiumModule } from './stadium/stadium.module';
import { UserRStadiumModule } from './userRstadium/userRstadium.module';
// import { OrderModule } from './order/order.module';
// import { MonthlyCardModule } from './monthly-card/monthly-card.module';
// import { SpaceModule } from './space/space.module';
//
// import { TasksModule } from './tasks/tasks.module';
// import { MatchModule } from './match/match.module';
// import { UserRMatchModule } from './user-r-match/user-r-match.module';
// import { RevenueModule } from './revenue/revenue.module';
//
// @Module({
//   imports: [
//     TypeOrmModule.forRoot(),
//     UsersModule,
//     AuthModule,
//     WxModule,
//     StadiumModule,
//     UserRelationStadiumModule,
//     OrderModule,
//     MonthlyCardModule,
//     SpaceModule,
//     TasksModule,
//     MatchModule,
//     UserRMatchModule,
//     RevenueModule,
//   ],
//   controllers: [AppController],
//   providers: [AppService],
// })
// export class AppModule {
//   constructor(private readonly connection: Connection) {}
// }

import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { LoggerMiddleware } from './common/middlewares/logger.middleware';
import { appConfig, dbUrl } from './config';

@Module({
  imports: [
    // APP全局配置
    ConfigModule.forRoot({
      load: [appConfig],
    }),
    // 数据库连接
    MongooseModule.forRoot(dbUrl, {
      // https://mongoosejs.com/docs/connections.html
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    }),
    UsersModule,
    AuthModule,
    WxModule,
    StadiumModule,
    UserRStadiumModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware); // 应用中间件
  }
}
